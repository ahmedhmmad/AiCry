// components/AnalysisDebugger.js - مكون لتشخيص وإصلاح عرض التحليل
import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ChartBarIcon,
  BugAntIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AnalysisDebugger = ({ analysisData }) => {
  const [showRawData, setShowRawData] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);

  // فحص تماسك البيانات
  const validateAnalysisData = () => {
    const issues = [];
    const warnings = [];
    
    if (!analysisData) {
      issues.push('لا توجد بيانات تحليل');
      return { issues, warnings, isValid: false };
    }

    // فحص التوصية النهائية
    if (analysisData.ultimate_decision) {
      const finalRec = analysisData.ultimate_decision.final_recommendation;
      const finalConf = analysisData.ultimate_decision.final_confidence;
      
      if (!finalRec) {
        issues.push('التوصية النهائية مفقودة');
      }
      
      if (!finalConf || finalConf < 0 || finalConf > 100) {
        issues.push('مستوى الثقة النهائي غير صحيح');
      }
    } else {
      issues.push('قسم القرار النهائي مفقود');
    }

    // فحص طبقات التحليل
    if (analysisData.analysis_layers) {
      const layers = analysisData.analysis_layers;
      
      // التحليل الفني
      if (layers['1_technical_analysis']) {
        const tech = layers['1_technical_analysis'];
        if (!tech.recommendation) {
          issues.push('توصية التحليل الفني مفقودة');
        }
        if (!tech.confidence) {
          issues.push('ثقة التحليل الفني مفقودة');
        }
        if (!tech.reasoning) {
          warnings.push('تفسير التحليل الفني مفقود');
        }
      } else {
        warnings.push('طبقة التحليل الفني مفقودة');
      }

      // الذكاء الاصطناعي البسيط
      if (layers['2_simple_ai']) {
        const simple = layers['2_simple_ai'];
        if (!simple.recommendation) {
          issues.push('توصية الذكاء الاصطناعي البسيط مفقودة');
        }
        if (!simple.confidence) {
          issues.push('ثقة الذكاء الاصطناعي البسيط مفقودة');
        }
      } else {
        warnings.push('طبقة الذكاء الاصطناعي البسيط مفقودة');
      }

      // الذكاء الاصطناعي المتقدم
      if (layers['3_advanced_ai']) {
        const advanced = layers['3_advanced_ai'];
        if (advanced.ensemble_prediction) {
          if (!advanced.ensemble_prediction.final_decision) {
            issues.push('قرار الذكاء الاصطناعي المتقدم مفقود');
          }
          if (!advanced.ensemble_prediction.confidence) {
            issues.push('ثقة الذكاء الاصطناعي المتقدم مفقودة');
          }
        } else {
          issues.push('تنبؤ الذكاء الاصطناعي المتقدم مفقود');
        }
      } else {
        warnings.push('طبقة الذكاء الاصطناعي المتقدم مفقودة');
      }
    } else {
      issues.push('جميع طبقات التحليل مفقودة');
    }

    // فحص تحليل وايكوف
    if (!analysisData.wyckoff_analysis) {
      warnings.push('تحليل وايكوف مفقود أو معطل');
    } else {
      const wyckoff = analysisData.wyckoff_analysis;
      if (!wyckoff.current_phase) {
        issues.push('مرحلة وايكوف الحالية مفقودة');
      }
      if (!wyckoff.recommended_action) {
        issues.push('توصية وايكوف مفقودة');
      }
      if (!wyckoff.confidence) {
        issues.push('ثقة وايكوف مفقودة');
      }
    }

    return { 
      issues, 
      warnings, 
      isValid: issues.length === 0 
    };
  };

  // حساب منطق القرار النهائي
  const calculateDecisionLogic = () => {
    if (!analysisData?.analysis_layers) return null;

    const layers = analysisData.analysis_layers;
    const calculations = [];
    
    let totalWeight = 0;
    let weightedScore = 0;
    let buyVotes = 0;
    let sellVotes = 0;
    let holdVotes = 0;

    // وزن كل طبقة تحليل
    const weights = {
      '1_technical_analysis': 0.3,
      '2_simple_ai': 0.2,
      '3_advanced_ai': 0.4,
      'wyckoff_analysis': 0.1
    };

    // تحليل كل طبقة
    Object.entries(layers).forEach(([layerName, layerData]) => {
      const weight = weights[layerName] || 0;
      let recommendation = null;
      let confidence = 0;
      
      if (layerName === '3_advanced_ai' && layerData.ensemble_prediction) {
        recommendation = layerData.ensemble_prediction.final_decision;
        confidence = layerData.ensemble_prediction.confidence || 0;
      } else {
        recommendation = layerData.recommendation;
        confidence = layerData.confidence || 0;
      }

      if (recommendation && confidence) {
        totalWeight += weight;
        
        // تحويل التوصية إلى نقاط
        let score = 0;
        if (recommendation.includes('BUY')) {
          score = 1;
          buyVotes++;
        } else if (recommendation.includes('SELL')) {
          score = -1;
          sellVotes++;
        } else {
          score = 0;
          holdVotes++;
        }
        
        const weightedContribution = (score * confidence * weight) / 100;
        weightedScore += weightedContribution;
        
        calculations.push({
          layer: layerName,
          recommendation,
          confidence,
          weight,
          score,
          contribution: weightedContribution,
          displayName: layerName === '1_technical_analysis' ? 'التحليل الفني' :
                      layerName === '2_simple_ai' ? 'الذكاء الاصطناعي البسيط' :
                      layerName === '3_advanced_ai' ? 'الذكاء الاصطناعي المتقدم' : layerName
        });
      }
    });

    // إضافة وايكوف إذا كان متوفراً
    if (analysisData.wyckoff_analysis) {
      const wyckoff = analysisData.wyckoff_analysis;
      const weight = weights.wyckoff_analysis;
      const recommendation = wyckoff.recommended_action;
      const confidence = wyckoff.confidence || 0;
      
      if (recommendation && confidence) {
        totalWeight += weight;
        
        let score = 0;
        if (recommendation.includes('BUY')) {
          score = 1;
          buyVotes++;
        } else if (recommendation.includes('SELL')) {
          score = -1;
          sellVotes++;
        } else {
          score = 0;
          holdVotes++;
        }
        
        const weightedContribution = (score * confidence * weight) / 100;
        weightedScore += weightedContribution;
        
        calculations.push({
          layer: 'wyckoff_analysis',
          recommendation,
          confidence,
          weight,
          score,
          contribution: weightedContribution,
          displayName: 'تحليل وايكوف'
        });
      }
    }

    // حساب النتيجة النهائية
    const finalScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    const finalRecommendation = finalScore > 20 ? 'BUY' : 
                               finalScore < -20 ? 'SELL' : 'HOLD';

    return {
      calculations,
      totalWeight,
      weightedScore,
      finalScore: Math.abs(finalScore),
      finalRecommendation,
      votes: { buy: buyVotes, sell: sellVotes, hold: holdVotes },
      consensus: buyVotes > sellVotes && buyVotes > holdVotes ? 'شراء' :
                sellVotes > buyVotes && sellVotes > holdVotes ? 'بيع' : 'مختلط'
    };
  };

  const validation = validateAnalysisData();
  const decisionLogic = calculateDecisionLogic();

  return (
    <div className="space-y-6">
      {/* ملخص التشخيص */}
      <div className={`rounded-xl p-4 border ${
        validation.isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center space-x-3 space-x-reverse mb-3">
          {validation.isValid ? (
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-400" />
          )}
          <h3 className={`font-semibold ${validation.isValid ? 'text-green-400' : 'text-red-400'}`}>
            تشخيص البيانات
          </h3>
        </div>

        {/* المشاكل */}
        {validation.issues.length > 0 && (
          <div className="mb-3">
            <h4 className="text-red-400 font-semibold mb-2">مشاكل حرجة:</h4>
            <ul className="space-y-1">
              {validation.issues.map((issue, index) => (
                <li key={index} className="text-red-300 text-sm flex items-center space-x-2 space-x-reverse">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* التحذيرات */}
        {validation.warnings.length > 0 && (
          <div>
            <h4 className="text-yellow-400 font-semibold mb-2">تحذيرات:</h4>
            <ul className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-yellow-300 text-sm flex items-center space-x-2 space-x-reverse">
                  <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {validation.isValid && (
          <p className="text-green-300">✅ جميع البيانات سليمة وصحيحة</p>
        )}
      </div>

      {/* تحليل منطق القرار */}
      {decisionLogic && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center space-x-2 space-x-reverse">
              <ChartBarIcon className="w-5 h-5" />
              <span>تحليل منطق القرار</span>
            </h3>
            <button
              onClick={() => setShowCalculations(!showCalculations)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showCalculations ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            </button>
          </div>

          {/* ملخص سريع */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-green-400 text-xl font-bold">{decisionLogic.votes.buy}</div>
              <div className="text-gray-400 text-sm">أصوات شراء</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-red-400 text-xl font-bold">{decisionLogic.votes.sell}</div>
              <div className="text-gray-400 text-sm">أصوات بيع</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-yellow-400 text-xl font-bold">{decisionLogic.votes.hold}</div>
              <div className="text-gray-400 text-sm">أصوات انتظار</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-white text-xl font-bold">{decisionLogic.finalScore.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">الثقة المحسوبة</div>
            </div>
          </div>

          {/* الإجماع */}
          <div className="bg-blue-500/10 rounded-lg p-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">نوع الإجماع:</span>
              <span className="text-blue-400 font-semibold">{decisionLogic.consensus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">التوصية المحسوبة:</span>
              <span className="text-white font-semibold">
                {decisionLogic.finalRecommendation === 'BUY' ? 'شراء' :
                 decisionLogic.finalRecommendation === 'SELL' ? 'بيع' : 'انتظار'}
              </span>
            </div>
          </div>

          {/* تفاصيل الحسابات */}
          {showCalculations && (
            <div className="space-y-3">
              <h4 className="text-white font-semibold">تفاصيل المساهمة:</h4>
              {decisionLogic.calculations.map((calc, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-semibold">{calc.displayName}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      calc.recommendation?.includes('BUY') ? 'bg-green-500/20 text-green-400' :
                      calc.recommendation?.includes('SELL') ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {calc.recommendation}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">الثقة: </span>
                      <span className="text-white">{calc.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">الوزن: </span>
                      <span className="text-white">{(calc.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">النقاط: </span>
                      <span className={calc.score > 0 ? 'text-green-400' : calc.score < 0 ? 'text-red-400' : 'text-yellow-400'}>
                        {calc.score}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">المساهمة: </span>
                      <span className="text-white">{calc.contribution.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* مقارنة مع النتائج المعروضة */}
      {analysisData?.ultimate_decision && decisionLogic && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <h3 className="text-white font-semibold mb-4">مقارنة النتائج</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">النتائج المعروضة</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">التوصية:</span>
                  <span className="text-white">{analysisData.ultimate_decision.final_recommendation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">الثقة:</span>
                  <span className="text-white">{analysisData.ultimate_decision.final_confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">المصدر:</span>
                  <span className="text-white">{analysisData.ultimate_decision.reasoning?.substring(0, 50)}...</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">النتائج المحسوبة</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">التوصية:</span>
                  <span className="text-white">{decisionLogic.finalRecommendation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">الثقة:</span>
                  <span className="text-white">{decisionLogic.finalScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">المصدر:</span>
                  <span className="text-white">{decisionLogic.consensus} من {decisionLogic.calculations.length} مصادر</span>
                </div>
              </div>
            </div>
          </div>

          {/* تحديد التطابق */}
          <div className={`mt-4 p-3 rounded-lg ${
            analysisData.ultimate_decision.final_recommendation === decisionLogic.finalRecommendation 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            {analysisData.ultimate_decision.final_recommendation === decisionLogic.finalRecommendation ? (
              <div className="flex items-center space-x-2 space-x-reverse text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
                <span>✅ التوصيات متطابقة</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse text-red-400">
                <XCircleIcon className="w-5 h-5" />
                <span>❌ عدم تطابق في التوصيات - يحتاج مراجعة</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* البيانات الخام */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold flex items-center space-x-2 space-x-reverse">
            <BugAntIcon className="w-5 h-5" />
            <span>البيانات الخام للتشخيص</span>
          </h3>
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-gray-400 hover:text-white text-sm"
          >
            {showRawData ? 'إخفاء' : 'عرض'}
          </button>
        </div>
        
        {showRawData && (
          <pre className="text-xs text-gray-300 overflow-auto bg-gray-900 p-4 rounded max-h-96">
            {JSON.stringify(analysisData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default AnalysisDebugger;
