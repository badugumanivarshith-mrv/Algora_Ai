import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Star, Filter, Tag, Users, ShieldCheck } from 'lucide-react';
import { aiosApi } from '../../services/aiosApi';

const Marketplace: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const fetchMarketplace = async () => {
    try {
      const res = await aiosApi.getMarketplace();
      setItems(res.data || []);
    } catch (e) {
      console.error('Failed to fetch marketplace', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (id: string) => {
    try {
      await aiosApi.installAgent(id);
      alert('Agent installed successfully!');
      fetchMarketplace();
    } catch (e) {
      console.error('Installation failed', e);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enterprise agents, templates, and workflows..."
            className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-bold transition-all">
            <Filter size={18} />
            Category
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-bold transition-all">
            <Tag size={18} />
            Price
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-24">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  {Number(item.rating_avg).toFixed(1)}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{item.name}</h3>
              <p className="text-neutral-500 text-sm mb-6 line-clamp-2">{item.description}</p>

              <div className="flex items-center gap-4 mb-6 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  {item.install_count} Installs
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={14} />
                  {item.category}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-bold">
                  {item.price_credits > 0 ? `${item.price_credits} Credits` : 'Free'}
                </div>
                <button 
                  onClick={() => handleInstall(item.id)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                >
                  <Download size={18} />
                  Install
                </button>
              </div>
            </motion.div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-24 text-neutral-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="font-bold">No agents matching your search.</p>
              <button 
                onClick={() => setSearch('')}
                className="mt-4 text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
