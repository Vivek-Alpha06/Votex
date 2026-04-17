import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { requestAccess, setAllowed, isAllowed, getUserInfo } from '@stellar/freighter-api';
// We are using @stellar/freighter-api as it handles Freighter directly, which is simpler for specific wallet gate.

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [networkFee, setNetworkFee] = useState(100); // stroops, default low fee
  
  // The Admin wallet.
  const ADMIN_WALLET = import.meta.env.VITE_ADMIN_ADDRESS || "";

  const shortAddress = typeof address === 'string' && address.length > 8 
    ? `${address.slice(0, 4)}...${address.slice(-4)}` 
    : '';

  const checkConnection = useCallback(async () => {
    try {
      if (await isAllowed()) {
        const userInfo = await getUserInfo();
        if (userInfo.publicKey) {
          setAddress(userInfo.publicKey);
          setIsAdmin(userInfo.publicKey === import.meta.env.VITE_ADMIN_ADDRESS);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = async () => {
    setIsConnecting(true);
    try {
      await setAllowed();
      const info = await requestAccess();
      if (info && !info.error) {
        // Handle case where info is a string or an object with address/publicKey field
        const pubKey = typeof info === 'string' ? info : (info.address || info.publicKey || "");
        if (!pubKey) throw new Error("No public key returned from wallet");
        setAddress(pubKey);
        setIsAdmin(pubKey === import.meta.env.VITE_ADMIN_ADDRESS);
      } else {
        throw new Error(info.error || "Connection refused");
      }
    } catch (e) {
      console.error("Connection failed", e);
      throw e;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsAdmin(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <WalletContext.Provider value={{ 
      address, 
      isAdmin, 
      isConnecting, 
      isModalOpen,
      shortAddress,
      networkFee,
      openModal,
      closeModal,
      connect, 
      disconnect,
      setNetworkFee
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
