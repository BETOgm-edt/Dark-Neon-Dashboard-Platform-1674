import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';

const { FiMessageCircle, FiStar, FiTrendingUp, FiUsers, FiZap, FiTool, FiActivity, FiBarChart2, FiClock } = FiIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userCount, onlineUsers } = useAuth();
  const [newsItems, setNewsItems] = useState([]);
  const [toolCount, setToolCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get tool count
        const { data: tools, error: toolsError } = await supabase
          .from('marketplace_tools_7h9f3k')
          .select('id');
          
        if (toolsError) throw toolsError;
        
        // Get message count from the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count: recentMessages, error: messagesError } = await supabase
          .from('chat_messages_7h9f3k')
          .select('id', { count: 'exact' })
          .gte('created_at', yesterday.toISOString());
          
        if (messagesError) throw messagesError;
        
        setToolCount(tools.length);
        setMessageCount(recentMessages || 0);
        
        // For news items, we'll use static data for the demo
        // In a real app, these would come from a database
        setNewsItems([
          {
            id: 1,
            title: 'Nova Ferramenta de Análise Disponível',
            description: 'Descubra insights poderosos com nossa nova ferramenta de análise de dados em tempo real.',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
            tag: 'Novo'
          },
          {
            id: 2,
            title: 'Atualização da Comunidade',
            description: 'Novos recursos no bate-papo e melhorias na experiência do usuário foram implementados.',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
            tag: 'Atualização'
          },
          {
            id: 3,
            title: 'Workshop Exclusivo Disponível',
            description: 'Participe do nosso workshop sobre estratégias avançadas de marketing digital.',
            image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
            tag: 'Evento'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const stats = [
    { 
      label: 'Ferramentas Ativas', 
      value: toolCount.toString(), 
      icon: FiTool, 
      color: 'text-neon-green',
      bg: 'from-neon-green/20 to-green-500/10'
    },
    { 
      label: 'Membros Online', 
      value: onlineUsers.toString(), 
      icon: FiUsers, 
      color: 'text-blue-400',
      bg: 'from-blue-400/20 to-blue-600/10'
    },
    { 
      label: 'Mensagens Hoje', 
      value: messageCount > 999 ? `${(messageCount / 1000).toFixed(1)}k` : messageCount.toString(), 
      icon: FiMessageCircle, 
      color: 'text-purple-400',
      bg: 'from-purple-400/20 to-purple-600/10'
    },
    { 
      label: 'Engajamento', 
      value: '94%', 
      icon: FiTrendingUp, 
      color: 'text-yellow-400',
      bg: 'from-yellow-400/20 to-yellow-600/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-neon-green bg-clip-text text-transparent mb-4">
          Bem-vindo, {user?.name}
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Sua plataforma exclusiva com ferramentas avançadas e comunidade ativa
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(57, 255, 20, 0.2)' }}
            className="glass rounded-xl p-6 border border-neon-green/30 bg-gradient-to-br transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            {/* Mini chart or trend indicator */}
            <div className="mt-3 flex items-center">
              <SafeIcon icon={FiActivity} className={`w-4 h-4 ${stat.color} mr-1`} />
              <span className={`text-xs font-medium ${stat.color}`}>
                +{Math.floor(Math.random() * 10) + 5}% esta semana
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-xl p-6 border border-neon-green/30"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiBarChart2} className="w-6 h-6 text-neon-green" />
            <h2 className="text-2xl font-bold text-white">Atividade Recente</h2>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Últimos 7 dias</span>
          </div>
        </div>
        
        {/* Activity chart - simplified version for demo */}
        <div className="h-64 w-full">
          <div className="h-full flex items-end justify-between">
            {[...Array(7)].map((_, i) => {
              const height = 30 + Math.random() * 70;
              return (
                <div key={i} className="w-1/8 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-neon-green to-neon-green/50 rounded-t-md"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* News Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass rounded-xl p-6 border border-neon-green/30"
      >
        <div className="flex items-center space-x-3 mb-6">
          <SafeIcon icon={FiStar} className="w-6 h-6 text-neon-green" />
          <h2 className="text-2xl font-bold text-white">Novidades em Destaque</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass rounded-lg overflow-hidden border border-neon-green/20 hover:border-neon-green/40 transition-all duration-300 group"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-neon-green/90 text-black px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {item.tag}
                  </span>
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neon-darker to-transparent opacity-70"></div>
              </div>
              <div className="p-6">
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-neon-green transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {item.description}
                </p>
                <button className="text-neon-green font-semibold text-sm hover:underline flex items-center">
                  <span>Saiba mais</span>
                  <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chat CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <motion.button
          onClick={() => navigate('/chat')}
          className="btn-neon text-black font-bold py-4 px-8 rounded-xl text-lg flex items-center space-x-3 mx-auto"
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 30px rgba(57, 255, 20, 0.6)'
          }}
          whileTap={{ scale: 0.98 }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(57, 255, 20, 0.3)',
              '0 0 30px rgba(57, 255, 20, 0.6)',
              '0 0 20px rgba(57, 255, 20, 0.3)'
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <SafeIcon icon={FiMessageCircle} className="w-6 h-6" />
          <span>💬 Acessar Bate-Papo</span>
          <SafeIcon icon={FiZap} className="w-6 h-6" />
        </motion.button>
        <p className="text-gray-400 mt-4">
          Conecte-se com {onlineUsers} usuários online e compartilhe experiências
        </p>
      </motion.div>
    </div>
  );
};

export default Dashboard;