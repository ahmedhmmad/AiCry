import React from 'react';
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ClockIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export const DecisionCard = ({ loading, analysisData }) => {
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'STRONG_BUY':
      case 'WEAK_BUY':
        return 'text-green-400';
      case 'SELL':
      case 'STRONG_SELL':
      case 'WEAK_SELL':
        return 'text-red-400';
      case 'NEUTRAL':
        return 'text-gray-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'STRONG_BUY':
      case 'WEAK_BUY':
        return <ArrowTrendingUpIcon className="w-6 h-6" />;
      case 'SELL':
      case 'STRONG_SELL':
      case 'WEAK_SELL':
        return <ArrowTrendingDownIcon className="w-6 h-6" />;
      default:
        return <ClockIcon className="w-6 h-6" />;
    }
  };

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

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">القرار النهائي</h3>
        <SparklesIcon className="w-6 h-6 text-purple-400" />
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <ArrowPathIcon className="w-6 h-6 text-purple-400 animate-spin" />
            <span className="text-purple-400">تحليل البيانات...</span>
          </div>
        </div>
      ) : analysisData?.ultimate_decision ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={getRecommendationColor(analysisData.ultimate_decision.final_recommendation)}>
              {getRecommendationIcon(analysisData.ultimate_decision.final_recommendation)}
            </div>
            <div>
              <div className={`text-lg font-bold ${getRecommendationColor(analysisData.ultimate_decision.final_recommendation)}`}>
                {getRecommendationText(analysisData.ultimate_decision.final_recommendation)}
              </div>
              <div className="text-sm text-gray-400">
                الثقة: {analysisData.ultimate_decision.final_confidence}%
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-3">
            {analysisData.ultimate_decision.reasoning}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">مستوى المخاطر:</span>
            <span className={`px-2 py-1 rounded ${
              analysisData.ultimate_decision.risk_level === 'LOW' ? 'bg-green-500/20 text-green-400' :
              analysisData.ultimate_decision.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {analysisData.ultimate_decision.risk_level === 'LOW' ? 'منخفض' :
               analysisData.ultimate_decision.risk_level === 'MEDIUM' ? 'متوسط' : 'عالي'}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <div>لا توجد توصيات متاحة</div>
          <div className="text-xs mt-1">قم بتحديث التحليل للحصول على توصيات</div>
        </div>
      )}
    </div>
  );
};