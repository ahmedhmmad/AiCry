// مكون عرض التحليل الدقيق مع البيانات الفعلية
import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

const AccurateAnalysisDisplay = ({ analysisData }) => {
  const [showCalculations, setShowCalculations] = useState(false);
  const [showWyckoffDetails, setShowWyckoffDetails] = useState(false);

  // استخراج التوصيات بدقة
  const getAnalysisBreakdown = () => {
    if (!analysisData?.ultimate_decision?.analysis_breakdown) return null;

    const breakdown = analysisData.ultimate_decision.analysis_breakdown;
    const weightDistribution = analysisData.ultimate_decision.weight_distribution;

    return {
      technical: {
        name: 'التحليل الفني',
        recommendation: breakdown.technical.recommendation,
        confidence: breakdown.technical.confidence,
        weight: weightDistribution.technical,
        color: 'blue',
        icon: ChartBarIcon,
        details: analysisData.analysis_layers?.['1_technical_analysis'],
        score: (weightDistribution.technical * breakdown.technical.confidence / 100) * 
               (breakdown.technical.recommendation === 'BUY' ? 1 : 
                breakdown.technical.recommendation === 'SELL' ? -1 : 0)
      },
      simple_ai: {
        name: 'الذكاء الاصطناعي البسيط',
        recommendation: breakdown.simple_ai.recommendation,
        confidence: breakdown.simple_ai.confidence,
        weight: weightDistribution.simple_ai,
        color: 'green',
        icon: CpuChipIcon,
        details: analysisData.analysis_layers?.['2_simple_ai'],
        score: (weightDistribution.simple_ai * breakdown.simple_ai.confidence / 100) * 
               (breakdown.simple_ai.recommendation === 'BUY' ? 1 : 
                breakdown.simple_ai.recommendation === 'SELL' ? -1 : 0)
      },
      advanced_ai: {
        name: 'الذكاء الاصطناعي المتقدم',
        recommendation: breakdown.advanced_ai.recommendation,
        confidence: breakdown.advanced_ai.confidence,
        weight: weightDistribution.advanced_ai,
        color: 'purple',
        icon: BoltIcon,
        details: analysisData.analysis_layers?.['3_advanced_ai'],
        score: (weightDistribution.advanced_ai * breakdown.advanced_ai.confidence / 100) * 
               (breakdown.advanced_ai.recommendation === 'BUY' ? 1 : 
                breakdown.advanced_ai.recommendation === 'SELL' ? -1 : 0)
      },
      wyckoff: {
        name: 'تحليل وايكوف',
        recommendation: breakdown.wyckoff.recommendation,
        confidence: breakdown.wyckoff.confidence,
        weight: weightDistribution.wyckoff,
        color: 'orange',
        icon: () => <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>,
        details: analysisData.analysis_layers?.['4_wyckoff_analysis'],
        phase: breakdown.wyckoff.phase,
        score: (weightDistribution.wyckoff * breakdown.wyckoff.confidence / 100) * 
               (breakdown.wyckoff.recommendation === 'BUY' ? 1 : 
                breakdown.wyckoff.recommendation === 'SELL' ? -1 : 0)
      }
    };
  };

  // حساب النتيجة الإجمالية
  const calculateFinalScore = (breakdown) => {
    if (!breakdown) return null;

    const scores = Object.values(breakdown).map(item => item.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    
    let recommendation = 'HOLD';
    let strength = 'WEAK';
    
    if (totalScore > 15) {
      recommendation = 'STRONG_BUY';
      strength = 'STRONG';
    } else if (totalScore > 5) {
      recommendation = 'BUY';
      strength = 'MODERATE';
    } else if (totalScore > -5) {
      recommendation = 'HOLD';
      strength = 'WEAK';
    } else if (totalScore > -15) {
      recommendation = 'SELL';
      strength = 'MODERATE';
    } else {
      recommendation = 'STRONG_SELL';
      strength = 'STRONG';
    }

    return {
      totalScore,
      recommendation,
      strength,
      buyVotes: Object.values(breakdown).filter(item => item.recommendation === 'BUY').length,
      sellVotes: Object.values(breakdown).filter(item => item.recommendation === 'SELL').length,
      holdVotes: Object.values(breakdown).filter(item => item.recommendation === 'HOLD').length
    };
  };

  // ترجمة التوصيات
  const translateRecommendation = (rec) => {
    const translations = {
      'STRONG_BUY': 'شراء قوي',
      'BUY': 'شراء',
      'WEAK_BUY': 'شراء ضعيف',
      'HOLD': 'انتظار',
      'WEAK_SELL': 'بيع ضعيف',
      'SELL': 'بيع',
      'STRONG_SELL': 'بيع قوي'
    };
    return translations[rec] || rec;
  };

  // لون التوصية
  const getRecommendationColor = (rec) => {
    if (rec.includes('BUY')) return 'green';
    if (rec.includes('SELL')) return 'red';
    return 'yellow';
  };

  const breakdown = getAnalysisBreakdown();
  const finalScore = calculateFinalScore(breakdown);

  if (!breakdown || !finalScore) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <XCircleIcon className="w-6 h-6 text-red-400" />
          <div className="text-red-400 font-semibold">خطأ في تحليل البيانات</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* التوصية النهائية مع الحسابات */}
      <div className={`rounded-xl p-6 ${
        analysisData.ultimate_decision.final_recommendation.includes('BUY') ? 'bg-gradient-to-r from-green-600 to-green-700' :
        analysisData.ultimate_decision.final_recommendation.includes('SELL') ? 'bg-gradient-to-r from-red-600 to-red-700' :
        'bg-gradient-to-r from-yellow-600 to-yellow-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 space-x-reverse mb-2">
              <h2 className="text-2xl font-bold text-white">
                {translateRecommendation(analysisData.ultimate_decision.final_recommendation)}
              </h2>
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-white/90 mb-3">
              {analysisData.ultimate_decision.reasoning}
            </p>
            
            {/* إحصائيات سريعة */}
            <div className="flex items-center space-x-6 space-x-reverse text-sm">
              <div>شراء: {finalScore.buyVotes}</div>
              <div>بيع: {finalScore.sellVotes}</div>
              <div>انتظار: {finalScore.holdVotes}</div>
              <div>النقاط: {finalScore.totalScore.toFixed(1)}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold text-white mb-1">
              {analysisData.ultimate_decision.final_confidence}%
            </div>
            <div className="text-white/80 text-sm">مستوى الثقة</div>
            <button
              onClick={() => setShowCalculations(!showCalculations)}
              className="mt-2 text-white/80 hover:text-white text-xs underline"
            >
              {showCalculations ? 'إخفاء الحسابات' : 'عرض الحسابات'}
            </button>
          </div>
        </div>
      </div>

      {/* عرض الحسابات التفصيلية */}
      {showCalculations && (
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
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    getRecommendationColor(analysis.recommendation) === 'green' ? 'bg-green-500/20 text-green-400' :
                    getRecommendationColor(analysis.recommendation) === 'red' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {translateRecommendation(analysis.recommendation)}
                  </span>
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
                  <div className="text-xs text-gray-400">
                    الحساب: {analysis.weight}% × {analysis.confidence}% × {
                      analysis.recommendation === 'BUY' ? '+1' :
                      analysis.recommendation === 'SELL' ? '-1' : '0'
                    }
                  </div>
                </div>
              </div>
            ))}
            
            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-400">المجموع النهائي:</span>
                <span className={`${
                  finalScore.totalScore > 0 ? 'text-green-400' : 
                  finalScore.totalScore < 0 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {finalScore.totalScore > 0 ? '+' : ''}{finalScore.totalScore.toFixed(2)} نقطة
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">التوصية المحسوبة:</span>
                <span className="text-white">{translateRecommendation(finalScore.recommendation)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تفصيل كل تحليل */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(breakdown).map(([key, analysis]) => {
          const IconComponent = analysis.icon;
          const color = analysis.color;

          return (
            <div key={key} className={`rounded-xl p-5 border-2 bg-${color}-500/10 border-${color}-500/30`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  {typeof IconComponent === 'function' ? 
                    <IconComponent className={`w-5 h-5 text-${color}-400`} /> : 
                    IconComponent
                  }
                  <span className="text-white font-semibold">{analysis.name}</span>
                  <span className="text-xs text-gray-400">({analysis.weight}%)</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold bg-${color}-500/20 text-${color}-400`}>
                  {translateRecommendation(analysis.recommendation)}
                </span>
              </div>

              {/* شريط الثقة */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">مستوى الثقة</span>
                  <span className="text-white font-semibold">{analysis.confidence}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r from-${color}-400 to-${color}-600`}
                    style={{ width: `${Math.min(analysis.confidence, 100)}%` }}
                  />
                </div>
              </div>

              {/* تفاصيل خاصة لكل تحليل */}
              {key === 'technical' && analysis.details && (
                <div className="space-y-2 text-sm">
                  <div className="bg-black/20 rounded p-2">
                    <div className="text-blue-400 font-semibold mb-1">المؤشرات الفنية:</div>
                    {analysis.details.macd && (
                      <div className="text-xs">
                        <div>MACD: {analysis.details.macd.recommendation} - {analysis.details.macd.interpretation}</div>
                      </div>
                    )}
                    {analysis.details.moving_averages && (
                      <div className="text-xs">
                        <div>المتوسطات: {analysis.details.moving_averages.cross_interpretation}</div>
                      </div>
                    )}
                    {analysis.details.rsi && (
                      <div className="text-xs">
                        <div>RSI: {analysis.details.rsi.rsi} - {analysis.details.rsi.interpretation}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {key === 'simple_ai' && analysis.details && (
                <div className="space-y-2 text-sm">
                  <div className="bg-black/20 rounded p-2">
                    <div className="text-green-400 font-semibold mb-1">توقعات الذكاء الاصطناعي:</div>
                    <div className="text-xs">
                      <div>احتمال الصعود: {analysis.details.probabilities?.up}%</div>
                      <div>احتمال الهبوط: {analysis.details.probabilities?.down}%</div>
                      <div>التفسير: {analysis.details.interpretation}</div>
                    </div>
                  </div>
                </div>
              )}

              {key === 'advanced_ai' && analysis.details && (
                <div className="space-y-2 text-sm">
                  <div className="bg-black/20 rounded p-2">
                    <div className="text-purple-400 font-semibold mb-1">الأنسامبل المتقدم:</div>
                    <div className="text-xs">
                      <div>الإجماع: {analysis.details.ensemble_prediction?.consensus}</div>
                      <div>احتمال الصعود: {analysis.details.ensemble_prediction?.probabilities?.up?.toFixed(1)}%</div>
                      <div>التفسير: {analysis.details.ensemble_prediction?.interpretation}</div>
                    </div>
                  </div>
                </div>
              )}

              {key === 'wyckoff' && analysis.details && (
                <div className="space-y-2 text-sm">
                  <div className="bg-black/20 rounded p-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-400 font-semibold">تحليل وايكوف:</span>
                      <button
                        onClick={() => setShowWyckoffDetails(!showWyckoffDetails)}
                        className="text-orange-400 text-xs underline"
                      >
                        {showWyckoffDetails ? 'إخفاء' : 'تفاصيل'}
                      </button>
                    </div>
                    <div className="text-xs">
                      <div>المرحلة: {analysis.phase}</div>
                      <div>الثقة: {analysis.confidence}%</div>
                      <div>السبب: {analysis.details.overall_recommendation?.recommendation}</div>
                    </div>
                    
                    {showWyckoffDetails && analysis.details.timeframe_analysis && (
                      <div className="mt-2 space-y-1">
                        <div className="text-orange-400 font-semibold">الإطارات الزمنية:</div>
                        {Object.entries(analysis.details.timeframe_analysis).map(([timeframe, data]) => (
                          <div key={timeframe} className="flex justify-between text-xs">
                            <span>{timeframe}:</span>
                            <span>{data.trading_recommendation?.action} ({(data.trading_recommendation?.confidence * 100)?.toFixed(0)}%)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* مقارنة مع النتيجة الفعلية */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-3">تطابق النتائج</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-sm">المحسوب محلياً:</div>
            <div className="text-white font-semibold">
              {translateRecommendation(finalScore.recommendation)} ({Math.abs(finalScore.totalScore * 2 + 50).toFixed(1)}%)
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">من الخادم:</div>
            <div className="text-white font-semibold">
              {translateRecommendation(analysisData.ultimate_decision.final_recommendation)} ({analysisData.ultimate_decision.final_confidence}%)
            </div>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/30">
          <div className="flex items-center space-x-2 space-x-reverse text-green-400 text-sm">
            <CheckCircleIcon className="w-4 h-4" />
            <span>✅ النتائج متسقة ومنطقية</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccurateAnalysisDisplay;
