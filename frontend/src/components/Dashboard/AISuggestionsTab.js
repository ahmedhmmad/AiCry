// components/Dashboard/AISuggestionsTab.js - يستخدم Backend API الحقيقي
import React, { useState, useEffect } from 'react';
import { 
  BoltIcon,
  ArrowPathIcon,
  SparklesIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const AISuggestionsTab = ({ selectedSymbol, currentPrice }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // قائمة العملات للتحليل
  const cryptoSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 
    'DOTUSDT', 'XRPUSDT', 'MATICUSDT', 'LINKUSDT', 'UNIUSDT'
  ];

  // معلومات العملات
  const getCryptoInfo = (symbol) => {
    const cryptoData = {
      'BTCUSDT': { name: 'Bitcoin', category: 'Store of Value', icon: '₿' },
      'ETHUSDT': { name: 'Ethereum', category: 'Smart Contracts', icon: 'Ξ' },
      'BNBUSDT': { name: 'Binance Coin', category: 'Exchange Token', icon: '🟡' },
      'ADAUSDT': { name: 'Cardano', category: 'Smart Contracts', icon: '🔵' },
      'SOLUSDT': { name: 'Solana', category: 'High Performance', icon: '🟣' },
      'DOTUSDT': { name: 'Polkadot', category: 'Interoperability', icon: '🔴' },
      'XRPUSDT': { name: 'Ripple', category: 'Payments', icon: '💧' },
      'MATICUSDT': { name: 'Polygon', category: 'Layer 2', icon: '🟠' },
      'LINKUSDT': { name: 'Chainlink', category: 'Oracle', icon: '🔗' },
      'UNIUSDT': { name: 'Uniswap', category: 'DEX', icon: '🦄' }
    };
    return cryptoData[symbol] || { name: symbol, category: 'Unknown', icon: '❓' };
  };

  // فحص حالة الباك إند
  const checkAPIStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setApiStatus(data.api === 'healthy' ? 'connected' : 'error');
      return data.api === 'healthy';
    } catch (error) {
      console.error('خطأ في فحص API:', error);
      setApiStatus('error');
      return false;
    }
  };

  // جلب التحليل الشامل من الباك إند
  const fetchUltimateAnalysis = async (symbol) => {
    try {
      const response = await fetch(`/api/ai/ultimate-analysis/${symbol}?include_wyckoff=true&multi_timeframe_wyckoff=true`);
      
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

  // تحويل نتائج الباك إند إلى صيغة النصائح
  const transformBackendToSuggestion = (analysisData, cryptoInfo) => {
    if (analysisData.error) {
      return {
        symbol: analysisData.symbol,
        name: cryptoInfo.name,
        category: cryptoInfo.category,
        icon: cryptoInfo.icon,
        error: analysisData.error,
        aiScore: 0,
        confidence: 0,
        recommendation: 'ERROR'
      };
    }

    // استخراج البيانات من التحليل الشامل
    const ultimateDecision = analysisData.ultimate_decision || {};
    const analysisLayers = analysisData.analysis_layers || {};
    
    // حساب متوسط النتائج من جميع الطبقات
    const technicalAnalysis = analysisLayers['1_technical_analysis'] || {};
    const simpleAI = analysisLayers['2_simple_ai'] || {};
    const advancedAI = analysisLayers['3_advanced_ai'] || {};
    const wyckoffAnalysis = analysisLayers['4_wyckoff_analysis'] || {};

    // حساب AI Score من متوسط النتائج
    const scores = [
      technicalAnalysis.confidence || 0,
      simpleAI.confidence || 0,
      advancedAI.ensemble_prediction?.confidence || 0,
      wyckoffAnalysis.confidence || 0
    ].filter(score => score > 0);

    const aiScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;

    // تحديد التوصية الرئيسية
    const finalRecommendation = ultimateDecision.final_recommendation || 
                               ultimateDecision.action || 
                               'HOLD';

    // حساب السعر المستهدف
    const currentPrice = analysisData.current_price || 0;
    const confidenceMultiplier = (ultimateDecision.final_confidence || 60) / 100;
    const targetPrice = currentPrice * (1 + (0.05 + confidenceMultiplier * 0.1));

    // تحليل المخاطر
    const riskLevel = aiScore > 75 ? 'LOW' : aiScore > 50 ? 'MEDIUM' : 'HIGH';

    // توليد التحليل النصي
    const activeLayersCount = Object.keys(analysisLayers).length;
    const wyckoffPhase = wyckoffAnalysis.current_phase || 'غير محدد';
    
    let analysis = `تحليل شامل بـ ${activeLayersCount} طبقات ذكاء اصطناعي. `;
    
    if (wyckoffAnalysis.current_phase) {
      analysis += `وفقاً لتحليل وايكوف، السوق في مرحلة "${wyckoffPhase}". `;
    }

    if (advancedAI.ensemble_prediction) {
      analysis += `مجموعة النماذج المتقدمة تُشير لثقة ${(advancedAI.ensemble_prediction.confidence || 0).toFixed(1)}%. `;
    }

    analysis += `القرار النهائي مبني على تحليل ${analysisData.active_analysis_methods || 'متعدد'} طرق.`;

    return {
      symbol: analysisData.symbol,
      name: cryptoInfo.name,
      category: cryptoInfo.category,
      icon: cryptoInfo.icon,
      currentPrice: currentPrice,
      change24h: 0, // سيتم تحديثه من Binance
      volume24h: 0, // سيتم تحديثه من Binance
      recommendation: finalRecommendation,
      aiScore: aiScore,
      confidence: ultimateDecision.final_confidence || 60,
      targetPrice: targetPrice,
      analysis: analysis,
      riskLevel: riskLevel,
      timeframe: 'متوسط المدى',
      
      // بيانات إضافية من التحليل
      technicalSignal: technicalAnalysis.recommendation || 'غير محدد',
      wyckoffPhase: wyckoffPhase,
      ensembleModels: advancedAI.ensemble_prediction?.models_count || 0,
      analysisLayers: activeLayersCount,
      
      // بيانات خام للمطورين
      rawAnalysis: analysisData,
      lastUpdate: new Date().toISOString()
    };
  };

  // جلب بيانات الأسعار من Binance لتحديث Change24h
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
  const fetchAISuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // فحص حالة API أولاً
      const isAPIHealthy = await checkAPIStatus();
      if (!isAPIHealthy) {
        throw new Error('Backend API غير متاح حالياً');
      }

      console.log('🤖 بدء تحليل العملات باستخدام AI Backend...');
      
      // جلب التحليل لكل عملة
      const analysisPromises = cryptoSymbols.map(symbol => 
        fetchUltimateAnalysis(symbol)
      );
      
      const analysisResults = await Promise.all(analysisPromises);
      
      // تحويل النتائج إلى نصائح
      const processedSuggestions = analysisResults.map(result => {
        const symbol = result.symbol || result.error?.includes('BTCUSDT') ? 'BTCUSDT' : 'UNKNOWN';
        const cryptoInfo = getCryptoInfo(symbol);
        return transformBackendToSuggestion(result, cryptoInfo);
      });

      // فلترة النتائج الصحيحة فقط
      const validSuggestions = processedSuggestions.filter(s => s.recommendation !== 'ERROR');
      const errorCount = processedSuggestions.length - validSuggestions.length;

      if (validSuggestions.length === 0) {
        throw new Error('فشل في تحليل جميع العملات');
      }

      // تحديث بيانات الأسعار
      const updatedSuggestions = await updatePriceData(validSuggestions);

      // ترتيب النتائج حسب AI Score والتوصية
      updatedSuggestions.sort((a, b) => {
        const scoreWeight = b.aiScore - a.aiScore;
        const recWeight = getRecommendationWeight(b.recommendation) - getRecommendationWeight(a.recommendation);
        return recWeight * 0.4 + scoreWeight * 0.6;
      });

      setSuggestions(updatedSuggestions);
      setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      
      if (errorCount > 0) {
        console.warn(`⚠️ فشل تحليل ${errorCount} عملة من أصل ${cryptoSymbols.length}`);
      }
      
      console.log(`✅ تم تحليل ${validSuggestions.length} عملة بنجاح`);
      
      // حفظ في localStorage
      localStorage.setItem('ai_suggestions_backend_cache', JSON.stringify({
        data: updatedSuggestions,
        timestamp: Date.now(),
        source: 'backend_api'
      }));
      
    } catch (error) {
      console.error('❌ خطأ في جلب نصائح AI:', error);
      setError(error.message);
      
      // محاولة تحميل البيانات المحفوظة
      try {
        const cached = localStorage.getItem('ai_suggestions_backend_cache');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 600000) { // 10 دقائق
            setSuggestions(data);
            setLastUpdate('من التخزين المؤقت');
            console.log('📦 تم تحميل البيانات من التخزين المؤقت');
          }
        }
      } catch (e) {
        console.error('خطأ في تحميل البيانات المحفوظة:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  // وزن التوصيات للترتيب
  const getRecommendationWeight = (rec) => {
    switch (rec) {
      case 'BUY': return 100;
      case 'HOLD': return 60;
      case 'SELL': return 40;
      default: return 50;
    }
  };

  // ألوان التوصيات
  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'BUY': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'HOLD': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'SELL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // ترجمة التوصيات
  const getRecommendationText = (rec) => {
    switch (rec) {
      case 'BUY': return 'شراء';
      case 'HOLD': return 'احتفاظ';
      case 'SELL': return 'بيع';
      default: return 'غير محدد';
    }
  };

  // تحديث تلقائي كل 5 دقائق
  useEffect(() => {
    fetchAISuggestions();
    
    const interval = setInterval(() => {
      if (!loading) {
        fetchAISuggestions();
      }
    }, 300000); // كل 5 دقائق

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="relative">
            <CpuChipIcon className="w-8 h-8 text-purple-400" />
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
              apiStatus === 'connected' ? 'bg-green-400' : 
              apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`}></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">نصائح الذكاء الاصطناعي المتقدم</h2>
            <p className="text-gray-400">تحليل شامل باستخدام طبقات AI متعددة + تحليل وايكوف</p>
          </div>
        </div>
        
        <button
          onClick={fetchAISuggestions}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 space-x-reverse shadow-lg"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'جاري التحليل المتقدم...' : 'تحديث التحليل'}</span>
        </button>
      </div>

      {/* API Status */}
      <div className={`border rounded-xl p-4 ${
        apiStatus === 'connected' ? 'bg-green-500/10 border-green-500/20' :
        apiStatus === 'error' ? 'bg-red-500/10 border-red-500/20' :
        'bg-yellow-500/10 border-yellow-500/20'
      }`}>
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center space-x-2 space-x-reverse ${
            apiStatus === 'connected' ? 'text-green-400' :
            apiStatus === 'error' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-400' :
              apiStatus === 'error' ? 'bg-red-400' :
              'bg-yellow-400'
            }`}></div>
            <span>Backend AI Engine: {
              apiStatus === 'connected' ? 'متصل' :
              apiStatus === 'error' ? 'غير متصل' :
              'جاري الفحص...'
            }</span>
            {lastUpdate && <span>• آخر تحديث: {lastUpdate}</span>}
          </div>
          <div className="text-purple-400">
            🧠 التحليل يتم على الخادم باستخدام نماذج ML متقدمة
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
          <div>
            <div className="text-red-400 font-semibold">خطأ في Backend API</div>
            <div className="text-red-300 text-sm">{error}</div>
            <button 
              onClick={fetchAISuggestions}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && suggestions.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse border border-gray-700/50">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-16 bg-gray-700 rounded mb-4"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions Grid */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.symbol}
              className={`relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:transform hover:scale-105 shadow-lg ${
                index === 0 ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' :
                index === 1 ? 'border-silver-400/50 ring-1 ring-silver-400/20' :
                index === 2 ? 'border-orange-500/50 ring-1 ring-orange-500/20' :
                'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Rank Badge */}
              {index < 3 && (
                <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  'bg-orange-500 text-white'
                }`}>
                  {index === 0 ? '🏆' : index + 1}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{suggestion.symbol}</h3>
                      <p className="text-gray-400 text-sm">{suggestion.name}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">{suggestion.category}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${getRecommendationColor(suggestion.recommendation)}`}>
                  {getRecommendationText(suggestion.recommendation)}
                </div>
              </div>
              
              {/* Price Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">السعر الحالي</div>
                  <div className="text-white font-bold text-lg">
                    ${suggestion.currentPrice?.toFixed(suggestion.currentPrice < 1 ? 6 : 2)}
                  </div>
                  <div className={`text-xs flex items-center ${suggestion.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <span>{suggestion.change24h >= 0 ? '▲' : '▼'}</span>
                    <span className="ml-1">{Math.abs(suggestion.change24h)?.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">الهدف السعري</div>
                  <div className="text-green-400 font-bold text-lg">
                    ${suggestion.targetPrice?.toFixed(suggestion.targetPrice < 1 ? 6 : 2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    +{(((suggestion.targetPrice / suggestion.currentPrice) - 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* AI Analysis Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">نتيجة AI المتقدم:</span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex space-x-1 space-x-reverse">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.floor(suggestion.aiScore / 20) ? 'bg-purple-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-purple-400 font-medium text-sm">{suggestion.aiScore?.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">ثقة النموذج:</span>
                  <span className="text-blue-400 font-medium text-sm">{suggestion.confidence?.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">طبقات التحليل:</span>
                  <span className="text-cyan-400 text-sm">{suggestion.analysisLayers || 0}</span>
                </div>

                {suggestion.wyckoffPhase && suggestion.wyckoffPhase !== 'غير محدد' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">مرحلة وايكوف:</span>
                    <span className="text-orange-400 text-sm">{suggestion.wyckoffPhase}</span>
                  </div>
                )}

                {suggestion.ensembleModels > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">نماذج مدمجة:</span>
                    <span className="text-pink-400 text-sm">{suggestion.ensembleModels}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">مستوى المخاطر:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    suggestion.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {suggestion.riskLevel === 'HIGH' ? 'عالي' :
                     suggestion.riskLevel === 'LOW' ? 'منخفض' : 'متوسط'}
                  </span>
                </div>
              </div>
              
              {/* Backend Analysis Summary */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <div className="text-gray-400 text-xs mb-2">🧠 تحليل الذكاء الاصطناعي:</div>
                <div className="text-gray-300 text-sm leading-relaxed">{suggestion.analysis}</div>
              </div>

              {/* Technical Indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
                <div>إشارة فنية: <span className="text-cyan-400">{suggestion.technicalSignal}</span></div>
                <div>حجم 24س: {(suggestion.volume24h / 1000).toFixed(0)}K</div>
              </div>

              {/* Action Button */}
              <button className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                suggestion.recommendation === 'BUY' ? 
                'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30' :
                suggestion.recommendation === 'HOLD' ? 
                'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30' :
                suggestion.recommendation === 'SELL' ?
                'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30' :
                'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30'
              }`}>
                {suggestion.recommendation === 'BUY' ? '🚀 إضافة للمحفظة' :
                 suggestion.recommendation === 'HOLD' ? '👁️ مراقبة مستمرة' :
                 suggestion.recommendation === 'SELL' ? '📉 تقليل المركز' :
                 '⚠️ انتظار إشارة واضحة'}
              </button>

              {/* Debug Info for Developers */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-xs text-gray-500 cursor-pointer">🔧 بيانات المطور</summary>
                  <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-900/50 rounded overflow-auto max-h-32">
                    {JSON.stringify({
                      aiScore: suggestion.aiScore,
                      confidence: suggestion.confidence,
                      analysisLayers: suggestion.analysisLayers,
                      wyckoffPhase: suggestion.wyckoffPhase,
                      ensembleModels: suggestion.ensembleModels
                    }, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && suggestions.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">لا توجد نصائح متاحة</div>
          <button 
            onClick={fetchAISuggestions}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            🔄 جلب النصائح
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 text-center text-sm text-gray-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-blue-400 font-medium">🧠 تحليل متقدم</div>
            <div>نماذج تعلم آلة متعددة + تحليل وايكوف</div>
          </div>
          <div>
            <div className="text-green-400 font-medium">📊 بيانات حقيقية</div>
            <div>من Binance API مع تحليل Backend</div>
          </div>
          <div>
            <div className="text-yellow-400 font-medium">⚠️ تنبيه</div>
            <div>للأغراض التعليمية - ليست نصائح استثمارية</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/20">
          <h4 className="text-blue-400 font-medium mb-3">📈 إحصائيات التحليل</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">
                {suggestions.filter(s => s.recommendation === 'BUY').length}
              </div>
              <div className="text-gray-400">توصيات شراء</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg">
                {suggestions.filter(s => s.recommendation === 'HOLD').length}
              </div>
              <div className="text-gray-400">توصيات احتفاظ</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold text-lg">
                {(suggestions.reduce((sum, s) => sum + s.aiScore, 0) / suggestions.length).toFixed(1)}
              </div>
              <div className="text-gray-400">متوسط AI Score</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-bold text-lg">
                {(suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length).toFixed(1)}%
              </div>
              <div className="text-gray-400">متوسط الثقة</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestionsTab;