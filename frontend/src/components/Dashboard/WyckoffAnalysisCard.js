// src/components/Dashboard/WyckoffAnalysisCard.js
import React from 'react';
import { ScaleIcon } from '@heroicons/react/24/outline';

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

export const WyckoffAnalysisCard = ({ data, loading }) => {
  if (loading || !data) {
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

  if (data.error) {
    return (
      <div className="bg-orange-500/10 backdrop-blur-md rounded-xl p-6 border border-orange-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">تحليل وايكوف</h3>
          <ScaleIcon className="w-6 h-6 text-orange-400" />
        </div>
        <div className="text-center text-gray-400">
          <div className="text-sm">تحليل وايكوف غير متاح</div>
          <div className="text-xs mt-1">{data.error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-500/10 backdrop-blur-md rounded-xl p-6 border border-orange-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">تحليل وايكوف</h3>
        <ScaleIcon className="w-6 h-6 text-orange-400" />
      </div>
      
      <div className="space-y-3">
        {data.current_phase && (
          <div className="flex justify-between">
            <span className="text-gray-400">المرحلة الحالية:</span>
            <span className="text-white font-semibold">{data.current_phase}</span>
          </div>
        )}
        
        {data.phase_confidence && (
          <div className="flex justify-between">
            <span className="text-gray-400">ثقة المرحلة:</span>
            <span className="text-orange-400 font-semibold">
              {(data.phase_confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}
        
        {data.trading_recommendation && (
          <div className="flex justify-between">
            <span className="text-gray-400">التوصية:</span>
            <span className={`font-semibold ${
              data.trading_recommendation.action === 'BUY' ? 'text-green-400' : 
              data.trading_recommendation.action === 'SELL' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {getRecommendationText(data.trading_recommendation.action)}
            </span>
          </div>
        )}
        
        {data.wyckoff_score && (
          <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-white/10">
            نقاط وايكوف: {data.wyckoff_score.total_score}/100
          </div>
        )}
      </div>
    </div>
  );
};

export default WyckoffAnalysisCard;