// src/components/Dashboard/SimpleAICard.js
import React from 'react';
import { CpuChipIcon } from '@heroicons/react/24/outline';

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

export const SimpleAICard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">الذكاء الاصطناعي البسيط</h3>
          <CpuChipIcon className="w-6 h-6 text-green-400" />
        </div>
        <div className="text-center text-gray-400">
          <div className="text-sm">النموذج غير مدرب</div>
          <div className="text-xs mt-1">يحتاج لتدريب أولي</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">الذكاء الاصطناعي البسيط</h3>
        <CpuChipIcon className="w-6 h-6 text-green-400" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">التوصية:</span>
          <span className={`font-semibold ${
            data.recommendation?.includes('BUY') ? 'text-green-400' : 
            data.recommendation?.includes('SELL') ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {getRecommendationText(data.recommendation)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">مستوى الثقة:</span>
          <span className="text-white font-semibold">{data.confidence?.toFixed(1)}%</span>
        </div>
        
        {data.prediction_strength && (
          <div className="flex justify-between">
            <span className="text-gray-400">قوة التنبؤ:</span>
            <span className={`font-semibold ${
              data.prediction_strength === 'STRONG' ? 'text-green-400' : 
              data.prediction_strength === 'WEAK' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {data.prediction_strength === 'STRONG' ? 'قوي' :
               data.prediction_strength === 'WEAK' ? 'ضعيف' : 'متوسط'}
            </span>
          </div>
        )}
        
        {data.model_version && (
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-white/10">
            إصدار النموذج: {data.model_version}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAICard;