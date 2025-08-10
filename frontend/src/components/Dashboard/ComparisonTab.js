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
        // Simulate loading data for each symbol
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
      current_price: price * (0.95 + Math.random() * 0.1), // Simple price variation
      price_change_24h: (Math.random() - 0.5) * 10,
      volume_24h: Math.floor(Math.random() * 1000000000),
      market_cap: Math.floor(Math.random() * 100000000000),
      ultimate_decision: {
        final_recommendation: recommendation,
        final_confidence: confidence,
        reasoning: `تحليل ${symbol} يشير إلى ${recommendation}`,
        risk_level: confidence > 70 ? 'LOW' : confidence > 50 ? 'MEDIUM' : 'HIGH'
      },
      technical_analysis: {
        rsi: Math.floor(Math.random() * 100),
        macd_signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        moving_averages: {
          trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH'
        }
      },
      volatility: Math.random() * 0.5 + 0.1,
      performance_score: Math.floor(Math.random() * 100)
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
    if (recommendation?.includes('BUY')) return 'text-green-400';
    if (recommendation?.includes('SELL')) return 'text-red-400';
    if (recommendation === 'NEUTRAL') return 'text-gray-400';
    return 'text-yellow-400';
  };

  const getRecommendationIcon = (recommendation) => {
    if (recommendation?.includes('BUY')) return <ArrowTrendingUpIcon className="w-4 h-4" />;
    if (recommendation?.includes('SELL')) return <ArrowTrendingDownIcon className="w-4 h-4" />;
    return <ClockIcon className="w-4 h-4" />;
  };

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

  return (
    <div className="space-y-6">
      {/* Symbol Selection */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">مقارنة العملات المشفرة</h2>
          <ScaleIcon className="w-6 h-6 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selected Symbols */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              العملات المحددة للمقارنة ({selectedSymbols.length}/6):
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSymbols.map((symbol) => (
                <div
                  key={symbol}
                  className="flex items-center space-x-2 space-x-reverse bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2"
                >
                  <span className="text-white font-semibold">{symbol}</span>
                  {selectedSymbols.length > 1 && (
                    <button
                      onClick={() => removeSymbol(symbol)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Available Symbols */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              إضافة عملات للمقارنة:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSymbols.filter(symbol => !selectedSymbols.includes(symbol)).map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => addSymbol(symbol)}
                  disabled={selectedSymbols.length >= 6}
                  className="flex items-center space-x-2 space-x-reverse bg-white/10 border border-white/20 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="w-4 h-4 text-green-400" />
                  <span className="text-white">{symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeframe Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">الإطار الزمني للمقارنة:</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h" className="bg-gray-800">ساعة واحدة</option>
            <option value="4h" className="bg-gray-800">4 ساعات</option>
            <option value="1d" className="bg-gray-800">يوم واحد</option>
            <option value="1w" className="bg-gray-800">أسبوع واحد</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-pulse">
            <ChartBarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">جاري تحميل بيانات المقارنة...</h3>
            <div className="text-gray-400">تحليل {selectedSymbols.length} عملة مشفرة</div>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && Object.keys(comparisonData).length > 0 && (
        <div className="space-y-6">
          {/* Quick Comparison Table */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-6">مقارنة سريعة</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-right pb-3">العملة</th>
                    <th className="text-right pb-3">السعر</th>
                    <th className="text-right pb-3">التغيير 24س</th>
                    <th className="text-right pb-3">التوصية</th>
                    <th className="text-right pb-3">الثقة</th>
                    <th className="text-right pb-3">المخاطر</th>
                    <th className="text-right pb-3">النتيجة</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(comparisonData).map((data, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-3">
                        <span className="text-white font-semibold">{data.symbol}</span>
                      </td>
                      <td className="py-3 text-white">
                        ${data.current_price.toFixed(data.current_price < 1 ? 4 : 2)}
                      </td>
                      <td className="py-3">
                        <span className={`font-semibold ${
                          data.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {data.price_change_24h > 0 ? '+' : ''}{data.price_change_24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3">
                        <div className={`flex items-center space-x-2 space-x-reverse ${getRecommendationColor(data.ultimate_decision.final_recommendation)}`}>
                          {getRecommendationIcon(data.ultimate_decision.final_recommendation)}
                          <span className="font-semibold">
                            {getRecommendationText(data.ultimate_decision.final_recommendation)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`font-semibold ${
                          data.ultimate_decision.final_confidence >= 70 ? 'text-green-400' :
                          data.ultimate_decision.final_confidence >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {data.ultimate_decision.final_confidence}%
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          data.ultimate_decision.risk_level === 'LOW' ? 'bg-green-500/20 text-green-400' :
                          data.ultimate_decision.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {data.ultimate_decision.risk_level === 'LOW' ? 'منخفض' :
                           data.ultimate_decision.risk_level === 'MEDIUM' ? 'متوسط' : 'عالي'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className={`w-12 h-2 rounded-full ${
                          data.performance_score >= 70 ? 'bg-green-400' :
                          data.performance_score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-xs text-gray-400">{data.performance_score}/100</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Performers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Best Buy Opportunity */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">أفضل فرصة شراء</h3>
                <TrophyIcon className="w-6 h-6 text-green-400" />
              </div>
              
              {(() => {
                const bestBuy = Object.values(comparisonData)
                  .filter(data => data.ultimate_decision.final_recommendation.includes('BUY'))
                  .sort((a, b) => b.ultimate_decision.final_confidence - a.ultimate_decision.final_confidence)[0];
                
                return bestBuy ? (
                  <div>
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {bestBuy.symbol}
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      الثقة: {bestBuy.ultimate_decision.final_confidence}%
                    </div>
                    <div className="text-xs text-gray-400">
                      ${bestBuy.current_price.toFixed(bestBuy.current_price < 1 ? 4 : 2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">لا توجد توصيات شراء قوية</div>
                );
              })()}
            </div>

            {/* Most Volatile */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">الأكثر تقلباً</h3>
                <ChartBarIcon className="w-6 h-6 text-orange-400" />
              </div>
              
              {(() => {
                const mostVolatile = Object.values(comparisonData)
                  .sort((a, b) => Math.abs(b.price_change_24h) - Math.abs(a.price_change_24h))[0];
                
                return mostVolatile ? (
                  <div>
                    <div className="text-2xl font-bold text-orange-400 mb-2">
                      {mostVolatile.symbol}
                    </div>
                    <div className={`text-sm mb-2 font-semibold ${
                      mostVolatile.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {mostVolatile.price_change_24h > 0 ? '+' : ''}{mostVolatile.price_change_24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">آخر 24 ساعة</div>
                  </div>
                ) : (
                  <div className="text-gray-400">لا توجد بيانات</div>
                );
              })()}
            </div>

            {/* Highest Confidence */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">أعلى ثقة</h3>
                <SparklesIcon className="w-6 h-6 text-blue-400" />
              </div>
              
              {(() => {
                const highestConfidence = Object.values(comparisonData)
                  .sort((a, b) => b.ultimate_decision.final_confidence - a.ultimate_decision.final_confidence)[0];
                
                return highestConfidence ? (
                  <div>
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {highestConfidence.symbol}
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      {highestConfidence.ultimate_decision.final_confidence}% ثقة
                    </div>
                    <div className={`text-xs ${getRecommendationColor(highestConfidence.ultimate_decision.final_recommendation)}`}>
                      {highestConfidence.ultimate_decision.final_recommendation}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">لا توجد بيانات</div>
                );
              })()}
            </div>
          </div>

          {/* Detailed Analysis Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(comparisonData).map((data, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{data.symbol}</h3>
                  <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    data.ultimate_decision.final_recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    data.ultimate_decision.final_recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {data.ultimate_decision.final_recommendation}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">السعر الحالي:</span>
                    <span className="text-white font-semibold">
                      ${data.current_price.toFixed(data.current_price < 1 ? 4 : 2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">التغيير 24س:</span>
                    <span className={`font-semibold ${
                      data.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {data.price_change_24h > 0 ? '+' : ''}{data.price_change_24h.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">RSI:</span>
                    <span className={`font-semibold ${
                      data.technical_analysis.rsi > 70 ? 'text-red-400' :
                      data.technical_analysis.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {data.technical_analysis.rsi.toFixed(0)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">اتجاه MACD:</span>
                    <span className={`font-semibold ${
                      data.technical_analysis.macd_signal === 'BUY' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {data.technical_analysis.macd_signal === 'BUY' ? 'صاعد' : 'هابط'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">مستوى الثقة:</span>
                    <span className={`font-semibold ${
                      data.ultimate_decision.final_confidence >= 70 ? 'text-green-400' :
                      data.ultimate_decision.final_confidence >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {data.ultimate_decision.final_confidence}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">التحليل:</div>
                  <div className="text-sm text-gray-300">
                    {data.ultimate_decision.reasoning}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Insights */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">ملخص المقارنة والتوصيات</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">الاستنتاجات الرئيسية</h4>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const buyRecommendations = Object.values(comparisonData).filter(d => d.ultimate_decision.final_recommendation.includes('BUY')).length;
                    const sellRecommendations = Object.values(comparisonData).filter(d => d.ultimate_decision.final_recommendation.includes('SELL')).length;
                    const avgConfidence = Object.values(comparisonData).reduce((sum, d) => sum + d.ultimate_decision.final_confidence, 0) / Object.values(comparisonData).length;

                    return (
                      <>
                        <div className="flex items-center space-x-2 space-x-reverse text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{buyRecommendations} من {selectedSymbols.length} عملات تحمل توصية شراء</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse text-blue-400">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>متوسط الثقة في التوصيات: {avgConfidence.toFixed(0)}%</span>
                        </div>
                        
                        {sellRecommendations > buyRecommendations ? (
                          <div className="flex items-center space-x-2 space-x-reverse text-yellow-400">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>السوق يميل نحو الحذر - كن حذراً في الاستثمار</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>فرص استثمارية جيدة متاحة</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">نصائح للاستثمار</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>• نوع استثماراتك عبر عدة عملات مختلفة</div>
                  <div>• ركز على العملات ذات الثقة العالية (>70%)</div>
                  <div>• تجنب العملات عالية التقلب إذا كنت مستثمراً محافظاً</div>
                  <div>• راقب المؤشرات الفنية بانتظام</div>
                  <div>• لا تستثمر أكثر مما تستطيع تحمل خسارته</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};