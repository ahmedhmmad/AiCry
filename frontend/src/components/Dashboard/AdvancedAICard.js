// frontend/src/components/Dashboard/AdvancedAICard.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BoltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export const AdvancedAICard = ({ data, loading }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-pulse">
        <div className="flex items-center space-x-2 space-x-reverse mb-3">
          <BoltIcon className="w-5 h-5 text-purple-400" />
          <div className="h-4 bg-purple-400/20 rounded w-48"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-purple-400/10 rounded"></div>
          <div className="h-4 bg-purple-400/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
        <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>لا توجد بيانات الذكاء الاصطناعي المتقدم</p>
      </div>
    );
  }

  const ensemblePrediction = data.ensemble_prediction || {};
  const individualModels = data.individual_models || {};

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'STRONG_BUY':
        return 'text-green-400';
      case 'SELL':
      case 'STRONG_SELL':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'STRONG_BUY':
        return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <ArrowTrendingDownIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatRecommendation = (rec) => {
    const translations = {
      'BUY': 'شراء',
      'SELL': 'بيع',
      'HOLD': 'انتظار',
      'STRONG_BUY': 'شراء قوي',
      'STRONG_SELL': 'بيع قوي'
    };
    return translations[rec] || rec;
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-500/20 to-violet-600/10 backdrop-blur-xl rounded-xl p-4 border border-purple-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 space-x-reverse">
          <BoltIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">الذكاء الاصطناعي المتقدم</h3>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
            {ensemblePrediction.confidence?.toFixed(0) || 0}%
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* التوصية الرئيسية */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">التنبؤ النهائي:</span>
          <div className={`flex items-center space-x-1 space-x-reverse font-semibold ${getRecommendationColor(ensemblePrediction.final_decision)}`}>
            {getRecommendationIcon(ensemblePrediction.final_decision)}
            <span>{formatRecommendation(ensemblePrediction.final_decision)}</span>
          </div>
        </div>

        {/* شريط الثقة */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">مستوى الثقة</span>
            <span className="text-white font-semibold">{ensemblePrediction.confidence?.toFixed(0) || 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${ensemblePrediction.confidence || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* الاحتماليات */}
        {ensemblePrediction.probabilities && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">صعود:</span>
              <span className="text-green-400">{(ensemblePrediction.probabilities.up * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">هبوط:</span>
              <span className="text-red-400">{(ensemblePrediction.probabilities.down * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* التفاصيل الموسعة */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 pt-3 space-y-3"
            >
              {/* النماذج الفردية */}
              <div>
                <h4 className="text-purple-400 font-medium text-sm mb-2">النماذج الفردية:</h4>
                <div className="space-y-2">
                  {Object.entries(individualModels).map(([modelName, prediction]) => (
                    <div key={modelName} className="flex justify-between text-xs">
                      <span className="text-gray-400">{modelName}:</span>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <span className={getRecommendationColor(prediction.prediction)}>
                          {formatRecommendation(prediction.prediction)}
                        </span>
                        <span className="text-gray-500">({prediction.confidence?.toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* معلومات إضافية */}
              {ensemblePrediction.reasoning && (
                <div className="text-xs text-gray-300 bg-white/5 rounded p-2">
                  <span className="text-purple-400 font-medium">التفسير:</span> {ensemblePrediction.reasoning}
                </div>
              )}

              {/* إحصائيات النموذج */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">النماذج النشطة:</span>
                  <span className="text-white">{Object.keys(individualModels).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">وقت المعالجة:</span>
                  <span className="text-white">{ensemblePrediction.processing_time || '0.5'}ث</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};