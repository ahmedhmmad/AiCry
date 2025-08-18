// frontend/src/components/LoadingScreen.js

import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* الشعار الرئيسي */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2 
          }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
            <motion.div
              className="text-white text-4xl font-bold"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ₿
            </motion.div>
          </div>
        </motion.div>

        {/* العنوان */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AiCry
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          منصة التداول الذكي بالذكاء الاصطناعي
        </motion.p>

        {/* شريط التقدم */}
        <motion.div
          className="w-80 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </motion.div>

        {/* المميزات */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {[
            { icon: '📊', text: 'تحليل فني متقدم' },
            { icon: '🤖', text: 'ذكاء صناعي متطور' },
            { icon: '🎯', text: 'تنبؤات دقيقة' },
            { icon: '📈', text: 'تحليل شامل للأسواق' }
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              className="flex items-center justify-center space-x-3 space-x-reverse text-gray-300"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + (index * 0.15), duration: 0.6 }}
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-lg">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* مؤشر التحميل */}
        <motion.div
          className="mt-12 flex items-center justify-center space-x-2 space-x-reverse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <motion.div
            className="w-3 h-3 bg-blue-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-3 h-3 bg-purple-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-3 h-3 bg-cyan-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;