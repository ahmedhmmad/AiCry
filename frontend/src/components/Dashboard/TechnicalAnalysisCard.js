// src/components/Dashboard/TechnicalAnalysisCard.js
import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

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

export const TechnicalAnalysisCard = ({ data, loading }) => {
  if (loading || !data) {
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

  return (
    <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">التحليل الفني</h3>
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
      </div>
      
      <div className="space-y-3">
        {data.macd && (
          <div className="flex justify-between">
            <span className="text-gray-400">MACD:</span>
            <span className={`font-semibold ${
              data.macd.signal === 'BUY' ? 'text-green-400' : 
              data.macd.signal === 'SELL' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {data.macd.signal === 'BUY' ? 'إشارة شراء' : 
               data.macd.signal === 'SELL' ? 'إشارة بيع' : 'محايد'}
            </span>
          </div>
        )}
        
        {data.rsi && (
          <div className="flex justify-between">
            <span className="text-gray-400">RSI:</span>
            <span className={`font-semibold ${
              data.rsi.value > 70 ? 'text-red-400' : 
              data.rsi.value < 30 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {data.rsi.value?.toFixed(1)} - {data.rsi.interpretation || 'متوسط'}
            </span>
          </div>
        )}
        
        {data.moving_averages && (
          <div className="flex justify-between">
            <span className="text-gray-400">المتوسطات المتحركة:</span>
            <span className={`font-semibold ${
              data.moving_averages.trend === 'BULLISH' ? 'text-green-400' : 
              data.moving_averages.trend === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {data.moving_averages.trend === 'BULLISH' ? 'صاعد' : 
               data.moving_averages.trend === 'BEARISH' ? 'هابط' : 'جانبي'}
            </span>
          </div>
        )}
        
        <div className="flex justify-between pt-2 border-t border-white/10">
          <span className="text-gray-400">التوصية:</span>
          <span className={`font-semibold ${
            data.overall_recommendation?.includes('BUY') ? 'text-green-400' : 
            data.overall_recommendation?.includes('SELL') ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {getRecommendationText(data.overall_recommendation)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">مستوى الثقة:</span>
          <span className="text-white font-semibold">{data.confidence?.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisCard;