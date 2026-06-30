import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Download, 
  Star, 
  Check, 
  Sparkles, 
  Puzzle, 
  Bot, 
  Layout, 
  Grid 
} from 'lucide-react';
import { MARKETPLACE_ITEMS } from './SaaSData';
import { motion, AnimatePresence } from 'motion/react';

export default function MarketplaceModule() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [installedIds, setInstalledIds] = useState<string[]>(['mp_1']); // preset GST sync installed

  const categories = ['All', 'Plugins', 'AI Agents', 'Themes', 'Extensions'];

  const filteredItems = MARKETPLACE_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInstall = (id: string) => {
    if (installedIds.includes(id)) {
      setInstalledIds(prev => prev.filter(item => item !== id));
    } else {
      setInstalledIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-cyan-600 animate-pulse" />
            <span>RBA AI PRO Global Extension Marketplace</span>
          </h2>
          <p className="text-xs text-gray-500">Extend your isolated workspace capabilities by downloading plugins, custom themes, and expert AI lawyer agents.</p>
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search plugins & themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 bg-gray-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-gray-900 transition-all"
          />
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-gray-900 text-white shadow-sm scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'All' && <Grid className="w-3.5 h-3.5 inline mr-1" />}
              {cat === 'Plugins' && <Puzzle className="w-3.5 h-3.5 inline mr-1" />}
              {cat === 'AI Agents' && <Bot className="w-3.5 h-3.5 inline mr-1 text-cyan-500" />}
              {cat === 'Themes' && <Layout className="w-3.5 h-3.5 inline mr-1" />}
              {cat === 'Extensions' && <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-500" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Marketplace grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const isInstalled = installedIds.includes(item.id);
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      item.category === 'AI Agents' 
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' 
                        : item.category === 'Plugins' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : item.category === 'Themes'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {item.category.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{item.rating.toFixed(1)}</span>
                      <span className="text-gray-400 font-normal">({item.installs}+)</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900">{item.name}</h3>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed min-h-[50px]">{item.desc}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-800">{item.price}</span>
                  <button
                    onClick={() => handleInstall(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isInstalled 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Install Node</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm font-semibold text-gray-500">No extensions match your filter parameters.</p>
          <p className="text-xs text-gray-400 mt-1">Try refining your search terms or choosing a different category.</p>
        </div>
      )}
    </div>
  );
}
