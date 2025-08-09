import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', color: 'text-orange-400' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', color: 'text-blue-400' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎', color: 'text-purple-400' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', color: 'text-blue-300' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●', color: 'text-pink-400' },
  { symbol: 'LINKUSDT', name: 'Chainlink', icon: '⬢', color: 'text-blue-500' },
];

const SymbolSelector = ({ selectedSymbol, onSymbolChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedCrypto = SYMBOLS.find(s => s.symbol === selectedSymbol);

  return (
    <div className="relative">
      <motion.button
        className="glass-effect rounded-xl p-4 w-full md:w-80 flex items-center justify-between card-hover"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className={`text-2xl ${selectedCrypto?.color}`}>
            {selectedCrypto?.icon}
          </span>
          <div className="text-right">
            <div className="font-semibold text-white">{selectedCrypto?.name}</div>
            <div className="text-sm text-gray-400">{selectedSymbol}</div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      {isOpen && (
        <motion.div
          className="absolute top-full mt-2 w-full glass-effect rounded-xl overflow-hidden z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {SYMBOLS.map((crypto, index) => (
            <motion.button
              key={crypto.symbol}
              className="w-full p-4 flex items-center space-x-3 space-x-reverse hover:bg-white/10 transition-colors"
              onClick={() => {
                onSymbolChange(crypto.symbol);
                setIsOpen(false);
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <span className={`text-2xl ${crypto.color}`}>
                {crypto.icon}
              </span>
              <div className="text-right flex-1">
                <div className="font-semibold text-white">{crypto.name}</div>
                <div className="text-sm text-gray-400">{crypto.symbol}</div>
              </div>
              {selectedSymbol === crypto.symbol && (
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SymbolSelector;
