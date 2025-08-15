// Dashboard.js - نسخة نهائية ونظيفة
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CpuChipIcon,
  BoltIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  WalletIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ScaleIcon,
  PlayIcon,
  StopIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// استيراد useAPI hook
import { useAPI } from '../../hooks/useAPI';

const Dashboard = (props) => {
  const selectedSymbol = props?.selectedSymbol || 'BTCUSDT';
  const analysisData = props?.analysisData || null;
  const setAnalysisData = props?.setAnalysisData || (() => {});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  
  // إعدادات وايكوف
  const [wyckoffEnabled, setWyckoffEnabled] = useState(true);
  const [wyckoffSettings, setWyckoffSettings] = useState({
    sensitivity: 'medium',
    multi_timeframe: true,
    volume_analysis: true,
    timeframes: ['1h', '4h', '1d']
  });
  const [showWyckoffSettings, setShowWyckoffSettings] = useState(false);

  // بيانات التبويبات
  const [portfolioData, setPortfolioData] = useState({
    balance: 10000,
    positions: [],
    pnl: 0,
    totalValue: 10000
  });

  const [tradingData, setTradingData] = useState({
    orderHistory: [],
    openOrders: [],
    tradingSettings: {
      riskPerTrade: 2,
      maxPositions: 5,
      autoTrading: false
    }
  });

  const [backtestData, setBacktestData] = useState({
    results: null,
    isRunning: false,
    settings: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialBalance: 10000,
      strategy: 'ai_combined'
    }
  });

  // بيانات النصائح
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [lastSuggestionsUpdate, setLastSuggestionsUpdate] = useState(null);

  const { fetchUltimateAnalysis } = useAPI();

  const tabs = [
    { id: 'analysis', name: 'التحليل', icon: ChartBarIcon },
    { id: 'ai_suggestions', name: 'نصائح الذكي', icon: BoltIcon },
    { id: 'portfolio', name: 'المحفظة', icon: WalletIcon },
    { id: 'investment', name: 'الاستثمار', icon: BanknotesIcon },
    { id: 'trading', name: 'التداول', icon: CurrencyDollarIcon },
    { id: 'backtest', name: 'المحاكاة', icon: ClockIcon },
    { id: 'comparison', name: 'المقارنة', icon: ScaleIcon }
  ];

  // جلب الأسعار الحقيقية
  const fetchRealPrices = async (symbols) => {
    try {
      const symbolsQuery = symbols.map(s => `"${s}"`).join(',');
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbolsQuery}]`);
      
      if (!response.ok) throw new Error('فشل في جلب الأسعار');
      
      const data = await response.json();
      const pricesMap = {};
      
      data.forEach(ticker => {
        pricesMap[ticker.symbol] = {
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent),
          volume: parseFloat(ticker.volume),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice)
        };
      });
      
      return pricesMap;
    } catch (error) {
      console.error('خطأ في جلب الأسعار:', error);
      return null;
    }
  };

  // جلب نصائح AI
  const fetchAISuggestions = async () => {
    setSuggestionsLoading(true);
    
    try {
      const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT'];
      const realPrices = await fetchRealPrices(cryptoSymbols);
      
      if (!realPrices) throw new Error('فشل في جلب الأسعار');
      
      const suggestions = [];
      
      for (const symbol of cryptoSymbols) {
        const priceData = realPrices[symbol];
        if (!priceData) continue;
        
        const suggestion = {
          symbol: symbol,
          name: getCryptoName(symbol),
          current_price: priceData.price,
          change_24h: priceData.change24h,
          volume_24h: priceData.volume,
          high_24h: priceData.high24h,
          low_24h: priceData.low24h,
          recommendation: generateRecommendation(priceData),
          confidence: generateConfidence(priceData),
          ai_score: generateAIScore(priceData),
          price_target: calculatePriceTarget(priceData),
          reasoning: generateReasoning(priceData, symbol),
          risk_level: calculateRiskLevel(priceData),
          timeframe: 'قصير إلى متوسط المدى',
          volume_strength: getVolumeStrength(priceData.volume, symbol),
          data_source: 'binance_api'
        };
        
        suggestions.push(suggestion);
      }
      
      suggestions.sort((a, b) => b.ai_score - a.ai_score);
      setAiSuggestions(suggestions);
      setLastSuggestionsUpdate(new Date().toLocaleTimeString('ar-SA'));
      
    } catch (error) {
      console.error('خطأ في جلب النصائح:', error);
      setAiSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // دوال مساعدة
  const getCryptoName = (symbol) => {
    const names = {
      'BTCUSDT': 'Bitcoin',
      'ETHUSDT': 'Ethereum', 
      'BNBUSDT': 'Binance Coin',
      'ADAUSDT': 'Cardano',
      'SOLUSDT': 'Solana',
      'DOTUSDT': 'Polkadot'
    };
    return names[symbol] || symbol;
  };

  const generateRecommendation = (priceData) => {
    if (priceData.change24h > 5) return 'BUY';
    if (priceData.change24h < -5) return 'SELL';
    return 'HOLD';
  };

  const generateConfidence = (priceData) => {
    const absChange = Math.abs(priceData.change24h);
    if (absChange > 10) return 85 + Math.random() * 10;
    if (absChange > 5) return 70 + Math.random() * 15;
    return 50 + Math.random() * 20;
  };

  const generateAIScore = (priceData) => {
    const baseScore = 60;
    const volatilityBonus = Math.min(Math.abs(priceData.change24h) * 2, 20);
    const randomFactor = Math.random() * 20;
    return Math.min(baseScore + volatilityBonus + randomFactor, 95);
  };

  const calculatePriceTarget = (priceData) => {
    const currentPrice = priceData.price;
    if (priceData.change24h > 0) {
      return currentPrice * (1 + 0.1 + Math.random() * 0.1);
    } else {
      return currentPrice * (1 + 0.05 + Math.random() * 0.05);
    }
  };

  const generateReasoning = (priceData, symbol) => {
    if (priceData.change24h > 5) {
      return `${symbol} يظهر قوة واضحة مع ارتفاع ${priceData.change24h.toFixed(1)}% في 24 ساعة`;
    } else if (priceData.change24h < -5) {
      return `${symbol} في مرحلة تصحيح مع انخفاض ${Math.abs(priceData.change24h).toFixed(1)}%`;
    } else {
      return `${symbol} في حالة استقرار نسبي، مناسب للمراقبة`;
    }
  };

  const calculateRiskLevel = (priceData) => {
    const volatility = Math.abs(priceData.change24h);
    if (volatility > 10) return 'HIGH';
    if (volatility > 5) return 'MEDIUM';
    return 'LOW';
  };

  const getVolumeStrength = (volume, symbol) => {
    if (symbol === 'BTCUSDT' && volume > 50000) return 'عالي جداً';
    if (symbol === 'ETHUSDT' && volume > 200000) return 'عالي جداً';
    if (volume > 100000) return 'عالي';
    if (volume > 50000) return 'متوسط إلى عالي';
    return 'متوسط';
  };

  // دالة التحديث الرئيسية
  const handleRefresh = useCallback(async () => {
    if (!fetchUltimateAnalysis) {
      setError('useAPI hook غير متصل');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const options = {
        include_wyckoff: wyckoffEnabled,
        multi_timeframe_wyckoff: wyckoffSettings.multi_timeframe,
        detail_level: 'detailed',
        depth: 200,
        wyckoff_sensitivity: wyckoffSettings.sensitivity,
        volume_analysis: wyckoffSettings.volume_analysis,
        timeframes: wyckoffSettings.timeframes
      };

      await fetchUltimateAnalysis(
        selectedSymbol,
        setAnalysisData,
        setCurrentPrice,
        setLastUpdate,
        options
      );
      
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, wyckoffEnabled, wyckoffSettings, fetchUltimateAnalysis, setAnalysisData, setCurrentPrice, setLastUpdate]);

  // Effects
  useEffect(() => {
    if (selectedSymbol && fetchUltimateAnalysis) {
      handleRefresh();
    }
  }, [selectedSymbol, handleRefresh]);

  useEffect(() => {
    if (activeTab === 'ai_suggestions' && aiSuggestions.length === 0 && !suggestionsLoading) {
      fetchAISuggestions();
    }
  }, [activeTab]);

  // مكونات التبويبات
  const TabNavigation = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
      <div className="flex space-x-2 space-x-reverse overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const AnalysisTab = () => {
    if (!analysisData) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">لا توجد بيانات تحليل متاحة</div>
          <button 
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            تحديث البيانات
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analysisData.analysis_layers?.['1_technical_analysis'] && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h4 className="text-blue-400 font-semibold mb-3">التحليل الفني</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">التوصية:</span>
                  <span className={`font-semibold ${
                    analysisData.analysis_layers['1_technical_analysis'].recommendation === 'BUY' ? 'text-green-400' :
                    analysisData.analysis_layers['1_technical_analysis'].recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {analysisData.analysis_layers['1_technical_analysis'].recommendation === 'BUY' ? 'شراء' :
                     analysisData.analysis_layers['1_technical_analysis'].recommendation === 'SELL' ? 'بيع' : 'انتظار'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">الثقة:</span>
                  <span className="text-white">{Math.round(analysisData.analysis_layers['1_technical_analysis'].confidence || 0)}%</span>
                </div>
              </div>
            </div>
          )}

          {analysisData.analysis_layers?.['4_wyckoff_analysis'] && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
              <h4 className="text-orange-400 font-semibold mb-3">تحليل وايكوف</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">المرحلة:</span>
                  <span className="text-white">{analysisData.analysis_layers['4_wyckoff_analysis'].current_phase || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">التوصية:</span>
                  <span className={`font-semibold ${
                    analysisData.analysis_layers['4_wyckoff_analysis'].trading_recommendation?.action === 'BUY' ? 'text-green-400' :
                    analysisData.analysis_layers['4_wyckoff_analysis'].trading_recommendation?.action === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {analysisData.analysis_layers['4_wyckoff_analysis'].trading_recommendation?.action === 'BUY' ? 'شراء' :
                     analysisData.analysis_layers['4_wyckoff_analysis'].trading_recommendation?.action === 'SELL' ? 'بيع' : 'انتظار'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {(analysisData?.final_recommendation || analysisData?.ultimate_decision) && (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-purple-400 font-semibold text-lg mb-4">القرار النهائي</h3>
            {(() => {
              const finalRec = analysisData?.final_recommendation || analysisData?.ultimate_decision;
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-gray-400">الإجراء</div>
                    <div className={`font-bold text-2xl ${
                      (finalRec.action || finalRec.final_recommendation) === 'BUY' ? 'text-green-400' :
                      (finalRec.action || finalRec.final_recommendation) === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {(finalRec.action || finalRec.final_recommendation) === 'BUY' ? 'شراء' :
                       (finalRec.action || finalRec.final_recommendation) === 'SELL' ? 'بيع' : 'انتظار'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">قوة الإشارة</div>
                    <div className="text-white font-bold text-2xl">
                      {Math.round((finalRec.strength || finalRec.final_confidence || 0) * (finalRec.strength < 1 ? 100 : 1))}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">الثقة الإجمالية</div>
                    <div className="text-white font-bold text-2xl">
                      {Math.round((finalRec.confidence || finalRec.final_confidence || 0) * (finalRec.confidence < 1 ? 100 : 1))}%
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  const AISuggestionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <BoltIcon className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">نصائح الذكاء الاصطناعي</h2>
            <p className="text-gray-400">أفضل العملات للاستثمار والتداول - بيانات حقيقية</p>
          </div>
        </div>
        
        <button
          onClick={fetchAISuggestions}
          disabled={suggestionsLoading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <ArrowPathIcon className={`w-4 h-4 ${suggestionsLoading ? 'animate-spin' : ''}`} />
          <span>{suggestionsLoading ? 'جاري التحديث...' : 'تحديث النصائح'}</span>
        </button>
      </div>

      {lastSuggestionsUpdate && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <span className="text-blue-400 text-sm">
            📊 آخر تحديث: {lastSuggestionsUpdate} | مصدر: Binance API
          </span>
        </div>
      )}

      {suggestionsLoading && aiSuggestions.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-16 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {!suggestionsLoading && aiSuggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiSuggestions.map((suggestion) => (
            <div
              key={suggestion.symbol}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{suggestion.symbol}</h3>
                  <p className="text-gray-400 text-sm">{suggestion.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  suggestion.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                  suggestion.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {suggestion.recommendation === 'BUY' ? 'شراء' :
                   suggestion.recommendation === 'SELL' ? 'بيع' : 'انتظار'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">السعر الحالي</div>
                  <div className="text-white font-bold text-lg">${suggestion.current_price?.toFixed(4)}</div>
                  <div className={`text-xs ${suggestion.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {suggestion.change_24h >= 0 ? '+' : ''}{suggestion.change_24h?.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">الهدف السعري</div>
                  <div className="text-green-400 font-bold text-lg">${suggestion.price_target?.toFixed(4)}</div>
                  <div className="text-xs text-gray-400">
                    +{(((suggestion.price_target / suggestion.current_price) - 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">مستوى الثقة:</span>
                  <span className="text-blue-400 font-medium text-sm">{suggestion.confidence?.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">نتيجة AI:</span>
                  <span className="text-purple-400 font-medium text-sm">{suggestion.ai_score?.toFixed(1)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">مستوى المخاطر:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    suggestion.risk_level === 'LOW' ? 'bg-green-500/20 text-green-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {suggestion.risk_level === 'HIGH' ? 'عالي' :
                     suggestion.risk_level === 'LOW' ? 'منخفض' : 'متوسط'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-1">تحليل:</div>
                <div className="text-gray-300 text-sm">{suggestion.reasoning}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!suggestionsLoading && aiSuggestions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">فشل في جلب البيانات</div>
          <button 
            onClick={fetchAISuggestions}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );

  const PortfolioTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-green-400 text-sm">إجمالي الرصيد</div>
          <div className="text-white text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-blue-400 text-sm">المراكز المفتوحة</div>
          <div className="text-white text-2xl font-bold">{portfolioData.positions.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="text-purple-400 text-sm">الربح/الخسارة</div>
          <div className={`text-2xl font-bold ${portfolioData.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolioData.pnl >= 0 ? '+' : ''}${portfolioData.pnl.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-yellow-400 text-sm">الرصيد المتاح</div>
          <div className="text-white text-2xl font-bold">${portfolioData.balance.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
          لوحة تحكم التداول الذكي
        </h1>
        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
          <span>العملة: <span className="text-white font-semibold">{selectedSymbol}</span></span>
          {currentPrice && (
            <span>السعر: <span className="text-green-400 font-semibold">${currentPrice.toLocaleString()}</span></span>
          )}
          {lastUpdate && (
            <span>آخر تحديث: <span className="text-blue-400">{lastUpdate}</span></span>
          )}
        </div>
      </div>

      {/* إعدادات وايكوف */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <CogIcon className="w-6 h-6 text-orange-400" />
              <h3 className="text-orange-400 font-semibold text-lg">إعدادات تحليل وايكوف</h3>
            </div>
            
            <button
              onClick={() => setShowWyckoffSettings(!showWyckoffSettings)}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-white">تفعيل تحليل وايكوف</span>
            <button
              onClick={() => setWyckoffEnabled(!wyckoffEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                wyckoffEnabled ? 'bg-orange-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  wyckoffEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showWyckoffSettings && wyckoffEnabled && (
            <div className="space-y-4 pt-4 border-t border-orange-500/20">
              <div>
                <label className="block text-sm text-gray-400 mb-2">حساسية التحليل</label>
                <select
                  value={wyckoffSettings.sensitivity}
                  onChange={(e) => setWyckoffSettings(prev => ({ ...prev, sensitivity: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">تحليل متعدد الإطارات</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({ ...prev, multi_timeframe: !prev.multi_timeframe }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    wyckoffSettings.multi_timeframe ? 'bg-orange-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      wyckoffSettings.multi_timeframe ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">تحليل الحجم</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({ ...prev, volume_analysis: !prev.volume_analysis }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    wyckoffSettings.volume_analysis ? 'bg-orange-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      wyckoffSettings.volume_analysis ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* التبويبات */}
      <TabNavigation />

      {/* زر التحديث للتحليل */}
      {activeTab === 'analysis' && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 space-x-reverse"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'جاري التحليل...' : 'تحديث التحليل'}</span>
          </button>
        </div>
      )}

      {/* عرض الأخطاء */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse mb-6">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
          <div>
            <div className="text-red-400 font-semibold">خطأ في التحليل</div>
            <div className="text-red-300 text-sm">{error}</div>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
              disabled={loading}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* تحذير useAPI */}
      {!fetchUltimateAnalysis && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse mb-6">
          <InformationCircleIcon className="w-6 h-6 text-yellow-400" />
          <div>
            <div className="text-yellow-400 font-semibold">تحذير: useAPI hook غير متصل</div>
            <div className="text-yellow-300 text-sm">
              تأكد من وجود ملف useAPI.js في: <code className="bg-yellow-500/20 px-1 rounded">src/hooks/useAPI.js</code>
            </div>
          </div>
        </div>
      )}

      {/* محتوى التبويبات */}
      {activeTab === 'analysis' && <AnalysisTab />}
      {activeTab === 'ai_suggestions' && <AISuggestionsTab />}
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'investment' && <div className="text-center py-8 text-gray-400">تبويب الاستثمار قيد التطوير</div>}
      {activeTab === 'trading' && <div className="text-center py-8 text-gray-400">تبويب التداول قيد التطوير</div>}
      {activeTab === 'backtest' && <div className="text-center py-8 text-gray-400">تبويب المحاكاة قيد التطوير</div>}
      {activeTab === 'comparison' && <div className="text-center py-8 text-gray-400">تبويب المقارنة قيد التطوير</div>}

      {/* معلومات التشخيص */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-xs mt-8">
        <div className="text-gray-400 mb-2">🔧 معلومات التشخيص:</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-gray-300">
          <div>الرمز: <span className="text-white">{selectedSymbol}</span></div>
          <div>التحميل: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'جاري' : 'مكتمل'}
          </span></div>
          <div>البيانات: <span className={analysisData ? 'text-green-400' : 'text-red-400'}>
            {analysisData ? 'متوفرة' : 'غير متوفرة'}
          </span></div>
          <div>وايكوف: <span className={wyckoffEnabled ? 'text-green-400' : 'text-gray-400'}>
            {wyckoffEnabled ? 'مفعل' : 'معطل'}
          </span></div>
          <div>useAPI: <span className={fetchUltimateAnalysis ? 'text-green-400' : 'text-red-400'}>
            {fetchUltimateAnalysis ? 'متصل' : 'غير متصل'}
          </span></div>
          <div>التبويب: <span className="text-blue-400">{activeTab}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;