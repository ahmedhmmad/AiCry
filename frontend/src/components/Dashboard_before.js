import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  BeakerIcon,
  ScaleIcon,
  ChartPieIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Dashboard = ({ selectedSymbol, analysisData, setAnalysisData }) => {
  const [loading, setLoading] = useState(false);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestData, setBacktestData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [currentSymbol, setCurrentSymbol] = useState(selectedSymbol);

  // مسح البيانات عند تغيير العملة
  const clearDataForNewSymbol = useCallback((newSymbol) => {
    if (newSymbol !== currentSymbol) {
      setAnalysisData(null);
      setCurrentPrice(null);
      setLastUpdate(null);
      setBacktestData(null);
      setCurrentSymbol(newSymbol);
    }
  }, [currentSymbol, setAnalysisData]);

  const fetchUltimateAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/ai/ultimate-analysis/${selectedSymbol}`);
      
      // تأكد أن الاستجابة للعملة الصحيحة
      if (response.data.symbol === selectedSymbol.toUpperCase()) {
        setAnalysisData(response.data);
        setCurrentPrice(response.data.current_price);
        setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      }
    } catch (error) {
      console.error('خطأ في جلب التحليل:', error);
      setAnalysisData({ error: 'فشل في جلب البيانات' });
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, setAnalysisData]);

  const runBacktest = async (days = 7) => {
    setBacktestLoading(true);
    try {
      const response = await axios.post(`/backtest/single/${selectedSymbol}?days=${days}`);
      
      // تأكد أن النتيجة للعملة الصحيحة
      if (response.data.symbol === selectedSymbol.toUpperCase()) {
        setBacktestData(response.data);
      }
    } catch (error) {
      console.error('خطأ في Backtesting:', error);
      setBacktestData({ error: 'فشل في تشغيل الاختبار' });
    } finally {
      setBacktestLoading(false);
    }
  };

  // مراقبة تغيير العملة
  useEffect(() => {
    clearDataForNewSymbol(selectedSymbol);
  }, [selectedSymbol, clearDataForNewSymbol]);

  // تحميل البيانات بعد تغيير العملة
  useEffect(() => {
    if (selectedSymbol === currentSymbol) {
      fetchUltimateAnalysis();
    }
  }, [selectedSymbol, currentSymbol, fetchUltimateAnalysis]);

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

  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 70) return 'text-green-400';
    if (accuracy >= 55) return 'text-yellow-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'analysis', name: 'التحليل الحالي', icon: SparklesIcon },
    { id: 'backtest', name: 'اختبار الأداء', icon: BeakerIcon },
    { id: 'comparison', name: 'المقارنة', icon: ScaleIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Symbol Header with Loading State */}
      <AnimatePresence>
        <motion.div
          className="glass-effect rounded-xl p-4 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          key={selectedSymbol}
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-2xl font-bold text-white">{selectedSymbol}</div>
            {loading && (
              <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
            )}
          </div>
          <div className="text-sm text-gray-400">
            {loading ? 'جاري تحميل البيانات...' : `آخر تحديث: ${lastUpdate || 'لم يتم التحديث'}`}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex space-x-4 space-x-reverse">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === tab.id 
                ? 'glass-effect text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Price Card */}
            <motion.div
              className="glass-effect rounded-2xl p-6 card-hover"
              layout
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">السعر الحالي</h3>
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
              </div>
              
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading-price"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
                      <span className="text-blue-400">جاري التحميل...</span>
                    </div>
                    <div className="h-8 bg-gray-600/50 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-600/50 rounded w-1/2 animate-pulse"></div>
                  </motion.div>
                ) : currentPrice ? (
                  <motion.div
                    key={`price-${selectedSymbol}-${currentPrice}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-3xl font-bold text-white mb-2">
                      ${currentPrice?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center space-x-2 space-x-reverse">
                      <ClockIcon className="w-4 h-4" />
                      <span>آخر تحديث: {lastUpdate}</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-price"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 text-center"
                  >
                    لا توجد بيانات
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Ultimate Decision Card */}
            <motion.div
              className="glass-effect rounded-2xl p-6 card-hover"
              layout
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">القرار النهائي</h3>
                <SparklesIcon className="w-6 h-6 text-purple-400" />
              </div>
              
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading-decision"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
                      <span className="text-purple-400">تحليل البيانات...</span>
                    </div>
                    <div className="h-8 bg-gray-600/50 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-600/50 rounded animate-pulse"></div>
                    <div className="h-2 bg-gray-600/50 rounded animate-pulse"></div>
                  </motion.div>
                ) : analysisData?.ultimate_decision ? (
                  <motion.div
                    key={`decision-${selectedSymbol}-${analysisData.ultimate_decision.final_recommendation}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
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
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${analysisData.ultimate_decision.final_confidence}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      
                      <div className="text-sm text-gray-400 mt-2">
                        {analysisData.ultimate_decision.reasoning}
                      </div>
                    </div>
                  </motion.div>
                ) : analysisData?.error ? (
                  <motion.div
                    key="error-decision"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-center"
                  >
                    {analysisData.error}
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-decision"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-400 text-center"
                  >
                    في انتظار البيانات...
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Analysis Control Card */}
            <motion.div
              className="glass-effect rounded-2xl p-6 card-hover"
              layout
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">تحكم في التحليل</h3>
                <CpuChipIcon className="w-6 h-6 text-green-400" />
              </div>
              
              <div className="space-y-4">
                <motion.button
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
                  onClick={fetchUltimateAnalysis}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>جاري التحليل...</span>
                    </div>
                  ) : (
                    'تحديث التحليل'
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {analysisData && !analysisData.error && !loading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-3 gap-2 text-sm"
                    >
                      <div className="text-center p-2 bg-green-500/20 rounded-lg">
                        <div className="text-green-400 font-semibold">فني</div>
                        <div className="text-xs text-gray-400">
                          {analysisData.analysis_layers?.['1_technical_analysis']?.confidence || 'N/A'}%
                        </div>
                      </div>
                      <div className="text-center p-2 bg-blue-500/20 rounded-lg">
                        <div className="text-blue-400 font-semibold">AI بسيط</div>
                        <div className="text-xs text-gray-400">
                          {analysisData.analysis_layers?.['2_simple_ai']?.confidence || 'N/A'}%
                        </div>
                      </div>
                      <div className="text-center p-2 bg-purple-500/20 rounded-lg">
                        <div className="text-purple-400 font-semibold">AI متقدم</div>
                        <div className="text-xs text-gray-400">
                          {analysisData.analysis_layers?.['3_advanced_ai']?.ensemble_prediction?.confidence?.toFixed(0) || 'N/A'}%
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Backtesting Tab */}
        {activeTab === 'backtest' && (
          <motion.div
            key="backtest"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Backtest Controls */}
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">اختبار أداء النماذج - {selectedSymbol}</h3>
                <BeakerIcon className="w-6 h-6 text-purple-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[7, 14, 30].map(days => (
                  <motion.button
                    key={days}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                    onClick={() => runBacktest(days)}
                    disabled={backtestLoading}
                    whileHover={{ scale: backtestLoading ? 1 : 1.02 }}
                    whileTap={{ scale: backtestLoading ? 1 : 0.98 }}
                  >
                    {backtestLoading ? (
                      <div className="flex items-center justify-center space-x-2 space-x-reverse">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>اختبار...</span>
                      </div>
                    ) : (
                      `اختبار ${days} أيام`
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Backtest Results */}
            <AnimatePresence>
              {backtestData && !backtestData.error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {['technical', 'simple_ai', 'advanced_ai'].map(modelType => {
                    const metrics = backtestData.metrics[modelType];
                    if (metrics?.error) return null;
                    
                    return (
                      <motion.div
                        key={modelType}
                        className="glass-effect rounded-2xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h4 className="text-lg font-semibold text-white mb-4">
                          {modelType === 'technical' ? 'التحليل الفني' : 
                           modelType === 'simple_ai' ? 'AI البسيط' : 'AI المتقدم'}
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">الدقة:</span>
                            <span className={`font-bold ${getPerformanceColor(metrics.accuracy_percentage)}`}>
                              {metrics.accuracy_percentage}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">الربحية:</span>
                            <span className="text-white">
                              {metrics.profitability_percentage}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">إجمالي العوائد:</span>
                            <span className="text-green-400">
                              {metrics.total_return_percentage}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">عدد الصفقات:</span>
                            <span className="text-white">
                              {metrics.total_trades}
                            </span>
                          </div>
                          
                          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-center">
                            <div className="text-sm text-gray-400">التقييم</div>
                            <div className={`font-bold ${getPerformanceColor(metrics.accuracy_percentage)}`}>
                              {metrics.performance_grade}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Backtest Summary */}
              {backtestData?.metrics?.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-effect rounded-2xl p-6"
                >
                  <h4 className="text-lg font-semibold text-white mb-4">ملخص الأداء</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-green-400 font-semibold mb-2">أفضل أداء</h5>
                      <div className="bg-green-500/20 rounded-lg p-3">
                        <div className="font-semibold">
                          {backtestData.metrics.summary.best_performer?.type === 'technical' ? 'التحليل الفني' : 
                           backtestData.metrics.summary.best_performer?.type === 'simple_ai' ? 'AI البسيط' : 'AI المتقدم'}
                        </div>
                        <div className="text-green-400">
                          {backtestData.metrics.summary.best_performer?.accuracy}% دقة
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-red-400 font-semibold mb-2">يحتاج تحسين</h5>
                      <div className="bg-red-500/20 rounded-lg p-3">
                        <div className="font-semibold">
                          {backtestData.metrics.summary.worst_performer?.type === 'technical' ? 'التحليل الفني' : 
                           backtestData.metrics.summary.worst_performer?.type === 'simple_ai' ? 'AI البسيط' : 'AI المتقدم'}
                        </div>
                        <div className="text-red-400">
                          {backtestData.metrics.summary.worst_performer?.accuracy}% دقة
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="text-blue-400 font-semibold mb-2">توصيات التحسين</h5>
                    <div className="space-y-2">
                      {backtestData.metrics.summary.recommendations?.map((rec, index) => (
                        <div key={index} className="bg-blue-500/20 rounded-lg p-2 text-sm">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {backtestData?.error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-effect rounded-2xl p-6 text-center"
                >
                  <div className="text-red-400">{backtestData.error}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-effect rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">مقارنة العملات</h3>
              <ScaleIcon className="w-6 h-6 text-blue-400" />
            </div>
            
            <div className="text-center text-gray-400">
              <ChartPieIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>مقارنة أداء النماذج على عملات متعددة</p>
              <p className="text-sm mt-2">قريباً...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
