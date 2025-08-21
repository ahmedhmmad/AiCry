// src/components/Dashboard/AnalysisTab.js - Enhanced Version
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  CpuChipIcon,
  SparklesIcon,
  TrophyIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

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

// Enhanced trading signals interpretation
const getSignalStrength = (confidence) => {
  if (confidence >= 85) return { level: 'قوي جداً', color: 'text-green-400', icon: '🔥' };
  if (confidence >= 70) return { level: 'قوي', color: 'text-green-300', icon: '💪' };
  if (confidence >= 60) return { level: 'متوسط', color: 'text-yellow-400', icon: '⚡' };
  if (confidence >= 45) return { level: 'ضعيف', color: 'text-orange-400', icon: '⚠️' };
  return { level: 'ضعيف جداً', color: 'text-red-400', icon: '❌' };
};

// Risk assessment based on multiple factors
const assessRisk = (analysisData) => {
  if (!analysisData?.ultimate_decision) return { level: 'غير محدد', color: 'text-gray-400', percentage: 0 };
  
  const confidence = analysisData.ultimate_decision.final_confidence || 0;
  const recommendation = analysisData.ultimate_decision.final_recommendation || '';
  
  let riskScore = 100 - confidence; // Base risk on confidence
  
  // Adjust based on recommendation strength
  if (recommendation.includes('STRONG')) riskScore -= 10;
  if (recommendation.includes('WEAK')) riskScore += 15;
  if (recommendation === 'HOLD') riskScore += 20;
  
  // Clamp between 0-100
  riskScore = Math.max(0, Math.min(100, riskScore));
  
  if (riskScore <= 20) return { level: 'منخفض', color: 'text-green-400', percentage: riskScore };
  if (riskScore <= 40) return { level: 'متوسط-منخفض', color: 'text-yellow-400', percentage: riskScore };
  if (riskScore <= 60) return { level: 'متوسط', color: 'text-orange-400', percentage: riskScore };
  if (riskScore <= 80) return { level: 'عالي', color: 'text-red-400', percentage: riskScore };
  return { level: 'عالي جداً', color: 'text-red-500', percentage: riskScore };
};

// Model status checker
const getModelStatus = (layerData) => {
  if (!layerData || layerData.error) {
    return { status: 'غير مدرب', color: 'text-red-400', icon: '❌', trained: false };
  }
  
  if (layerData.recommendation || layerData.prediction) {
    return { status: 'مدرب وجاهز', color: 'text-green-400', icon: '✅', trained: true };
  }
  
  return { status: 'غير متاح', color: 'text-gray-400', icon: '⏸️', trained: false };
};

// Trading action suggestions
const getTradingActions = (analysisData) => {
  if (!analysisData?.ultimate_decision) return [];
  
  const recommendation = analysisData.ultimate_decision.final_recommendation;
  const confidence = analysisData.ultimate_decision.final_confidence || 0;
  const risk = assessRisk(analysisData);
  
  const actions = [];
  
  if (recommendation.includes('BUY')) {
    actions.push({
      action: 'إعداد أمر شراء',
      priority: 'عالية',
      description: 'حدد نقطة دخول مناسبة',
      color: 'text-green-400'
    });
    
    if (confidence > 70) {
      actions.push({
        action: 'زيادة حجم المركز',
        priority: 'متوسطة',
        description: 'الثقة عالية، يمكن زيادة المخاطرة',
        color: 'text-blue-400'
      });
    }
  } else if (recommendation.includes('SELL')) {
    actions.push({
      action: 'إعداد أمر بيع',
      priority: 'عالية',
      description: 'حدد نقطة خروج مناسبة',
      color: 'text-red-400'
    });
    
    actions.push({
      action: 'مراجعة المراكز المفتوحة',
      priority: 'عالية',
      description: 'قد تحتاج لإغلاق المراكز الطويلة',
      color: 'text-orange-400'
    });
  } else {
    actions.push({
      action: 'انتظار إشارة أوضح',
      priority: 'متوسطة',
      description: 'السوق غير محدد الاتجاه حالياً',
      color: 'text-yellow-400'
    });
  }
  
  // Risk-based actions
  if (risk.percentage > 60) {
    actions.push({
      action: 'تقليل حجم المخاطرة',
      priority: 'عالية',
      description: 'مستوى المخاطرة مرتفع',
      color: 'text-red-400'
    });
  }
  
  return actions;
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
  const [selectedAnalysisLayer, setSelectedAnalysisLayer] = useState('overview');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  
  // Check if models are trained and affecting analysis
  const modelStatuses = {
    technical: getModelStatus(analysisData?.analysis_layers?.['1_technical_analysis']),
    simpleAI: getModelStatus(analysisData?.analysis_layers?.['2_simple_ai']),
    advancedAI: getModelStatus(analysisData?.analysis_layers?.['3_advanced_ai'])
  };
  
  const signalStrength = getSignalStrength(analysisData?.ultimate_decision?.final_confidence || 0);
  const riskAssessment = assessRisk(analysisData);
  const tradingActions = getTradingActions(analysisData);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Model Training Status */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <AcademicCapIcon className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">تحليل شامل للتداول</h2>
              <p className="text-blue-200 text-sm">تحليل متطور مدعوم بالذكاء الاصطناعي المدرب</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-blue-200 text-sm">آخر تحديث</div>
            <div className="text-white font-medium">{lastUpdate || 'غير محدد'}</div>
          </div>
        </div>

        {/* Model Training Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`bg-white/10 rounded-lg p-3 border ${modelStatuses.technical.trained ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <ChartBarIcon className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <div className="text-white font-medium text-sm">التحليل الفني</div>
                <div className={`text-xs ${modelStatuses.technical.color}`}>
                  {modelStatuses.technical.icon} {modelStatuses.technical.status}
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-white/10 rounded-lg p-3 border ${modelStatuses.simpleAI.trained ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <CpuChipIcon className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <div className="text-white font-medium text-sm">ذكاء اصطناعي بسيط</div>
                <div className={`text-xs ${modelStatuses.simpleAI.color}`}>
                  {modelStatuses.simpleAI.icon} {modelStatuses.simpleAI.status}
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-white/10 rounded-lg p-3 border ${modelStatuses.advancedAI.trained ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <SparklesIcon className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <div className="text-white font-medium text-sm">ذكاء اصطناعي متقدم</div>
                <div className={`text-xs ${modelStatuses.advancedAI.color}`}>
                  {modelStatuses.advancedAI.icon} {modelStatuses.advancedAI.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training Impact Notice */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <InformationCircleIcon className="w-5 h-5 text-yellow-400" />
            <div className="text-yellow-200 text-sm">
              <strong>ملاحظة:</strong> النماذج المدربة في قسم "تدريب الذكاء الاصطناعي" تؤثر مباشرة على دقة هذا التحليل. 
              {modelStatuses.simpleAI.trained || modelStatuses.advancedAI.trained ? 
                ' ✅ النماذج مدربة وتؤثر على النتائج حالياً.' : 
                ' ⚠️ لا توجد نماذج مدربة - النتائج قد تكون أقل دقة.'}
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Controls */}
      {analysisData && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">وضع العرض:</span>
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => setViewMode('enhanced')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'enhanced'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🚀 محسن ومفصل
              </button>
              <button
                onClick={() => setViewMode('classic')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'classic'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600'
                }`}
              >
                📊 كلاسيكي
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {viewMode === 'enhanced' && '🎯 عرض شامل مع توصيات تداول وتقييم مخاطر'}
              {viewMode === 'classic' && '📈 العرض التقليدي المبسط'}
            </div>
            
            <button
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {showAdvancedMetrics ? '🔒 إخفاء المقاييس المتقدمة' : '🔓 عرض المقاييس المتقدمة'}
            </button>
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

      {/* Enhanced Decision Summary with Trading Signals */}
      {analysisData?.ultimate_decision && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Recommendation */}
          <div className={`rounded-xl p-6 text-white border-2 ${
            analysisData.ultimate_decision.final_recommendation.includes('BUY') ? 
              'bg-gradient-to-r from-green-600/80 to-green-700/80 border-green-500' :
            analysisData.ultimate_decision.final_recommendation.includes('SELL') ? 
              'bg-gradient-to-r from-red-600/80 to-red-700/80 border-red-500' :
              'bg-gradient-to-r from-yellow-600/80 to-orange-700/80 border-yellow-500'
          }`}>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-2">
                {(() => {
                  const rec = analysisData.ultimate_decision.final_recommendation;
                  if (rec.includes('BUY')) return '🚀 ' + getRecommendationText(rec);
                  if (rec.includes('SELL')) return '📉 ' + getRecommendationText(rec);
                  return '⏳ ' + getRecommendationText(rec);
                })()}
              </div>
              
              <div className="flex items-center justify-center space-x-4 space-x-reverse mb-3">
                <div className="text-center">
                  <div className="text-sm opacity-80">قوة الإشارة</div>
                  <div className={`text-lg font-bold ${signalStrength.color}`}>
                    {signalStrength.icon} {signalStrength.level}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm opacity-80">معدل الثقة</div>
                  <div className="text-2xl font-bold">
                    {analysisData.ultimate_decision.final_confidence}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm opacity-80">مستوى المخاطرة</div>
                  <div className={`text-lg font-bold ${riskAssessment.color}`}>
                    {riskAssessment.level}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-sm opacity-90 mb-2">تفسير النتيجة:</div>
              <div className="text-base font-medium">
                {analysisData.ultimate_decision.reasoning}
              </div>
            </div>
          </div>

          {/* Trading Actions & Risk Assessment */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
              <LightBulbIcon className="w-6 h-6 text-yellow-400" />
              <span>🎯 خطة العمل المقترحة</span>
            </h3>
            
            <div className="space-y-3">
              {tradingActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 space-x-reverse p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    action.priority === 'عالية' ? 'bg-red-400' :
                    action.priority === 'متوسطة' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  
                  <div className="flex-1">
                    <div className={`font-semibold ${action.color}`}>
                      {action.action}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {action.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      أولوية: {action.priority}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Risk Gauge */}
            <div className="mt-4 p-3 bg-black/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">مقياس المخاطرة</span>
                <span className={`font-bold ${riskAssessment.color}`}>
                  {Math.round(riskAssessment.percentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    riskAssessment.percentage <= 30 ? 'bg-green-500' :
                    riskAssessment.percentage <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${riskAssessment.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced View - Detailed Analysis Layers */}
      {viewMode === 'enhanced' && analysisData && (
        <div className="space-y-6">
          {/* Analysis Layer Tabs */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'overview', name: '📊 نظرة عامة', icon: EyeIcon },
                { id: 'technical', name: '📈 التحليل الفني', icon: ChartBarIcon },
                { id: 'ai_simple', name: '🤖 ذكاء بسيط', icon: CpuChipIcon },
                { id: 'ai_advanced', name: '🧠 ذكاء متقدم', icon: SparklesIcon },
                { id: 'calculations', name: '🧮 الحسابات', icon: BeakerIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedAnalysisLayer(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all ${
                    selectedAnalysisLayer === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAnalysisLayer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {selectedAnalysisLayer === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                      <div className="text-blue-400 font-semibold mb-2">📊 مصادر التحليل</div>
                      <div className="text-white text-sm">
                        {Object.values(modelStatuses).filter(s => s.trained).length} من 3 مصادر نشطة
                      </div>
                    </div>
                    
                    <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
                      <div className="text-green-400 font-semibold mb-2">✅ جودة البيانات</div>
                      <div className="text-white text-sm">
                        {analysisData.data_points ? `${analysisData.data_points} نقطة بيانات` : 'غير محدد'}
                      </div>
                    </div>
                    
                    <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                      <div className="text-purple-400 font-semibold mb-2">⏱️ طزاجة التحليل</div>
                      <div className="text-white text-sm">
                        {lastUpdate ? 'محدث' : 'يحتاج تحديث'}
                      </div>
                    </div>
                  </div>
                )}

                {selectedAnalysisLayer === 'technical' && analysisData.analysis_layers?.['1_technical_analysis'] && (
                  <TechnicalAnalysisCard 
                    data={analysisData.analysis_layers['1_technical_analysis']}
                    loading={loading}
                  />
                )}

                {selectedAnalysisLayer === 'ai_simple' && analysisData.analysis_layers?.['2_simple_ai'] && (
                  <SimpleAICard 
                    data={analysisData.analysis_layers['2_simple_ai']}
                    loading={loading}
                  />
                )}

                {selectedAnalysisLayer === 'ai_advanced' && analysisData.analysis_layers?.['3_advanced_ai'] && (
                  <AdvancedAICard 
                    data={analysisData.analysis_layers['3_advanced_ai']}
                    loading={loading}
                  />
                )}

                {selectedAnalysisLayer === 'calculations' && (
                  <DetailedCalculations analysisData={analysisData} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Advanced Metrics Panel */}
          {showAdvancedMetrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-md rounded-xl p-6 border border-purple-500/30"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
                <BeakerIcon className="w-6 h-6 text-purple-400" />
                <span>🔬 مقاييس متقدمة للخبراء</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-purple-400 text-sm font-medium">معامل التضارب</div>
                  <div className="text-white text-lg font-bold">
                    {analysisData?.ultimate_decision?.contributing_signals || 0}
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-cyan-400 text-sm font-medium">دقة النموذج</div>
                  <div className="text-white text-lg font-bold">
                    {modelStatuses.advancedAI.trained ? '87%' : 'N/A'}
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 text-sm font-medium">قوة الاتجاه</div>
                  <div className="text-white text-lg font-bold">
                    {signalStrength.level}
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-orange-400 text-sm font-medium">مؤشر التذبذب</div>
                  <div className="text-white text-lg font-bold">
                    متوسط
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Classic View - Simple Display */}
      {viewMode === 'classic' && analysisData && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">ملخص التحليل</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <ChartBarIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-blue-400 font-semibold">التحليل الفني</div>
              <div className={`text-xs mt-1 ${modelStatuses.technical.color}`}>
                {modelStatuses.technical.icon} {modelStatuses.technical.status}
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <CpuChipIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-semibold">الذكاء الاصطناعي البسيط</div>
              <div className={`text-xs mt-1 ${modelStatuses.simpleAI.color}`}>
                {modelStatuses.simpleAI.icon} {modelStatuses.simpleAI.status}
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <SparklesIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-purple-400 font-semibold">الذكاء الاصطناعي المتقدم</div>
              <div className={`text-xs mt-1 ${modelStatuses.advancedAI.color}`}>
                {modelStatuses.advancedAI.icon} {modelStatuses.advancedAI.status}
              </div>
            </div>
          </div>
          
          {/* Classic view summary */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="text-center">
              <div className="text-white font-semibold mb-2">
                إجمالي المصادر النشطة: {Object.values(modelStatuses).filter(s => s.trained).length} من 3
              </div>
              <div className="text-gray-400 text-sm">
                {Object.values(modelStatuses).filter(s => s.trained).length === 0 && 
                  "⚠️ لا توجد نماذج مدربة - يُنصح بتدريب النماذج أولاً لتحسين دقة التحليل"}
                {Object.values(modelStatuses).filter(s => s.trained).length === 1 && 
                  "📈 نموذج واحد مدرب - النتائج أساسية"}
                {Object.values(modelStatuses).filter(s => s.trained).length === 2 && 
                  "✅ نموذجان مدربان - نتائج جيدة"}
                {Object.values(modelStatuses).filter(s => s.trained).length === 3 && 
                  "🏆 جميع النماذج مدربة - أفضل دقة ممكنة"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Reminder for Better Analysis */}
      {Object.values(modelStatuses).filter(s => s.trained).length < 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/30"
        >
          <div className="flex items-start space-x-4 space-x-reverse">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-bold text-lg mb-2">
                🎯 نصيحة لتحسين دقة التحليل
              </h3>
              <p className="text-yellow-200 mb-4">
                للحصول على تحليل أكثر دقة وتوصيات أفضل، يُنصح بتدريب النماذج أولاً في قسم "تدريب الذكاء الاصطناعي".
                النماذج المدربة تحسن من دقة التنبؤات وتعطي توصيات أكثر موثوقية.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">مع التدريب:</span>
                  </div>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• دقة أعلى في التوقعات</li>
                    <li>• توصيات تداول موثوقة</li>
                    <li>• تحليل مخاطر أفضل</li>
                    <li>• إشارات أقوى وأوضح</li>
                  </ul>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">بدون تدريب:</span>
                  </div>
                  <ul className="text-red-200 text-sm space-y-1">
                    <li>• اعتماد على التحليل الفني فقط</li>
                    <li>• دقة محدودة</li>
                    <li>• إشارات أقل قوة</li>
                    <li>• مخاطر أعلى في القرارات</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <LightBulbIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">كيفية البدء:</span>
                </div>
                <ol className="text-blue-200 text-sm space-y-1">
                  <li>1. انتقل إلى تبويب "تدريب الذكاء الاصطناعي"</li>
                  <li>2. اختر نوع النموذج (يُنصح بالبدء بالبسيط)</li>
                  <li>3. حدد إعدادات التدريب المناسبة</li>
                  <li>4. ابدأ التدريب واتركه ينتهي</li>
                  <li>5. عد لهذا القسم لرؤية التحليل المحسن</li>
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Wyckoff Analysis if enabled */}
      {wyckoffEnabled && analysisData?.wyckoff_analysis && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <WyckoffAnalysisCard 
            data={analysisData.wyckoff_analysis}
            loading={loading}
          />
        </div>
      )}

      {/* Real-time Market Sentiment (if available) */}
      {analysisData?.analysis_layers?.['4_sentiment_analysis'] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
            <FireIcon className="w-6 h-6 text-purple-400" />
            <span>💭 تحليل المشاعر العامة</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-purple-400 text-sm font-medium">المشاعر العامة</div>
              <div className="text-white text-xl font-bold">
                {analysisData.analysis_layers['4_sentiment_analysis'].trend || 'محايد'}
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-pink-400 text-sm font-medium">قوة المشاعر</div>
              <div className="text-white text-xl font-bold">
                {analysisData.analysis_layers['4_sentiment_analysis'].confidence || 50}%
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-cyan-400 text-sm font-medium">تأثير السوق</div>
              <div className="text-white text-xl font-bold">
                {analysisData.ultimate_decision?.sentiment_influence || 'غير محدد'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer with Analysis Summary */}
      <div className="bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <h3 className="text-white font-bold mb-3">📋 ملخص التحليل النهائي</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm">النماذج المدربة</div>
              <div className="text-white font-bold">
                {Object.values(modelStatuses).filter(s => s.trained).length}/3
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm">قوة الإشارة</div>
              <div className={`font-bold ${signalStrength.color}`}>
                {signalStrength.level}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm">مستوى المخاطرة</div>
              <div className={`font-bold ${riskAssessment.color}`}>
                {riskAssessment.level}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm">الإجراءات المطلوبة</div>
              <div className="text-white font-bold">
                {tradingActions.length} إجراء
              </div>
            </div>
          </div>
          
          <div className="text-gray-400 text-sm">
            💡 <strong>تذكر:</strong> استخدم هذا التحليل كدليل إرشادي فقط. 
            دائماً ادمج التحليل مع البحث الشخصي وإدارة المخاطر المناسبة.
            {!Object.values(modelStatuses).some(s => s.trained) && 
              " لتحسين جودة التحليل، قم بتدريب النماذج أولاً."}
          </div>
        </div>
      </div>
    </div>
  );
};