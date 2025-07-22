import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiPlus, FiEdit, FiTrash2, FiUpload, FiSave, FiX, FiSettings, FiExternalLink, FiAlertCircle, FiCheck } = FiIcons;

const AdminPanel = () => {
  const [tools, setTools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: 'analytics',
    redirect_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const categories = [
    { value: 'analytics', label: 'Analytics' },
    { value: 'content', label: 'Conteúdo' },
    { value: 'automation', label: 'Automação' },
    { value: 'design', label: 'Design' }
  ];

  // Load tools from Supabase
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_tools_7h9f3k')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setTools(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Erro ao carregar as ferramentas. Tente novamente.');
        setLoading(false);
      }
    };
    
    fetchTools();
  }, []);

  const openModal = (tool = null) => {
    if (tool) {
      setEditingTool(tool);
      setFormData({
        title: tool.title,
        description: tool.description,
        image_url: tool.image_url || '',
        category: tool.category,
        redirect_url: tool.redirect_url || ''
      });
    } else {
      setEditingTool(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        category: 'analytics',
        redirect_url: ''
      });
    }
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTool(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category: 'analytics',
      redirect_url: ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (!formData.title.trim()) {
        setError('O título é obrigatório.');
        return;
      }
      
      if (!formData.description.trim()) {
        setError('A descrição é obrigatória.');
        return;
      }
      
      if (!formData.image_url.trim()) {
        setError('A URL da imagem é obrigatória.');
        return;
      }
      
      if (editingTool) {
        // Update existing tool
        const { data, error } = await supabase
          .from('marketplace_tools_7h9f3k')
          .update({
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            category: formData.category,
            redirect_url: formData.redirect_url
          })
          .eq('id', editingTool.id);
          
        if (error) throw error;
        
        // Update local state
        setTools(prev => 
          prev.map(tool => 
            tool.id === editingTool.id 
              ? { ...tool, ...formData } 
              : tool
          )
        );
        
        setSuccess('Ferramenta atualizada com sucesso!');
      } else {
        // Create new tool
        const { data, error } = await supabase
          .from('marketplace_tools_7h9f3k')
          .insert([
            {
              title: formData.title,
              description: formData.description,
              image_url: formData.image_url,
              category: formData.category,
              redirect_url: formData.redirect_url
            }
          ])
          .select();
          
        if (error) throw error;
        
        // Add to local state
        setTools(prev => [data[0], ...prev]);
        
        setSuccess('Ferramenta criada com sucesso!');
      }
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      console.error('Error submitting tool:', err);
      setError('Erro ao salvar a ferramenta. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      try {
        const { error } = await supabase
          .from('marketplace_tools_7h9f3k')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Update local state
        setTools(prev => prev.filter(tool => tool.id !== id));
      } catch (err) {
        console.error('Error deleting tool:', err);
        alert('Erro ao excluir a ferramenta. Tente novamente.');
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload to storage
      // For demo, we'll just use a placeholder
      setFormData(prev => ({
        ...prev,
        image_url: URL.createObjectURL(file)
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-xl p-6 border border-neon-green/30 shadow-neon"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-neon-green/20 to-green-500/10 rounded-xl">
              <SafeIcon icon={FiSettings} className="w-7 h-7 text-neon-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-neon-green bg-clip-text text-transparent">
                Painel Administrativo
              </h1>
              <p className="text-gray-300">Gerencie ferramentas e conteúdo da plataforma</p>
            </div>
          </div>
          <motion.button
            onClick={() => openModal()}
            className="btn-neon text-black font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 shadow-neon"
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(57, 255, 20, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
            <span>Nova Ferramenta</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Tools Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass rounded-xl p-6 border border-neon-green/30 shadow-neon"
      >
        <h2 className="text-xl font-bold text-white mb-6">Ferramentas Cadastradas</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
              <div className="absolute inset-0 rounded-full border-2 border-neon-green/20"></div>
            </div>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center backdrop-blur-sm"
          >
            <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
            >
              Tentar novamente
            </button>
          </motion.div>
        ) : tools.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="p-4 bg-neon-green/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiSettings} className="w-10 h-10 text-neon-green" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">Nenhuma ferramenta cadastrada</h3>
            <p className="text-gray-400 mb-6">Comece adicionando sua primeira ferramenta</p>
            <motion.button 
              onClick={() => openModal()} 
              className="btn-neon text-black font-semibold py-3 px-6 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Adicionar primeira ferramenta
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(57, 255, 20, 0.15)' }}
                className="group relative overflow-hidden rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition-all duration-500 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm"
              >
                {/* Image container - 90% height */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={tool.image_url}
                    alt={tool.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x300/1a1a1a/39FF14?text=Imagem+Indisponível";
                    }}
                  />
                  
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Title over image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg text-shadow-lg leading-tight">
                      {tool.title}
                    </h3>
                  </div>
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-neon-green/95 text-black px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
                      {categories.find(cat => cat.value === tool.category)?.label}
                    </span>
                  </div>
                  
                  {/* Admin controls */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <motion.button
                      onClick={() => openModal(tool)}
                      className="p-2.5 bg-neon-green/95 text-black rounded-xl hover:bg-neon-green shadow-lg backdrop-blur-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(tool.id)}
                      className="p-2.5 bg-red-500/95 text-white rounded-xl hover:bg-red-600 shadow-lg backdrop-blur-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Description section - 10% height */}
                <div className="p-4 h-20 flex flex-col justify-between">
                  <p className="text-gray-300 text-sm line-clamp-2 flex-1">
                    {tool.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    {tool.redirect_url ? (
                      <a
                        href={tool.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-green flex items-center space-x-1 text-sm font-medium hover:underline transition-colors duration-300"
                      >
                        <span>Acessar</span>
                        <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        Sem link
                      </span>
                    )}
                    
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="glass rounded-2xl p-8 w-full max-w-3xl border border-neon-green/40 shadow-neon-lg"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-neon-green/20 rounded-lg">
                  <SafeIcon icon={editingTool ? FiEdit : FiPlus} className="w-6 h-6 text-neon-green" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-neon-green bg-clip-text text-transparent">
                  {editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'}
                </h3>
              </div>
              <motion.button
                onClick={closeModal}
                className="p-3 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">
                  Imagem da Ferramenta
                </label>
                <div className="flex items-start space-x-6">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          image_url: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-4 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                      placeholder="Cole a URL da imagem aqui..."
                    />
                    <p className="text-xs text-gray-400">
                      Use uma imagem de alta qualidade (recomendado: 800x600px)
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-3 px-6 py-4 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-gray-300 hover:text-white hover:border-neon-green cursor-pointer transition-all duration-300 hover:shadow-neon"
                    >
                      <SafeIcon icon={FiUpload} className="w-5 h-5" />
                      <span className="font-medium">Upload</span>
                    </label>
                  </div>
                </div>
                
                {formData.image_url && (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border border-neon-green/20"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x300/1a1a1a/39FF14?text=Imagem+Inválida";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="absolute top-3 right-3 p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-all duration-300"
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold">
                    Título da Ferramenta
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-4 py-4 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                    placeholder="Nome da ferramenta"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-4 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-white focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                  >
                    {categories.map((category) => (
                      <option
                        key={category.value}
                        value={category.value}
                        className="bg-neon-gray text-white"
                      >
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-white font-semibold">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-4 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300 resize-none"
                  placeholder="Breve descrição da ferramenta e seus benefícios..."
                />
              </div>
              
              {/* Redirect URL */}
              <div className="space-y-2">
                <label className="block text-white font-semibold">
                  Link de Redirecionamento
                </label>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-neon-green/20 rounded-lg">
                    <SafeIcon icon={FiExternalLink} className="text-neon-green w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={formData.redirect_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        redirect_url: e.target.value,
                      }))
                    }
                    className="flex-1 px-4 py-4 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300"
                    placeholder="https://exemplo.com/ferramenta"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  URL para onde o usuário será direcionado ao clicar na ferramenta
                </p>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 backdrop-blur-sm"
                >
                  <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <span className="text-red-400">{error}</span>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3 backdrop-blur-sm"
                >
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-green-400">{success}</span>
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex items-center space-x-4 pt-6">
                <motion.button
                  type="submit"
                  className="btn-neon text-black font-bold py-4 px-8 rounded-xl flex items-center space-x-3 shadow-neon"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(57, 255, 20, 0.6)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SafeIcon icon={FiSave} className="w-5 h-5" />
                  <span>{editingTool ? 'Atualizar Ferramenta' : 'Criar Ferramenta'}</span>
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={closeModal}
                  className="py-4 px-8 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-gray-300 hover:text-white hover:border-neon-green transition-all duration-300 font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;