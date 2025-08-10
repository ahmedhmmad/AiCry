// src/components/Dashboard/AnalysisTab.js
import React from 'react';
import { PriceCard } from './PriceCard';
import { DecisionCard } from './DecisionCard';
import { ControlCard } from './ControlCard';
import TechnicalAnalysisCard from './TechnicalAnalysisCard';
import SimpleAICard from './SimpleAICard';
import AdvancedAICard from './AdvancedAICard';
import WyckoffAnalysisCard from './WyckoffAnalysisCard';
import DetailedCalculations from './DetailedCalculations';

// Helper function for recommendation text
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

export const AnalysisTab = ({ 
  loading, 
  currentPrice, 
  lastUpdate, 
  analysisData, 
  onRefresh,
  selectedSymbol,
  wyckoffEnabled,
  wyckoffSettings,
  viewMode,
  setViewMode,
  showCalculations,
  setShowCalculations
}) => {
  return (
    <div className="space-y-6">
      {/* View Mode Controls */}
      {analysisData && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-sm">وضع العرض:</span>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => setViewMode('enhanced')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'enhanced'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:text-white bg-gray-700'
                }`}
              >
                محسن ومفصل
              </button>
              <button
                onClick={() => setViewMode('classic')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'classic'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white bg-gray-700'
                }`}
              >
                كلاسيكي
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {viewMode === 'enhanced' && 'عرض محسن مع حسابات مفصلة وتحليل شامل'}
            {viewMode === 'classic' && 'العرض التقليدي السابق'}
          </div>
        </div>
      )}

      {/* Main Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PriceCard 
          loading={loading} 
          currentPrice={currentPrice} 
          lastUpdate={lastUpdate} 
        />
        <DecisionCard 
          loading={loading} 
          analysisData={analysisData} 
        />
        <ControlCard 
          loading={loading} 
          analysisData={analysisData} 
          onRefresh={onRefresh}
          selectedSymbol={selectedSymbol}
          wyckoffEnabled={wyckoffEnabled}
          wyckoffSettings={wyckoffSettings}
        />
      </div>

      {/* Final Recommendation Display */}
      {analysisData?.ultimate_decision && (
        <div className={`rounded-xl p-6 text-white ${
          analysisData.ultimate_decision.final_recommendation.includes('BUY') ? 'bg-gradient-to-r from-green-600 to-green-700' :
          analysisData.ultimate_decision.final_recommendation.includes('SELL') ? 'bg-gradient-to-r from-red-600 to-red-700' :
          'bg-gradient-to-r from-yellow-600 to-orange-700'
        }`}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              {(() => {
                const rec = analysisData.ultimate_decision.final_recommendation;
                if (rec.includes('BUY')) return '🚀 ' + getRecommendationText(rec);
                if (rec.includes('SELL')) return '📉 ' + getRecommendationText(rec);
                return '⏳ ' + getRecommendationText(rec);
              })()}
            </div>
            <div className="text-lg mb-3">
              معدل الثقة: {analysisData.ultimate_decision.final_confidence}%
            </div>
            <div className="text-sm opacity-90">
              {analysisData.ultimate_decision.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced View - Detailed Analysis Layers */}
      {viewMode === 'enhanced' && analysisData && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">طبقات التحليل المفصلة</h3>
          
          {/* Analysis Layers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Technical Analysis Card */}
            {analysisData.analysis_layers?.['1_technical_analysis'] && (
              <TechnicalAnalysisCard 
                data={analysisData.analysis_layers['1_technical_analysis']}
                loading={loading}
              />
            )}

            {/* Simple AI Card */}
            {analysisData.analysis_layers?.['2_simple_ai'] && (
              <SimpleAICard 
                data={analysisData.analysis_layers['2_simple_ai']}
                loading={loading}
              />
            )}

            {/* Advanced AI Card */}
            {analysisData.analysis_layers?.['3_advanced_ai'] && (
              <AdvancedAICard 
                data={analysisData.analysis_layers['3_advanced_ai']}
                loading={loading}
              />
            )}

            {/* Wyckoff Analysis Card */}
            {wyckoffEnabled && analysisData.wyckoff_analysis && (
              <WyckoffAnalysisCard 
                data={analysisData.wyckoff_analysis}
                loading={loading}
              />
            )}
          </div>

          {/* Detailed Calculations Toggle */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold">عرض الحسابات التفصيلية:</span>
              <button
                onClick={() => setShowCalculations(!showCalculations)}
                className={`relative inline-flex h-6 w-12 rounded-full transition-colors ${
                  showCalculations ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${
                    showCalculations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {showCalculations && analysisData && (
              <DetailedCalculations analysisData={analysisData} />
            )}
          </div>
        </div>
      )}

      {/* Classic View - Simple Display */}
      {viewMode === 'classic' && analysisData && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">ملخص التحليل</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-500/20 rounded-lg">
              <div className="text-blue-400 font-semibold">التحليل الفني</div>
              <div className="text-xs text-gray-400 mt-1">
                {analysisData.analysis_layers?.['1_technical_analysis'] ? 'متاح' : 'غير متاح'}
              </div>
            </div>
            <div className="text-center p-3 bg-green-500/20 rounded-lg">
              <div className="text-green-400 font-semibold">الذكاء الاصطناعي البسيط</div>
              <div className="text-xs text-gray-400 mt-1">
                {analysisData.analysis_layers?.['2_simple_ai'] ? 'متاح' : 'غير متاح'}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-500/20 rounded-lg">
              <div className="text-purple-400 font-semibold">الذكاء الاصطناعي المتقدم</div>
              <div className="text-xs text-gray-400 mt-1">
                {analysisData.analysis_layers?.['3_advanced_ai'] ? 'متاح' : 'غير متاح'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};