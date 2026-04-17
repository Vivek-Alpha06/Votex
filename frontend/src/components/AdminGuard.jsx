import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import toast from 'react-hot-toast';

const AdminGuard = ({ children }) => {
  const { isAdmin, address } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Admin access requires the authorized wallet.", {
        style: {
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: '#fecaca',
          backdropFilter: 'blur(10px)'
        }
      });
      navigate("/");
    }
  }, [isAdmin, address, navigate]);

  if (!isAdmin) return null;
  return children;
};

export default AdminGuard;
