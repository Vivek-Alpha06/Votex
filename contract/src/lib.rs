#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, panic_with_error,
    vec, Address, Env, String, Symbol, Vec, token
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    AlreadyVoted = 2,
    InsufficientBalance = 3,
    Unauthorized = 4,
    AdminCannotVote = 5,
    NotStarted = 6,
    DeadlinePassed = 7,
    IsClosed = 8,
    CannotCloseBeforeDeadline = 9,
    InvalidOption = 10,
    ProposalNotFound = 11,
}

#[contracttype]
#[derive(Clone)]
pub struct Proposal {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub start_time: u64,
    pub deadline: u64,
    pub options: Vec<String>,
    pub vote_counts: Vec<u64>,
    pub creator: Address,
    pub is_closed: bool,
    pub created_at: u64,
    pub total_votes: u64,
    pub quorum: u64,
    pub category: String,
    pub min_balance: i128,
}

#[contracttype]
#[derive(Clone)]
pub struct VoteRecord {
    pub voter: Address,
    pub proposal_id: u64,
    pub option_idx: u32,
    pub voted_at: u64,
    pub tx_hash: String,
}

#[contract]
pub struct VoxChainVotingContract;

#[contracttype]
pub enum DataKey {
    Admin,
    NativeToken,
    ProposalCount,
    Proposal(u64),
    Vote(Address, u64), // voter + proposal_id
}

fn require_admin(env: &Env) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth();
}

#[contractimpl]
impl VoxChainVotingContract {
    pub fn initialize(env: Env, admin: Address, native_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NativeToken, &native_token);
        env.storage().instance().set(&DataKey::ProposalCount, &0u64);
    }

    pub fn create_proposal(
        env: Env,
        title: String,
        description: String,
        start_time: u64,
        deadline: u64,
        options: Vec<String>,
        quorum: u64,
        category: String,
        min_balance: i128,
    ) -> u64 {
        require_admin(&env);

        let mut proposal_count: u64 = env.storage().instance().get(&DataKey::ProposalCount).unwrap_or(0);
        let id = proposal_count;
        proposal_count += 1;

        let cur_time = env.ledger().timestamp();
        
        let mut vote_counts = Vec::new(&env);
        for _ in 0..options.len() {
            vote_counts.push_back(0u64);
        }

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

        let proposal = Proposal {
            id,
            title,
            description,
            start_time,
            deadline,
            options,
            vote_counts,
            creator: admin,
            is_closed: false,
            created_at: cur_time,
            total_votes: 0,
            quorum,
            category,
            min_balance,
        };

        env.storage().instance().set(&DataKey::Proposal(id), &proposal);
        env.storage().instance().set(&DataKey::ProposalCount, &proposal_count);
        id
    }

    pub fn close_proposal(env: Env, proposal_id: u64) {
        require_admin(&env);

        if let Some(mut proposal) = env.storage().instance().get::<_, Proposal>(&DataKey::Proposal(proposal_id)) {
            let cur_time = env.ledger().timestamp();
            if cur_time < proposal.deadline {
                panic_with_error!(&env, Error::CannotCloseBeforeDeadline);
            }
            proposal.is_closed = true;
            env.storage().instance().set(&DataKey::Proposal(proposal_id), &proposal);
        } else {
            panic_with_error!(&env, Error::ProposalNotFound);
        }
    }

    pub fn transfer_admin(env: Env, new_admin: Address) {
        require_admin(&env);
        env.storage().instance().set(&DataKey::Admin, &new_admin);
    }

    pub fn vote(env: Env, voter: Address, proposal_id: u64, option_idx: u32, tx_hash: String) {
        voter.require_auth();

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if voter == admin {
            panic_with_error!(&env, Error::AdminCannotVote);
        }

        if let Some(mut proposal) = env.storage().instance().get::<_, Proposal>(&DataKey::Proposal(proposal_id)) {
            let cur_time = env.ledger().timestamp();
            if cur_time < proposal.start_time {
                panic_with_error!(&env, Error::NotStarted);
            }
            if cur_time > proposal.deadline {
                panic_with_error!(&env, Error::DeadlinePassed);
            }
            if proposal.is_closed {
                panic_with_error!(&env, Error::IsClosed);
            }
            
            let vote_key = DataKey::Vote(voter.clone(), proposal_id);
            if env.storage().instance().has(&vote_key) {
                panic_with_error!(&env, Error::AlreadyVoted);
            }

            if option_idx >= proposal.options.len() {
                panic_with_error!(&env, Error::InvalidOption);
            }

            // Verify min_balance if > 0
            if proposal.min_balance > 0 {
                let native_token: Address = env.storage().instance().get(&DataKey::NativeToken).unwrap();
                let native_client = token::Client::new(&env, &native_token);
                if native_client.balance(&voter) < proposal.min_balance {
                    panic_with_error!(&env, Error::InsufficientBalance);
                }
            }

            let current_count = proposal.vote_counts.get(option_idx).unwrap();
            proposal.vote_counts.set(option_idx, current_count + 1);
            proposal.total_votes += 1;

            let record = VoteRecord {
                voter: voter.clone(),
                proposal_id,
                option_idx,
                voted_at: cur_time,
                tx_hash,
            };

            env.storage().instance().set(&vote_key, &record);
            env.storage().instance().set(&DataKey::Proposal(proposal_id), &proposal);
        } else {
            panic_with_error!(&env, Error::ProposalNotFound);
        }
    }

    pub fn get_proposal(env: Env, id: u64) -> Proposal {
        env.storage().instance().get(&DataKey::Proposal(id)).unwrap()
    }

    pub fn get_all_proposals(env: Env) -> Vec<Proposal> {
        let count: u64 = env.storage().instance().get(&DataKey::ProposalCount).unwrap_or(0);
        let mut proposals = Vec::new(&env);
        for i in 0..count {
            if let Some(p) = env.storage().instance().get::<_, Proposal>(&DataKey::Proposal(i)) {
                proposals.push_back(p);
            }
        }
        proposals
    }

    pub fn get_active_proposals(env: Env) -> Vec<Proposal> {
        let all = Self::get_all_proposals(env.clone());
        let cur_time = env.ledger().timestamp();
        let mut active = Vec::new(&env);
        for p in all.into_iter() {
            if cur_time >= p.start_time && cur_time <= p.deadline && !p.is_closed {
                active.push_back(p);
            }
        }
        active
    }

    pub fn get_closed_proposals(env: Env) -> Vec<Proposal> {
        let all = Self::get_all_proposals(env.clone());
        let cur_time = env.ledger().timestamp();
        let mut closed = Vec::new(&env);
        for p in all.into_iter() {
            if p.is_closed || cur_time > p.deadline {
                closed.push_back(p);
            }
        }
        closed
    }

    pub fn has_voted(env: Env, voter: Address, proposal_id: u64) -> bool {
        env.storage().instance().has(&DataKey::Vote(voter, proposal_id))
    }

    pub fn get_vote(env: Env, voter: Address, proposal_id: u64) -> Option<u32> {
        let key = DataKey::Vote(voter, proposal_id);
        if let Some(record) = env.storage().instance().get::<_, VoteRecord>(&key) {
            Some(record.option_idx)
        } else {
            None
        }
    }

    pub fn get_voter_history(env: Env, voter: Address) -> Vec<VoteRecord> {
        let count: u64 = env.storage().instance().get(&DataKey::ProposalCount).unwrap_or(0);
        let mut history = Vec::new(&env);
        for i in 0..count {
            let vote_key = DataKey::Vote(voter.clone(), i);
            if let Some(record) = env.storage().instance().get::<_, VoteRecord>(&vote_key) {
                history.push_back(record);
            }
        }
        history
    }
    
    // returns (winner_idx, vote_counts, total_votes, quorum_met)
    pub fn get_results(env: Env, proposal_id: u64) -> (u32, Vec<u64>, u64, bool) {
        let proposal: Proposal = env.storage().instance().get(&DataKey::Proposal(proposal_id)).unwrap();
        let mut winner_idx = 0;
        let mut max_votes = 0;
        
        for i in 0..proposal.options.len() {
            let count = proposal.vote_counts.get(i).unwrap();
            if count > max_votes {
                max_votes = count;
                winner_idx = i;
            }
        }
        
        let quorum_met = proposal.quorum == 0 || proposal.total_votes >= proposal.quorum;
        
        (winner_idx, proposal.vote_counts, proposal.total_votes, quorum_met)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn get_stats(env: Env) -> (u64, u64) {
        let count: u64 = env.storage().instance().get(&DataKey::ProposalCount).unwrap_or(0);
        let all = Self::get_all_proposals(env);
        let mut total_votes = 0;
        for p in all.into_iter() {
            total_votes += p.total_votes;
        }
        (count, total_votes)
    }
}
