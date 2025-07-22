import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiMessageCircle, FiTool, FiSettings, FiLogOut, FiMenu, FiX, FiUser, FiCheck, FiEdit } = FiIcons;

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateUserName } = useAuth();

  useEffect(() => {
    // Close sidebar on route change on mobile
    setSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/chat', icon: FiMessageCircle, label: 'Bate-Papo' },
    { path: '/tools', icon: FiTool, label: 'Ferramentas' },
    ...(user?.isAdmin ? [{ path: '/admin', icon: FiSettings, label: 'Admin' }] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const openNameModal = () => {
    setNewName(user?.name || '');
    setNameError('');
    setIsNameModalOpen(true);
  };
  
  const handleUpdateName = async (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setNameError('Por favor, informe um nome.');
      return;
    }
    
    const result = await updateUserName(newName);
    
    if (result.success) {
      setIsNameModalOpen(false);
    } else {
      setNameError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neon-darker via-neon-dark to-neon-gray">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-neon-gray/80 backdrop-blur-sm rounded-lg border border-neon-green/30 text-neon-green"
        >
          <SafeIcon icon={sidebarOpen ? FiX : FiMenu} className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 h-full w-70 glass border-r border-neon-green/30 z-40 lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-neon-green to-green-400 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTool} className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Dashboard</h1>
              <p className="text-gray-400 text-sm">Privado</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                    : 'text-gray-300 hover:bg-neon-gray/50 hover:text-white'
                }`}
              >
                <SafeIcon icon={item.icon} className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-neon-gray/30 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neon-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <p className="text-white text-sm font-medium truncate">
                      {user?.name}
                    </p>
                    {user?.isAdmin && (
                      <span className="bg-yellow-400 text-black px-1.5 py-0.5 rounded-full text-xs flex items-center">
                        <SafeIcon icon={FiCheck} className="w-2.5 h-2.5 mr-0.5" />
                        <span className="text-[10px]">ADMIN</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {user?.hasPurchased ? 'Acesso Total' : 'Acesso Limitado'}
                  </p>
                </div>
                <button 
                  onClick={openNameModal}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-neon-gray/50"
                  title="Editar nome"
                >
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <SafeIcon icon={FiLogOut} className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-70 min-h-screen">
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* Name Edit Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-xl p-6 w-full max-w-md border border-neon-green/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Editar Nome de Usuário
              </h3>
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-neon-gray/50 rounded-lg transition-all duration-300"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <SafeIcon icon={FiUser} className="w-5 h-5 text-neon-green" />
                  <label className="text-white font-medium">Nome de Usuário</label>
                </div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-neon-gray/50 border border-neon-green/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                  placeholder="Seu nome"
                />
                
                {nameError && (
                  <p className="mt-2 text-red-400 text-sm">
                    {nameError}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNameModalOpen(false)}
                  className="px-4 py-2 bg-neon-gray/50 border border-neon-green/30 rounded-lg text-gray-300 hover:text-white hover:border-neon-green transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neon text-black font-semibold px-4 py-2 rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Layout;