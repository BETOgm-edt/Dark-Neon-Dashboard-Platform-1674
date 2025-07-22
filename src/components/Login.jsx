import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiLock, FiLogIn, FiAlertCircle, FiMail, FiUserPlus } = FiIcons;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const { login, register } = useAuth();

  // Handle redirect countdown
  useEffect(() => {
    if (redirectUrl && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (redirectUrl && redirectCountdown === 0) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl, redirectCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        // Register flow
        if (!name.trim()) {
          setError('Por favor, informe um nome de usuário.');
          setLoading(false);
          return;
        }
        
        const result = await register(email, password, name);
        if (result.success) {
          setSuccess(result.message);
          if (result.redirectUrl) {
            setRedirectUrl(result.redirectUrl);
          }
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-darker via-neon-dark to-neon-gray"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neon-green rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Large neon circle background effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-[600px] h-[600px] rounded-full bg-neon-green/5"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 60px 10px rgba(57, 255, 20, 0.1)',
              '0 0 80px 20px rgba(57, 255, 20, 0.2)',
              '0 0 60px 10px rgba(57, 255, 20, 0.1)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-neon-lg border border-neon-green/30">
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-neon-green to-green-400 rounded-full mx-auto flex items-center justify-center mb-4"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(57, 255, 20, 0.4)',
                  '0 0 30px rgba(57, 255, 20, 0.7)',
                  '0 0 20px rgba(57, 255, 20, 0.4)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <SafeIcon icon={isLogin ? FiLogIn : FiUserPlus} className="w-10 h-10 text-black" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {isLogin ? 'Dashboard Privado' : 'Criar Conta'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-gray-300 text-sm"
            >
              {isLogin ? 'Acesse sua plataforma exclusiva' : 'Junte-se à nossa comunidade exclusiva'}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative">
                    <SafeIcon
                      icon={FiUser}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-green w-5 h-5"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-neon-gray/50 border border-neon-green/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                      placeholder="Nome de usuário"
                    />
                  </div>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isLogin ? 0.1 : 0.2, duration: 0.4 }}
              >
                <div className="relative">
                  <SafeIcon
                    icon={FiMail}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-green w-5 h-5"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neon-gray/50 border border-neon-green/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                    placeholder="Seu email"
                    required
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isLogin ? 0.2 : 0.3, duration: 0.4 }}
              >
                <div className="relative">
                  <SafeIcon
                    icon={FiLock}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-green w-5 h-5"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neon-gray/50 border border-neon-green/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                    placeholder="Sua senha"
                    required
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <SafeIcon icon={FiAlertCircle} className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-green-400 text-sm p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <SafeIcon icon={FiAlertCircle} className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span>{success}</span>
                    {redirectUrl && (
                      <p className="mt-1">Redirecionando em {redirectCountdown} segundos...</p>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isLogin ? 0.3 : 0.4, duration: 0.6 }}
                type="submit"
                disabled={loading}
                className="w-full btn-neon text-black font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon icon={isLogin ? FiLogIn : FiUserPlus} className="w-5 h-5" />
                <span>
                  {loading
                    ? isLogin ? 'Entrando...' : 'Registrando...'
                    : isLogin ? 'Entrar' : 'Registrar'}
                </span>
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-center"
              >
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-neon-green hover:text-green-400 text-sm transition-colors duration-300"
                >
                  {isLogin
                    ? 'Não tem uma conta? Registre-se'
                    : 'Já tem uma conta? Faça login'}
                </button>
              </motion.div>
            </motion.form>
          </AnimatePresence>

          {isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
            >
              <p className="text-yellow-300 text-sm text-center">
                <SafeIcon icon={FiAlertCircle} className="inline w-4 h-4 mr-2" />
                Você pode explorar o bate-papo com acesso limitado até concluir a compra.
              </p>
            </motion.div>
          )}

          {isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 text-center text-sm text-gray-400"
            >
              <p>Credenciais de teste:</p>
              <p>Admin: admin@dashboard.com / admin123</p>
              <p>Usuário: user@dashboard.com / user123</p>
              <p>Limitado: limited@dashboard.com / limited123</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;