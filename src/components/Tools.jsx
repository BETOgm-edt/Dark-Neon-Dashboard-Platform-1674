import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiTool, FiSearch, FiFilter, FiGrid, FiList, FiExternalLink, FiAlertCircle, FiX } = FiIcons;

const Tools = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePreview, setActivePreview] = useState(null);

  const categories = [
    { value: 'all', label: 'Todas' },
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

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const handleToolClick = (tool) => {
    if (tool.redirect_url) {
      window.open(tool.redirect_url, '_blank', 'noopener,noreferrer');
    } else {
      setActivePreview(activePreview === tool.id ? null : tool.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-xl p-6 border border-neon-green/30 shadow-neon"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-neon-green/20 to-green-500/10 rounded-xl">
            <SafeIcon icon={FiTool} className="w-8 h-8 text-neon-green" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-neon-green bg-clip-text text-transparent">
              Ferramentas Exclusivas
            </h1>
            <p className="text-gray-300 text-lg">
              Acesse nossa coleção de ferramentas premium para potencializar seus resultados
            </p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass rounded-xl p-6 border border-neon-green/30 shadow-neon"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Enhanced Search */}
            <div className="relative">
              <SafeIcon
                icon={FiSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neon-green w-5 h-5"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ferramentas..."
                className="pl-12 pr-4 py-3 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300 min-w-[250px]"
              />
            </div>

            {/* Enhanced Category Filter */}
            <div className="relative">
              <SafeIcon
                icon={FiFilter}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neon-green w-5 h-5"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 bg-neon-gray/50 border border-neon-green/30 rounded-xl text-white focus:outline-none focus:border-neon-green focus:shadow-neon transition-all duration-300 appearance-none min-w-[180px]"
              >
                {categories.map(category => (
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

          {/* Enhanced View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-neon-gray/30 rounded-xl p-1">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-neon-green text-black shadow-neon'
                  : 'text-gray-400 hover:text-white hover:bg-neon-gray/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiGrid} className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-neon-green text-black shadow-neon'
                  : 'text-gray-400 hover:text-white hover:bg-neon-gray/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiList} className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        
        {/* Results counter */}
        <div className="mt-4 pt-4 border-t border-neon-green/20">
          <p className="text-gray-400 text-sm">
            Encontradas <span className="text-neon-green font-semibold">{filteredTools.length}</span> ferramentas
            {searchTerm && <span> para "{searchTerm}"</span>}
            {selectedCategory !== 'all' && <span> na categoria "{categories.find(c => c.value === selectedCategory)?.label}"</span>}
          </p>
        </div>
      </motion.div>

      {/* Enhanced Tools Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-green"></div>
            <div className="absolute inset-0 rounded-full border-2 border-neon-green/20"></div>
          </div>
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center backdrop-blur-sm"
        >
          <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 text-xl font-semibold mb-2">Ops! Algo deu errado</h3>
          <p className="text-red-400/80 mb-6">{error}</p>
          <motion.button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tentar novamente
          </motion.button>
        </motion.div>
      ) : filteredTools.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-20"
        >
          <div className="p-8 bg-neon-green/10 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiSearch} className="w-16 h-16 text-neon-green/50" />
          </div>
          <h3 className="text-white text-2xl font-bold mb-3">Nenhuma ferramenta encontrada</h3>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Tente ajustar seus filtros de busca ou explore outras categorias
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}
        >
          <AnimatePresence>
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 * index }}
                whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(57, 255, 20, 0.15)' }}
                className={`group relative overflow-hidden rounded-xl border border-neon-green/20 hover:border-neon-green/40 transition-all duration-500 cursor-pointer bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm ${
                  viewMode === 'list' ? 'flex h-48' : 'flex flex-col'
                }`}
                onClick={() => handleToolClick(tool)}
              >
                {viewMode === 'list' ? (
                  <>
                    {/* List view image - 40% width */}
                    <div className="w-2/5 relative overflow-hidden">
                      <img
                        src={tool.image_url}
                        alt={tool.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/400x300/1a1a1a/39FF14?text=Imagem+Indisponível";
                        }}
                      />
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/50"></div>
                      
                      {/* Category badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-neon-green/95 text-black px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                          {categories.find(cat => cat.value === tool.category)?.label}
                        </span>
                      </div>
                    </div>
                    
                    {/* List view content - 60% width */}
                    <div className="w-3/5 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-bold text-xl mb-3 group-hover:text-neon-green transition-colors duration-300 leading-tight">
                          {tool.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                          {tool.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        {tool.redirect_url ? (
                          <div className="text-neon-green flex items-center space-x-2 text-sm font-semibold">
                            <span>Acessar ferramenta</span>
                            <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm italic">
                            Em breve
                          </span>
                        )}
                        
                        {/* New indicator */}
                        {index < 2 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                            <span className="text-neon-green text-xs font-bold">NOVO</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Grid view - 90% image, 10% content */}
                    <div className="relative h-80 overflow-hidden">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      
                      {/* Title over image */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-bold text-xl leading-tight text-shadow-lg">
                          {tool.title}
                        </h3>
                      </div>
                      
                      {/* Category badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-neon-green/95 text-black px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
                          {categories.find(cat => cat.value === tool.category)?.label}
                        </span>
                      </div>
                      
                      {/* New badge */}
                      {index < 2 && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-yellow-400/95 text-black px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm flex items-center shadow-lg">
                            <span className="w-1.5 h-1.5 bg-black rounded-full mr-2 animate-pulse"></span>
                            NOVO
                          </span>
                        </div>
                      )}
                      
                      {/* Hover overlay with action */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        {tool.redirect_url ? (
                          <div className="text-center">
                            <div className="p-4 bg-neon-green/20 rounded-full mb-3 mx-auto w-fit">
                              <SafeIcon icon={FiExternalLink} className="w-8 h-8 text-neon-green" />
                            </div>
                            <p className="text-white font-semibold">Clique para acessar</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="p-4 bg-yellow-500/20 rounded-full mb-3 mx-auto w-fit">
                              <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-yellow-400" />
                            </div>
                            <p className="text-yellow-300 font-semibold">Em breve</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Grid view content - 10% */}
                    <div className="p-4 h-20 flex items-center justify-between">
                      <p className="text-gray-300 text-sm line-clamp-2 flex-1 pr-4">
                        {tool.description}
                      </p>
                      
                      <motion.button 
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          activePreview === tool.id 
                            ? 'bg-neon-green text-black shadow-neon' 
                            : 'bg-neon-gray/50 text-gray-400 group-hover:text-neon-green group-hover:bg-neon-green/20'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePreview(activePreview === tool.id ? null : tool.id);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <SafeIcon icon={activePreview === tool.id ? FiX : FiSearch} className="w-4 h-4" />
                      </motion.button>
                    </div>
                    
                    {/* Enhanced Preview panel */}
                    {activePreview === tool.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-neon-green/20 overflow-hidden bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm"
                      >
                        <div className="p-6">
                          <h4 className="font-bold text-neon-green mb-3 text-lg">
                            Sobre esta ferramenta
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            {tool.description}
                          </p>
                          
                          {tool.redirect_url ? (
                            <motion.a
                              href={tool.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-neon text-black font-bold py-3 px-6 rounded-xl inline-flex items-center space-x-3 shadow-neon"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(57, 255, 20, 0.5)' }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>Acessar agora</span>
                              <SafeIcon icon={FiExternalLink} className="w-5 h-5" />
                            </motion.a>
                          ) : (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                                <div>
                                  <p className="text-yellow-300 font-semibold">Em desenvolvimento</p>
                                  <p className="text-yellow-300/80 text-sm">Esta ferramenta estará disponível em breve.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Tools;