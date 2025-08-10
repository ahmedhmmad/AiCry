// src/components/Dashboard/AdvancedAICard.js
import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const getRecommendationText = (recommendation) => {
  const texts = {
    'BUY': 'شراء',
    'STRONG_BUY': 'شراء قوي',
    'WEAK_BUY': 'شراء ضعيف',
    'SELL': 'بيع',
    'STRONG_SELL': 'بيع قوي',
    'WEAK_SELL': 'بيع ضعيف',
    'HOLD': 'انتظار',
    'NEUTRAL': 'محايد'
  };
  return texts[recommendation] || recommendation;
};

export const AdvancedAICard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-purple-500/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">الذكاء الاصطناعي المتقدم</h3>
          <SparklesIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="text-center text-gray-400">
          <div className="text-sm">النماذج غير مدربة</div>
          <div className="text-xs mt-1">يحتاج لتدريب النماذج المجمعة</div>
        </div>
      </div>
    );
  }

  const ensembleData = data.ensemble_prediction || data;

  return (
    <div className="bg-purple-500/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">الذكاء الاصطناعي المتقدم</h3>
        <SparklesIcon className="w-6 h-6 text-purple-400" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">التوصية:</span>
          <span className={`font-semibold ${
            ensembleData.recommendation?.includes('BUY') ? 'text-green-400' : 
            ensembleData.recommendation?.includes('SELL') ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {getRecommendationText(ensembleData.recommendation)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">مستوى الثقة:</span>
          <span className="text-white font-semibold">{ensembleData.confidence?.toFixed(1)}%</span>
        </div>
        
        {ensembleData.models_agreement && (
          <div className="flex justify-between">
            <span className="text-gray-400">اتفاق النماذج:</span>
            <span className={`font-semibold ${
              ensembleData.models_agreement > 80 ? 'text-green-400' : 
              ensembleData.models_agreement > 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {ensembleData.models_agreement?.toFixed(0)}%
            </span>
          </div>
        )}
        
        {data.individual_models && (
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-white/10">
            النماذج النشطة: {Object.keys(data.individual_models).length}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAICard;