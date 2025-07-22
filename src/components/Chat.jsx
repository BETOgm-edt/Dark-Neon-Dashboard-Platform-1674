import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiSend, FiImage, FiLink, FiMic, FiLock, FiUsers, FiCheck, FiMoreVertical, FiTrash, FiAlertTriangle, FiVolume2, FiVolume1, FiVolume, FiVolumeX, FiMessageCircle, FiX } = FiIcons;

const Chat = () => {
  const { user, onlineUsers } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState('text');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [muteDuration, setMuteDuration] = useState('1h');
  
  const messagesEndRef = useRef(null);
  const chatSubscription = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages_7h9f3k')
          .select(`
            id, 
            message, 
            message_type,
            created_at, 
            is_restricted,
            users_dashboard_7h9f3k (id, name, is_admin, has_purchased)
          `)
          .order('created_at', { ascending: true })
          .limit(50);
          
        if (error) throw error;
        
        const formattedMessages = data.map(item => ({
          id: item.id,
          user: item.users_dashboard_7h9f3k.name,
          userId: item.users_dashboard_7h9f3k.id,
          message: item.message,
          timestamp: new Date(item.created_at),
          type: item.message_type,
          isAdmin: item.users_dashboard_7h9f3k.is_admin,
          hasPurchased: item.users_dashboard_7h9f3k.has_purchased,
          isRestricted: item.is_restricted
        }));
        
        setMessages(formattedMessages);
        setLoading(false);
        
        // Wait for next render to scroll
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Subscribe to new messages
    chatSubscription.current = supabase
      .channel('chat-messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages_7h9f3k' 
        }, 
        async (payload) => {
          try {
            // Get user info for the new message
            const { data: userData, error: userError } = await supabase
              .from('users_dashboard_7h9f3k')
              .select('id, name, is_admin, has_purchased')
              .eq('id', payload.new.user_id)
              .single();
              
            if (userError) throw userError;
            
            const newMsg = {
              id: payload.new.id,
              user: userData.name,
              userId: userData.id,
              message: payload.new.message,
              timestamp: new Date(payload.new.created_at),
              type: payload.new.message_type,
              isAdmin: userData.is_admin,
              hasPurchased: userData.has_purchased,
              isRestricted: payload.new.is_restricted
            };
            
            setMessages(prev => [...prev, newMsg]);
            
            // Wait for next render to scroll
            setTimeout(scrollToBottom, 100);
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe();
      
    return () => {
      if (chatSubscription.current) {
        supabase.removeChannel(chatSubscription.current);
      }
    };
  }, []);

  // Auto scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Check if user is muted
    const isMuted = mutedUsers.some(muted => muted.userId === user.id);
    if (isMuted) {
      alert('Você está temporariamente silenciado no chat.');
      return;
    }
    
    try {
      // Determine if message should be restricted
      const isRestricted = messageType !== 'text';
      
      const { data, error } = await supabase
        .from('chat_messages_7h9f3k')
        .insert([
          {
            user_id: user.id,
            message: newMessage,
            message_type: messageType,
            is_restricted: isRestricted
          }
        ]);
      
      if (error) throw error;
      
      setNewMessage('');
      setMessageType('text');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleMuteUser = async (userId, username) => {
    let muteTimeMs;
    switch (muteDuration) {
      case '5m':
        muteTimeMs = 5 * 60 * 1000;
        break;
      case '15m':
        muteTimeMs = 15 * 60 * 1000;
        break;
      case '1h':
        muteTimeMs = 60 * 60 * 1000;
        break;
      case '24h':
        muteTimeMs = 24 * 60 * 60 * 1000;
        break;
      default:
        muteTimeMs = 60 * 60 * 1000;
    }
    
    const muteUntil = new Date(Date.now() + muteTimeMs);
    
    setMutedUsers(prev => [
      ...prev.filter(muted => muted.userId !== userId),
      { userId, username, until: muteUntil }
    ]);
    
    // Add system message
    const systemMessage = {
      id: Date.now(),
      user: 'Sistema',
      userId: 'system',
      message: `Usuário ${username} foi silenciado por ${muteDuration} pelo administrador.`,
      timestamp: new Date(),
      type: 'system',
      isAdmin: true,
      hasPurchased: true,
      isRestricted: false
    };
    
    setMessages(prev => [...prev, systemMessage]);
    setActiveDropdown(null);
    
    // Auto-remove mute after duration
    setTimeout(() => {
      setMutedUsers(prev => prev.filter(muted => muted.userId !== userId));
      
      const unmutedMessage = {
        id: Date.now(),
        user: 'Sistema',
        userId: 'system',
        message: `Usuário ${username} não está mais silenciado.`,
        timestamp: new Date(),
        type: 'system',
        isAdmin: true,
        hasPurchased: true,
        isRestricted: false
      };
      
      setMessages(prev => [...prev, unmutedMessage]);
    }, muteTimeMs);
  };
  
  const handleDeleteMessage = async (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    setActiveDropdown(null);
  };
  
  const toggleMessageType = (type) => {
    if (!user.hasPurchased) {
      alert('Recurso disponível apenas para usuários premium.');
      return;
    }
    setMessageType(messageType === type ? 'text' : type);
  };

  const renderMessage = (msg) => {
    const isOwn = msg.user === user.name;
    const canViewRestricted = user.hasPurchased || msg.user === user.name;
    const isMuted = mutedUsers.some(muted => muted.userId === msg.userId);
    
    if (msg.type === 'system') {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center my-3"
        >
          <div className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 text-gray-300 px-4 py-2 rounded-full text-sm max-w-md backdrop-blur-sm border border-gray-600/30">
            {msg.message}
          </div>
        </motion.div>
      );
    }
    
    if (msg.isRestricted && !canViewRestricted) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm"
        >
          <div className="flex items-center space-x-3 text-yellow-300">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <SafeIcon icon={FiLock} className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">🔒 Conteúdo Premium</p>
              <p className="text-sm opacity-80">Compre para liberar acesso total ao chat.</p>
            </div>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'} relative group`}>
          <div className={`flex items-end space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green to-green-400 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-black font-bold text-sm">
                {msg.user.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Message bubble */}
            <div className={`rounded-2xl px-4 py-3 shadow-lg ${
              isOwn 
                ? 'bg-gradient-to-br from-neon-green to-green-400 text-black' 
                : msg.isAdmin 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white border border-purple-500/30' 
                  : 'glass border border-neon-green/20 text-white backdrop-blur-sm'
            }`}>
              {/* User info */}
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm">
                  {msg.user}
                </span>
                
                {msg.isAdmin && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-bold flex items-center shadow-sm"
                  >
                    <SafeIcon icon={FiCheck} className="w-3 h-3 mr-1" />
                    ADMIN
                  </motion.span>
                )}
                
                {msg.hasPurchased && !msg.isAdmin && (
                  <span className="bg-neon-green text-black px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    VIP
                  </span>
                )}
                
                {isMuted && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center shadow-sm">
                    <SafeIcon icon={FiVolumeX} className="w-3 h-3 mr-1" />
                    MUDO
                  </span>
                )}
              </div>
              
              {/* Message content */}
              {msg.type === 'link' ? (
                <a
                  href={msg.message}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isOwn ? 'text-blue-800' : 'text-blue-300'} hover:underline break-all font-medium`}
                >
                  {msg.message}
                </a>
              ) : msg.type === 'image' ? (
                <div className="mt-2">
                  <img 
                    src={msg.message} 
                    alt="Shared image" 
                    className="max-w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200/1a1a1a/39FF14?text=Imagem+Indisponível";
                    }}
                  />
                </div>
              ) : (
                <p className="break-words leading-relaxed">{msg.message}</p>
              )}
              
              {/* Timestamp */}
              <p className={`text-xs mt-2 ${isOwn ? 'text-black/70' : 'text-gray-400'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
            
            {/* Admin controls */}
            {user.isAdmin && !isOwn && (
              <div className="relative">
                <motion.button 
                  onClick={() => setActiveDropdown(activeDropdown === msg.id ? null : msg.id)}
                  className="p-2 rounded-full bg-neon-gray/70 text-gray-400 hover:text-white hover:bg-neon-gray transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SafeIcon icon={FiMoreVertical} className="w-4 h-4" />
                </motion.button>
                
                {activeDropdown === msg.id && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-0 right-0 mb-12 w-52 glass rounded-xl border border-neon-green/20 shadow-neon z-10 backdrop-blur-md"
                  >
                    <div className="p-3 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2 font-medium">Silenciar por:</label>
                        <select 
                          value={muteDuration}
                          onChange={(e) => setMuteDuration(e.target.value)}
                          className="w-full text-sm bg-neon-gray/70 text-white border border-neon-green/20 rounded-lg p-2 focus:border-neon-green transition-colors"
                        >
                          <option value="5m">5 minutos</option>
                          <option value="15m">15 minutos</option>
                          <option value="1h">1 hora</option>
                          <option value="24h">24 horas</option>
                        </select>
                      </div>
                      
                      <motion.button 
                        onClick={() => handleMuteUser(msg.userId, msg.user)}
                        className="w-full flex items-center space-x-2 p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg text-sm transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        <SafeIcon icon={FiVolumeX} className="w-4 h-4" />
                        <span>Silenciar usuário</span>
                      </motion.button>
                      
                      <motion.button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="w-full flex items-center space-x-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        <SafeIcon icon={FiTrash} className="w-4 h-4" />
                        <span>Deletar mensagem</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-xl p-6 mb-6 border border-neon-green/30 shadow-neon"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-neon-green/20 to-green-500/10 rounded-xl">
              <SafeIcon icon={FiUsers} className="w-7 h-7 text-neon-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neon-green bg-clip-text text-transparent">
                Bate-Papo da Comunidade
              </h1>
              <p className="text-gray-300">Conecte-se com outros membros em tempo real</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse shadow-neon"></div>
              <p className="text-neon-green font-bold text-lg">{onlineUsers}</p>
            </div>
            <p className="text-gray-400 text-sm">membros online</p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Messages Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 glass rounded-xl border border-neon-green/30 overflow-hidden shadow-neon"
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-neon-green/20"></div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="p-6 bg-neon-green/10 rounded-full mb-6">
                  <SafeIcon icon={FiMessageCircle} className="w-16 h-16 text-neon-green/50" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Seja o primeiro!</h3>
                <p className="text-center max-w-md">Nenhuma mensagem ainda. Comece a conversa e conecte-se com a comunidade.</p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {renderMessage(msg)}
                  </div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Message Input */}
          <div className="border-t border-neon-green/20 p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      messageType === 'text' 
                        ? "Digite sua mensagem..." 
                        : messageType === 'link' 
                          ? "Cole um link..." 
                          : "Cole o URL da imagem..."
                    }
                    className={`w-full px-6 py-4 bg-neon-gray/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:shadow-neon transition-all duration-300 ${
                      messageType === 'text' 
                        ? 'border-neon-green/30 focus:border-neon-green' 
                        : messageType === 'link' 
                          ? 'border-blue-500/50 focus:border-blue-500' 
                          : 'border-purple-500/50 focus:border-purple-500'
                    }`}
                  />
                  {messageType !== 'text' && (
                    <motion.button 
                      type="button"
                      onClick={() => setMessageType('text')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-red-500/20 rounded-full text-red-400 hover:bg-red-500/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {/* Enhanced Media Buttons */}
                {user.hasPurchased && (
                  <div className="flex space-x-2">
                    <motion.button
                      type="button"
                      className={`p-4 border rounded-xl transition-all duration-300 ${
                        messageType === 'image' 
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-lg' 
                          : 'bg-neon-gray/50 border-neon-green/30 text-gray-400 hover:text-neon-green hover:border-neon-green hover:shadow-neon'
                      }`}
                      title="Enviar imagem"
                      onClick={() => toggleMessageType('image')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SafeIcon icon={FiImage} className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      className={`p-4 border rounded-xl transition-all duration-300 ${
                        messageType === 'link' 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg' 
                          : 'bg-neon-gray/50 border-neon-green/30 text-gray-400 hover:text-neon-green hover:border-neon-green hover:shadow-neon'
                      }`}
                      title="Enviar link"
                      onClick={() => toggleMessageType('link')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SafeIcon icon={FiLink} className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      className="p-4 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-gray-400 hover:text-neon-green hover:border-neon-green transition-all duration-300 opacity-50 cursor-not-allowed"
                      title="Enviar áudio (em breve)"
                      disabled
                    >
                      <SafeIcon icon={FiMic} className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}

                {/* Enhanced Send Button */}
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-neon text-black font-bold py-4 px-8 rounded-xl flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(57, 255, 20, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiSend} className="w-5 h-5" />
                  <span>Enviar</span>
                </motion.button>
              </div>
              
              {/* Premium Notice */}
              {!user.hasPurchased && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <SafeIcon icon={FiLock} className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-yellow-300 font-medium">Acesso Limitado</p>
                      <p className="text-yellow-300/80 text-sm">Apenas mensagens de texto. Compre para liberar imagens, links e áudios.</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Muted Users Panel */}
              {mutedUsers.length > 0 && user.isAdmin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-gray-700/50 border border-gray-500/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="text-gray-300 text-sm">
                    <div className="font-semibold mb-2 flex items-center">
                      <SafeIcon icon={FiVolumeX} className="w-4 h-4 mr-2 text-red-400" />
                      Usuários silenciados:
                    </div>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {mutedUsers.map(muted => (
                        <div key={muted.userId} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2">
                          <span className="font-medium">{muted.username}</span>
                          <span className="text-xs text-gray-400">
                            até {muted.until.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;