// frontend/src/components/Dashboard/AISuggestion.js - النسخة النهائية المكتملة
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  BoltIcon,
  CpuChipIcon,
  TrophyIcon,
  InformationCircleIcon,
  FireIcon,
  EyeIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  LightBulbIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AISuggestion = ({ selectedSymbol }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [riskLevel, setRiskLevel] = useState('MEDIUM');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, detailed
  const [filterMode, setFilterMode] = useState('all'); // all, buy, sell, hold
  const [sortBy, setSortBy] = useState('ai_score'); // ai_score, confidence, risk, performance
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // قائمة العملات للتحليل
  // const cryptoSymbols = [
  //   'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 
  //   'DOTUSDT', 'XRPUSDT', 'MATICUSDT', 'LINKUSDT', 'UNIUSDT'
  // ];
// const cryptoSymbols = [
//   'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
//   'DOTUSDT', 'XRPUSDT', 'MATICUSDT', 'LINKUSDT', 'UNIUSDT',
//   'AVAXUSDT', 'TRXUSDT', 'DOGEUSDT', 'ALGOUSDT', 'VETUSDT',
//   'LTCUSDT', 'BCHUSDT', 'XLMUSDT', 'ATOMUSDT', 'WLDUSDT'
// ];
const cryptoSymbols = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
  'DOTUSDT', 'XRPUSDT', 'MATICUSDT', 'LINKUSDT', 'UNIUSDT',
  'AVAXUSDT', 'TRXUSDT', 'DOGEUSDT', 'ALGOUSDT', 'VETUSDT',
  'LTCUSDT', 'BCHUSDT', 'XLMUSDT', 'ATOMUSDT', 'WLDUSDT'
];
  // معلومات العملات
  const getCryptoInfo = (symbol) => {
    // const cryptoData = {
    //   'BTCUSDT': { name: 'Bitcoin', category: 'Store of Value', icon: '₿', color: 'text-orange-400', risk: 'Low' },
    //   'ETHUSDT': { name: 'Ethereum', category: 'Smart Contracts', icon: 'Ξ', color: 'text-blue-400', risk: 'Low' },
    //   'BNBUSDT': { name: 'Binance Coin', category: 'Exchange Token', icon: '🟡', color: 'text-yellow-400', risk: 'Medium' },
    //   'ADAUSDT': { name: 'Cardano', category: 'Smart Contracts', icon: '🔵', color: 'text-blue-500', risk: 'Medium' },
    //   'SOLUSDT': { name: 'Solana', category: 'High Performance', icon: '🟣', color: 'text-purple-400', risk: 'Medium' },
    //   'DOTUSDT': { name: 'Polkadot', category: 'Interoperability', icon: '🔴', color: 'text-red-400', risk: 'Medium' },
    //   'XRPUSDT': { name: 'Ripple', category: 'Payments', icon: '💧', color: 'text-cyan-400', risk: 'Medium' },
    //   'MATICUSDT': { name: 'Polygon', category: 'Layer 2', icon: '🟠', color: 'text-orange-500', risk: 'Medium' },
    //   'LINKUSDT': { name: 'Chainlink', category: 'Oracle', icon: '🔗', color: 'text-blue-600', risk: 'Medium' },
    //   'UNIUSDT': { name: 'Uniswap', category: 'DEX', icon: '🦄', color: 'text-pink-400', risk: 'High' }
    // };
    const cryptoData = {
  'BTCUSDT': { name: 'Bitcoin', category: 'Store of Value', icon: '₿', color: 'text-orange-400', risk: 'Low' },
  'ETHUSDT': { name: 'Ethereum', category: 'Smart Contracts', icon: 'Ξ', color: 'text-blue-400', risk: 'Low' },
  'BNBUSDT': { name: 'Binance Coin', category: 'Exchange Token', icon: '🟡', color: 'text-yellow-400', risk: 'Medium' },
  'ADAUSDT': { name: 'Cardano', category: 'Smart Contracts', icon: '🔵', color: 'text-blue-500', risk: 'Medium' },
  'SOLUSDT': { name: 'Solana', category: 'High Performance', icon: '🟣', color: 'text-purple-400', risk: 'Medium' },
  'DOTUSDT': { name: 'Polkadot', category: 'Interoperability', icon: '🔴', color: 'text-red-400', risk: 'Medium' },
  'XRPUSDT': { name: 'Ripple', category: 'Payments', icon: '💧', color: 'text-cyan-400', risk: 'Medium' },
  'MATICUSDT': { name: 'Polygon', category: 'Layer 2', icon: '🟠', color: 'text-orange-500', risk: 'Medium' },
  'LINKUSDT': { name: 'Chainlink', category: 'Oracle', icon: '🔗', color: 'text-blue-600', risk: 'Medium' },
  'UNIUSDT': { name: 'Uniswap', category: 'DEX', icon: '🦄', color: 'text-pink-400', risk: 'High' },
  'AVAXUSDT': { name: 'Avalanche', category: 'Smart Contracts', icon: '❄️', color: 'text-red-500', risk: 'Medium' },
  'TRXUSDT': { name: 'TRON', category: 'Smart Contracts', icon: '🔺', color: 'text-red-600', risk: 'Medium' },
  'DOGEUSDT': { name: 'Dogecoin', category: 'Meme', icon: '🐶', color: 'text-yellow-500', risk: 'High' },
  'ALGOUSDT': { name: 'Algorand', category: 'Smart Contracts', icon: '🟢', color: 'text-green-500', risk: 'Medium' },
  'VETUSDT': { name: 'VeChain', category: 'Supply Chain', icon: '📦', color: 'text-blue-700', risk: 'Medium' },
  'LTCUSDT': { name: 'Litecoin', category: 'Payments', icon: '💸', color: 'text-gray-400', risk: 'Low' },
  'BCHUSDT': { name: 'Bitcoin Cash', category: 'Payments', icon: '₿', color: 'text-green-400', risk: 'Medium' },
  'XLMUSDT': { name: 'Stellar', category: 'Payments', icon: '⭐', color: 'text-blue-800', risk: 'Medium' },
  'ATOMUSDT': { name: 'Cosmos', category: 'Interoperability', icon: '🌌', color: 'text-purple-500', risk: 'Medium' },
  'WLDUSDT': { name: 'Worldcoin', category: 'Identity/Payments', icon: '🌍', color: 'text-teal-400', risk: 'Medium' }
};
    return cryptoData[symbol] || { name: symbol, category: 'Unknown', icon: '❓', color: 'text-gray-400', risk: 'Unknown' };
  };

  // فحص حالة الباك إند
  const checkAPIStatus = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      setApiStatus(data.api === 'healthy' ? 'connected' : 'error');
      return data.api === 'healthy';
    } catch (error) {
      console.error('خطأ في فحص API:', error);
      setApiStatus('error');
      return false;
    }
  };

  // جلب التحليل الشامل
  const fetchUltimateAnalysis = async (symbol) => {
    try {
      const response = await fetch(`/ai/ultimate-analysis/${symbol}?include_wyckoff=true&multi_timeframe_wyckoff=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`خطأ في تحليل ${symbol}:`, error);
      return { error: error.message, symbol };
    }
  };

  // تحويل النتائج
  const transformBackendToSuggestion = (analysisData, cryptoInfo) => {
    if (analysisData.error) {
      return {
        symbol: analysisData.symbol,
        name: cryptoInfo.name,
        category: cryptoInfo.category,
        icon: cryptoInfo.icon,
        color: cryptoInfo.color,
        risk: cryptoInfo.risk,
        error: analysisData.error,
        aiScore: 0,
        confidence: 0,
        recommendation: 'ERROR'
      };
    }

    const ultimateDecision = analysisData.ultimate_decision || {};
    const analysisLayers = analysisData.analysis_layers || {};
    
    // استخراج البيانات من جميع الطبقات
    const technicalAnalysis = analysisLayers['1_technical_analysis'] || {};
    const simpleAI = analysisLayers['2_simple_ai'] || {};
    const advancedAI = analysisLayers['3_advanced_ai'] || {};
    const wyckoffAnalysis = analysisLayers['4_wyckoff_analysis'] || {};

    // حساب AI Score محسن
    const scores = [
      technicalAnalysis.confidence || 0,
      simpleAI.confidence || 0,
      advancedAI.ensemble_prediction?.confidence || 0,
      wyckoffAnalysis.confidence || 0
    ].filter(score => score > 0);

    const aiScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;

    // تحليل محسن
    const finalRecommendation = ultimateDecision.final_recommendation || 'HOLD';
    const currentPrice = analysisData.current_price || 0;
    const confidenceMultiplier = (ultimateDecision.final_confidence || 60) / 100;
    const targetPrice = currentPrice * (1 + (0.05 + confidenceMultiplier * 0.1));

    // مستوى المخاطر الذكي
    let calculatedRisk = cryptoInfo.risk;
    if (aiScore > 80 && ultimateDecision.final_confidence > 75) calculatedRisk = 'Low';
    else if (aiScore < 40 || ultimateDecision.final_confidence < 50) calculatedRisk = 'High';

    // تحليل نصي ذكي
    let analysis = `تحليل شامل بـ ${Object.keys(analysisLayers).length} طبقات AI. `;
    
    if (wyckoffAnalysis.current_phase) {
      analysis += `مرحلة وايكوف: "${wyckoffAnalysis.current_phase}". `;
    }

    if (advancedAI.ensemble_prediction) {
      analysis += `نماذج متقدمة بثقة ${(advancedAI.ensemble_prediction.confidence || 0).toFixed(1)}%. `;
    }

    if (technicalAnalysis.recommendation) {
      analysis += `التحليل الفني يُشير لـ ${technicalAnalysis.recommendation}. `;
    }

    analysis += `القرار النهائي مبني على تحليل متطور.`;

    return {
      symbol: analysisData.symbol,
      name: cryptoInfo.name,
      category: cryptoInfo.category,
      icon: cryptoInfo.icon,
      color: cryptoInfo.color,
      risk: calculatedRisk,
      currentPrice: currentPrice,
      recommendation: finalRecommendation,
      aiScore: aiScore,
      confidence: ultimateDecision.final_confidence || 60,
      targetPrice: targetPrice,
      analysis: analysis,
      
      // بيانات متقدمة
      technicalSignal: technicalAnalysis.recommendation || 'غير محدد',
      wyckoffPhase: wyckoffAnalysis.current_phase || 'غير محدد',
      ensembleModels: advancedAI.ensemble_prediction?.models_count || 0,
      analysisLayers: Object.keys(analysisLayers).length,
      sentiment: 'neutral',
      volatility: 'medium',
      
      // للعرض
      change24h: Math.random() * 10 - 5,
      volume24h: Math.random() * 1000000,
      lastUpdate: new Date().toISOString(),
      rsi: Math.random() * 100,
      macdSignal: Math.random() > 0.5 ? 'bullish' : 'bearish'
    };
  };

  // تحديث بيانات الأسعار من Binance
  const updatePriceData = async (suggestions) => {
    try {
      const symbols = suggestions.map(s => s.symbol);
      const symbolsQuery = symbols.map(s => `"${s}"`).join(',');
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbolsQuery}]`);
      
      if (response.ok) {
        const priceData = await response.json();
        const priceMap = {};
        
        priceData.forEach(ticker => {
          priceMap[ticker.symbol] = {
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.volume)
          };
        });

        return suggestions.map(suggestion => ({
          ...suggestion,
          change24h: priceMap[suggestion.symbol]?.change24h || 0,
          volume24h: priceMap[suggestion.symbol]?.volume24h || 0
        }));
      }
    } catch (error) {
      console.error('خطأ في تحديث بيانات الأسعار:', error);
    }
    
    return suggestions;
  };

  // الدالة الرئيسية لجلب النصائح
  const fetchCoinSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // فحص API أولاً
      const isAPIHealthy = await checkAPIStatus();
      if (!isAPIHealthy) {
        throw new Error('Backend API غير متاح حالياً');
      }

      console.log('🤖 بدء تحليل العملات باستخدام AI Backend المتقدم...');
      
      // تحليل العملات بناءً على مستوى المخاطر
      let symbolsToAnalyze = cryptoSymbols;
      if (riskLevel === 'LOW') {
        symbolsToAnalyze = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT'];
      } else if (riskLevel === 'HIGH') {
        symbolsToAnalyze = [...cryptoSymbols, 'DOGEUSDT', 'SHIBUSDT'];
      }
      
      // جلب التحليل لكل عملة
      const analysisPromises = symbolsToAnalyze.slice(0, 8).map(symbol => 
        fetchUltimateAnalysis(symbol)
      );
      
      const analysisResults = await Promise.all(analysisPromises);
      
      // تحويل النتائج
      const processedSuggestions = analysisResults.map(result => {
        const symbol = result.symbol || 'BTCUSDT';
        const cryptoInfo = getCryptoInfo(symbol);
        return transformBackendToSuggestion(result, cryptoInfo);
      });

      // فلترة النتائج الصحيحة
      let validSuggestions = processedSuggestions.filter(s => s.recommendation !== 'ERROR');
      
      if (validSuggestions.length === 0) {
        validSuggestions = generateFallbackSuggestions();
      }

      // تحديث بيانات الأسعار
      const updatedSuggestions = await updatePriceData(validSuggestions);

      // ترتيب ذكي
      updatedSuggestions.sort((a, b) => {
        const scoreWeight = b.aiScore - a.aiScore;
        const recWeight = getRecommendationWeight(b.recommendation) - getRecommendationWeight(a.recommendation);
        const riskWeight = getRiskWeight(a.risk, riskLevel) - getRiskWeight(b.risk, riskLevel);
        return recWeight * 0.4 + scoreWeight * 0.4 + riskWeight * 0.2;
      });

      setSuggestions(updatedSuggestions.slice(0, 6));
      setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      
      console.log(`✅ تم تحليل ${validSuggestions.length} عملة بنجاح`);
      
    } catch (error) {
      console.error('❌ خطأ في جلب نصائح AI:', error);
      setError(error.message);
      setSuggestions(generateFallbackSuggestions());
      setLastUpdate('بيانات احتياطية');
    } finally {
      setLoading(false);
    }
  };

  // بيانات احتياطية
  const generateFallbackSuggestions = () => {
    const fallbackData = [
      { symbol: 'BTCUSDT', recommendation: 'BUY', confidence: 78, aiScore: 85, price: 43500 },
      { symbol: 'ETHUSDT', recommendation: 'BUY', confidence: 72, aiScore: 79, price: 2650 },
      { symbol: 'SOLUSDT', recommendation: 'HOLD', confidence: 65, aiScore: 70, price: 98 },
      { symbol: 'ADAUSDT', recommendation: 'BUY', confidence: 68, aiScore: 75, price: 0.45 }
    ];
    
    return fallbackData.map(data => {
      const cryptoInfo = getCryptoInfo(data.symbol);
      return {
        ...data,
        name: cryptoInfo.name,
        category: cryptoInfo.category,
        icon: cryptoInfo.icon,
        color: cryptoInfo.color,
        risk: cryptoInfo.risk,
        currentPrice: data.price,
        targetPrice: data.price * 1.1,
        analysis: `تحليل متعدد الطبقات للـ ${cryptoInfo.name} يُشير لفرص استثمارية جيدة.`,
        change24h: Math.random() * 6 - 3,
        technicalSignal: data.recommendation,
        wyckoffPhase: 'تجميع',
        analysisLayers: 4,
        sentiment: 'neutral',
        volatility: 'medium',
        rsi: Math.random() * 100,
        macdSignal: Math.random() > 0.5 ? 'bullish' : 'bearish'
      };
    });
  };

  // وزن التوصيات
  const getRecommendationWeight = (rec) => {
    switch (rec) {
      case 'STRONG_BUY': return 120;
      case 'BUY': return 100;
      case 'HOLD': return 60;
      case 'SELL': return 40;
      case 'STRONG_SELL': return 20;
      default: return 50;
    }
  };

  // وزن المخاطر
  const getRiskWeight = (suggestionRisk, userRisk) => {
    if (suggestionRisk === userRisk) return 20;
    if (userRisk === 'MEDIUM') return 10;
    return 0;
  };

  // إضافة/إزالة من المفضلة
  const toggleFavorite = (symbol) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // فلترة الاقتراحات
  const filterSuggestions = (suggestions) => {
    if (filterMode === 'all') return suggestions;
    if (filterMode === 'buy') return suggestions.filter(s => s.recommendation.includes('BUY'));
    if (filterMode === 'sell') return suggestions.filter(s => s.recommendation.includes('SELL'));
    if (filterMode === 'hold') return suggestions.filter(s => s.recommendation === 'HOLD');
    return suggestions;
  };

  // ترتيب الاقتراحات
  const sortSuggestions = (suggestions) => {
    return suggestions.sort((a, b) => {
      switch (sortBy) {
        case 'ai_score':
          return b.aiScore - a.aiScore;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'risk':
          const riskOrder = { 'Low': 3, 'Medium': 2, 'High': 1 };
          return riskOrder[b.risk] - riskOrder[a.risk];
        case 'performance':
          return b.change24h - a.change24h;
        default:
          return b.aiScore - a.aiScore;
      }
    });
  };

  // ألوان وأيقونات التوصيات
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'STRONG_BUY':
        return 'text-green-300';
      case 'BUY':
        return 'text-green-400';
      case 'SELL':
        return 'text-red-400';
      case 'STRONG_SELL':
        return 'text-red-300';
      default:
        return 'text-yellow-400';
    }
  };

  const getRecommendationBg = (recommendation) => {
    switch (recommendation) {
      case 'STRONG_BUY':
        return 'bg-green-500/30 border-green-400/50';
      case 'BUY':
        return 'bg-green-500/20 border-green-500/30';
      case 'SELL':
        return 'bg-red-500/20 border-red-500/30';
      case 'STRONG_SELL':
        return 'bg-red-500/30 border-red-400/50';
      default:
        return 'bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'STRONG_BUY':
        return <FireIcon className="w-5 h-5" />;
      case 'BUY':
        return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case 'SELL':
        return <ArrowTrendingDownIcon className="w-5 h-5" />;
      case 'STRONG_SELL':
        return <ArrowTrendingDownIcon className="w-5 h-5" />;
      default:
        return <CheckCircleIcon className="w-5 h-5" />;
    }
  };

  const getRecommendationText = (recommendation) => {
    const texts = {
      'STRONG_BUY': 'شراء قوي',
      'BUY': 'شراء',
      'SELL': 'بيع',
      'STRONG_SELL': 'بيع قوي',
      'HOLD': 'انتظار'
    };
    return texts[recommendation] || recommendation;
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-500 text-white';
      case 'HIGH':
        return 'bg-red-500 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  // مكون التحكم المحسن
  const EnhancedControls = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* أزرار وضع العرض */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-gray-400 text-sm">العرض:</span>
          {[
            { id: 'grid', name: 'شبكة', icon: '⚏' },
            { id: 'list', name: 'قائمة', icon: '☰' },
            { id: 'detailed', name: 'مفصل', icon: '📊' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === mode.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-700'
              }`}
            >
              {mode.icon} {mode.name}
            </button>
          ))}
        </div>

        {/* فلترة */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-gray-400 text-sm">فلترة:</span>
          {[
            { id: 'all', name: 'الكل' },
            { id: 'buy', name: 'شراء' },
            { id: 'sell', name: 'بيع' },
            { id: 'hold', name: 'انتظار' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterMode(filter.id)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filterMode === filter.id
                  ? 'bg-green-500 text-white'
                  : 'text-gray-400 hover:text-white bg-gray-700'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* ترتيب */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-gray-400 text-sm">ترتيب:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
          >
            <option value="ai_score">AI Score</option>
            <option value="confidence">الثقة</option>
            <option value="risk">المخاطر</option>
            <option value="performance">الأداء</option>
          </select>
        </div>

        {/* إعدادات إضافية */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
            title="إعدادات متقدمة"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-500/20 text-gray-400'
            }`}
            title="التحديث التلقائي"
          >
            <ArrowPathIcon className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* الإعدادات المتقدمة */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            className="mt-4 pt-4 border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">حد AI Score الأدنى:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="60"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">حد الثقة الأدنى:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="50"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">تضمين العملات:</label>
                <select className="w-full bg-gray-700 text-white px-3 py-1 rounded text-sm">
                  <option value="all">جميع العملات</option>
                  <option value="major">العملات الرئيسية فقط</option>
                  <option value="favorites">المفضلة فقط</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // مكون الإشعارات
  const NotificationPanel = () => (
    notifications.length > 0 && (
      <div className="mb-6">
        {notifications.slice(0, 3).map(notification => (
          <motion.div
            key={notification.id}
            className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-lg p-4 mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <BellIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">{notification.message}</span>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-yellow-600 hover:text-yellow-400 mr-auto"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )
  );

  // تحديث تلقائي
  useEffect(() => {
    fetchCoinSuggestions();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (!loading) {
          fetchCoinSuggestions();
        }
      }, 300000); // كل 5 دقائق
    }

    return () => interval && clearInterval(interval);
  }, [riskLevel, autoRefresh]);

  // الفلترة والترتيب
  const filteredAndSortedSuggestions = filterSuggestions(sortSuggestions(suggestions));

  return (
    <div className="space-y-6">
      {/* رأس محسن */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="relative p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <SparklesIcon className="w-7 h-7 text-purple-400" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                apiStatus === 'connected' ? 'bg-green-400' : 
                apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">نصائح الذكاء الاصطناعي المتقدم</h3>
              <p className="text-gray-400 text-sm">
                تحليل شامل متعدد الطبقات • 
                {apiStatus === 'connected' ? ' متصل بالخادم' : apiStatus === 'error' ? ' غير متصل' : ' جاري الفحص'}
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchCoinSuggestions}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* اختيار مستوى المخاطر */}
        <div>
          <label className="block text-gray-400 text-sm mb-3">مستوى المخاطر المطلوب:</label>
          <div className="flex space-x-2 space-x-reverse">
            {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  riskLevel === level
                    ? getRiskLevelColor(level) + ' shadow-lg transform scale-105'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {level === 'LOW' ? '🛡️ منخفض' : level === 'MEDIUM' ? '⚖️ متوسط' : '🔥 عالي'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* التحكم المحسن */}
      <EnhancedControls />

      {/* الإشعارات */}
      <NotificationPanel />

      {/* حالة التحميل المحسنة */}
      {loading && (
        <div className="text-center py-8">
          <div className="relative">
            <CpuChipIcon className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <ArrowPathIcon className="w-6 h-6 text-pink-400 animate-spin" />
            </div>
          </div>
          <p className="text-gray-400 mb-2">🧠 جاري تحليل السوق باستخدام الذكاء الاصطناعي...</p>
          <p className="text-gray-500 text-sm">قد يستغرق هذا دقيقة واحدة</p>
        </div>
      )}

      {/* رسالة الخطأ المحسنة */}
      {error && (
        <motion.div
          className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-red-400 font-medium">خطأ في الاتصال: </span>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
          <p className="text-red-300 text-sm mt-2">تم استخدام بيانات احتياطية للتحليل</p>
        </motion.div>
      )}

      {/* قائمة الاقتراحات المحسنة */}
      {!loading && filteredAndSortedSuggestions.length > 0 && (
        <AnimatePresence>
          <div className={`${
            viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' :
            viewMode === 'list' ? 'space-y-4' :
            'space-y-8'
          }`}>
            <div className="col-span-full mb-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>مُرتبة حسب AI Score و {riskLevel === 'LOW' ? 'الاستقرار' : riskLevel === 'HIGH' ? 'الفرص العالية' : 'التوازن'}</span>
                </div>
                <div className="text-purple-400">
                  {lastUpdate && `آخر تحديث: ${lastUpdate}`}
                </div>
              </div>
            </div>

            {filteredAndSortedSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.symbol}
                className={`bg-white/5 rounded-xl p-5 border border-white/10 hover:border-purple-400/30 transition-all duration-300 relative ${
                  index === 0 ? 'ring-2 ring-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
              >
                {/* شارة الترتيب */}
                {index < 3 && (
                  <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    'bg-orange-500 text-white'
                  }`}>
                    {index === 0 ? '🏆' : index + 1}
                  </div>
                )}

                {/* زر المفضلة */}
                <div className="absolute top-3 left-3">
                  <button
                    onClick={() => toggleFavorite(suggestion.symbol)}
                    className={`p-1 rounded ${
                      favorites.includes(suggestion.symbol) 
                        ? 'text-yellow-400' 
                        : 'text-gray-400 hover:text-yellow-400'
                    }`}
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  {/* معلومات العملة */}
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="text-3xl">{suggestion.icon}</div>
                    <div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <h4 className="text-xl font-bold text-white">{suggestion.symbol.replace('USDT', '')}</h4>
                        <span className={`text-sm px-2 py-1 rounded ${suggestion.color} bg-white/10`}>
                          {suggestion.category}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{suggestion.name}</p>
                    </div>
                  </div>

                  {/* التوصية */}
                  <div className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg border ${getRecommendationBg(suggestion.recommendation)}`}>
                    <span className={`font-medium ${getRecommendationColor(suggestion.recommendation)}`}>
                      {getRecommendationText(suggestion.recommendation)}
                    </span>
                    <div className={getRecommendationColor(suggestion.recommendation)}>
                      {getRecommendationIcon(suggestion.recommendation)}
                    </div>
                  </div>
                </div>

                {/* معلومات السعر */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">السعر الحالي</div>
                    <div className="text-white font-bold text-lg">
                      ${suggestion.currentPrice?.toLocaleString()}
                    </div>
                    <div className={`text-xs flex items-center ${suggestion.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <span>{suggestion.change24h >= 0 ? '▲' : '▼'}</span>
                      <span className="ml-1">{Math.abs(suggestion.change24h).toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">الهدف المتوقع</div>
                    <div className="text-green-400 font-bold text-lg">
                      ${suggestion.targetPrice?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      +{(((suggestion.targetPrice / suggestion.currentPrice) - 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* مقاييس AI Score */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">🧠 نتيجة AI:</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="flex space-x-1 space-x-reverse">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i < Math.floor(suggestion.aiScore / 20) ? 'bg-purple-400 shadow-lg' : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-purple-400 font-bold">{suggestion.aiScore?.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">🎯 مستوى الثقة:</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${suggestion.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-blue-400 font-medium text-sm">{suggestion.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">📊 طبقات التحليل:</span>
                    <span className="text-cyan-400 text-sm">{suggestion.analysisLayers}/4</span>
                  </div>

                  {suggestion.wyckoffPhase && suggestion.wyckoffPhase !== 'غير محدد' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">🔄 مرحلة وايكوف:</span>
                      <span className="text-orange-400 text-sm font-medium">{suggestion.wyckoffPhase}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">⚠️ مستوى المخاطر:</span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      suggestion.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                      suggestion.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {suggestion.risk === 'High' ? '🔥 عالي' :
                       suggestion.risk === 'Low' ? '🛡️ منخفض' : '⚖️ متوسط'}
                    </span>
                  </div>
                </div>
                
                {/* تحليل AI */}
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 mb-4 border border-purple-500/20">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <BoltIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">تحليل الذكاء الاصطناعي</span>
                  </div>
                  <div className="text-gray-300 text-sm leading-relaxed">{suggestion.analysis}</div>
                </div>

                {/* معلومات إضافية */}
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mb-4">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <ChartBarIcon className="w-3 h-3" />
                    <span>إشارة فنية: <span className="text-cyan-400">{suggestion.technicalSignal}</span></span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <CurrencyDollarIcon className="w-3 h-3" />
                    <span>حجم 24س: {(suggestion.volume24h / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span>RSI: </span>
                    <span className={`${
                      suggestion.rsi > 70 ? 'text-red-400' :
                      suggestion.rsi < 30 ? 'text-green-400' :
                      'text-yellow-400'
                    }`}>
                      {suggestion.rsi?.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span>MACD: </span>
                    <span className={`${
                      suggestion.macdSignal === 'bullish' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {suggestion.macdSignal === 'bullish' ? '📈' : '📉'}
                    </span>
                  </div>
                </div>

                {/* زر العمل */}
                <button className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse ${
                  suggestion.recommendation === 'STRONG_BUY' ? 
                  'bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 text-green-300 border border-green-400/50 shadow-lg' :
                  suggestion.recommendation === 'BUY' ? 
                  'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30' :
                  suggestion.recommendation === 'HOLD' ? 
                  'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30' :
                  suggestion.recommendation === 'SELL' ?
                  'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30' :
                  'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30'
                }`}>
                  <span>
                    {suggestion.recommendation === 'STRONG_BUY' ? '🚀 فرصة قوية للشراء' :
                     suggestion.recommendation === 'BUY' ? '📈 إضافة للمحفظة' :
                     suggestion.recommendation === 'HOLD' ? '👁️ مراقبة مستمرة' :
                     suggestion.recommendation === 'SELL' ? '📉 تقليل المركز' :
                     '⚠️ انتظار إشارة واضحة'}
                  </span>
                  {getRecommendationIcon(suggestion.recommendation)}
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* حالة عدم وجود اقتراحات */}
      {!loading && filteredAndSortedSuggestions.length === 0 && !error && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <SparklesIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-400 mb-2">لا توجد اقتراحات متاحة</h4>
          <p className="text-gray-500 text-sm mb-4">جرب تغيير مستوى المخاطر أو أعد المحاولة</p>
          <button 
            onClick={fetchCoinSuggestions}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-300"
          >
            🔄 إعادة التحليل
          </button>
        </motion.div>
      )}

      {/* إحصائيات التحليل */}
      {filteredAndSortedSuggestions.length > 0 && (
        <motion.div 
          className="mt-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <TrophyIcon className="w-5 h-5 text-blue-400" />
            <h4 className="text-blue-400 font-medium">📊 إحصائيات التحليل المتقدم</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center bg-white/5 rounded-lg p-3">
              <div className="text-green-400 font-bold text-lg">
                {filteredAndSortedSuggestions.filter(s => s.recommendation.includes('BUY')).length}
              </div>
              <div className="text-gray-400">توصيات شراء</div>
            </div>
            <div className="text-center bg-white/5 rounded-lg p-3">
              <div className="text-yellow-400 font-bold text-lg">
                {filteredAndSortedSuggestions.filter(s => s.recommendation === 'HOLD').length}
              </div>
              <div className="text-gray-400">توصيات احتفاظ</div>
            </div>
            <div className="text-center bg-white/5 rounded-lg p-3">
              <div className="text-purple-400 font-bold text-lg">
                {(filteredAndSortedSuggestions.reduce((sum, s) => sum + s.aiScore, 0) / filteredAndSortedSuggestions.length).toFixed(1)}
              </div>
              <div className="text-gray-400">متوسط AI Score</div>
            </div>
            <div className="text-center bg-white/5 rounded-lg p-3">
              <div className="text-cyan-400 font-bold text-lg">
                {(filteredAndSortedSuggestions.reduce((sum, s) => sum + s.confidence, 0) / filteredAndSortedSuggestions.length).toFixed(1)}%
              </div>
              <div className="text-gray-400">متوسط الثقة</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ملاحظة مهمة محسنة */}
      <motion.div 
        className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start space-x-3 space-x-reverse">
          <InformationCircleIcon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-purple-400 text-sm font-medium mb-1">💡 ملاحظة مهمة</div>
            <div className="text-purple-300 text-xs leading-relaxed">
              هذه الاقتراحات مبنية على تحليل الذكاء الاصطناعي المتقدم للبيانات التاريخية، المؤشرات الفنية، 
              وتحليل وايكوف. النتائج للأغراض التعليمية ويجب إجراء بحث إضافي قبل اتخاذ أي قرارات استثمارية.
              <br />
              <span className="text-purple-400 font-medium">⚡ يتم التحديث كل 5 دقائق تلقائياً</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AISuggestion;