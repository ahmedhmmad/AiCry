import { SparklesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const DecisionCard = ({ loading, analysisData }) => {
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
        return <ArrowTrendingUpIcon className="w-6 h-6" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <ArrowTrendingDownIcon className="w-6 h-6" />;
      default:
        return <ClockIcon className="w-6 h-6" />;
    }
  };

  const getRecommendationText = (recommendation) => {
    const texts = {
      'BUY': 'شراء',
      'STRONG_BUY': 'شراء قوي',
      'SELL': 'بيع',
      'STRONG_SELL': 'بيع قوي',
      'HOLD': 'انتظار'
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
        <div>
          <div className={`flex items-center space-x-3 space-x-reverse mb-3 ${getRecommendationColor(analysisData.ultimate_decision.final_recommendation)}`}>
            {getRecommendationIcon(analysisData.ultimate_decision.final_recommendation)}
            <span className="text-2xl font-bold">
              {getRecommendationText(analysisData.ultimate_decision.final_recommendation)}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">مستوى الثقة:</span>
              <span className="text-white font-semibold">
                {analysisData.ultimate_decision.final_confidence}%
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                style={{ width: `${analysisData.ultimate_decision.final_confidence}%` }}
              />
            </div>
            
            <div className="text-sm text-gray-400 mt-2">
              {analysisData.ultimate_decision.reasoning}
            </div>
          </div>
        </div>
      ) : analysisData?.error ? (
        <div className="text-red-400 text-center">
          <div className="mb-2">{analysisData.error}</div>
          {analysisData.details && (
            <div className="text-xs text-gray-500">{analysisData.details}</div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center">في انتظار البيانات...</div>
      )}
    </div>
  );
};
