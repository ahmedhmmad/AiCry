// export default Dashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioTab } from './PortfolioTab';
import { InvestmentTab } from './InvestmentTab'; 
import { TradingTab } from './TradingTab';
import { BacktestTab } from './BacktestTab';
import { ComparisonTab } from './ComparisonTab';
import AISuggestion from './AISuggestion';
import { SentimentTab } from './SentimentTab';


import {
  ChartBarIcon,
  WalletIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CpuChipIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  HeartIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const PriceCard = ({ loading, currentPrice, lastUpdate }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">السعر الحالي</h3>
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
      </div>
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <ArrowPathIcon className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-blue-400">جاري التحميل...</span>
          </div>
        </div>
      ) : currentPrice ? (
        <div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            ${currentPrice?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 flex items-center space-x-2 space-x-reverse">
            <ClockIcon className="w-4 h-4" />
            <span>آخر تحديث: {lastUpdate || 'غير متوفر'}</span>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center">لا توجد بيانات السعر</div>
      )}
    </div>
  );
};

const DecisionCard = ({ loading, analysisData }) => {
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
        <div className="space-y-3">
          <div className="flex items-center space-x-3 space-x-reverse">
            {getRecommendationIcon(analysisData.ultimate_decision.final_recommendation)}
            <div>
              <div className={`text-xl font-bold ${getRecommendationColor(analysisData.ultimate_decision.final_recommendation)}`}>
                {getRecommendationText(analysisData.ultimate_decision.final_recommendation)}
              </div>
              <div className="text-sm text-gray-400">
                مستوى الثقة: {analysisData.ultimate_decision.final_confidence}%
              </div>
            </div>
          </div>
          {analysisData.ultimate_decision.reasoning && (
            <div className="mt-3 p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-300">
                {analysisData.ultimate_decision.reasoning}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد توصيات متاحة</p>
        </div>
      )}
    </div>
  );
};

const ControlCard = ({ loading, analysisData, onRefresh }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">التحكم</h3>
        <CpuChipIcon className="w-6 h-6 text-orange-400" />
      </div>
      <div className="space-y-4">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'جاري التحديث...' : 'تحديث التحليل'}</span>
        </button>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">حالة التحليل:</span>
            <span className={analysisData ? 'text-green-400' : 'text-red-400'}>
              {analysisData ? 'نشط' : 'غير متوفر'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">طبقات التحليل:</span>
            <span className="text-white">
              {analysisData?.analysis_layers ? Object.keys(analysisData.analysis_layers).length : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccurateAnalysisDisplay = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-50" />
        <h3 className="text-xl font-semibold text-white mb-2">لا توجد بيانات تحليل</h3>
        <p className="text-gray-400">يرجى تحديث البيانات للحصول على التحليل المفصل</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2 space-x-reverse">
          <BoltIcon className="w-6 h-6 text-yellow-400" />
          <span>ملخص التحليل الشامل</span>
        </h3>
        {analysisData.ultimate_decision && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm">التوصية النهائية</div>
              <div className="text-2xl font-bold text-green-400">
                {analysisData.ultimate_decision.final_recommendation}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm">مستوى الثقة</div>
              <div className="text-2xl font-bold text-blue-400">
                {analysisData.ultimate_decision.final_confidence}%
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm">قوة الإشارة</div>
              <div className="text-2xl font-bold text-purple-400">
                {analysisData.ultimate_decision.signal_strength || 'متوسطة'}
              </div>
            </div>
          </div>
        )}
      </div>

      {analysisData.analysis_layers && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">طبقات التحليل المفصلة</h3>
          <div className="space-y-4">
            {Object.entries(analysisData.analysis_layers).map(([layerKey, layerData]) => {
              const layerNames = {
                '1_technical_analysis': 'التحليل الفني',
                '2_simple_ai': 'الذكاء الاصطناعي البسيط',
                '3_advanced_ai': 'الذكاء الاصطناعي المتقدم',
                '4_wyckoff_analysis': 'تحليل وايكوف'
              };
              
              const layerName = layerNames[layerKey] || layerKey;
              const recommendation = layerData.recommendation || 
                                  layerData.ensemble_prediction?.final_decision || 
                                  'غير محدد';
              const confidence = layerData.confidence || 
                               layerData.ensemble_prediction?.confidence || 
                               0;
              
              return (
                <div key={layerKey} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{layerName}</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className={`font-bold ${
                        recommendation === 'BUY' ? 'text-green-400' :
                        recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {recommendation}
                      </span>
                      <span className="text-gray-400">({confidence}%)</span>
                    </div>
                  </div>
                  {layerData.reasoning && (
                    <div className="text-sm text-gray-300 mt-2">
                      {layerData.reasoning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {analysisData.technical_indicators && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">المؤشرات الفنية</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analysisData.technical_indicators).map(([key, value]) => (
              <div key={key} className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-sm capitalize">{key.replace('_', ' ')}</div>
                <div className="text-white font-semibold">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { 
      id: 'analysis', 
      name: 'التحليل', 
      icon: ChartBarIcon, 
      color: 'from-emerald-500 to-teal-600',
      description: 'التحليل الفني والذكي'
    },
    { 
      id: 'ai_suggestions', 
      name: 'نصائح الذكاء الاصطناعي', 
      icon: SparklesIcon, 
      color: 'from-purple-500 to-pink-600',
      description: 'توصيات ذكية متقدمة'
    },
    {
        
      id: 'sentiment', 
      name: 'تحليل المشاعر', 
      icon: HeartIcon, 
      color: 'from-purple-500 to-pink-600',
      description: 'مشاعر السوق والمستثمرين'
    },
    { 
      id: 'portfolio', 
      name: 'المحفظة', 
      icon: WalletIcon, 
      color: 'from-blue-500 to-indigo-600',
      description: 'إدارة رأس المال'
    },
    { 
      id: 'investment', 
      name: 'الاستثمار', 
      icon: BanknotesIcon, 
      color: 'from-cyan-500 to-blue-600',
      description: 'استثمارات طويلة المدى'
    },
    { 
      id: 'trading', 
      name: 'التداول', 
      icon: CurrencyDollarIcon, 
      color: 'from-orange-500 to-amber-600',
      description: 'تداول قصير المدى'
    },
    { 
      id: 'backtest', 
      name: 'المحاكاة', 
      icon: ClockIcon, 
      color: 'from-pink-500 to-rose-600',
      description: 'اختبار الاستراتيجيات'
    },
    { 
      id: 'comparison', 
      name: 'المقارنة', 
      icon: ScaleIcon, 
      color: 'from-violet-500 to-purple-600',
      description: 'مقارنة الأصول'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-xl">
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <div className="relative z-10 flex items-center space-x-2 space-x-reverse">
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden sm:block">{tab.name}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AnalysisTab = ({ loading, currentPrice, lastUpdate, analysisData, onRefresh }) => {
  const [viewMode, setViewMode] = useState('enhanced');

  return (
    <div className="space-y-6">
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
        </div>
      )}

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
        />
      </div>

      <AccurateAnalysisDisplay analysisData={analysisData} />
    </div>
  );
};

const AISuggestionsTab = ({ selectedSymbol }) => {
  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">نصائح الذكاء الاصطناعي المتقدم</h2>
            <p className="text-gray-400">
              توصيات ذكية مبنية على تحليل متعدد الطبقات للسوق والمؤشرات الفنية
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AISuggestion selectedSymbol={selectedSymbol} />
      </motion.div>
    </div>
  );
};

const UnderDevelopmentCard = ({ tabName, expectedFeatures = [] }) => (
  <motion.div
    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
      animate={{ 
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <ExclamationTriangleIcon className="w-10 h-10 text-white" />
    </motion.div>
    
    <h3 className="text-2xl font-bold text-white mb-3">
      {tabName} قيد التطوير
    </h3>
    
    <p className="text-gray-300 mb-6 leading-relaxed">
      نعمل بجد لتطوير هذه الميزة لتقديم أفضل تجربة لك. 
      سيتم إطلاقها قريباً مع مميزات متقدمة.
    </p>

    {expectedFeatures.length > 0 && (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center justify-center space-x-2 space-x-reverse">
          <SparklesIcon className="w-5 h-5 text-yellow-400" />
          <span>المميزات المتوقعة</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {expectedFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/5 rounded-lg p-3 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-300">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                <span>{feature}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

const Dashboard = ({ 
  selectedSymbol = 'BTCUSDT', 
  analysisData, 
  setAnalysisData,
  loading, 
  currentPrice, 
  lastUpdate,
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalCurrentPrice, setInternalCurrentPrice] = useState(null);
  const [internalLastUpdate, setInternalLastUpdate] = useState(null);
  const [internalAnalysisData, setInternalAnalysisData] = useState(null);

  const fetchUltimateAnalysis = async () => {
    setInternalLoading(true);
    try {
      const response = await axios.get(`/ai/ultimate-analysis/${selectedSymbol}`);
      setInternalAnalysisData(response.data);
      setInternalCurrentPrice(response.data.current_price);
      setInternalLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      
      if (setAnalysisData) {
        setAnalysisData(response.data);
      }
    } catch (error) {
      console.error('خطأ في جلب التحليل:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchUltimateAnalysis();
  }, [selectedSymbol]);

  const finalLoading = loading !== undefined ? loading : internalLoading;
  const finalCurrentPrice = currentPrice !== undefined ? currentPrice : internalCurrentPrice;
  const finalLastUpdate = lastUpdate !== undefined ? lastUpdate : internalLastUpdate;
  const finalAnalysisData = analysisData !== undefined ? analysisData : internalAnalysisData;
  const finalOnRefresh = onRefresh || fetchUltimateAnalysis;

  const tabFeatures = {
    portfolio: [
      'إدارة رأس المال المتقدمة',
      'توزيع المحفظة الذكي',
      'تتبع الأرباح والخسائر',
      'تحليل الأداء التاريخي'
    ],
    investment: [
      'استراتيجيات DCA المتقدمة',
      'التخطيط طويل المدى',
      'تحليل المخاطر',
      'تنويع الاستثمارات'
    ],
    trading: [
      'إشارات التداول المباشرة',
      'إدارة المخاطر التلقائية',
      'تحليل نقاط الدخول والخروج',
      'تتبع الصفقات المفتوحة'
    ],
    backtest: [
      'محاكاة الاستراتيجيات',
      'تحليل الأداء التاريخي',
      'اختبار المؤشرات المختلفة',
      'تقارير شاملة'
    ],
    comparison: [
      'مقارنة الأصول المختلفة',
      'تحليل الارتباط',
      'مؤشرات الأداء النسبي',
      'رسوم بيانية تفاعلية'
    ]
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-3xl font-bold text-white">{selectedSymbol}</div>
            {finalLoading && (
              <motion.div
                className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
          
          <div className="text-left">
            {finalCurrentPrice && (
              <div className="text-2xl font-bold text-green-400">
                ${finalCurrentPrice.toLocaleString()}
              </div>
            )}
            <div className="text-sm text-gray-400">
              {finalLoading ? 'جاري تحميل البيانات...' : `آخر تحديث: ${finalLastUpdate || 'لم يتم التحديث'}`}
            </div>
          </div>
        </div>
      </motion.div>

      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'analysis' && (
            <AnalysisTab
              loading={finalLoading}
              currentPrice={finalCurrentPrice}
              lastUpdate={finalLastUpdate}
              analysisData={finalAnalysisData}
              onRefresh={finalOnRefresh}
            />
          )}
            {activeTab === 'sentiment' && (
    <SentimentTab 
      selectedSymbol={selectedSymbol}
      currentPrice={finalCurrentPrice}
    />
  )}

          {activeTab === 'ai_suggestions' && (
            <AISuggestionsTab selectedSymbol={selectedSymbol} />
          )}
          
          {activeTab === 'portfolio' && (
            <div>
              <PortfolioTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
              />
              {/* <UnderDevelopmentCard 
                tabName="إدارة المحفظة"
                expectedFeatures={tabFeatures.portfolio}
              /> */}
            </div>
          )}
          
          {activeTab === 'investment' && (
            <div>
              <InvestmentTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
                analysisData={finalAnalysisData}
              />
              {/* <UnderDevelopmentCard 
                tabName="الاستثمار طويل المدى"
                expectedFeatures={tabFeatures.investment}
              /> */}
            </div>
          )}
          
          {activeTab === 'trading' && (
            <div>
              <TradingTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
                analysisData={finalAnalysisData}
              />
              {/* <UnderDevelopmentCard 
                tabName="التداول السريع"
                expectedFeatures={tabFeatures.trading}
              /> */}
            </div>
          )}
          
          {activeTab === 'backtest' && (
            <div>
              <BacktestTab 
                selectedSymbol={selectedSymbol}
                analysisData={finalAnalysisData}
              />
              {/* <UnderDevelopmentCard 
                tabName="محاكاة الاستراتيجيات"
                expectedFeatures={tabFeatures.backtest}
              /> */}
            </div>
          )}
          
          {activeTab === 'comparison' && (
            <div>
              <ComparisonTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
              />
              {/* <UnderDevelopmentCard 
                tabName="مقارنة الأصول"
                expectedFeatures={tabFeatures.comparison}
              /> */}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;