// frontend/src/components/SymbolSelector.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', color: 'from-orange-400 to-orange-600', price: '$45,230' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', color: 'from-blue-400 to-blue-600', price: '$2,890' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎', color: 'from-purple-400 to-purple-600', price: '$98.50' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', color: 'from-blue-300 to-blue-500', price: '$0.48' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●', color: 'from-pink-400 to-pink-600', price: '$6.75' },
  { symbol: 'LINKUSDT', name: 'Chainlink', icon: '⬢', color: 'from-blue-500 to-blue-700', price: '$14.20' },
];

const SymbolSelector = ({ selectedSymbol, onSymbolChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedCrypto = SYMBOLS.find(s => s.symbol === selectedSymbol);
  
  const filteredSymbols = SYMBOLS.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative z-50">
      <motion.button
        className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 w-full md:w-80 flex items-center justify-between border border-white/10 shadow-xl hover:from-white/15 hover:to-white/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <motion.div 
            className={`w-12 h-12 bg-gradient-to-r ${selectedCrypto?.color} rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg`}
            whileHover={{ rotate: 5 }}
          >
            {selectedCrypto?.icon}
          </motion.div>
          
          <div className="text-right">
            <div className="font-bold text-white text-lg">{selectedCrypto?.name}</div>
            <div className="text-sm text-gray-400">{selectedSymbol}</div>
            <div className="text-xs text-green-400 font-semibold">{selectedCrypto?.price}</div>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="w-6 h-6 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full mt-3 w-full bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* شريط البحث */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث عن عملة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pr-10 pl-4 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* قائمة العملات */}
            <div className="max-h-64 overflow-y-auto">
              {filteredSymbols.map((crypto, index) => (
                <motion.button
                  key={crypto.symbol}
                  className="w-full p-4 flex items-center space-x-4 space-x-reverse hover:bg-white/10 transition-colors group"
                  onClick={() => {
                    onSymbolChange(crypto.symbol);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <motion.div 
                    className={`w-10 h-10 bg-gradient-to-r ${crypto.color} rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform`}
                  >
                    {crypto.icon}
                  </motion.div>
                  
                  <div className="text-right flex-1">
                    <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {crypto.name}
                    </div>
                    <div className="text-sm text-gray-400">{crypto.symbol}</div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-green-400 font-semibold text-sm">{crypto.price}</div>
                    {selectedSymbol === crypto.symbol && (
                      <motion.div
                        className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </div>
                </motion.button>
              ))}
              
              {filteredSymbols.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  لم يتم العثور على عملات مطابقة
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SymbolSelector;