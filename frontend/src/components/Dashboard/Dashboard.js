// Enhanced Professional Dashboard.js - Corrected Version
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioTab } from './PortfolioTab';
import { InvestmentTab } from './InvestmentTab'; 
import { TradingTab } from './TradingTab';
import { BacktestTab } from './BacktestTab';
import { ComparisonTab } from './ComparisonTab';
import AISuggestion from './AISuggestion';
import { SentimentTab } from './SentimentTab';
import { TrainingTab } from './TrainingTab';

import API_CONFIG from '../../config/api.config';
import EnhancedTrainingStatus, { 
  getModelStatus, 
  getDetailedModelStatuses, 
  calculateTrainedModelsStats,
  getTrainingRecommendation
} from './EnhancedTrainingStatus';

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
  BoltIcon,
  AcademicCapIcon,
  LightBulbIcon,
  FireIcon,
  BeakerIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrophyIcon,
  SignalIcon,
  ClockIcon as TimeIcon,
  ChartPieIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Helper function to get time ago - MOVED TO TOP LEVEL
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'الآن';
  if (diffInMinutes < 60) return `${diffInMinutes} د`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} س`;
  return `${Math.floor(diffInMinutes / 1440)} ي`;
};

axios.defaults.baseURL = API_CONFIG.BASE_URL;
// Enhanced helper functions
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




const getSignalStrength = (confidence) => {
  if (confidence >= 85) return { level: 'قوي جداً', color: 'text-green-400', bgColor: 'bg-green-500/20', icon: '🔥' };
  if (confidence >= 70) return { level: 'قوي', color: 'text-green-300', bgColor: 'bg-green-500/15', icon: '💪' };
  if (confidence >= 60) return { level: 'متوسط', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', icon: '⚡' };
  if (confidence >= 45) return { level: 'ضعيف', color: 'text-orange-400', bgColor: 'bg-orange-500/20', icon: '⚠️' };
  return { level: 'ضعيف جداً', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '❌' };
};

const getRecommendationStyle = (recommendation) => {
  if (recommendation.includes('BUY')) {
    return {
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      icon: <ArrowTrendingUpIcon className="w-8 h-8" />,
      gradient: 'from-green-500/30 to-emerald-600/30'
    };
  } else if (recommendation.includes('SELL')) {
    return {
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      icon: <ArrowTrendingDownIcon className="w-8 h-8" />,
      gradient: 'from-red-500/30 to-pink-600/30'
    };
  } else {
    return {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      icon: <ClockIcon className="w-8 h-8" />,
      gradient: 'from-yellow-500/30 to-orange-600/30'
    };
  }
};


// Compact Symbol Selector Component - محسّن مع Portal و Overlay
const CompactSymbolSelector = ({ selectedSymbol, onSymbolChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState(null);
  const buttonRef = useRef(null);
  
  const POPULAR_SYMBOLS = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', color: 'from-orange-400 to-orange-600' },
    { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', color: 'from-blue-400 to-blue-600' },
    { symbol: 'SOLUSDT', name: 'Solana', icon: '◎', color: 'from-purple-400 to-purple-600' },
    { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', color: 'from-blue-300 to-blue-500' },
    { symbol: 'BNBUSDT', name: 'BNB', icon: 'B', color: 'from-yellow-400 to-yellow-600' },
    { symbol: 'XRPUSDT', name: 'XRP', icon: 'X', color: 'from-gray-400 to-gray-600' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð', color: 'from-yellow-300 to-orange-500' },
    { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●', color: 'from-pink-400 to-pink-600' },
    { symbol: 'LINKUSDT', name: 'Chainlink', icon: '⬢', color: 'from-blue-500 to-blue-700' },
    { symbol: 'LTCUSDT', name: 'Litecoin', icon: 'Ł', color: 'from-gray-300 to-gray-500' },
    { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬟', color: 'from-purple-500 to-indigo-600' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', icon: 'A', color: 'from-red-400 to-red-600' },
    { symbol: 'ATOMUSDT', name: 'Cosmos', icon: '⚛', color: 'from-indigo-400 to-purple-600' },
    { symbol: 'UNIUSDT', name: 'Uniswap', icon: '🦄', color: 'from-pink-400 to-purple-500' },
    { symbol: 'FILUSDT', name: 'Filecoin', icon: 'F', color: 'from-cyan-400 to-blue-500' },
    { symbol: 'VETUSDT', name: 'VeChain', icon: 'V', color: 'from-green-400 to-teal-500' },
    { symbol: 'TRXUSDT', name: 'TRON', icon: 'T', color: 'from-red-500 to-orange-600' },
    { symbol: 'ALGOUSDT', name: 'Algorand', icon: 'A', color: 'from-gray-600 to-gray-800' },
    { symbol: 'HBARUSDT', name: 'Hedera', icon: 'ℏ', color: 'from-purple-600 to-pink-600' },
    { symbol: 'NEARUSDT', name: 'NEAR Protocol', icon: 'N', color: 'from-green-500 to-emerald-600' },
    { symbol: 'SUIUSDT', name: 'Sui', icon: 'S', color: 'from-cyan-500 to-blue-600' },
    { symbol: 'WLDUSDT', name: 'Worldcoin', icon: 'W', color: 'from-gray-500 to-slate-700' },
  ];
  
  const selectedCrypto = POPULAR_SYMBOLS.find(s => s.symbol === selectedSymbol) || POPULAR_SYMBOLS[0];

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320; // عرض القائمة المنسدلة
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - rect.left;
      const spaceOnLeft = rect.right;
      
      // حساب الموضع الأفضل للقائمة
      let calculatedLeft = rect.left;
      
      // إذا لم يكن هناك مساحة كافية على اليمين
      if (spaceOnRight < dropdownWidth + 20) {
        // إذا كان هناك مساحة كافية على اليسار، اعرضها على اليسار
        if (spaceOnLeft >= dropdownWidth + 20) {
          calculatedLeft = rect.right - dropdownWidth;
        } else {
          // وسط القائمة في الشاشة إذا لم يكن هناك مساحة كافية على الجانبين
          calculatedLeft = Math.max(10, Math.min(viewportWidth - dropdownWidth - 10, rect.left - (dropdownWidth - rect.width) / 2));
        }
      }
      
      // التأكد من عدم تجاوز حدود الشاشة
      calculatedLeft = Math.max(10, Math.min(calculatedLeft, viewportWidth - dropdownWidth - 10));
      
      setButtonPosition({
        top: rect.bottom + 8,
        left: calculatedLeft,
        width: rect.width,
        buttonRect: rect
      });
    }
    setIsOpen(!isOpen);
  };

  // Effect to handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Effect to handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Button */}
      <motion.button
        ref={buttonRef}
        className={`flex items-center space-x-3 space-x-reverse bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border transition-all duration-300 ${
          isOpen ? 'border-blue-400 bg-white/20 shadow-lg shadow-blue-400/20' : 'border-white/20 hover:bg-white/15'
        }`}
        onClick={handleToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`w-8 h-8 bg-gradient-to-r ${selectedCrypto.color} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
          {selectedCrypto.icon}
        </div>
        <div className="text-right">
          <div className="font-bold text-white text-sm">{selectedCrypto.name}</div>
          <div className="text-xs text-gray-400">{selectedSymbol}</div>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Portal for Dropdown and Overlay */}
      {isOpen && buttonPosition && ReactDOM.createPortal(
        <motion.div 
          className="fixed inset-0"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Enhanced Backdrop with stronger blur and darker overlay */}
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Dropdown with animation and smart positioning */}
          <motion.div 
            className="absolute"
            style={{
              top: buttonPosition.top,
              left: buttonPosition.left,
              width: '320px',
              zIndex: 10000,
              // إضافة max-width للشاشات الصغيرة
              maxWidth: 'calc(100vw - 20px)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900/98 backdrop-blur-xl rounded-xl border-2 border-white/30 shadow-2xl shadow-black/50 max-h-96 overflow-hidden">
              {/* Header with gradient background */}
              <div className="p-3 border-b border-white/20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="text-center text-white font-semibold text-sm mb-2">
                  اختر العملة الرقمية
                </div>
                <div className="text-center text-gray-300 text-xs">
                  {POPULAR_SYMBOLS.length} عملة متاحة
                </div>
                {/* مؤشر سهم يشير للزر */}
                <div 
                  className="absolute -top-2 w-4 h-4 bg-gray-900/98 border-t-2 border-l-2 border-white/30 transform rotate-45"
                  style={{
                    left: buttonPosition.buttonRect ? 
                      Math.min(
                        Math.max(20, buttonPosition.buttonRect.left + buttonPosition.buttonRect.width/2 - buttonPosition.left - 8),
                        280
                      ) : '20px'
                  }}
                />
              </div>

              {/* Scrollable Coins Grid with custom scrollbar */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-900/90 max-h-80 overflow-y-auto custom-scrollbar">
                <style jsx>{`
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                  }
                `}</style>
                
                {POPULAR_SYMBOLS.map((crypto, index) => (
                  <motion.button
                    key={crypto.symbol}
                    className={`w-full p-3 flex items-center space-x-3 space-x-reverse transition-all duration-200 rounded-lg border group ${
                      selectedSymbol === crypto.symbol 
                        ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/30 border-blue-400 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20' 
                        : 'bg-gray-800/90 border-gray-600 hover:bg-gray-700/90 hover:border-gray-500 hover:shadow-md'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSymbolChange(crypto.symbol);
                      setIsOpen(false);
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-r ${crypto.color} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0 group-hover:shadow-xl transition-shadow`}>
                      {crypto.icon}
                    </div>
                    <div className="text-right flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate group-hover:text-blue-300 transition-colors">
                        {crypto.name}
                      </div>
                      <div className="text-xs text-gray-300 truncate">{crypto.symbol}</div>
                    </div>
                    {selectedSymbol === crypto.symbol && (
                      <motion.div 
                        className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0 shadow-lg shadow-blue-400/50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              {/* Footer with keyboard hint */}
              <div className="p-3 border-t border-white/20 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                <div className="flex items-center justify-center space-x-2 space-x-reverse text-gray-300 text-xs">
                  <span>💡 انقر على العملة لاختيارها</span>
                  <span className="text-gray-500">•</span>
                  <span>ESC للإغلاق</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </>
  );
};

// Training Status Badge Component with Last Training Date
const TrainingStatusBadge = ({ analysisData, onTrainingClick }) => {
  const trainedStats = calculateTrainedModelsStats(analysisData);
  
  // Mock last training date - في التطبيق الفعلي سيأتي من البيانات
  const getLastTrainingDate = () => {
    // يمكن استخراج هذا من analysisData أو localStorage
    const mockDate = new Date();
    mockDate.setHours(mockDate.getHours() - 2); // آخر تدريب منذ ساعتين
    return mockDate;
  };
  
  const lastTrainingDate = getLastTrainingDate();
  const timeAgo = getTimeAgo(lastTrainingDate);
  
  return (
    <motion.button
      onClick={onTrainingClick}
      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
        trainedStats.trainedCount === 3 ? 
          'bg-green-500/20 border-green-500/30 text-green-400' :
        trainedStats.trainedCount >= 1 ? 
          'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
          'bg-red-500/20 border-red-500/30 text-red-400'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AcademicCapIcon className="w-4 h-4" />
      <div className="text-right">
        <div className="text-xs font-bold">
          {trainedStats.trainedCount}/3 مدرب
        </div>
        <div className="text-xs opacity-80">
          آخر تدريب: {timeAgo}
        </div>
      </div>
    </motion.button>
  );
};

// Main Recommendation Hero Card
const RecommendationHeroCard = ({ analysisData, loading }) => {
  if (loading) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/30 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <ArrowPathIcon className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">جاري تحليل البيانات...</h2>
          <p className="text-purple-200">يرجى الانتظار حتى اكتمال التحليل الذكي</p>
        </div>
      </motion.div>
    );
  }

  if (!analysisData?.ultimate_decision) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-600/30 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <ExclamationTriangleIcon className="w-20 h-20 mx-auto mb-6 text-yellow-400 opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">لا توجد توصيات متاحة</h2>
          <p className="text-gray-400">قم بتدريب النماذج أولاً للحصول على توصيات دقيقة</p>
        </div>
      </motion.div>
    );
  }

  const recommendation = analysisData.ultimate_decision.final_recommendation;
  const confidence = analysisData.ultimate_decision.final_confidence;
  const reasoning = analysisData.ultimate_decision.reasoning;
  
  const style = getRecommendationStyle(recommendation);
  const signalStrength = getSignalStrength(confidence);

  return (
    <motion.div 
      className={`bg-gradient-to-br ${style.gradient} backdrop-blur-xl rounded-3xl p-8 border ${style.borderColor} shadow-2xl`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className={`p-4 rounded-2xl ${style.bgColor} ${style.borderColor} border-2`}>
            {style.icon}
          </div>
          
          <div>
            <div className="flex items-center space-x-3 space-x-reverse mb-2">
              <h1 className={`text-4xl font-bold ${style.color}`}>
                {getRecommendationText(recommendation)}
              </h1>
              <div className={`px-3 py-1 rounded-full ${signalStrength.bgColor} border ${style.borderColor}`}>
                <span className={`text-sm font-medium ${signalStrength.color}`}>
                  {signalStrength.icon} {signalStrength.level}
                </span>
              </div>
            </div>
            
            <p className="text-white/80 text-lg mb-3 max-w-2xl leading-relaxed">
              {reasoning || 'تحليل شامل للمؤشرات الفنية ونماذج الذكاء الاصطناعي'}
            </p>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <SignalIcon className="w-5 h-5 text-white/60" />
                <span className="text-white/80 text-sm">قوة الإشارة</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <TrophyIcon className="w-5 h-5 text-white/60" />
                <span className="text-white/80 text-sm">مستوى الثقة</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-6xl font-bold text-white mb-2">
            {confidence}%
          </div>
          <div className="text-white/80 text-lg font-medium mb-4">مستوى الثقة</div>
          
          {/* Confidence Progress Bar */}
          <div className="w-32 bg-white/20 rounded-full h-3 mb-2">
            <motion.div 
              className={`h-3 rounded-full bg-gradient-to-r ${style.color === 'text-green-400' ? 'from-green-400 to-green-600' : style.color === 'text-red-400' ? 'from-red-400 to-red-600' : 'from-yellow-400 to-yellow-600'}`}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
          
          <div className="text-white/60 text-sm">
            تحديث منذ {new Date().toLocaleTimeString('ar-SA')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Key Metrics Dashboard
const KeyMetricsDashboard = ({ analysisData, currentPrice, lastUpdate }) => {
  const trainedStats = calculateTrainedModelsStats(analysisData);
  
  const metrics = [
    {
      title: 'السعر الحالي',
      value: currentPrice ? `$${currentPrice.toLocaleString()}` : 'غير متوفر',
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      change: '+2.5%' // يمكن حسابها من البيانات الفعلية
    },
    {
      title: 'النماذج المدربة',
      value: `${trainedStats.trainedCount}/${trainedStats.totalCount}`,
      icon: <CpuChipIcon className="w-6 h-6" />,
      color: trainedStats.qualityColor,
      bgColor: trainedStats.trainedCount === 3 ? 'bg-green-500/20' : 'bg-yellow-500/20',
      subtext: trainedStats.qualityLevel
    },
    {
      title: 'طبقات التحليل',
      value: analysisData?.analysis_layers ? Object.keys(analysisData.analysis_layers).length : 0,
      icon: <ChartPieIcon className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      subtext: 'نشطة'
    },
    {
      title: 'آخر تحديث',
      value: lastUpdate || 'لم يحدث',
      icon: <TimeIcon className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      subtext: 'الوقت الحالي'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          className={`${metric.bgColor} backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-white/10 ${metric.color}`}>
              {metric.icon}
            </div>
            {metric.change && (
              <span className="text-green-400 text-sm font-medium">
                {metric.change}
              </span>
            )}
          </div>
          
          <h3 className="text-white/80 text-sm font-medium mb-2">{metric.title}</h3>
          <div className={`text-2xl font-bold ${metric.color} mb-1`}>
            {metric.value}
          </div>
          {metric.subtext && (
            <p className="text-white/60 text-xs">{metric.subtext}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Analysis Layers Overview
const AnalysisLayersOverview = ({ analysisData }) => {
  if (!analysisData?.analysis_layers) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
        <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
        <h3 className="text-xl font-semibold text-white mb-2">لا توجد طبقات تحليل</h3>
        <p className="text-gray-400">قم بتحديث البيانات لعرض التحليل المفصل</p>
      </div>
    );
  }

  const layers = [
    {
      key: '1_technical_analysis',
      name: 'التحليل الفني',
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: 'RSI, MACD, المتوسطات المتحركة'
    },
    {
      key: '2_simple_ai',
      name: 'الذكاء الاصطناعي البسيط',
      icon: <CpuChipIcon className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: 'نموذج تعلم آلي بسيط'
    },
    {
      key: '3_advanced_ai',
      name: 'الذكاء الاصطناعي المتقدم',
      icon: <SparklesIcon className="w-6 h-6" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: 'نماذج متعددة وتحليل متقدم'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 space-x-reverse">
        <BeakerIcon className="w-6 h-6 text-cyan-400" />
        <span>طبقات التحليل النشطة</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {layers.map((layer, index) => {
          const layerData = analysisData.analysis_layers[layer.key];
          const isActive = layerData && !layerData.error;
          
          return (
            <motion.div
              key={layer.key}
              className={`${layer.bgColor} rounded-xl p-4 border ${isActive ? 'border-green-500/30' : 'border-red-500/30'} transition-all duration-300 hover:scale-105`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <div className={`p-2 rounded-lg bg-white/10 ${layer.color}`}>
                  {layer.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">{layer.name}</h4>
                  <p className="text-white/60 text-xs">{layer.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
              </div>
              
              {isActive && layerData.recommendation && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">التوصية:</span>
                    <span className={`text-xs font-medium ${
                      layerData.recommendation === 'BUY' ? 'text-green-400' :
                      layerData.recommendation === 'SELL' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {getRecommendationText(layerData.recommendation)}
                    </span>
                  </div>
                  
                  {layerData.confidence && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-xs">الثقة:</span>
                      <span className="text-xs font-medium text-white">
                        {layerData.confidence}%
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {!isActive && (
                <div className="text-center text-red-400 text-xs">
                  غير مدرب أو غير متوفر
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Quick Actions Panel
const QuickActionsPanel = ({ onRefresh, loading, onTrainingClick }) => {
  const actions = [
    {
      title: 'تحديث التحليل',
      description: 'تحديث جميع البيانات والتحليلات',
      icon: <ArrowPathIcon className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      action: onRefresh,
      loading: loading
    },
    {
      title: 'تدريب النماذج',
      description: 'انتقل لقسم تدريب الذكاء الاصطناعي',
      icon: <AcademicCapIcon className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
      action: onTrainingClick,
      loading: false
    },
    {
      title: 'عرض التفاصيل',
      description: 'انتقل للتحليل المفصل',
      icon: <EyeIcon className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      action: () => {}, // يمكن إضافة وظيفة هنا
      loading: false
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3 space-x-reverse">
        <BoltIcon className="w-6 h-6 text-yellow-400" />
        <span>إجراءات سريعة</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            onClick={action.action}
            disabled={action.loading}
            className={`bg-gradient-to-r ${action.color} p-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-3 space-x-reverse mb-2">
              {action.loading ? 
                <ArrowPathIcon className="w-6 h-6 animate-spin" /> : 
                action.icon
              }
              <span className="font-bold">{action.title}</span>
            </div>
            <p className="text-white/80 text-sm text-right">
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Analysis Tab with Better Organization
const EnhancedAnalysisTab = ({ 
  loading, 
  currentPrice, 
  lastUpdate, 
  analysisData, 
  onRefresh,
  selectedSymbol,
  onTrainingClick 
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Recommendation Card */}
      <RecommendationHeroCard 
        analysisData={analysisData} 
        loading={loading} 
      />

      {/* Key Metrics Dashboard */}
      <KeyMetricsDashboard 
        analysisData={analysisData}
        currentPrice={currentPrice}
        lastUpdate={lastUpdate}
      />

      {/* Quick Actions Panel */}
      <QuickActionsPanel 
        onRefresh={onRefresh}
        loading={loading}
        onTrainingClick={onTrainingClick}
      />

      {/* Analysis Layers Overview */}
      <AnalysisLayersOverview analysisData={analysisData} />

      {/* Enhanced Training Status */}
      <EnhancedTrainingStatus 
        analysisData={analysisData}
        onTrainingClick={onTrainingClick}
        showDetails={true}
        compact={false}
      />
    </div>
  );
};

// Updated TabNavigation
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
      id: 'training', 
      name: 'تدريب الذكاء الاصطناعي', 
      icon: AcademicCapIcon, 
      color: 'from-red-500 to-pink-600',
      description: 'تدريب نماذج الذكاء الاصطناعي'
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
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl">
      <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
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
  );
};

// Enhanced AISuggestionsTab Component
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
            <h2 className="text-2xl font-bold text-white">✨ نصائح الذكاء الاصطناعي المتقدم</h2>
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

// Under Development Card Component
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

// Main Dashboard Component with Enhanced Organization
const Dashboard = ({ 
  selectedSymbol = 'BTCUSDT', 
  analysisData, 
  setAnalysisData,
  loading, 
  currentPrice, 
  lastUpdate,
  onRefresh,
  onSymbolChange // إضافة prop للتحكم في تغيير العملة
}) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalCurrentPrice, setInternalCurrentPrice] = useState(null);
  const [internalLastUpdate, setInternalLastUpdate] = useState(null);
  const [internalAnalysisData, setInternalAnalysisData] = useState(null);

  useEffect(() => {
    window.setActiveTab = setActiveTab;
    return () => {
      delete window.setActiveTab;
    };
  }, []);

  const fetchUltimateAnalysis = async () => {
    setInternalLoading(true);
    try {
      console.log(`🔄 Fetching analysis for ${selectedSymbol}...`);
      
      // تجربة Ultimate Analysis أولاً
      let response;
      try {
        response = await axios.get(`/ai/ultimate-analysis/${selectedSymbol}`);
        console.log('✅ Ultimate analysis successful');
      } catch (ultimateError) {
        console.log('⚠️ Ultimate analysis failed, trying enhanced...');
        try {
          response = await axios.get(`/analysis/enhanced/${selectedSymbol}`);
          console.log('✅ Enhanced analysis successful');
        } catch (enhancedError) {
          console.log('⚠️ Enhanced analysis failed, trying basic...');
          response = await axios.get(`/analysis/${selectedSymbol}`);
          console.log('✅ Basic analysis successful');
          
          // تحويل البيانات الأساسية لتتناسب مع الواجهة
          response.data = {
            ...response.data,
            analysis_layers: {
              "1_technical_analysis": response.data.comprehensive_analysis || {}
            },
            ultimate_decision: {
              final_recommendation: response.data.comprehensive_analysis?.overall_recommendation || "HOLD",
              final_confidence: response.data.comprehensive_analysis?.confidence || 50,
              reasoning: "تحليل فني أساسي"
            }
          };
        }
      }
      
      setInternalAnalysisData(response.data);
      setInternalCurrentPrice(response.data.current_price);
      setInternalLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      
      if (setAnalysisData) {
        setAnalysisData(response.data);
      }
      
    } catch (error) {
      console.error('❌ جميع محاولات التحليل فشلت:', error);
      setInternalAnalysisData({
        error: true,
        message: 'فشل في جلب البيانات. تحقق من الاتصال.',
        analysis_layers: {},
        ultimate_decision: {
          final_recommendation: "HOLD",
          final_confidence: 0,
          reasoning: "لا توجد بيانات متاحة"
        }
      });
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    fetchUltimateAnalysis();
  }, [selectedSymbol]);

  // Use props if provided, otherwise use internal state
  const finalLoading = loading !== undefined ? loading : internalLoading;
  const finalCurrentPrice = currentPrice !== undefined ? currentPrice : internalCurrentPrice;
  const finalLastUpdate = lastUpdate !== undefined ? lastUpdate : internalLastUpdate;
  const finalAnalysisData = analysisData !== undefined ? analysisData : internalAnalysisData;
  const finalOnRefresh = onRefresh || fetchUltimateAnalysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Compact Professional Header */}
        <motion.div
          className="bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            
            {/* Symbol Selector and Status */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <CompactSymbolSelector 
                selectedSymbol={selectedSymbol} 
                onSymbolChange={onSymbolChange || ((symbol) => {
                  console.log('Selected symbol:', symbol);
                  // يمكن استخدام callback افتراضي
                })}
              />
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2 space-x-reverse bg-white/10 rounded-lg px-3 py-2">
                <div className={`w-2 h-2 rounded-full ${finalAnalysisData ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-white/80 text-xs font-medium">
                  {finalAnalysisData ? 'متصل' : 'غير متصل'}
                </span>
              </div>
            </div>
            
            {/* Price and Quick Info */}
            <div className="flex items-center space-x-6 space-x-reverse">
              
              {/* Current Price */}
              {finalCurrentPrice && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${finalCurrentPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {finalLoading ? 'تحديث...' : finalLastUpdate}
                  </div>
                </div>
              )}
              
              {/* Quick Recommendation Badge */}
              {finalAnalysisData?.ultimate_decision && (
                <div className={`px-3 py-2 rounded-lg border ${
                  finalAnalysisData.ultimate_decision.final_recommendation.includes('BUY') ? 
                    'bg-green-500/20 border-green-500/30 text-green-400' :
                  finalAnalysisData.ultimate_decision.final_recommendation.includes('SELL') ? 
                    'bg-red-500/20 border-red-500/30 text-red-400' :
                    'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                }`}>
                  <div className="text-sm font-bold">
                    {getRecommendationText(finalAnalysisData.ultimate_decision.final_recommendation)}
                  </div>
                  <div className="text-xs opacity-80">
                    {finalAnalysisData.ultimate_decision.final_confidence}% ثقة
                  </div>
                </div>
              )}
              
              {/* Training Status with Last Training Date */}
              {finalAnalysisData && (
                <TrainingStatusBadge 
                  analysisData={finalAnalysisData}
                  onTrainingClick={() => setActiveTab('training')}
                />
              )}
              
              {/* Loading Indicator */}
              {finalLoading && (
                <motion.div
                  className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'analysis' && (
              <EnhancedAnalysisTab
                loading={finalLoading}
                currentPrice={finalCurrentPrice}
                lastUpdate={finalLastUpdate}
                analysisData={finalAnalysisData}
                onRefresh={finalOnRefresh}
                selectedSymbol={selectedSymbol}
                onTrainingClick={() => setActiveTab('training')}
              />
            )}
            
            {activeTab === 'training' && (
              <TrainingTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
                analysisData={finalAnalysisData}
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
              <PortfolioTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
              />
            )}
            
            {activeTab === 'investment' && (
              <InvestmentTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
                analysisData={finalAnalysisData}
              />
            )}
            
            {activeTab === 'trading' && (
              <TradingTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
                analysisData={finalAnalysisData}
              />
            )}
            
            {activeTab === 'backtest' && (
              <BacktestTab 
                selectedSymbol={selectedSymbol}
                analysisData={finalAnalysisData}
              />
            )}
            
            {activeTab === 'comparison' && (
              <ComparisonTab 
                selectedSymbol={selectedSymbol}
                currentPrice={finalCurrentPrice}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Compact Footer with Essential Stats */}
        <motion.div
          className="bg-gradient-to-r from-gray-900/30 to-black/30 backdrop-blur-md rounded-xl p-4 border border-gray-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 space-x-reverse text-sm">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="text-white font-bold">
                  {finalAnalysisData?.analysis_layers ? Object.keys(finalAnalysisData.analysis_layers).length : 0}
                </div>
                <div className="text-gray-400">طبقات نشطة</div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="text-white font-bold">
                  {calculateTrainedModelsStats(finalAnalysisData).trainedCount}/3
                </div>
                <div className="text-gray-400">نماذج مدربة</div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`font-bold ${
                  finalAnalysisData?.ultimate_decision?.final_confidence >= 70 ? 'text-green-400' :
                  finalAnalysisData?.ultimate_decision?.final_confidence >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {finalAnalysisData?.ultimate_decision?.final_confidence || 0}%
                </div>
                <div className="text-gray-400">مستوى الثقة</div>
              </div>
            </div>
            
            <div className="text-right text-xs text-gray-500">
              آخر تحديث: {finalLastUpdate || 'غير محدد'} | 
              الحالة: {finalAnalysisData ? '✅ متصل' : '❌ غير متصل'}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;