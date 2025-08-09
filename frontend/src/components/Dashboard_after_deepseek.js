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
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  CurrencyDollarIcon,
  WalletIcon,
  BellIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
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
  
  // Trading states
  const [portfolios, setPortfolios] = useState([]);
  const [tradingDashboard, setTradingDashboard] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [autoTradingStatus, setAutoTradingStatus] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [createPortfolioModal, setCreatePortfolioModal] = useState(false);
  const [manualTradeModal, setManualTradeModal] = useState(false);
  
  // Scheduler states
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [scheduleSettings, setScheduleSettings] = useState({
    normal_interval: 60,
    conservative_interval: 240,
    performance_update_time: "00:00"
  });
  const [alerts, setAlerts] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [settingsModal, setSettingsModal] = useState(false);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  
  // Form states
  const [newPortfolio, setNewPortfolio] = useState({
    symbol: '',
    initial_balance: 1000,
    risk_level: 'MEDIUM'
  });
  const [manualTrade, setManualTrade] = useState({
    action: 'BUY',
    percentage: 20
  });

  // Portfolio details states
  const [expandedPortfolio, setExpandedPortfolio] = useState(null);

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

  const fetchTradingDashboard = async (userId = 'default_user') => {
    setPortfolioLoading(true);
    try {
      const response = await axios.get(`/trading/dashboard/${userId}`);
      setTradingDashboard(response.data);
      setPortfolios(response.data.portfolios || []);
    } catch (error) {
      console.error('خطأ في جلب لوحة التداول:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const createPortfolio = async () => {
    try {
      const response = await axios.post('/trading/portfolio/create', {
        user_id: 'default_user',
        symbol: newPortfolio.symbol.toUpperCase(),
        initial_balance: parseFloat(newPortfolio.initial_balance),
        risk_level: newPortfolio.risk_level
      });
      
      if (response.data.portfolio_id) {
        fetchTradingDashboard();
        setCreatePortfolioModal(false);
        setNewPortfolio({ symbol: '', initial_balance: 1000, risk_level: 'MEDIUM' });
      }
    } catch (error) {
      console.error('خطأ في إنشاء المحفظة:', error);
    }
  };

  const togglePortfolio = async (portfolioId) => {
    try {
      await axios.put(`/trading/portfolio/${portfolioId}/toggle`);
      fetchTradingDashboard();
    } catch (error) {
      console.error('خطأ في تبديل حالة المحفظة:', error);
    }
  };

  const executeManualTrade = async () => {
    if (!selectedPortfolio) return;
    
    try {
      await axios.post(`/trading/manual-trade/${selectedPortfolio}`, null, {
        params: {
          action: manualTrade.action,
          percentage: parseFloat(manualTrade.percentage)
        }
      });
      
      fetchTradingDashboard();
      fetchRecentTrades();
      setManualTradeModal(false);
    } catch (error) {
      console.error('خطأ في تنفيذ الصفقة:', error);
    }
  };

  // Scheduler functions
  const fetchSchedulerStatus = async () => {
    try {
      const response = await axios.get('/trading/scheduler/status');
      setSchedulerStatus(response.data);
    } catch (error) {
      console.error('خطأ في جلب حالة المجدول:', error);
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      const response = await axios.get('/alerts/recent?limit=5');
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('خطأ في جلب التنبيهات:', error);
    }
  };

  const fetchRecentTrades = async () => {
    try {
      const response = await axios.get('/trading/recent-trades?limit=10');
      setRecentTrades(response.data.trades || []);
    } catch (error) {
      console.error('خطأ في جلب الصفقات:', error);
    }
  };

  const toggleScheduler = async () => {
    setSchedulerLoading(true);
    try {
      const endpoint = schedulerStatus?.is_running 
        ? '/trading/scheduler/stop' 
        : '/trading/scheduler/start';
      
      await axios.post(endpoint);
      await fetchSchedulerStatus();
      await fetchTradingDashboard();
    } catch (error) {
      console.error('خطأ في تبديل حالة المجدول:', error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const updateScheduleSettings = async () => {
    try {
      await axios.put('/trading/scheduler/settings', scheduleSettings);
      setSettingsModal(false);
      await fetchSchedulerStatus();
    } catch (error) {
      console.error('خطأ في تحديث الإعدادات:', error);
    }
  };

  const runManualCycle = async () => {
    setSchedulerLoading(true);
    try {
      await axios.post('/trading/scheduler/run-cycle');
      await fetchRecentTrades();
      await fetchRecentAlerts();
    } catch (error) {
      console.error('خطأ في تشغيل الدورة:', error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const runBacktest = async (days = 7) => {
    setBacktestLoading(true);
    try {
      const response = await axios.post(`/backtest/single/${selectedSymbol}?days=${days}`);
      
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

  useEffect(() => {
    clearDataForNewSymbol(selectedSymbol);
  }, [selectedSymbol, clearDataForNewSymbol]);

  useEffect(() => {
    if (selectedSymbol === currentSymbol) {
      fetchUltimateAnalysis();
    }
  }, [selectedSymbol, currentSymbol, fetchUltimateAnalysis]);

  useEffect(() => {
    if (activeTab === 'trading') {
      fetchTradingDashboard();
      fetchSchedulerStatus();
      fetchRecentAlerts();
      fetchRecentTrades();
      
      // تحديث البيانات كل 30 ثانية
      const interval = setInterval(() => {
        fetchSchedulerStatus();
        fetchRecentAlerts();
        fetchRecentTrades();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [activeTab]);

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

  const getRiskLevelColor = (risk) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'BUY':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />;
      case 'SELL':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />;
      case 'ERROR':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <BellAlertIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const tabs = [
    { id: 'analysis', name: 'التحليل الحالي', icon: SparklesIcon },
    { id: 'trading', name: 'التداول التلقائي', icon: CpuChipIcon },
    { id: 'backtest', name: 'اختبار الأداء', icon: BeakerIcon },
    { id: 'comparison', name: 'المقارنة', icon: ScaleIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Symbol Header with Loading State */}
        <AnimatePresence>
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/20"
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
                  ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white' 
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
          {/* Analysis Tab */}
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
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
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
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
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
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
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

          {/* Trading Tab */}
          {activeTab === 'trading' && (
            <motion.div
              key="trading"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Scheduler Control Panel */}
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">التحكم في التداول التلقائي</h2>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <motion.button
                      className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
                      onClick={() => setSettingsModal(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-300" />
                    </motion.button>
                    <motion.button
                      className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 space-x-reverse transition-all ${
                        schedulerStatus?.is_running
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                      onClick={toggleScheduler}
                      disabled={schedulerLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {schedulerLoading ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : schedulerStatus?.is_running ? (
                        <>
                          <PauseIcon className="w-5 h-5" />
                          <span>إيقاف المجدول</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-5 h-5" />
                          <span>تشغيل المجدول</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* حالة المجدول */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">حالة المجدول</span>
                      {schedulerStatus?.is_running ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="text-xl font-bold text-white">
                      {schedulerStatus?.is_running ? 'يعمل' : 'متوقف'}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      آخر دورة: {schedulerStatus?.last_cycle ? formatTime(schedulerStatus.last_cycle) : 'لا يوجد'}
                    </div>
                  </div>

                  {/* المحافظ النشطة */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">المحافظ النشطة</span>
                      <ChartBarIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-white">
                      {schedulerStatus?.active_portfolios || 0}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      الدورة القادمة: {schedulerStatus?.next_cycle ? formatTime(schedulerStatus.next_cycle) : 'غير محددة'}
                    </div>
                  </div>

                  {/* إجمالي الأرباح */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">إجمالي الأرباح</span>
                      <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {formatCurrency(tradingDashboard?.total_profit || 0)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      معدل النجاح: {(tradingDashboard?.success_rate || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Manual Cycle Button */}
                <div className="mt-4">
                  <motion.button
                    className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2 space-x-reverse"
                    onClick={runManualCycle}
                    disabled={schedulerLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {schedulerLoading ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                    <span>تشغيل دورة يدوية</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Portfolios Management */}
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">إدارة المحافظ</h3>
                  <motion.button
                    className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2 space-x-reverse"
                    onClick={() => setCreatePortfolioModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>إنشاء محفظة جديدة</span>
                  </motion.button>
                </div>

                {portfolioLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
                    <span className="ml-3 text-blue-400">جاري تحميل المحافظ...</span>
                  </div>
                ) : portfolios.length > 0 ? (
                  <div className="space-y-4">
                    {portfolios.map((portfolio) => (
                      <motion.div
                        key={portfolio.id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{portfolio.symbol}</h4>
                              <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                                <span>الروصيد: {formatCurrency(portfolio.current_balance)}</span>
                                <span>الربح: <span className={portfolio.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {formatCurrency(portfolio.profit)}
                                </span></span>
                                <span className={`px-2 py-1 rounded text-xs ${getRiskLevelColor(portfolio.risk_level)}`}>
                                  {portfolio.risk_level}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <motion.button
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              onClick={() => setExpandedPortfolio(expandedPortfolio === portfolio.id ? null : portfolio.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {expandedPortfolio === portfolio.id ? (
                                <ChevronUpIcon className="w-5 h-5" />
                              ) : (
                                <ChevronDownIcon className="w-5 h-5" />
                              )}
                            </motion.button>
                            
                            <motion.button
                              className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                              onClick={() => {
                                setSelectedPortfolio(portfolio.id);
                                setManualTradeModal(true);
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <CurrencyDollarIcon className="w-5 h-5" />
                            </motion.button>
                            
                            <motion.button
                              className={`p-2 rounded-lg transition-colors ${
                                portfolio.is_active 
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                  : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                              }`}
                              onClick={() => togglePortfolio(portfolio.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {portfolio.is_active ? (
                                <CheckCircleIcon className="w-5 h-5" />
                              ) : (
                                <XCircleIcon className="w-5 h-5" />
                              )}
                            </motion.button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedPortfolio === portfolio.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-gray-700/50"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">الرصيد الأولي:</span>
                                  <div className="text-white font-semibold">{formatCurrency(portfolio.initial_balance)}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">معدل الربح:</span>
                                  <div className={`font-semibold ${portfolio.profit_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {portfolio.profit_rate?.toFixed(2)}%
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-400">عدد الصفقات:</span>
                                  <div className="text-white font-semibold">{portfolio.total_trades || 0}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">آخر صفقة:</span>
                                  <div className="text-white font-semibold">
                                    {portfolio.last_trade ? formatTime(portfolio.last_trade) : 'لا يوجد'}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    لا توجد محافظ حاليًا. قم بإنشاء محفظة جديدة للبدء.
                  </div>
                )}
              </motion.div>

              {/* Recent Trades and Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Trades */}
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">الصفقات الأخيرة</h3>
                    <ChartBarIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentTrades.length > 0 ? recentTrades.map((trade, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          {trade.action === 'BUY' ? (
                            <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            <div className="text-white font-semibold">{trade.symbol}</div>
                            <div className="text-sm text-gray-400">{formatTime(trade.timestamp)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${trade.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.action}
                          </div>
                          <div className="text-sm text-gray-400">{formatCurrency(trade.amount)}</div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-4 text-gray-400">لا توجد صفقات حديثة</div>
                    )}
                  </div>
                </motion.div>

                {/* Recent Alerts */}
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">التنبيهات الأخيرة</h3>
                    <BellIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alerts.length > 0 ? alerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-800/50 rounded-lg"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="text-white text-sm">{alert.message}</div>
                          <div className="text-xs text-gray-400">{formatTime(alert.timestamp)}</div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-4 text-gray-400">لا توجد تنبيهات حديثة</div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Backtest Tab */}
          {activeTab === 'backtest' && (
            <motion.div
              key="backtest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">اختبار الأداء التاريخي</h2>
                  <BeakerIcon className="w-8 h-8 text-orange-400" />
                </div>

                <div className="flex items-center space-x-4 space-x-reverse mb-6">
                  <motion.button
                    className="bg-orange-500/20 text-orange-400 px-6 py-3 rounded-xl font-semibold hover:bg-orange-500/30 transition-colors flex items-center space-x-2 space-x-reverse"
                    onClick={() => runBacktest(7)}
                    disabled={backtestLoading}
                    whileHover={{ scale: backtestLoading ? 1 : 1.02 }}
                    whileTap={{ scale: backtestLoading ? 1 : 0.98 }}
                  >
                    {backtestLoading ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <BeakerIcon className="w-5 h-5" />
                    )}
                    <span>اختبار 7 أيام</span>
                  </motion.button>
                  
                  <motion.button
                    className="bg-orange-500/20 text-orange-400 px-6 py-3 rounded-xl font-semibold hover:bg-orange-500/30 transition-colors"
                    onClick={() => runBacktest(30)}
                    disabled={backtestLoading}
                    whileHover={{ scale: backtestLoading ? 1 : 1.02 }}
                    whileTap={{ scale: backtestLoading ? 1 : 0.98 }}
                  >
                    اختبار 30 يوم
                  </motion.button>
                </div>

                <AnimatePresence>
                  {backtestLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent mx-auto mb-4"></div>
                      <div className="text-orange-400 font-semibold">جاري تشغيل اختبار الأداء...</div>
                      <div className="text-sm text-gray-400 mt-2">قد يستغرق هذا بضع دقائق</div>
                    </motion.div>
                  )}

                  {backtestData && !backtestData.error && !backtestLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">إجمالي الأرباح</div>
                        <div className={`text-2xl font-bold ${backtestData.performance?.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtestData.performance?.total_return?.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">معدل النجاح</div>
                        <div className={`text-2xl font-bold ${getPerformanceColor(backtestData.performance?.win_rate)}`}>
                          {backtestData.performance?.win_rate?.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">عدد الصفقات</div>
                        <div className="text-2xl font-bold text-white">
                          {backtestData.performance?.total_trades || 0}
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">الحد الأقصى للخسارة</div>
                        <div className="text-2xl font-bold text-red-400">
                          {backtestData.performance?.max_drawdown?.toFixed(2)}%
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {backtestData?.error && !backtestLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-red-400"
                    >
                      {backtestData.error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
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
              className="space-y-6"
            >
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">مقارنة العملات</h2>
                  <ScaleIcon className="w-8 h-8 text-blue-400" />
                </div>
                
                <div className="text-center py-12 text-gray-400">
                  <ChartPieIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <div className="text-lg">قريباً...</div>
                  <div className="text-sm">مقارنة شاملة بين العملات المختلفة</div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {/* Create Portfolio Modal */}
          {createPortfolioModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreatePortfolioModal(false)}
            >
              <motion.div
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">إنشاء محفظة جديدة</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">رمز العملة</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثل: BTCUSDT"
                      value={newPortfolio.symbol}
                      onChange={(e) => setNewPortfolio({...newPortfolio, symbol: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">الرصيد الأولي ($)</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newPortfolio.initial_balance}
                      onChange={(e) => setNewPortfolio({...newPortfolio, initial_balance: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">مستوى المخاطر</label>
                    <select
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newPortfolio.risk_level}
                      onChange={(e) => setNewPortfolio({...newPortfolio, risk_level: e.target.value})}
                    >
                      <option value="LOW">منخفض</option>
                      <option value="MEDIUM">متوسط</option>
                      <option value="HIGH">عالي</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 space-x-reverse mt-6">
                  <motion.button
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    onClick={createPortfolio}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    إنشاء
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setCreatePortfolioModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Manual Trade Modal */}
          {manualTradeModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManualTradeModal(false)}
            >
              <motion.div
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">صفقة يدوية</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">نوع الصفقة</label>
                    <select
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={manualTrade.action}
                      onChange={(e) => setManualTrade({...manualTrade, action: e.target.value})}
                    >
                      <option value="BUY">شراء</option>
                      <option value="SELL">بيع</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">النسبة المئوية (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={manualTrade.percentage}
                      onChange={(e) => setManualTrade({...manualTrade, percentage: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 space-x-reverse mt-6">
                  <motion.button
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={executeManualTrade}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    تنفيذ
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setManualTradeModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Settings Modal */}
          {settingsModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsModal(false)}
            >
              <motion.div
                className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">إعدادات المجدول</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">فترة التحليل العادي (دقيقة)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={scheduleSettings.normal_interval}
                      onChange={(e) => setScheduleSettings({...scheduleSettings, normal_interval: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">فترة التحليل المحافظ (دقيقة)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={scheduleSettings.conservative_interval}
                      onChange={(e) => setScheduleSettings({...scheduleSettings, conservative_interval: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">وقت تحديث الأداء اليومي</label>
                    <input
                      type="time"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={scheduleSettings.performance_update_time}
                      onChange={(e) => setScheduleSettings({...scheduleSettings, performance_update_time: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 space-x-reverse mt-6">
                  <motion.button
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={updateScheduleSettings}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    حفظ
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setSettingsModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
