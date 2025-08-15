// components/Dashboard/TradingTab.js
import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CpuChipIcon,
  SparklesIcon,
  ArrowPathIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Configure axios for backend connection
const API_BASE_URL = 'http://localhost:8000';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const TradingTab = ({ selectedSymbol }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [tradingSignals, setTradingSignals] = useState([]);
  const [autoTrading, setAutoTrading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signalLoading, setSignalLoading] = useState(false);
  const [recentTrades, setRecentTrades] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [coinSuggestions, setCoinSuggestions] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);
  
  // Trading simulation state
  const [simulationMode, setSimulationMode] = useState(true);
  const [riskLevel, setRiskLevel] = useState('MEDIUM');
  const [tradingStrategy, setTradingStrategy] = useState('AI_HYBRID');

  useEffect(() => {
    fetchPortfolios();
    fetchMarketData();
    fetchCoinSuggestions();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      fetchRecentTrades(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  const fetchPortfolios = async () => {
    try {
      const response = await api.get('/trading/portfolios/user_001');
      setPortfolios(response.data.portfolios || []);
      if (response.data.portfolios?.length > 0) {
        setSelectedPortfolio(response.data.portfolios[0]);
      }
      setBackendConnected(true);
    } catch (error) {
      console.error('خطأ في جلب المحافظ:', error);
      setBackendConnected(false);
      // Demo portfolios
      const demoPortfolios = [{
        id: 'demo-1',
        symbol: 'BTCUSDT',
        performance: {
          current_balance: 1050.75,
          total_portfolio_value: 1125.30,
          total_return: 125.30,
          return_percentage: 12.53,
          success_rate: 75.5,
          total_trades: 8,
          successful_trades: 6
        }
      }];
      setPortfolios(demoPortfolios);
      setSelectedPortfolio(demoPortfolios[0]);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await api.get(`/price/${selectedSymbol}`);
      setMarketData(response.data);
      setBackendConnected(true);
    } catch (error) {
      console.error('خطأ في جلب بيانات السوق:', error);
      setBackendConnected(false);
      // Demo market data
      setMarketData({
        symbol: selectedSymbol,
        price: 67350.45,
        timestamp: Date.now() / 1000
      });
    }
  };

  const fetchCoinSuggestions = async () => {
    try {
      const response = await api.get(`/trading/suggest-coins?risk_level=${riskLevel}&count=5`);
      setCoinSuggestions(response.data.suggestions || []);
      setBackendConnected(true);
    } catch (error) {
      console.error('خطأ في جلب اقتراحات العملات:', error);
      setBackendConnected(false);
      // Demo suggestions
      setCoinSuggestions([
        {
          symbol: 'BTCUSDT',
          recommendation: 'BUY',
          confidence: 78.5,
          current_price: 67350.45,
          score: 85.2,
          reasoning: 'تحليل فني إيجابي',
          analysis_source: 'AI_HYBRID'
        }
      ]);
    }
  };

  const fetchRecentTrades = async (portfolioId) => {
    try {
      const response = await axios.get(`/trading/portfolio/history/${portfolioId}?limit=10`);
      setRecentTrades(response.data.trade_history || []);
    } catch (error) {
      console.error('خطأ في جلب تاريخ التداولات:', error);
    }
  };

  const getTradingSignal = async (symbol = selectedSymbol) => {
    setSignalLoading(true);
    try {
      const response = await axios.get(`/trading/signal/${symbol}`, {
        params: { strategy: tradingStrategy }
      });
      
      setTradingSignals(prev => [response.data, ...prev.slice(0, 4)]);
      return response.data;
    } catch (error) {
      console.error('خطأ في جلب إشارة التداول:', error);
      return null;
    } finally {
      setSignalLoading(false);
    }
  };

  const executeAutoTrade = async (portfolioId) => {
    setLoading(true);
    try {
      const response = await axios.post(`/trading/portfolio/auto-trade/${portfolioId}`);
      
      // تحديث البيانات
      fetchPortfolios();
      fetchRecentTrades(portfolioId);
      
      return response.data;
    } catch (error) {
      console.error('خطأ في التداول التلقائي:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startAutoTrading = async () => {
    if (!selectedPortfolio) return;
    
    setAutoTrading(true);
    
    // تنفيذ دورة تداول كل 30 ثانية (لأغراض العرض التوضيحي)
    const tradingInterval = setInterval(async () => {
      if (selectedPortfolio) {
        await executeAutoTrade(selectedPortfolio.id);
      }
    }, 30000);

    // حفظ interval ID لإيقافه لاحقاً
    window.tradingInterval = tradingInterval;
  };

  const stopAutoTrading = () => {
    setAutoTrading(false);
    if (window.tradingInterval) {
      clearInterval(window.tradingInterval);
      window.tradingInterval = null;
    }
  };

  const getSignalColor = (action) => {
    switch (action) {
      case 'BUY': 
      case 'STRONG_BUY': 
        return 'text-green-400 bg-green-500/20';
      case 'SELL': 
      case 'STRONG_SELL': 
        return 'text-red-400 bg-red-500/20';
      default: 
        return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getSignalText = (action) => {
    const actions = {
      'BUY': 'شراء',
      'SELL': 'بيع',
      'STRONG_BUY': 'شراء قوي',
      'STRONG_SELL': 'بيع قوي',
      'HOLD': 'انتظار'
    };
    return actions[action] || action;
  };

  const getTradeTypeIcon = (type) => {
    return type === 'BUY' ? (
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">محاكي التداول</h2>
            <p className="text-gray-400">تداول تلقائي مدعوم بالذكاء الصناعي</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          {/* Auto Trading Toggle */}
          <button
            onClick={autoTrading ? stopAutoTrading : startAutoTrading}
            disabled={!selectedPortfolio || loading}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 space-x-reverse ${
              autoTrading 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:bg-gray-500 disabled:cursor-not-allowed`}
          >
            {autoTrading ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            <span>{autoTrading ? 'إيقاف التداول' : 'بدء التداول'}</span>
          </button>

          {/* Portfolio Selector */}
          <select
            value={selectedPortfolio?.id || ''}
            onChange={(e) => {
              const portfolio = portfolios.find(p => p.id === e.target.value);
              setSelectedPortfolio(portfolio);
            }}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
          >
            <option value="">اختر محفظة</option>
            {portfolios.map(portfolio => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.symbol} - {formatCurrency(portfolio.performance?.current_balance || 0)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Signals Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">إشارات التداول</h3>
              <button
                onClick={() => getTradingSignal()}
                disabled={signalLoading}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
              >
                <BoltIcon className={`w-5 h-5 text-blue-400 ${signalLoading ? 'animate-bounce' : ''}`} />
              </button>
            </div>

            <div className="space-y-3">
              {tradingSignals.length > 0 ? (
                tradingSignals.map((signal, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{signal.symbol || selectedSymbol}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalColor(signal.action)}`}>
                        {getSignalText(signal.action)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">الثقة:</span>
                        <span className="text-blue-400">{signal.confidence?.toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">السعر:</span>
                        <span className="text-white">${signal.current_price?.toFixed(4)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">المصدر:</span>
                        <span className="text-purple-400">{signal.source}</span>
                      </div>
                    </div>
                    
                    {signal.reasoning && (
                      <div className="mt-2 text-xs text-gray-300">
                        {signal.reasoning.substring(0, 80)}...
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">لا توجد إشارات تداول</p>
                  <button
                    onClick={() => getTradingSignal()}
                    className="mt-2 text-blue-400 text-sm hover:text-blue-300"
                  >
                    جلب إشارة جديدة
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Market Data */}
          {marketData && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mt-4">
              <h3 className="text-lg font-semibold text-white mb-4">بيانات السوق</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">العملة:</span>
                  <span className="text-white font-medium">{marketData.symbol}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">السعر الحالي:</span>
                  <span className="text-green-400 font-bold">${marketData.price}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">آخر تحديث:</span>
                  <span className="text-blue-400 text-sm">
                    {formatTime(marketData.timestamp * 1000)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Performance & Recent Trades */}
        <div className="lg:col-span-2">
          {selectedPortfolio ? (
            <div className="space-y-6">
              {/* Portfolio Performance */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">أداء المحفظة</h3>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <ChartBarIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">{selectedPortfolio.symbol}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-1">إجمالي القيمة</div>
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(selectedPortfolio.performance?.total_portfolio_value || 0)}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-1">العائد</div>
                    <div className={`text-xl font-bold ${
                      (selectedPortfolio.performance?.return_percentage || 0) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {(selectedPortfolio.performance?.return_percentage || 0).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-1">نسبة النجاح</div>
                    <div className="text-xl font-bold text-blue-400">
                      {(selectedPortfolio.performance?.success_rate || 0).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-1">إجمالي الصفقات</div>
                    <div className="text-xl font-bold text-purple-400">
                      {selectedPortfolio.performance?.total_trades || 0}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-3 space-x-reverse mt-4">
                  <button
                    onClick={() => executeAutoTrade(selectedPortfolio.id)}
                    disabled={loading}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>تداول فوري</span>
                  </button>

                  <button
                    onClick={() => getTradingSignal(selectedPortfolio.symbol)}
                    disabled={signalLoading}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>إشارة جديدة</span>
                  </button>

                  <button
                    onClick={() => fetchRecentTrades(selectedPortfolio.id)}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>تحديث</span>
                  </button>
                </div>
              </div>

              {/* Recent Trades */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">التداولات الأخيرة</h3>
                
                {recentTrades.length > 0 ? (
                  <div className="space-y-3">
                    {recentTrades.map((trade, index) => (
                      <div key={trade.id || index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {getTradeTypeIcon(trade.type)}
                            <span className="font-medium text-white">{getSignalText(trade.type)}</span>
                            <span className="text-sm text-gray-400">#{trade.id?.substring(0, 8)}</span>
                          </div>
                          
                          <div className="text-sm text-gray-400">
                            {formatTime(trade.timestamp)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">الكمية: </span>
                            <span className="text-white">{trade.quantity?.toFixed(4)}</span>
                          </div>
                          
                          <div>
                            <span className="text-gray-400">السعر: </span>
                            <span className="text-blue-400">${trade.price?.toFixed(4)}</span>
                          </div>
                          
                          <div>
                            <span className="text-gray-400">القيمة: </span>
                            <span className="text-white">{formatCurrency(trade.total_value)}</span>
                          </div>
                          
                          <div>
                            <span className="text-gray-400">الربح/الخسارة: </span>
                            <span className={`font-medium ${
                              (trade.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(trade.profit_loss || 0)}
                            </span>
                          </div>
                        </div>

                        {trade.signal_source && (
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              المصدر: <span className="text-purple-400">{trade.signal_source}</span>
                            </span>
                            {trade.signal_confidence && (
                              <span className="text-gray-400">
                                الثقة: <span className="text-blue-400">{trade.signal_confidence.toFixed(1)}%</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">لا توجد تداولات بعد</p>
                    <p className="text-sm text-gray-500 mt-1">ابدأ التداول التلقائي لرؤية النتائج</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
              <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">اختر محفظة للتداول</h3>
              <p className="text-gray-400 mb-6">
                {portfolios.length === 0 
                  ? 'لا توجد محافظ متاحة. قم بإنشاء محفظة جديدة من قسم إدارة المحافظ.'
                  : 'اختر محفظة من القائمة أعلاه لبدء التداول.'
                }
              </p>
              
              {portfolios.length === 0 && (
                <button
                  onClick={() => window.location.hash = '#portfolio'}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  إنشاء محفظة جديدة
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Coin Suggestions */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">اقتراحات الذكاء الصناعي</h3>
          <div className="flex items-center space-x-3 space-x-reverse">
            <select
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                fetchCoinSuggestions();
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none text-sm"
            >
              <option value="LOW">مخاطر منخفضة</option>
              <option value="MEDIUM">مخاطر متوسطة</option>
              <option value="HIGH">مخاطر عالية</option>
            </select>
            
            <button
              onClick={fetchCoinSuggestions}
              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
            >
              <SparklesIcon className="w-5 h-5 text-purple-400" />
            </button>
          </div>
        </div>

        {coinSuggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {coinSuggestions.map((suggestion, index) => (
              <div key={suggestion.symbol} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{suggestion.symbol}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSignalColor(suggestion.recommendation)}`}>
                    {getSignalText(suggestion.recommendation)}
                  </span>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">السعر:</span>
                    <span className="text-white">${suggestion.current_price?.toFixed(4)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">الثقة:</span>
                    <span className="text-blue-400">{suggestion.confidence?.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">النتيجة:</span>
                    <span className="text-purple-400">{suggestion.score?.toFixed(1)}</span>
                  </div>
                </div>

                <button
                  onClick={() => getTradingSignal(suggestion.symbol)}
                  className="w-full mt-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded text-xs transition-colors"
                >
                  جلب إشارة
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">لا توجد اقتراحات متاحة</p>
          </div>
        )}
      </div>

      {/* Trading Settings & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">إعدادات التداول</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">استراتيجية التداول</label>
              <select
                value={tradingStrategy}
                onChange={(e) => setTradingStrategy(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="AI_HYBRID">ذكاء صناعي هجين</option>
                <option value="TECHNICAL">تحليل فني</option>
                <option value="SIMPLE_AI">ذكاء صناعي بسيط</option>
                <option value="ADVANCED_AI">ذكاء صناعي متقدم</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">مستوى المخاطرة</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="LOW">منخفض - استثمار آمن</option>
                <option value="MEDIUM">متوسط - متوازن</option>
                <option value="HIGH">عالي - مخاطر عالية</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">وضع المحاكاة</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {simulationMode && (
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <InformationCircleIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">وضع المحاكاة مفعل - لا يتم تداول حقيقي</span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => executeAutoTrade(selectedPortfolio?.id)}
                  disabled={!selectedPortfolio || loading}
                  className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-500/20 text-green-400 disabled:text-gray-400 py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  تداول فوري
                </button>
                
                <button
                  onClick={() => getTradingSignal()}
                  disabled={signalLoading}
                  className="bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 text-blue-400 disabled:text-gray-400 py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  إشارة جديدة
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Status & Stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">حالة التداول</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">حالة التداول التلقائي:</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`w-2 h-2 rounded-full ${autoTrading ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className={autoTrading ? 'text-green-400' : 'text-gray-400'}>
                  {autoTrading ? 'نشط' : 'متوقف'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">المحفظة النشطة:</span>
              <span className="text-white">{selectedPortfolio?.symbol || 'غير محددة'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">الاستراتيجية:</span>
              <span className="text-purple-400">
                {tradingStrategy === 'AI_HYBRID' ? 'هجين' :
                 tradingStrategy === 'TECHNICAL' ? 'فني' :
                 tradingStrategy === 'SIMPLE_AI' ? 'ذكي بسيط' : 'ذكي متقدم'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">إشارات التداول:</span>
              <span className="text-blue-400">{tradingSignals.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">وضع المحاكاة:</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                {simulationMode ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">مفعل</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">تداول حقيقي</span>
                  </>
                )}
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">العملة المختارة:</span>
                <span className="text-blue-400">{selectedSymbol}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">السعر الحالي:</span>
                <span className="text-white">{marketData ? `${marketData.price}` : 'جاري التحميل...'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">آخر تحديث:</span>
                <span className="text-gray-400">
                  {marketData ? formatTime(marketData.timestamp * 1000) : 'غير متاح'}
                </span>
              </div>
            </div>

            {loading && (
              <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ArrowPathIcon className="w-4 h-4 text-yellow-400 animate-spin" />
                  <span className="text-sm text-yellow-400">جاري تنفيذ العملية...</span>
                </div>
              </div>
            )}

            {/* Performance Summary */}
            {selectedPortfolio?.performance && (
              <div className="pt-3 border-t border-white/10">
                <div className="text-sm text-gray-400 mb-2">ملخص الأداء</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 rounded p-2 text-center">
                    <div className="text-gray-400">العائد</div>
                    <div className={`font-bold ${
                      (selectedPortfolio.performance.return_percentage || 0) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {(selectedPortfolio.performance.return_percentage || 0).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded p-2 text-center">
                    <div className="text-gray-400">الصفقات</div>
                    <div className="text-blue-400 font-bold">
                      {selectedPortfolio.performance.total_trades || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Trading Features Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">الميزات المتقدمة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Risk Management */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2 space-x-reverse">
              <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
              <span>إدارة المخاطر</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">مستوى المخاطر:</span>
                <span className={`font-medium ${
                  riskLevel === 'LOW' ? 'text-green-400' :
                  riskLevel === 'HIGH' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {riskLevel === 'LOW' ? 'منخفض' :
                   riskLevel === 'HIGH' ? 'عالي' : 'متوسط'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">حد الخسارة:</span>
                <span className="text-red-400">-5%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">هدف الربح:</span>
                <span className="text-green-400">+10%</span>
              </div>
            </div>
          </div>

          {/* AI Confidence */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2 space-x-reverse">
              <CpuChipIcon className="w-4 h-4 text-purple-400" />
              <span>ثقة الذكاء الصناعي</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              {tradingSignals.length > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">آخر إشارة:</span>
                    <span className="text-blue-400">{tradingSignals[0]?.confidence?.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">متوسط الثقة:</span>
                    <span className="text-purple-400">
                      {(tradingSignals.reduce((acc, signal) => acc + (signal.confidence || 0), 0) / tradingSignals.length).toFixed(1)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-center py-2">
                  لا توجد إشارات متاحة
                </div>
              )}
            </div>
          </div>

          {/* Market Conditions */}
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2 space-x-reverse">
              <ChartBarIcon className="w-4 h-4 text-blue-400" />
              <span>ظروف السوق</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">الاتجاه العام:</span>
                <span className="text-green-400">صعودي</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">التقلبات:</span>
                <span className="text-yellow-400">متوسطة</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">حجم التداول:</span>
                <span className="text-blue-400">مرتفع</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 space-x-reverse mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => fetchCoinSuggestions()}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>تحديث الاقتراحات</span>
          </button>
          
          <button
            onClick={fetchMarketData}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>تحديث السوق</span>
          </button>
          
          <button
            onClick={fetchPortfolios}
            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <WalletIcon className="w-4 h-4" />
            <span>تحديث المحافظ</span>
          </button>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="bg-red-500/10 backdrop-blur-md rounded-xl p-6 border border-red-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2 space-x-reverse">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
          <span>ضوابط الطوارئ</span>
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300 mb-1">إيقاف جميع العمليات فوراً</p>
            <p className="text-xs text-gray-400">يتم إيقاف التداول التلقائي وإلغاء جميع الأوامر المعلقة</p>
          </div>
          
          <button
            onClick={() => {
              stopAutoTrading();
              setTradingSignals([]);
              // يمكن إضافة المزيد من منطق الإيقاف الطارئ هنا
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <PauseIcon className="w-5 h-5" />
            <span>إيقاف طارئ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingTab;