// components/Dashboard/ComparisonTab.js
import React, { useState, useEffect } from 'react';
import { 
  ScaleIcon,
  ChartBarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  SparklesIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export const ComparisonTab = ({ selectedSymbol, analysisData }) => {
  const [selectedSymbols, setSelectedSymbols] = useState([selectedSymbol]);
  const [comparisonData, setComparisonData] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('1h');

  const availableSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOGEUSDT', 'XRPUSDT', 'LTCUSDT'];

  // Load comparison data for selected symbols
  useEffect(() => {
    if (selectedSymbols.length > 0) {
      loadComparisonData();
    }
  }, [selectedSymbols, timeframe]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const data = {};
      
      for (const symbol of selectedSymbols) {
        // محاكاة تحميل البيانات لكل رمز
        await new Promise(resolve => setTimeout(resolve, 300));
        
        data[symbol] = generateMockAnalysis(symbol);
      }
      
      setComparisonData(data);
    } catch (error) {
      console.error('خطأ في تحميل بيانات المقارنة:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock analysis data for comparison
  const generateMockAnalysis = (symbol) => {
    const basePrice = {
      'BTCUSDT': 45000,
      'ETHUSDT': 3200,
      'BNBUSDT': 320,
      'ADAUSDT': 0.45,
      'SOLUSDT': 85,
      'DOGEUSDT': 0.08,
      'XRPUSDT': 0.55,
      'LTCUSDT': 95
    };

    const price = basePrice[symbol] || 100;
    const recommendations = ['BUY', 'SELL', 'HOLD'];
    const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
    const confidence = Math.floor(Math.random() * 40) + 50;
    
    return {
      symbol: symbol,
      current_price: price * (0.95 + Math.random() * 0.1), // تقلب بسيط في السعر
      price_change_24h: (Math.random() - 0.5) * 10,
      volume_24h: Math.floor(Math.random() * 1000000000),
      market_cap: Math.floor(Math.random() * 100000000000),
      ultimate_decision: {
        final_recommendation: recommendation,
        final_confidence: confidence,
        reasoning: `تحليل ${symbol} يشير إلى ${recommendation}`,
        risk_level: confidence > 70 ? 'LOW' : confidence > 50 ? 'MEDIUM' : 'HIGH'
      },
      analysis_layers: {
        '1_technical_analysis': {
          confidence: Math.floor(Math.random() * 30) + 50,
          recommendation: recommendations[Math.floor(Math.random() * recommendations.length)]
        },
        '2_simple_ai': {
          confidence: Math.floor(Math.random() * 35) + 55,
          recommendation: recommendations[Math.floor(Math.random() * recommendations.length)]
        },
        '3_advanced_ai': {
          ensemble_prediction: {
            confidence: Math.floor(Math.random() * 25) + 65,
            recommendation: recommendations[Math.floor(Math.random() * recommendations.length)]
          }
        }
      },
      performance_metrics: {
        volatility: Math.random() * 50 + 10,
        trend_strength: Math.random() * 100,
        momentum: Math.random() * 200 - 100,
        support_level: price * (0.9 + Math.random() * 0.05),
        resistance_level: price * (1.05 + Math.random() * 0.05)
      }
    };
  };

  const addSymbol = (symbol) => {
    if (!selectedSymbols.includes(symbol) && selectedSymbols.length < 6) {
      setSelectedSymbols(prev => [...prev, symbol]);
    }
  };

  const removeSymbol = (symbol) => {
    if (selectedSymbols.length > 1) {
      setSelectedSymbols(prev => prev.filter(s => s !== symbol));
    }
  };

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
        return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <ArrowTrendingDownIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  // Sort symbols by performance for ranking
  const sortedByConfidence = Object.entries(comparisonData)
    .sort(([,a], [,b]) => (b.ultimate_decision?.final_confidence || 0) - (a.ultimate_decision?.final_confidence || 0));

  const sortedByPriceChange = Object.entries(comparisonData)
    .sort(([,a], [,b]) => (b.price_change_24h || 0) - (a.price_change_24h || 0));

  return (
    <div className="space-y-6">
      {/* Comparison Controls */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <ScaleIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">مقارنة العملات الرقمية</h3>
        </div>

        {/* Symbol Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">العملات المختارة ({selectedSymbols.length}/6)</h4>
            <select
              onChange={(e) => e.target.value && addSymbol(e.target.value)}
              value=""
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="" className="bg-slate-800">إضافة عملة</option>
              {availableSymbols
                .filter(symbol => !selectedSymbols.includes(symbol))
                .map(symbol => (
                  <option key={symbol} value={symbol} className="bg-slate-800">
                    {symbol}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSymbols.map(symbol => (
              <div
                key={symbol}
                className="flex items-center space-x-2 space-x-reverse bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2"
              >
                <span className="text-blue-400 font-semibold">{symbol}</span>
                {selectedSymbols.length > 1 && (
                  <button
                    onClick={() => removeSymbol(symbol)}
                    className="text-blue-300 hover:text-red-400 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeframe Selection */}
        <div className="flex items-center space-x-4 space-x-reverse">
          <span className="text-gray-400">الإطار الزمني:</span>
          {['1h', '4h', '1d', '1w'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeframe === tf
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent ml-3"></div>
          <span className="text-blue-400">جاري تحميل بيانات المقارنة...</span>
        </div>
      ) : (
        <>
          {/* Quick Rankings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Confidence Ranking */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <TrophyIcon className="w-5 h-5 text-yellow-400" />
                <h4 className="text-lg font-semibold text-white">الأعلى ثقة</h4>
              </div>
              <div className="space-y-3">
                {sortedByConfidence.slice(0, 3).map(([symbol, data], index) => (
                  <div key={symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-400 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        'bg-orange-400 text-black'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-white font-semibold">{symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className={getRecommendationColor(data.ultimate_decision?.final_recommendation)}>
                        {data.ultimate_decision?.final_confidence}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {data.ultimate_decision?.final_recommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Performance Ranking */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <ChartBarIcon className="w-5 h-5 text-green-400" />
                <h4 className="text-lg font-semibold text-white">الأفضل أداءً (24س)</h4>
              </div>
              <div className="space-y-3">
                {sortedByPriceChange.slice(0, 3).map(([symbol, data], index) => (
                  <div key={symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-green-400 text-black' :
                        index === 1 ? 'bg-blue-400 text-black' :
                        'bg-purple-400 text-black'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-white font-semibold">{symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className={data.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {data.price_change_24h >= 0 ? '+' : ''}{data.price_change_24h?.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        ${data.current_price?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-6">مقارنة تفصيلية</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">العملة</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">السعر</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">التغيير 24س</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">التوصية</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">الثقة</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">المخاطر</th>
                    <th className="text-right py-3 px-2 text-gray-400 font-semibold">التقلب</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    if (!data) return null;

                    return (
                      <tr key={symbol} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="font-semibold text-white">{symbol}</span>
                            {symbol === selectedSymbol && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">حالي</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-white font-semibold">
                          ${data.current_price?.toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <span className={data.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {data.price_change_24h >= 0 ? '+' : ''}{data.price_change_24h?.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className={`flex items-center space-x-1 space-x-reverse ${getRecommendationColor(data.ultimate_decision?.final_recommendation)}`}>
                            {getRecommendationIcon(data.ultimate_decision?.final_recommendation)}
                            <span className="text-sm font-semibold">
                              {data.ultimate_decision?.final_recommendation}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-12 bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-blue-400"
                                style={{ width: `${data.ultimate_decision?.final_confidence || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm">
                              {data.ultimate_decision?.final_confidence}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            data.ultimate_decision?.risk_level === 'LOW' ? 'bg-green-500/20 text-green-400' :
                            data.ultimate_decision?.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {data.ultimate_decision?.risk_level === 'LOW' ? 'منخفض' :
                             data.ultimate_decision?.risk_level === 'MEDIUM' ? 'متوسط' : 'عالي'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-white">
                          {data.performance_metrics?.volatility?.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analysis Layers Comparison */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-6">مقارنة طبقات التحليل</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Technical Analysis */}
              <div>
                <h5 className="text-green-400 font-semibold mb-4 flex items-center space-x-2 space-x-reverse">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>التحليل الفني</span>
                </h5>
                <div className="space-y-3">
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    const techData = data?.analysis_layers?.['1_technical_analysis'];
                    
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-white text-sm">{symbol}</span>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className={`text-xs ${getRecommendationColor(techData?.recommendation)}`}>
                            {techData?.recommendation}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {techData?.confidence}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simple AI */}
              <div>
                <h5 className="text-blue-400 font-semibold mb-4 flex items-center space-x-2 space-x-reverse">
                  <SparklesIcon className="w-5 h-5" />
                  <span>AI البسيط</span>
                </h5>
                <div className="space-y-3">
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    const aiData = data?.analysis_layers?.['2_simple_ai'];
                    
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-white text-sm">{symbol}</span>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className={`text-xs ${getRecommendationColor(aiData?.recommendation)}`}>
                            {aiData?.recommendation}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {aiData?.confidence}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advanced AI */}
              <div>
                <h5 className="text-purple-400 font-semibold mb-4 flex items-center space-x-2 space-x-reverse">
                  <SparklesIcon className="w-5 h-5" />
                  <span>AI المتقدم</span>
                </h5>
                <div className="space-y-3">
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    const advancedData = data?.analysis_layers?.['3_advanced_ai']?.ensemble_prediction;
                    
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-white text-sm">{symbol}</span>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className={`text-xs ${getRecommendationColor(advancedData?.recommendation)}`}>
                            {advancedData?.recommendation}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {advancedData?.confidence}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Comparison */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-6">مقاييس الأداء</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Trend Strength */}
              <div>
                <h5 className="text-gray-400 text-sm mb-3">قوة الاتجاه</h5>
                <div className="space-y-2">
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    const trendStrength = data?.performance_metrics?.trend_strength || 0;
                    
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-white text-sm">{symbol}</span>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-16 bg-gray-700 rounded-full h-1">
                            <div 
                              className="h-1 rounded-full bg-blue-400"
                              style={{ width: `${trendStrength}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {trendStrength.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Momentum */}
              <div>
                <h5 className="text-gray-400 text-sm mb-3">الزخم</h5>
                <div className="space-y-2">
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    const momentum = data?.performance_metrics?.momentum || 0;
                    
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-white text-sm">{symbol}</span>
                        <span className={`text-sm ${momentum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {momentum >= 0 ? '+' : ''}{momentum.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Support Levels */}
              <div>
                <h5 className="text-gray-400 text-sm mb-3">مستوى الدعم</h5>
                <div className="space-y-2">
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    const support = data?.performance_metrics?.support_level || 0;
                    
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-white text-sm">{symbol}</span>
                        <span className="text-green-400 text-sm">
                          ${support.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resistance Levels */}
              <div>
                <h5 className="text-gray-400 text-sm mb-3">مستوى المقاومة</h5>
                <div className="space-y-2">
                  {selectedSymbols.map(symbol => {
                    const data = comparisonData[symbol];
                    const resistance = data?.performance_metrics?.resistance_level || 0;
                    
                    return (
                      <div key={symbol} className="flex items-center justify-between">
                        <span className="text-white text-sm">{symbol}</span>
                        <span className="text-red-400 text-sm">
                          ${resistance.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Insights */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-6">ملخص ونصائح</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best Opportunities */}
              <div>
                <h5 className="text-green-400 font-semibold mb-4">أفضل الفرص</h5>
                <div className="space-y-3">
                  {sortedByConfidence.slice(0, 2).map(([symbol, data]) => (
                    <div key={symbol} className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{symbol}</span>
                        <span className="text-green-400 text-sm">
                          {data.ultimate_decision?.final_recommendation}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        ثقة {data.ultimate_decision?.final_confidence}% | 
                        مخاطر {data.ultimate_decision?.risk_level === 'LOW' ? 'منخفضة' : 
                               data.ultimate_decision?.risk_level === 'MEDIUM' ? 'متوسطة' : 'عالية'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Warnings */}
              <div>
                <h5 className="text-red-400 font-semibold mb-4">تحذيرات المخاطر</h5>
                <div className="space-y-3">
                  {Object.entries(comparisonData)
                    .filter(([, data]) => data.ultimate_decision?.risk_level === 'HIGH')
                    .slice(0, 2)
                    .map(([symbol, data]) => (
                      <div key={symbol} className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{symbol}</span>
                          <span className="text-red-400 text-sm">مخاطر عالية</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          تقلب {data.performance_metrics?.volatility?.toFixed(1)}% | 
                          ثقة {data.ultimate_decision?.final_confidence}%
                        </div>
                      </div>
                    ))}
                  
                  {Object.entries(comparisonData).filter(([, data]) => data.ultimate_decision?.risk_level === 'HIGH').length === 0 && (
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="text-green-400 text-sm">
                        ✅ لا توجد عملات عالية المخاطر في اختيارك الحالي
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* General Insights */}
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <h5 className="text-blue-400 font-semibold mb-2">نصائح عامة</h5>
              <div className="text-gray-300 text-sm space-y-1">
                <div>• قم بتنويع استثماراتك عبر عملات مختلفة لتقليل المخاطر</div>
                <div>• ركز على العملات ذات مستوى الثقة العالي والمخاطر المنخفضة</div>
                <div>• راقب مستويات الدعم والمقاومة لتحديد نقاط الدخول والخروج</div>
                <div>• استخدم إدارة رأس المال ولا تستثمر أكثر مما يمكنك تحمل خسارته</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
