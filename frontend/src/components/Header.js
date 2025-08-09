import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, CpuChipIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <motion.header 
      className="glass-effect rounded-2xl p-6 mb-8"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center space-x-4 space-x-reverse"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur opacity-75"></div>
            <CpuChipIcon className="relative w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              منصة التداول الذكي
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              تحليل شامل بالذكاء الصناعي
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="flex items-center space-x-6 space-x-reverse"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <ChartBarIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">التحليل الفني</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <CpuChipIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">الذكاء الصناعي</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <SparklesIcon className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300">تحليل متقدم</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
