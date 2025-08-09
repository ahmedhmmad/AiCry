// components/Dashboard/Dashboard.js - نسخة شاملة مع جميع التبويبات
import React, { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CpuChipIcon,
  BoltIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CalculatorIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  WalletIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ScaleIcon,
  PlayIcon,
  StopIcon,
  ArrowTrendingUpIcon,  // الاسم الصحيح
  ArrowTrendingDownIcon, // الاسم الصحيح
  PlusIcon,
  MinusIcon,
  DocumentChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Dashboard = (props) => {
  // حماية من props غير معرفة
  const selectedSymbol = props?.selectedSymbol || 'BTCUSDT';
  const analysisData = props?.analysisData || null;
  const setAnalysisData = props?.setAnalysisData || (() => {});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  
  // إعدادات تحليل وايكوف
  const [wyckoffEnabled, setWyckoffEnabled] = useState(true);
  const [wyckoffSettings, setWyckoffSettings] = useState({
    sensitivity: 'medium',
    multi_timeframe: true,
    volume_analysis: true,
    timeframes: ['1h', '4h', '1d']
  });
  const [showWyckoffSettings, setShowWyckoffSettings] = useState(false);

  // إعدادات العرض
  const [viewMode, setViewMode] = useState('enhanced');
  const [showCalculations, setShowCalculations] = useState(false);

  // حالات التبويبات المختلفة
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

  // دالة تحديث مع إعدادات وايكوف
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 محاولة تحليل:', selectedSymbol);
      
      const params = new URLSearchParams();
      params.append('include_wyckoff', wyckoffEnabled.toString());
      
      if (wyckoffEnabled) {
        params.append('multi_timeframe_wyckoff', wyckoffSettings.multi_timeframe.toString());
        params.append('wyckoff_sensitivity', wyckoffSettings.sensitivity);
        params.append('volume_threshold', '1.5');
        params.append('timeframes', wyckoffSettings.timeframes.join(','));
      }
      
      const response = await fetch(`/ai/ultimate-analysis/${selectedSymbol}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 البيانات:', data);
      
      setAnalysisData(data);
      setCurrentPrice(data.current_price);
      setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      
      console.log('✅ نجح التحليل');
    } catch (err) {
      console.error('❌ خطأ:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSymbol) {
      handleRefresh();
    }
  }, [selectedSymbol, wyckoffEnabled, wyckoffSettings]);

  // مكونات مساعدة
  const ConfidenceBar = ({ confidence, label, color = 'blue' }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{confidence}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${
            color === 'green' ? 'from-green-400 to-green-600' :
            color === 'red' ? 'from-red-400 to-red-600' :
            color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
            color === 'purple' ? 'from-purple-400 to-purple-600' :
            color === 'orange' ? 'from-orange-400 to-orange-600' :
            'from-blue-400 to-blue-600'
          }`}
          style={{ width: `${Math.min(confidence, 100)}%` }}
        />
      </div>
    </div>
  );

  const RecommendationBadge = ({ recommendation, size = 'sm' }) => {
    const recColors = {
      'BUY': 'text-green-400 bg-green-400/20',
      'SELL': 'text-red-400 bg-red-400/20',
      'HOLD': 'text-yellow-400 bg-yellow-400/20',
      'STRONG_BUY': 'text-green-600 bg-green-600/20',
      'STRONG_SELL': 'text-red-600 bg-red-600/20',
      'WEAK_BUY': 'text-green-300 bg-green-300/20'
    };
    
    const recTexts = {
      'BUY': 'شراء',
      'SELL': 'بيع', 
      'HOLD': 'انتظار',
      'STRONG_BUY': 'شراء قوي',
      'STRONG_SELL': 'بيع قوي',
      'WEAK_BUY': 'شراء ضعيف'
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-${size} font-semibold ${recColors[recommendation] || recColors.HOLD}`}>
        {recTexts[recommendation] || recommendation}
      </span>
    );
  };

  // دالة حساب تفصيل القرار
  const getDecisionBreakdown = () => {
    if (!analysisData?.ultimate_decision?.analysis_breakdown) return null;

    const breakdown = analysisData.ultimate_decision.analysis_breakdown;
    const weightDistribution = analysisData.ultimate_decision.weight_distribution;

    return {
      technical: {
        name: 'التحليل الفني',
        recommendation: breakdown.technical.recommendation,
        confidence: breakdown.technical.confidence,
        weight: weightDistribution.technical,
        score: (weightDistribution.technical * breakdown.technical.confidence / 100) * 
               (breakdown.technical.recommendation === 'BUY' ? 1 : 
                breakdown.technical.recommendation === 'SELL' ? -1 : 0)
      },
      simple_ai: {
        name: 'الذكاء الاصطناعي البسيط',
        recommendation: breakdown.simple_ai.recommendation,
        confidence: breakdown.simple_ai.confidence,
        weight: weightDistribution.simple_ai,
        score: (weightDistribution.simple_ai * breakdown.simple_ai.confidence / 100) * 
               (breakdown.simple_ai.recommendation === 'BUY' ? 1 : 
                breakdown.simple_ai.recommendation === 'SELL' ? -1 : 0)
      },
      advanced_ai: {
        name: 'الذكاء الاصطناعي المتقدم',
        recommendation: breakdown.advanced_ai.recommendation,
        confidence: breakdown.advanced_ai.confidence,
        weight: weightDistribution.advanced_ai,
        score: (weightDistribution.advanced_ai * breakdown.advanced_ai.confidence / 100) * 
               (breakdown.advanced_ai.recommendation === 'BUY' ? 1 : 
                breakdown.advanced_ai.recommendation === 'SELL' ? -1 : 0)
      },
      wyckoff: {
        name: 'تحليل وايكوف',
        recommendation: breakdown.wyckoff.recommendation,
        confidence: breakdown.wyckoff.confidence,
        weight: weightDistribution.wyckoff,
        phase: breakdown.wyckoff.phase,
        score: (weightDistribution.wyckoff * breakdown.wyckoff.confidence / 100) * 
               (breakdown.wyckoff.recommendation === 'BUY' ? 1 : 
                breakdown.wyckoff.recommendation === 'SELL' ? -1 : 0)
      }
    };
  };

  const calculateTotalScore = (breakdown) => {
    if (!breakdown) return null;
    const totalScore = Object.values(breakdown).reduce((sum, item) => sum + item.score, 0);
    return {
      total: totalScore,
      buyVotes: Object.values(breakdown).filter(item => item.recommendation === 'BUY').length,
      sellVotes: Object.values(breakdown).filter(item => item.recommendation === 'SELL').length,
      holdVotes: Object.values(breakdown).filter(item => item.recommendation === 'HOLD').length
    };
  };

  const breakdown = getDecisionBreakdown();
  const totalScore = calculateTotalScore(breakdown);

  // مكونات التبويبات
  const TabNavigation = () => {
    const tabs = [
      { id: 'analysis', name: 'التحليل', icon: ChartBarIcon },
      { id: 'portfolio', name: 'المحفظة', icon: WalletIcon },
      { id: 'investment', name: 'الاستثمار', icon: BanknotesIcon },
      { id: 'trading', name: 'التداول', icon: CurrencyDollarIcon },
      { id: 'backtest', name: 'المحاكاة', icon: ClockIcon },
      { id: 'comparison', name: 'المقارنة', icon: ScaleIcon }
    ];

    return (
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
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // تبويب التحليل (محسن)
  const AnalysisTab = () => (
    <div className="space-y-6">
      {/* أزرار وضع العرض */}
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
          <div className="text-xs text-gray-400">
            {viewMode === 'enhanced' && 'عرض محسن مع حسابات مفصلة وتحليل شامل'}
            {viewMode === 'classic' && 'العرض التقليدي السابق'}
          </div>
        </div>
      )}

      {/* التوصية النهائية */}
      {analysisData?.ultimate_decision && (
        <div className={`rounded-xl p-6 text-white ${
          analysisData.ultimate_decision.final_recommendation.includes('BUY') ? 'bg-gradient-to-r from-green-600 to-green-700' :
          analysisData.ultimate_decision.final_recommendation.includes('SELL') ? 'bg-gradient-to-r from-red-600 to-red-700' :
          'bg-gradient-to-r from-yellow-600 to-yellow-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 space-x-reverse mb-2">
                <h2 className="text-2xl font-bold">
                  <RecommendationBadge recommendation={analysisData.ultimate_decision.final_recommendation} size="lg" />
                </h2>
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <p className="opacity-90 mb-3">{analysisData.ultimate_decision.reasoning}</p>
              
              {totalScore && (
                <div className="flex items-center space-x-6 space-x-reverse text-sm">
                  <div>شراء: {totalScore.buyVotes}</div>
                  <div>بيع: {totalScore.sellVotes}</div>
                  <div>انتظار: {totalScore.holdVotes}</div>
                  <div>النقاط: {totalScore.total.toFixed(1)}</div>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">
                {analysisData.ultimate_decision.final_confidence}%
              </div>
              <div className="opacity-80 text-sm">مستوى الثقة</div>
              <button
                onClick={() => setShowCalculations(!showCalculations)}
                className="mt-2 opacity-80 hover:opacity-100 text-xs underline"
              >
                {showCalculations ? 'إخفاء' : 'عرض'} الحسابات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* عرض الحسابات التفصيلية */}
      {showCalculations && breakdown && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <CalculatorIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">تفصيل الحسابات</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(breakdown).map(([key, analysis]) => (
              <div key={key} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{analysis.name}</span>
                  <RecommendationBadge recommendation={analysis.recommendation} />
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الوزن:</span>
                    <span className="text-white">{analysis.weight}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الثقة:</span>
                    <span className="text-white">{analysis.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">النقاط المساهمة:</span>
                    <span className={`font-semibold ${
                      analysis.score > 0 ? 'text-green-400' : 
                      analysis.score < 0 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {analysis.score > 0 ? '+' : ''}{analysis.score.toFixed(2)}
                    </span>
                  </div>
                  {key === 'wyckoff' && analysis.phase && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">المرحلة:</span>
                      <span className="text-orange-400">{analysis.phase}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {totalScore && (
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-400">المجموع النهائي:</span>
                  <span className={`${
                    totalScore.total > 0 ? 'text-green-400' : 
                    totalScore.total < 0 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {totalScore.total > 0 ? '+' : ''}{totalScore.total.toFixed(2)} نقطة
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* طبقات التحليل */}
      {viewMode === 'enhanced' ? (
        // العرض المحسن
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* التحليل الفني المحسن */}
          {analysisData?.analysis_layers?.['1_technical_analysis'] && (
            <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-5 border-2 border-blue-500/30">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
                <h3 className="text-white font-semibold text-lg">التحليل الفني</h3>
                <span className="text-xs text-gray-400">({breakdown?.technical?.weight}%)</span>
              </div>
              
              <div className="space-y-4">
                <ConfidenceBar 
                  confidence={analysisData.analysis_layers['1_technical_analysis'].confidence} 
                  label="مستوى الثقة"
                  color="blue"
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">التوصية:</span>
                  <RecommendationBadge recommendation={analysisData.analysis_layers['1_technical_analysis'].overall_recommendation} />
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-blue-400 font-semibold mb-2">تفاصيل المؤشرات:</div>
                  <div className="space-y-1 text-sm">
                    {analysisData.analysis_layers['1_technical_analysis'].macd && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">MACD:</span>
                        <span className="text-green-400">{analysisData.analysis_layers['1_technical_analysis'].macd.recommendation}</span>
                      </div>
                    )}
                    {analysisData.analysis_layers['1_technical_analysis'].rsi && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">RSI:</span>
                        <span className="text-yellow-400">{analysisData.analysis_layers['1_technical_analysis'].rsi.signal}</span>
                      </div>
                    )}
                    {analysisData.analysis_layers['1_technical_analysis'].moving_averages && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">المتوسطات:</span>
                        <span className="text-green-400">{analysisData.analysis_layers['1_technical_analysis'].moving_averages.cross_signal}</span>
                      </div>
                    )}
                  </div>
                </div>

                {analysisData.analysis_layers['1_technical_analysis'].interpretation && (
                  <div className="text-xs text-gray-300 bg-gray-800/50 rounded p-2">
                    {analysisData.analysis_layers['1_technical_analysis'].interpretation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* الذكاء الاصطناعي البسيط المحسن */}
          {analysisData?.analysis_layers?.['2_simple_ai'] && (
            <div className="bg-green-500/10 backdrop-blur-md rounded-xl p-5 border-2 border-green-500/30">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <CpuChipIcon className="w-6 h-6 text-green-400" />
                <h3 className="text-white font-semibold text-lg">الذكاء الاصطناعي البسيط</h3>
                <span className="text-xs text-gray-400">({breakdown?.simple_ai?.weight}%)</span>
              </div>
              
              <div className="space-y-4">
                <ConfidenceBar 
                  confidence={analysisData.analysis_layers['2_simple_ai'].confidence} 
                  label="مستوى الثقة"
                  color="green"
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">التوصية:</span>
                  <RecommendationBadge recommendation={analysisData.analysis_layers['2_simple_ai'].recommendation} />
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-green-400 font-semibold mb-2">توقعات النموذج:</div>
                  <div className="space-y-1 text-sm">
                    {analysisData.analysis_layers['2_simple_ai'].probabilities && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">احتمال الصعود:</span>
                          <span className="text-green-400">{analysisData.analysis_layers['2_simple_ai'].probabilities.up}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">احتمال الهبوط:</span>
                          <span className="text-red-400">{analysisData.analysis_layers['2_simple_ai'].probabilities.down}%</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">التوقع:</span>
                      <span className={`${
                        analysisData.analysis_layers['2_simple_ai'].prediction === 'UP' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {analysisData.analysis_layers['2_simple_ai'].prediction === 'UP' ? 'صاعد' : 'هابط'}
                      </span>
                    </div>
                  </div>
                </div>

                {analysisData.analysis_layers['2_simple_ai'].interpretation && (
                  <div className="text-xs text-gray-300 bg-gray-800/50 rounded p-2">
                    {analysisData.analysis_layers['2_simple_ai'].interpretation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* الذكاء الاصطناعي المتقدم المحسن */}
          {analysisData?.analysis_layers?.['3_advanced_ai'] && (
            <div className="bg-purple-500/10 backdrop-blur-md rounded-xl p-5 border-2 border-purple-500/30">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <BoltIcon className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-semibold text-lg">الذكاء الاصطناعي المتقدم</h3>
                <span className="text-xs text-gray-400">({breakdown?.advanced_ai?.weight}%)</span>
              </div>
              
              <div className="space-y-4">
                <ConfidenceBar 
                  confidence={Math.round(analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction?.confidence || 0)} 
                  label="مستوى الثقة"
                  color="purple"
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">التوصية:</span>
                  <RecommendationBadge recommendation={analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction?.recommendation} />
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-purple-400 font-semibold mb-2">تفاصيل الأنسامبل:</div>
                  <div className="space-y-1 text-sm">
                    {analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction?.consensus && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">الإجماع:</span>
                        <span className="text-white">{analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction.consensus}</span>
                      </div>
                    )}
                    {analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction?.probabilities && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">احتمال الصعود:</span>
                          <span className="text-green-400">{analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction.probabilities.up.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">احتمال الهبوط:</span>
                          <span className="text-red-400">{analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction.probabilities.down.toFixed(1)}%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* النماذج الفردية */}
                {analysisData.analysis_layers['3_advanced_ai'].individual_probabilities && (
                  <details className="bg-black/20 rounded-lg p-3">
                    <summary className="text-purple-400 font-semibold cursor-pointer mb-2">النماذج الفردية</summary>
                    <div className="space-y-1 text-xs">
                      {Object.entries(analysisData.analysis_layers['3_advanced_ai'].individual_probabilities).map(([model, probs]) => (
                        <div key={model} className="flex justify-between">
                          <span className="text-gray-400">{model}:</span>
                          <span className="text-white">
                            ↑{probs.up.toFixed(0)}% ↓{probs.down.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction?.interpretation && (
                  <div className="text-xs text-gray-300 bg-gray-800/50 rounded p-2">
                    {analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction.interpretation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* تحليل وايكوف المحسن */}
          {analysisData?.analysis_layers?.['4_wyckoff_analysis'] && (
            <div className="bg-orange-500/10 backdrop-blur-md rounded-xl p-5 border-2 border-orange-500/30 lg:col-span-2">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-6 h-6 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>
                <h3 className="text-white font-semibold text-lg">تحليل وايكوف</h3>
                <span className="text-xs text-gray-400">({breakdown?.wyckoff?.weight}%)</span>
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">متقدم</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <ConfidenceBar 
                    confidence={Math.round((analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.confidence || 0) * 100)} 
                    label="مستوى الثقة"
                    color="orange"
                  />
                </div>
                
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">المرحلة الحالية</div>
                  <div className="text-orange-400 font-semibold">{analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.wyckoff_phase || 'Unknown'}</div>
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">التوصية</div>
                  <RecommendationBadge recommendation={analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.final_action} />
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-1">المخاطرة</div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.risk_level === 'LOW' ? 'bg-green-500/20 text-green-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.risk_level === 'HIGH' ? 'عالي' :
                     analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.risk_level === 'LOW' ? 'منخفض' : 'متوسط'}
                  </span>
                </div>
              </div>

              {/* الإطارات الزمنية */}
              {analysisData.analysis_layers['4_wyckoff_analysis'].timeframe_analysis && (
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-orange-400 font-semibold mb-3">التحليل متعدد الإطارات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(analysisData.analysis_layers['4_wyckoff_analysis'].timeframe_analysis).map(([timeframe, data]) => (
                      <div key={timeframe} className="border border-gray-600 rounded-lg p-3">
                        <div className="text-center mb-2">
                          <div className="text-orange-400 font-semibold">{timeframe}</div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">المرحلة:</span>
                            <span className="text-white">{data.current_phase}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">الثقة:</span>
                            <span className="text-white">{Math.round((data.phase_confidence || 0) * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">التوصية:</span>
                            <span className={`${
                              data.trading_recommendation?.action === 'BUY' ? 'text-green-400' :
                              data.trading_recommendation?.action === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {data.trading_recommendation?.action === 'BUY' ? 'شراء' :
                               data.trading_recommendation?.action === 'SELL' ? 'بيع' : 'انتظار'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation?.recommendation && (
                <div className="mt-4 text-xs text-gray-300 bg-gray-800/50 rounded p-2">
                  {analysisData.analysis_layers['4_wyckoff_analysis'].overall_recommendation.recommendation}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // العرض الكلاسيكي
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* التحليل الفني الكلاسيكي */}
          {analysisData?.analysis_layers?.['1_technical_analysis'] && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">التحليل الفني</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">الثقة:</span>
                  <span className="text-white">{analysisData.analysis_layers['1_technical_analysis'].confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">التوصية:</span>
                  <span className="text-green-400">{analysisData.analysis_layers['1_technical_analysis'].overall_recommendation}</span>
                </div>
              </div>
            </div>
          )}
          {/* باقي الطبقات بالعرض الكلاسيكي... */}
        </div>
      )}
    </div>
  );

  // تبويب المحفظة
  const PortfolioTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <WalletIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">إدارة المحفظة</h2>
        </div>
        
        {/* ملخص المحفظة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">
            <div className="text-white">
              <div className="text-sm opacity-80">القيمة الإجمالية</div>
              <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4">
            <div className="text-white">
              <div className="text-sm opacity-80">الرصيد النقدي</div>
              <div className="text-2xl font-bold">${portfolioData.balance.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4">
            <div className="text-white">
              <div className="text-sm opacity-80">الربح/الخسارة</div>
              <div className={`text-2xl font-bold ${portfolioData.pnl >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                ${portfolioData.pnl.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-4">
            <div className="text-white">
              <div className="text-sm opacity-80">عدد المراكز</div>
              <div className="text-2xl font-bold">{portfolioData.positions.length}</div>
            </div>
          </div>
        </div>

        {/* قائمة المراكز */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">المراكز المفتوحة</h3>
          {portfolioData.positions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <WalletIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مراكز مفتوحة حالياً</p>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                إضافة مركز جديد
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioData.positions.map((position, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">{position.symbol}</div>
                    <div className="text-gray-400 text-sm">{position.quantity} وحدة</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">${position.currentValue}</div>
                    <div className={`text-sm ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnl}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // تبويب الاستثمار
  const InvestmentTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <BanknotesIcon className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">الاستثمار الذكي</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* استراتيجيات الاستثمار */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">استراتيجيات الاستثمار</h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3 border border-green-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">استثمار متحفظ</div>
                    <div className="text-gray-400 text-sm">مخاطر منخفضة - عوائد مستقرة</div>
                  </div>
                  <div className="text-green-400 font-bold">5-8%</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 border border-blue-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">استثمار متوازن</div>
                    <div className="text-gray-400 text-sm">مخاطر متوسطة - نمو متوازن</div>
                  </div>
                  <div className="text-blue-400 font-bold">8-15%</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-semibold">استثمار نمو</div>
                    <div className="text-gray-400 text-sm">مخاطر عالية - عوائد محتملة عالية</div>
                  </div>
                  <div className="text-orange-400 font-bold">15-25%</div>
                </div>
              </div>
            </div>
          </div>

          {/* توصيات الاستثمار الحالية */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">توصيات الاستثمار</h3>
            {analysisData && (
              <div className="space-y-3">
                <div className={`bg-gradient-to-r p-4 rounded-lg ${
                  analysisData.ultimate_decision?.final_recommendation?.includes('BUY') ? 'from-green-600 to-green-700' :
                  analysisData.ultimate_decision?.final_recommendation?.includes('SELL') ? 'from-red-600 to-red-700' :
                  'from-yellow-600 to-yellow-700'
                }`}>
                  <div className="text-white">
                    <div className="font-semibold">{selectedSymbol}</div>
                    <div className="text-sm opacity-90">
                      {analysisData.ultimate_decision?.final_recommendation?.includes('BUY') ? 'فرصة استثمارية' :
                       analysisData.ultimate_decision?.final_recommendation?.includes('SELL') ? 'تجنب الاستثمار' :
                       'مراقبة وانتظار'}
                    </div>
                    <div className="text-lg font-bold mt-2">
                      ثقة {analysisData.ultimate_decision?.final_confidence}%
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white font-semibold mb-2">خطة الاستثمار المقترحة</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">المبلغ المقترح:</span>
                      <span className="text-white">5% من المحفظة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">فترة الاستثمار:</span>
                      <span className="text-white">3-6 أشهر</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">مستوى المخاطرة:</span>
                      <span className="text-yellow-400">{analysisData.ultimate_decision?.risk_level || 'متوسط'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* أدوات الاستثمار */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">أدوات الاستثمار</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors">
              <DocumentChartBarIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">حاسبة العوائد</div>
              <div className="text-sm opacity-80">احسب العوائد المتوقعة</div>
            </button>
            
            <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors">
              <ArrowTrendingUpIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">خطة الاستثمار</div>
              <div className="text-sm opacity-80">إنشاء خطة مخصصة</div>
            </button>
            
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors">
              <CogIcon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">إعدادات المخاطر</div>
              <div className="text-sm opacity-80">تخصيص مستوى المخاطر</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // تبويب التداول
  const TradingTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">منصة التداول</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نموذج الطلب */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">إنشاء طلب</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">نوع الطلب</label>
                  <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
                    <option>طلب فوري</option>
                    <option>طلب محدد</option>
                    <option>وقف الخسارة</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الكمية</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">السعر</label>
                  <input 
                    type="number" 
                    placeholder={currentPrice || "0.00"}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <div className="flex space-x-2 space-x-reverse">
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">
                    شراء
                  </button>
                  <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors">
                    بيع
                  </button>
                </div>
              </div>
            </div>
            
            {/* إعدادات التداول */}
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <h3 className="text-white font-semibold mb-4">إعدادات التداول</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">التداول التلقائي</span>
                  <button
                    onClick={() => setTradingData(prev => ({
                      ...prev,
                      tradingSettings: {
                        ...prev.tradingSettings,
                        autoTrading: !prev.tradingSettings.autoTrading
                      }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tradingData.tradingSettings.autoTrading ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tradingData.tradingSettings.autoTrading ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">مخاطر لكل صفقة (%)</label>
                  <input 
                    type="number" 
                    value={tradingData.tradingSettings.riskPerTrade}
                    onChange={(e) => setTradingData(prev => ({
                      ...prev,
                      tradingSettings: {
                        ...prev.tradingSettings,
                        riskPerTrade: Number(e.target.value)
                      }
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">عدد المراكز القصوى</label>
                  <input 
                    type="number" 
                    value={tradingData.tradingSettings.maxPositions}
                    onChange={(e) => setTradingData(prev => ({
                      ...prev,
                      tradingSettings: {
                        ...prev.tradingSettings,
                        maxPositions: Number(e.target.value)
                      }
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* الطلبات المفتوحة */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">الطلبات المفتوحة</h3>
              
              {tradingData.openOrders.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات مفتوحة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tradingData.openOrders.map((order, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold">{order.symbol}</div>
                        <div className="text-gray-400 text-sm">{order.type} - {order.side}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{order.quantity} @ ${order.price}</div>
                        <button className="text-red-400 hover:text-red-300 text-sm">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* تاريخ الصفقات */}
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <h3 className="text-white font-semibold mb-4">تاريخ الصفقات</h3>
              
              {tradingData.orderHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  <p>لا توجد صفقات سابقة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tradingData.orderHistory.map((trade, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-2 flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white">{trade.symbol}</span>
                        <span className={`ml-2 ${trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.side}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        {trade.quantity} @ ${trade.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // تبويب المحاكاة
  const BacktestTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <ClockIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">محاكاة الاستراتيجيات</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* إعدادات المحاكاة */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">إعدادات المحاكاة</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الاستراتيجية</label>
                  <select 
                    value={backtestData.settings.strategy}
                    onChange={(e) => setBacktestData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, strategy: e.target.value }
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="ai_combined">الذكاء الاصطناعي المدمج</option>
                    <option value="technical_only">التحليل الفني فقط</option>
                    <option value="wyckoff_only">وايكوف فقط</option>
                    <option value="custom">استراتيجية مخصصة</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">تاريخ البداية</label>
                  <input 
                    type="date" 
                    value={backtestData.settings.startDate}
                    onChange={(e) => setBacktestData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, startDate: e.target.value }
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">تاريخ النهاية</label>
                  <input 
                    type="date" 
                    value={backtestData.settings.endDate}
                    onChange={(e) => setBacktestData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, endDate: e.target.value }
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">الرصيد الأولي ($)</label>
                  <input 
                    type="number" 
                    value={backtestData.settings.initialBalance}
                    onChange={(e) => setBacktestData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, initialBalance: Number(e.target.value) }
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <button 
                  onClick={() => setBacktestData(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                  disabled={backtestData.isRunning}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  {backtestData.isRunning ? (
                    <>
                      <StopIcon className="w-4 h-4" />
                      <span>إيقاف المحاكاة</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4" />
                      <span>بدء المحاكاة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* نتائج المحاكاة */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">نتائج المحاكاة</h3>
              
              {backtestData.isRunning ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">جاري تشغيل المحاكاة...</p>
                </div>
              ) : backtestData.results ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-sm">العائد الإجمالي</div>
                      <div className="text-green-400 text-xl font-bold">+23.5%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-sm">عدد الصفقات</div>
                      <div className="text-white text-xl font-bold">156</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-sm">معدل النجاح</div>
                      <div className="text-blue-400 text-xl font-bold">68%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-sm">أقصى خسارة</div>
                      <div className="text-red-400 text-xl font-bold">-8.2%</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">ملخص الأداء</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">الرصيد النهائي:</span>
                        <span className="text-white">$12,350</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">نسبة شارب:</span>
                        <span className="text-white">1.85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">متوسط العائد الشهري:</span>
                        <span className="text-white">1.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>اختر إعدادات المحاكاة وابدأ التشغيل</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // تبويب المقارنة
  const ComparisonTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <ScaleIcon className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">مقارنة العملات</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* اختيار العملات للمقارنة */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">اختيار العملات</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">العملة الأولى</label>
                <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
                  <option>BTCUSDT</option>
                  <option>ETHUSDT</option>
                  <option>ADAUSDT</option>
                  <option>SOLUSDT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">العملة الثانية</label>
                <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
                  <option>ETHUSDT</option>
                  <option>BTCUSDT</option>
                  <option>ADAUSDT</option>
                  <option>SOLUSDT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">العملة الثالثة (اختياري)</label>
                <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
                  <option value="">لا شيء</option>
                  <option>ADAUSDT</option>
                  <option>SOLUSDT</option>
                  <option>DOTUSDT</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">فترة المقارنة</label>
                <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
                  <option>24 ساعة</option>
                  <option>7 أيام</option>
                  <option>30 يوم</option>
                  <option>3 أشهر</option>
                </select>
              </div>
              
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors">
                بدء المقارنة
              </button>
            </div>
          </div>
          
          {/* نتائج المقارنة */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">نتائج المقارنة</h3>
            
            <div className="space-y-4">
              {/* مقارنة التوصيات */}
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-semibold mb-3">التوصيات</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">BTCUSDT</span>
                    <RecommendationBadge recommendation="WEAK_BUY" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ETHUSDT</span>
                    <RecommendationBadge recommendation="HOLD" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ADAUSDT</span>
                    <RecommendationBadge recommendation="BUY" />
                  </div>
                </div>
              </div>
              
              {/* مقارنة مستويات الثقة */}
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-semibold mb-3">مستويات الثقة</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">BTCUSDT</span>
                      <span className="text-white">67.6%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500" style={{width: '67.6%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">ETHUSDT</span>
                      <span className="text-white">54.2%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-yellow-500" style={{width: '54.2%'}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">ADAUSDT</span>
                      <span className="text-white">82.1%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{width: '82.1%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ملخص المقارنة */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-4">
                <div className="text-white">
                  <h4 className="font-semibold mb-2">أفضل فرصة:</h4>
                  <div className="text-xl font-bold">ADAUSDT</div>
                  <div className="text-sm opacity-90">بثقة 82.1% - توصية شراء قوية</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* جدول المقارنة التفصيلي */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">جدول المقارنة التفصيلي</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left text-gray-400 py-2">العملة</th>
                  <th className="text-left text-gray-400 py-2">السعر الحالي</th>
                  <th className="text-left text-gray-400 py-2">التغيير 24س</th>
                  <th className="text-left text-gray-400 py-2">التوصية</th>
                  <th className="text-left text-gray-400 py-2">الثقة</th>
                  <th className="text-left text-gray-400 py-2">المخاطر</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-white font-semibold">BTCUSDT</td>
                  <td className="py-3 text-white">$117,099</td>
                  <td className="py-3 text-green-400">+2.3%</td>
                  <td className="py-3"><RecommendationBadge recommendation="WEAK_BUY" size="xs" /></td>
                  <td className="py-3 text-white">67.6%</td>
                  <td className="py-3 text-yellow-400">متوسط</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-3 text-white font-semibold">ETHUSDT</td>
                  <td className="py-3 text-white">$3,245</td>
                  <td className="py-3 text-red-400">-1.2%</td>
                  <td className="py-3"><RecommendationBadge recommendation="HOLD" size="xs" /></td>
                  <td className="py-3 text-white">54.2%</td>
                  <td className="py-3 text-green-400">منخفض</td>
                </tr>
                <tr>
                  <td className="py-3 text-white font-semibold">ADAUSDT</td>
                  <td className="py-3 text-white">$0.89</td>
                  <td className="py-3 text-green-400">+5.7%</td>
                  <td className="py-3"><RecommendationBadge recommendation="BUY" size="xs" /></td>
                  <td className="py-3 text-white">82.1%</td>
                  <td className="py-3 text-yellow-400">متوسط</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center justify-between border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="text-2xl font-bold text-white">{selectedSymbol}</div>
          {loading && (
            <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
          )}
          {currentPrice && (
            <div className="text-lg text-gray-400">
              ${Number(currentPrice).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          {/* حالة وايكوف */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-sm text-gray-400">وايكوف:</span>
            {wyckoffEnabled ? (
              <span className="text-green-400 text-sm">مفعل</span>
            ) : (
              <span className="text-gray-500 text-sm">معطل</span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {loading ? 'جاري تحميل البيانات...' : `آخر تحديث: ${lastUpdate || 'لم يتم التحديث'}`}
          </div>
        </div>
      </div>

      {/* أزرار التبويبات */}
      <TabNavigation />

      {/* إعدادات وايكوف - تظهر فقط في تبويب التحليل */}
      {activeTab === 'analysis' && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
              <span className="text-white font-semibold">إعدادات تحليل وايكوف</span>
            </div>
            <button
              onClick={() => setShowWyckoffSettings(!showWyckoffSettings)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showWyckoffSettings ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400">تمكين تحليل وايكوف</span>
            <button
              onClick={() => setWyckoffEnabled(!wyckoffEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                wyckoffEnabled ? 'bg-blue-600' : 'bg-gray-600'
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
            <div className="space-y-4 pt-4 border-t border-white/20">
              {/* حساسية التحليل */}
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

              {/* تحليل متعدد الإطارات */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">تحليل متعدد الإطارات</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({ ...prev, multi_timeframe: !prev.multi_timeframe }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    wyckoffSettings.multi_timeframe ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      wyckoffSettings.multi_timeframe ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* تحليل الحجم */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">تحليل الحجم</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({ ...prev, volume_analysis: !prev.volume_analysis }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    wyckoffSettings.volume_analysis ? 'bg-blue-600' : 'bg-gray-600'
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
      )}

      {/* زر التحديث - يظهر فقط في تبويب التحليل */}
      {activeTab === 'analysis' && (
        <div className="flex justify-center">
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse">
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

      {/* محتوى التبويبات */}
      {activeTab === 'analysis' && <AnalysisTab />}
      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'investment' && <InvestmentTab />}
      {activeTab === 'trading' && <TradingTab />}
      {activeTab === 'backtest' && <BacktestTab />}
      {activeTab === 'comparison' && <ComparisonTab />}

      {/* معلومات التشخيص */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-xs">
        <div className="text-gray-400 mb-2 flex items-center space-x-2 space-x-reverse">
          <span>🔧 معلومات التشخيص:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-gray-300">
          <div>الرمز: <span className="text-white">{selectedSymbol}</span></div>
          <div>حالة التحميل: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'جاري التحميل' : 'مكتمل'}
          </span></div>
          <div>البيانات: <span className={analysisData ? 'text-green-400' : 'text-red-400'}>
            {analysisData ? 'متوفرة' : 'غير متوفرة'}
          </span></div>
          <div>وايكوف: <span className={wyckoffEnabled ? 'text-green-400' : 'text-gray-500'}>
            {wyckoffEnabled ? 'مفعل' : 'معطل'}
          </span></div>
          <div>التبويب النشط: <span className="text-white">{activeTab}</span></div>
          <div>آخر تحديث: <span className="text-white">{lastUpdate || 'لم يتم'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;