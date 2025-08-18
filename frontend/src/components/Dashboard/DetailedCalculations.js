// // src/components/Dashboard/DetailedCalculations.js
// import React from 'react';

// export const DetailedCalculations = ({ analysisData }) => {
//   return (
//     <div className="bg-white/5 rounded-lg p-4 space-y-4">
//       <h4 className="text-white font-semibold mb-3">الحسابات التفصيلية</h4>
      
//       {/* Technical Indicators Details */}
//       {analysisData.analysis_layers?.['1_technical_analysis'] && (
//         <div className="space-y-2">
//           <h5 className="text-blue-400 font-semibold text-sm">المؤشرات الفنية:</h5>
//           <div className="grid grid-cols-2 gap-4 text-xs">
//             {analysisData.analysis_layers['1_technical_analysis'].macd && (
//               <div>
//                 <span className="text-gray-400">MACD Line:</span>
//                 <span className="text-white ml-2">
//                   {analysisData.analysis_layers['1_technical_analysis'].macd.macd_line?.toFixed(4)}
//                 </span>
//               </div>
//             )}
            
//             {analysisData.analysis_layers['1_technical_analysis'].rsi && (
//               <div>
//                 <span className="text-gray-400">RSI Value:</span>
//                 <span className="text-white ml-2">
//                   {analysisData.analysis_layers['1_technical_analysis'].rsi.value?.toFixed(2)}
//                 </span>
//               </div>
//             )}
            
//             {analysisData.analysis_layers['1_technical_analysis'].moving_averages && (
//               <>
//                 <div>
//                   <span className="text-gray-400">MA20:</span>
//                   <span className="text-white ml-2">
//                     {analysisData.analysis_layers['1_technical_analysis'].moving_averages.ma20?.toFixed(2)}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-400">MA50:</span>
//                   <span className="text-white ml-2">
//                     {analysisData.analysis_layers['1_technical_analysis'].moving_averages.ma50?.toFixed(2)}
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* AI Models Details */}
//       {analysisData.analysis_layers?.['2_simple_ai'] && !analysisData.analysis_layers['2_simple_ai'].error && (
//         <div className="space-y-2">
//           <h5 className="text-green-400 font-semibold text-sm">الذكاء الاصطناعي البسيط:</h5>
//           <div className="grid grid-cols-2 gap-4 text-xs">
//             <div>
//               <span className="text-gray-400">نوع النموذج:</span>
//               <span className="text-white ml-2">Random Forest</span>
//             </div>
//             <div>
//               <span className="text-gray-400">دقة التنبؤ:</span>
//               <span className="text-white ml-2">
//                 {analysisData.analysis_layers['2_simple_ai'].accuracy?.toFixed(1)}%
//               </span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Advanced AI Details */}
//       {analysisData.analysis_layers?.['3_advanced_ai'] && !analysisData.analysis_layers['3_advanced_ai'].error && (
//         <div className="space-y-2">
//           <h5 className="text-purple-400 font-semibold text-sm">الذكاء الاصطناعي المتقدم:</h5>
//           <div className="grid grid-cols-2 gap-4 text-xs">
//             {analysisData.analysis_layers['3_advanced_ai'].individual_models && (
//               <>
//                 <div>
//                   <span className="text-gray-400">عدد النماذج:</span>
//                   <span className="text-white ml-2">
//                     {Object.keys(analysisData.analysis_layers['3_advanced_ai'].individual_models).length}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-400">اتفاق النماذج:</span>
//                   <span className="text-white ml-2">
//                     {analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction?.models_agreement?.toFixed(1)}%
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Wyckoff Analysis Details */}
//       {analysisData.wyckoff_analysis && !analysisData.wyckoff_analysis.error && (
//         <div className="space-y-2">
//           <h5 className="text-orange-400 font-semibold text-sm">تحليل وايكوف:</h5>
//           <div className="grid grid-cols-2 gap-4 text-xs">
//             {analysisData.wyckoff_analysis.detected_events && (
//               <div>
//                 <span className="text-gray-400">الأحداث المكتشفة:</span>
//                 <span className="text-white ml-2">
//                   {analysisData.wyckoff_analysis.detected_events.length}
//                 </span>
//               </div>
//             )}
            
//             {analysisData.wyckoff_analysis.volume_analysis && (
//               <div>
//                 <span className="text-gray-400">تحليل الحجم:</span>
//                 <span className="text-white ml-2">
//                   {analysisData.wyckoff_analysis.volume_analysis.status}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Decision Making Process */}
//       <div className="space-y-2">
//         <h5 className="text-yellow-400 font-semibold text-sm">عملية اتخاذ القرار:</h5>
//         <div className="text-xs space-y-1">
//           <div className="flex justify-between">
//             <span className="text-gray-400">طبقات التحليل النشطة:</span>
//             <span className="text-white">
//               {analysisData.analysis_summary?.total_analysis_methods || 'غير محدد'}
//             </span>
//           </div>
          
//           <div className="flex justify-between">
//             <span className="text-gray-400">نقاط الثقة الإجمالية:</span>
//             <span className="text-white">
//               {analysisData.ultimate_decision?.final_confidence?.toFixed(1)}%
//             </span>
//           </div>
          
//           <div className="flex justify-between">
//             <span className="text-gray-400">مستوى المخاطر:</span>
//             <span className={`${
//               analysisData.ultimate_decision?.risk_level === 'LOW' ? 'text-green-400' :
//               analysisData.ultimate_decision?.risk_level === 'MEDIUM' ? 'text-yellow-400' :
//               'text-red-400'
//             }`}>
//               {analysisData.ultimate_decision?.risk_level === 'LOW' ? 'منخفض' :
//                analysisData.ultimate_decision?.risk_level === 'MEDIUM' ? 'متوسط' :
//                analysisData.ultimate_decision?.risk_level === 'HIGH' ? 'عالي' : 'غير محدد'}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Raw Data Preview */}
//       <div className="mt-4 pt-4 border-t border-white/10">
//         <button
//           onClick={() => {
//             console.log('تفاصيل البيانات الكاملة:', analysisData);
//             alert('تم طباعة تفاصيل البيانات في وحدة التحكم (Console)');
//           }}
//           className="text-xs text-blue-400 hover:text-blue-300 underline"
//         >
//           عرض البيانات الخام في وحدة التحكم
//         </button>
//       </div>
//     </div>
//   );
// };

// export default DetailedCalculations;
// frontend/src/components/Dashboard/DetailedCalculations.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalculatorIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export const DetailedCalculations = ({ analysisData }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (!analysisData?.ultimate_decision) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 text-center">
        <CalculatorIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400">لا توجد بيانات حسابات متاحة</p>
      </div>
    );
  }

  const { analysis_breakdown, weight_distribution, final_confidence, final_recommendation } = analysisData.ultimate_decision;

  // حساب النقاط لكل طبقة
  const calculateLayerScores = () => {
    if (!analysis_breakdown || !weight_distribution) return [];

    return [
      {
        id: 'technical',
        name: 'التحليل الفني',
        recommendation: analysis_breakdown.technical?.recommendation,
        confidence: analysis_breakdown.technical?.confidence || 0,
        weight: weight_distribution.technical || 0,
        color: 'blue',
        rawScore: (weight_distribution.technical || 0) * (analysis_breakdown.technical?.confidence || 0) / 100,
        normalizedScore: ((weight_distribution.technical || 0) * (analysis_breakdown.technical?.confidence || 0) / 100) * 
                         (analysis_breakdown.technical?.recommendation === 'BUY' ? 1 : 
                          analysis_breakdown.technical?.recommendation === 'SELL' ? -1 : 0)
      },
      {
        id: 'simple_ai',
        name: 'الذكاء الاصطناعي البسيط',
        recommendation: analysis_breakdown.simple_ai?.recommendation,
        confidence: analysis_breakdown.simple_ai?.confidence || 0,
        weight: weight_distribution.simple_ai || 0,
        color: 'green',
        rawScore: (weight_distribution.simple_ai || 0) * (analysis_breakdown.simple_ai?.confidence || 0) / 100,
        normalizedScore: ((weight_distribution.simple_ai || 0) * (analysis_breakdown.simple_ai?.confidence || 0) / 100) * 
                         (analysis_breakdown.simple_ai?.recommendation === 'BUY' ? 1 : 
                          analysis_breakdown.simple_ai?.recommendation === 'SELL' ? -1 : 0)
      },
      {
        id: 'advanced_ai',
        name: 'الذكاء الاصطناعي المتقدم',
        recommendation: analysis_breakdown.advanced_ai?.recommendation,
        confidence: analysis_breakdown.advanced_ai?.confidence || 0,
        weight: weight_distribution.advanced_ai || 0,
        color: 'purple',
        rawScore: (weight_distribution.advanced_ai || 0) * (analysis_breakdown.advanced_ai?.confidence || 0) / 100,
        normalizedScore: ((weight_distribution.advanced_ai || 0) * (analysis_breakdown.advanced_ai?.confidence || 0) / 100) * 
                         (analysis_breakdown.advanced_ai?.recommendation === 'BUY' ? 1 : 
                          analysis_breakdown.advanced_ai?.recommendation === 'SELL' ? -1 : 0)
      },
      {
        id: 'wyckoff',
        name: 'تحليل وايكوف',
        recommendation: analysis_breakdown.wyckoff?.recommendation,
        confidence: analysis_breakdown.wyckoff?.confidence || 0,
        weight: weight_distribution.wyckoff || 0,
        color: 'orange',
        rawScore: (weight_distribution.wyckoff || 0) * (analysis_breakdown.wyckoff?.confidence || 0) / 100,
        normalizedScore: ((weight_distribution.wyckoff || 0) * (analysis_breakdown.wyckoff?.confidence || 0) / 100) * 
                         (analysis_breakdown.wyckoff?.recommendation === 'BUY' ? 1 : 
                          analysis_breakdown.wyckoff?.recommendation === 'SELL' ? -1 : 0)
      }
    ];
  };

  const layerScores = calculateLayerScores();
  const totalNormalizedScore = layerScores.reduce((sum, layer) => sum + layer.normalizedScore, 0);
  const totalRawScore = layerScores.reduce((sum, layer) => sum + layer.rawScore, 0);

  const CalculationSection = ({ title, id, children, icon: Icon }) => (
    <div className="bg-white/5 rounded-xl border border-white/10">
      <button
        onClick={() => toggleSection(id)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-3 space-x-reverse">
          {Icon && <Icon className="w-5 h-5 text-blue-400" />}
          <span className="text-white font-semibold">{title}</span>
        </div>
        {expandedSections[id] ? 
          <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : 
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        }
      </button>
      
      <AnimatePresence>
        {expandedSections[id] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <CalculatorIcon className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">الحسابات المفصلة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="text-blue-400 text-sm font-medium">النقاط الإجمالية</div>
            <div className="text-2xl font-bold text-white">{totalNormalizedScore.toFixed(2)}</div>
            <div className="text-xs text-gray-400">مجموع النقاط المعيارية</div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="text-green-400 text-sm font-medium">مستوى الثقة النهائي</div>
            <div className="text-2xl font-bold text-white">{final_confidence}%</div>
            <div className="text-xs text-gray-400">الثقة في القرار النهائي</div>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="text-purple-400 text-sm font-medium">التوصية النهائية</div>
            <div className="text-2xl font-bold text-white">{final_recommendation}</div>
            <div className="text-xs text-gray-400">القرار المتخذ</div>
          </div>
        </div>
      </div>

      {/* تفصيل حسابات كل طبقة */}
      <CalculationSection 
        title="حسابات الطبقات الفردية" 
        id="layer_calculations"
        icon={CalculatorIcon}
      >
        <div className="space-y-4">
          {layerScores.map((layer, index) => (
            <motion.div
              key={layer.id}
              className={`bg-${layer.color}-500/10 border border-${layer.color}-500/20 rounded-lg p-4`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-${layer.color}-400 font-semibold`}>{layer.name}</h4>
                <span className={`text-${layer.color}-400 text-sm font-medium`}>
                  {layer.recommendation}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">الوزن:</span>
                  <span className="text-white font-mono">{layer.weight}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">مستوى الثقة:</span>
                  <span className="text-white font-mono">{layer.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">النقاط الخام:</span>
                  <span className="text-white font-mono">{layer.rawScore.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">النقاط المعيارية:</span>
                  <span className={`font-mono font-bold ${layer.normalizedScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {layer.normalizedScore >= 0 ? '+' : ''}{layer.normalizedScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* معادلة الحساب */}
              <div className="mt-3 p-2 bg-black/20 rounded text-xs font-mono text-gray-300">
                النقاط = ({layer.weight}% × {layer.confidence}%) × {
                  layer.recommendation === 'BUY' ? '+1' : 
                  layer.recommendation === 'SELL' ? '-1' : '0'
                } = {layer.normalizedScore.toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>
      </CalculationSection>

      {/* شرح آلية الحساب */}
      <CalculationSection 
        title="شرح آلية الحساب" 
        id="calculation_methodology"
        icon={InformationCircleIcon}
      >
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">1. حساب النقاط الخام</h4>
            <p className="text-gray-300 text-sm">
              النقاط الخام = (وزن الطبقة ÷ 100) × (مستوى ثقة الطبقة ÷ 100) × 100
            </p>
            <div className="text-xs text-gray-400 mt-2">
              مثال: التحليل الفني (30% × 72%) = 21.6 نقطة خام
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">2. تطبيق اتجاه التوصية</h4>
            <p className="text-gray-300 text-sm">
              النقاط المعيارية = النقاط الخام × معامل الاتجاه
            </p>
            <div className="text-xs text-gray-400 mt-2">
              معامل الاتجاه: شراء = +1، بيع = -1، انتظار = 0
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">3. الحساب النهائي</h4>
            <p className="text-gray-300 text-sm">
              مجموع النقاط المعيارية = مجموع جميع نقاط الطبقات المعيارية
            </p>
            <div className="text-xs text-gray-400 mt-2">
              القرار النهائي: موجب = شراء، سالب = بيع، صفر = انتظار
            </div>
          </div>
        </div>
      </CalculationSection>

      {/* تحليل التوزيع */}
      <CalculationSection 
        title="تحليل توزيع الأوزان" 
        id="weight_distribution"
        icon={CheckCircleIcon}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-semibold mb-3">التوزيع الحالي</h4>
              {layerScores.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">{layer.name}:</span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-white font-semibold">{layer.weight}%</span>
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-${layer.color}-400`}
                        style={{ width: `${layer.weight}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">إحصائيات التوزيع</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">إجمالي الأوزان:</span>
                  <span className="text-white">{layerScores.reduce((sum, layer) => sum + layer.weight, 0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">أعلى وزن:</span>
                  <span className="text-white">{Math.max(...layerScores.map(l => l.weight))}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">أقل وزن:</span>
                  <span className="text-white">{Math.min(...layerScores.map(l => l.weight))}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">متوسط الوزن:</span>
                  <span className="text-white">
                    {(layerScores.reduce((sum, layer) => sum + layer.weight, 0) / layerScores.length).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CalculationSection>

      {/* التحقق من صحة الحسابات */}
      <CalculationSection 
        title="التحقق من صحة الحسابات" 
        id="validation"
        icon={ExclamationTriangleIcon}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">مجموع الأوزان</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {layerScores.reduce((sum, layer) => sum + layer.weight, 0)}%
              </div>
              <div className="text-xs text-gray-400">يجب أن يساوي 100%</div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">صحة البيانات</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {layerScores.filter(l => l.confidence > 0).length}/{layerScores.length}
              </div>
              <div className="text-xs text-gray-400">طبقات بها بيانات صالحة</div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <CheckCircleIcon className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-semibold">دقة الحساب</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {((totalRawScore / 100) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">معدل استغلال النقاط</div>
            </div>
          </div>

          {/* رسائل التحقق */}
          <div className="space-y-2">
            {layerScores.reduce((sum, layer) => sum + layer.weight, 0) === 100 ? (
              <div className="flex items-center space-x-2 space-x-reverse text-green-400 text-sm">
                <CheckCircleIcon className="w-4 h-4" />
                <span>✅ مجموع الأوزان صحيح (100%)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse text-red-400 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>⚠️ مجموع الأوزان غير صحيح ({layerScores.reduce((sum, layer) => sum + layer.weight, 0)}%)</span>
              </div>
            )}

            {layerScores.every(l => l.confidence >= 0 && l.confidence <= 100) ? (
              <div className="flex items-center space-x-2 space-x-reverse text-green-400 text-sm">
                <CheckCircleIcon className="w-4 h-4" />
                <span>✅ جميع مستويات الثقة في النطاق المقبول (0-100%)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse text-red-400 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>⚠️ بعض مستويات الثقة خارج النطاق المقبول</span>
              </div>
            )}

            {layerScores.every(l => l.recommendation) ? (
              <div className="flex items-center space-x-2 space-x-reverse text-green-400 text-sm">
                <CheckCircleIcon className="w-4 h-4" />
                <span>✅ جميع الطبقات لديها توصيات واضحة</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse text-yellow-400 text-sm">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>⚠️ بعض الطبقات بدون توصيات واضحة</span>
              </div>
            )}
          </div>
        </div>
      </CalculationSection>
    </div>
  );
};