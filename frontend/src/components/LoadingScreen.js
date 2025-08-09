import React from 'react';
import { motion } from 'framer-motion';
import { CpuChipIcon } from '@heroicons/react/24/outline';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo Animation */}
        <motion.div
          className="relative mb-8"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-50"></div>
          <CpuChipIcon className="relative w-24 h-24 text-white mx-auto" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          منصة التداول الذكي
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-gray-300 text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          تحليل شامل بالذكاء الصناعي
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          className="flex items-center justify-center space-x-2 space-x-reverse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="text-white">جاري التحميل</div>
          <div className="flex space-x-1 space-x-reverse">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Features List */}
        <motion.div
          className="mt-12 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {[
            'تحليل فني متقدم',
            'ذكاء صناعي متطور', 
            'تنبؤات دقيقة',
            'تحليل شامل'
          ].map((feature, index) => (
            <motion.div
              key={feature}
              className="text-gray-400 text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + (index * 0.1), duration: 0.5 }}
            >
              ✨ {feature}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
