// components/RecommendationBreakdown.js - مكون لعرض تفصيل التوصيات
import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const RecommendationBreakdown = ({ analysisData }) => {
  const [showDetails, setShowDetails] = useState(false);

  // استخراج التوصيات من كل طبقة
  const extractRecommendations = () => {
    if (!analysisData?.analysis_layers) return [];

    const recommendations = [];
    const layers = analysisData.analysis_layers;

    // التحليل الفني
    if (layers['1_technical_analysis']) {
      const tech = layers['1_technical_analysis'];
      recommendations.push({
        id: 'technical',
        name: 'التحليل الفني',
        icon: ChartBarIcon,
        recommendation: tech.recommendation || 'غير محدد',
        confidence: tech.confidence || 0,
        reasoning: tech.reasoning || 'لا يوجد تفسير',
        color: 'blue',
        weight: 30 // وزن 30%
      });
    }

    // الذكاء الاصطناعي البسيط
    if (layers['2_simple_ai']) {
      const simple = layers['2_simple_ai'];
      recommendations.push({
        id: 'simple_ai',
        name: 'الذكاء الاصطناعي البسيط',
        icon: CpuChipIcon,
        recommendation: simple.recommendation || 'غير محدد',
        confidence: simple.confidence || 0,
        reasoning: simple.reasoning || 'لا يوجد تفسير',
        color: 'green',
        weight: 20 // وزن 20%
      });
    }

    // الذكاء الاصطناعي المتقدم
    if (layers['3_advanced_ai']) {
      const advanced = layers['3_advanced_ai'];
      const prediction = advanced.ensemble_prediction;
      recommendations.push({
        id: 'advanced_ai',
        name: 'الذكاء الاصطناعي المتقدم',
        icon: BoltIcon,
        recommendation: prediction?.final_decision || 'غير محدد',
        confidence: prediction?.confidence || 0,
        reasoning: prediction?.reasoning || 'لا يوجد تفسير',
        color: 'purple',
        weight: 40, // وزن 40%
        models: advanced.individual_models // النماذج الفردية
      });
    }

    // تحليل وايكوف
    if (analysisData.wyckoff_analysis) {
      const wyckoff = analysisData.wyckoff_analysis;
      recommendations.push({
        id: 'wyckoff',
        name: 'تحليل وايكوف',
        icon: () => <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>,
        recommendation: wyckoff.recommended_action || 'غير محدد',
        confidence: wyckoff.confidence || 0,
        reasoning: wyckoff.interpretation || 'لا يوجد تفسير',
        color: 'orange',
        weight: 10, // وزن 10%
        phase: wyckoff.current_phase,
        phaseStrength: wyckoff.phase_strength
      });
    }

    return recommendations;
  };

  // حساب الإجماع
  const calculateConsensus = (recommendations) => {
    const votes = { BUY: 0, SELL: 0, HOLD: 0 };
    let totalWeight = 0;
    let weightedScore = 0;

    recommendations.forEach(rec => {
      const recType = rec.recommendation.toUpperCase();
      const weight = rec.weight / 100;
      const confidence = rec.confidence / 100;
      
      totalWeight += weight;
      
      if (recType.includes('BUY')) {
        votes.BUY++;
        weightedScore += weight * confidence * 1;
      } else if (recType.includes('SELL')) {
        votes.SELL++;
        weightedScore += weight * confidence * (-1);
      } else {
        votes.HOLD++;
        weightedScore += weight * confidence * 0;
      }
    });

    const normalizedScore = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
    const finalConfidence = Math.abs(normalizedScore) * 100;
    
    let consensusType = 'مختلط';
    let finalRecommendation = 'HOLD';
    
    if (normalizedScore > 0.2) {
      consensusType = votes.BUY > 1 ? 'إجماع قوي' : 'ميل للشراء';
      finalRecommendation = 'BUY';
    } else if (normalizedScore < -0.2) {
      consensusType = votes.SELL > 1 ? 'إجماع قوي' : 'ميل للبيع';
      finalRecommendation = 'SELL';
    } else {
      consensusType = 'آراء متضاربة';
    }

    return {
      votes,
      consensusType,
      finalRecommendation,
      finalConfidence,
      weightedScore: normalizedScore,
      participating: recommendations.length
    };
  };

  // تحديد لون التوصية
  const getRecommendationColor = (recommendation) => {
    const rec = recommendation.toUpperCase();
    if (rec.includes('BUY')) return 'green';
    if (rec.includes('SELL')) return 'red';
    return 'yellow';
  };

  // تحديد أيقونة التوصية
  const getRecommendationIcon = (recommendation) => {
    const rec = recommendation.toUpperCase();
    if (rec.includes('BUY')) return ArrowTrendingUpIcon;
    if (rec.includes('SELL')) return ArrowTrendingDownIcon;
    return MinusIcon;
  };

  // ترجمة التوصية
  const translateRecommendation = (recommendation) => {
    const rec = recommendation.toUpperCase();
    if (rec.includes('STRONG_BUY')) return 'شراء قوي';
    if (rec.includes('BUY')) return 'شراء';
    if (rec.includes('STRONG_SELL')) return 'بيع قوي';
    if (rec.includes('SELL')) return 'بيع';
    if (rec.includes('HOLD')) return 'انتظار';
    return recommendation;
  };

  const recommendations = extractRecommendations();
  const consensus = calculateConsensus(recommendations);

  return (
    <div className="space-y-6">
      {/* ملخص الإجماع */}
      <div className={`rounded-xl p-6 ${
        consensus.finalRecommendation === 'BUY' ? 'bg-gradient-to-r from-green-600 to-green-700' :
        consensus.finalRecommendation === 'SELL' ? 'bg-gradient-to-r from-red-600 to-red-700' :
        'bg-gradient-to-r from-yellow-600 to-yellow-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 space-x-reverse mb-2">
              <h2 className="text-2xl font-bold text-white">
                الإجماع: {translateRecommendation(consensus.finalRecommendation)}
              </h2>
              {React.createElement(getRecommendationIcon(consensus.finalRecommendation), {
                className: "w-6 h-6 text-white"
              })}
            </div>
            <p className="text-white/90 mb-3">
              {consensus.consensusType} من {consensus.participating} مصادر تحليلية
            </p>
            
            {/* تفصيل الأصوات */}
            <div className="flex items-center space-x-6 space-x-reverse text-sm">
              <div className="flex items-center space-x-2 space-x-reverse">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <span>شراء: {consensus.votes.BUY}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <ArrowTrendingDownIcon className="w-4 h-4" />
                <span>بيع: {consensus.votes.SELL}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <MinusIcon className="w-4 h-4" />
                <span>انتظار: {consensus.votes.HOLD}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold text-white mb-1">
              {consensus.finalConfidence.toFixed(1)}%
            </div>
            <div className="text-white/80 text-sm">قوة الإجماع</div>
            <div className="mt-2 w-24 bg-white/20 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-white"
                style={{ width: `${Math.min(consensus.finalConfidence, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* تفصيل كل توصية */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">تفصيل التوصيات</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-2 space-x-reverse"
          >
            <InformationCircleIcon className="w-4 h-4" />
            <span>{showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => {
            const IconComponent = rec.icon;
            const recColor = getRecommendationColor(rec.recommendation);
            const RecIcon = getRecommendationIcon(rec.recommendation);

            return (
              <div key={rec.id} className={`rounded-xl p-4 border-2 ${
                recColor === 'green' ? 'bg-green-500/10 border-green-500/30' :
                recColor === 'red' ? 'bg-red-500/10 border-red-500/30' :
                recColor === 'blue' ? 'bg-blue-500/10 border-blue-500/30' :
                recColor === 'purple' ? 'bg-purple-500/10 border-purple-500/30' :
                recColor === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {typeof IconComponent === 'function' ? 
                      <IconComponent className={`w-5 h-5 text-${recColor}-400`} /> : 
                      IconComponent
                    }
                    <span className="text-white font-semibold">{rec.name}</span>
                    <span className="text-xs text-gray-400">({rec.weight}%)</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RecIcon className={`w-4 h-4 text-${recColor}-400`} />
                    <span className={`px-2 py-1 rounded text-xs font-semibold bg-${recColor}-500/20 text-${recColor}-400`}>
                      {translateRecommendation(rec.recommendation)}
                    </span>
                  </div>
                </div>

                {/* شريط الثقة */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">مستوى الثقة</span>
                    <span className="text-white font-semibold">{rec.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        recColor === 'green' ? 'from-green-400 to-green-600' :
                        recColor === 'red' ? 'from-red-400 to-red-600' :
                        recColor === 'blue' ? 'from-blue-400 to-blue-600' :
                        recColor === 'purple' ? 'from-purple-400 to-purple-600' :
                        recColor === 'orange' ? 'from-orange-400 to-orange-600' :
                        'from-yellow-400 to-yellow-600'
                      }`}
                      style={{ width: `${Math.min(rec.confidence, 100)}%` }}
                    />
                  </div>
                </div>

                {/* معلومات إضافية لوايكوف */}
                {rec.id === 'wyckoff' && (
                  <div className="mb-3 p-2 bg-black/20 rounded">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">المرحلة:</span>
                      <span className="text-orange-400">{rec.phase}</span>
                    </div>
                    {rec.phaseStrength && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">قوة المرحلة:</span>
                        <span className="text-white">{rec.phaseStrength}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* النماذج الفردية للذكاء الاصطناعي المتقدم */}
                {rec.id === 'advanced_ai' && rec.models && showDetails && (
                  <div className="mb-3 p-2 bg-black/20 rounded">
                    <div className="text-xs text-gray-400 mb-2">النماذج الفردية:</div>
                    <div className="space-y-1">
                      {Object.entries(rec.models).map(([model, data]) => (
                        <div key={model} className="flex justify-between text-xs">
                          <span className="text-gray-400">{model}:</span>
                          <span className={`${
                            data.prediction?.includes('BUY') ? 'text-green-400' :
                            data.prediction?.includes('SELL') ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {translateRecommendation(data.prediction || 'N/A')} ({data.confidence || 0}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* التفسير */}
                {showDetails && (
                  <div className="text-xs text-gray-300 bg-black/20 rounded p-2">
                    <div className="text-gray-400 mb-1">التفسير:</div>
                    <p className="leading-relaxed">
                      {rec.reasoning.length > 150 ? 
                        `${rec.reasoning.substring(0, 150)}...` : 
                        rec.reasoning
                      }
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* تحذيرات أو ملاحظات */}
      {recommendations.length < 3 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-yellow-400 font-semibold">تحذير: بيانات ناقصة</div>
              <div className="text-yellow-300 text-sm">
                بعض طبقات التحليل مفقودة. النتائج قد تكون أقل دقة من المتوقع.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مقارنة مع القرار الأصلي */}
      {analysisData?.ultimate_decision && (
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">مقارنة مع القرار الأصلي</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">القرار المحسوب:</div>
              <div className="text-white font-semibold">
                {translateRecommendation(consensus.finalRecommendation)} ({consensus.finalConfidence.toFixed(1)}%)
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">القرار الأصلي:</div>
              <div className="text-white font-semibold">
                {translateRecommendation(analysisData.ultimate_decision.final_recommendation)} 
                ({analysisData.ultimate_decision.final_confidence}%)
              </div>
            </div>
          </div>
          
          {consensus.finalRecommendation !== analysisData.ultimate_decision.final_recommendation && (
            <div className="mt-3 p-2 bg-red-500/10 rounded border border-red-500/30">
              <div className="flex items-center space-x-2 space-x-reverse text-red-400 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>❌ هناك تضارب في التوصيات - يحتاج مراجعة خوارزمية الإجماع</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationBreakdown;
