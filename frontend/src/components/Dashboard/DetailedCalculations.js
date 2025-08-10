// src/components/Dashboard/DetailedCalculations.js
import React from 'react';

export const DetailedCalculations = ({ analysisData }) => {
  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-4">
      <h4 className="text-white font-semibold mb-3">الحسابات التفصيلية</h4>
      
      {/* Technical Indicators Details */}
      {analysisData.analysis_layers?.['1_technical_analysis'] && (
        <div className="space-y-2">
          <h5 className="text-blue-400 font-semibold text-sm">المؤشرات الفنية:</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {analysisData.analysis_layers['1_technical_analysis'].macd && (
              <div>
                <span className="text-gray-400">MACD Line:</span>
                <span className="text-white ml-2">
                  {analysisData.analysis_layers['1_technical_analysis'].macd.macd_line?.toFixed(4)}
                </span>
              </div>
            )}
            
            {analysisData.analysis_layers['1_technical_analysis'].rsi && (
              <div>
                <span className="text-gray-400">RSI Value:</span>
                <span className="text-white ml-2">
                  {analysisData.analysis_layers['1_technical_analysis'].rsi.value?.toFixed(2)}
                </span>
              </div>
            )}
            
            {analysisData.analysis_layers['1_technical_analysis'].moving_averages && (
              <>
                <div>
                  <span className="text-gray-400">MA20:</span>
                  <span className="text-white ml-2">
                    {analysisData.analysis_layers['1_technical_analysis'].moving_averages.ma20?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">MA50:</span>
                  <span className="text-white ml-2">
                    {analysisData.analysis_layers['1_technical_analysis'].moving_averages.ma50?.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Models Details */}
      {analysisData.analysis_layers?.['2_simple_ai'] && !analysisData.analysis_layers['2_simple_ai'].error && (
        <div className="space-y-2">
          <h5 className="text-green-400 font-semibold text-sm">الذكاء الاصطناعي البسيط:</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400">نوع النموذج:</span>
              <span className="text-white ml-2">Random Forest</span>
            </div>
            <div>
              <span className="text-gray-400">دقة التنبؤ:</span>
              <span className="text-white ml-2">
                {analysisData.analysis_layers['2_simple_ai'].accuracy?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Advanced AI Details */}
      {analysisData.analysis_layers?.['3_advanced_ai'] && !analysisData.analysis_layers['3_advanced_ai'].error && (
        <div className="space-y-2">
          <h5 className="text-purple-400 font-semibold text-sm">الذكاء الاصطناعي المتقدم:</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {analysisData.analysis_layers['3_advanced_ai'].individual_models && (
              <>
                <div>
                  <span className="text-gray-400">عدد النماذج:</span>
                  <span className="text-white ml-2">
                    {Object.keys(analysisData.analysis_layers['3_advanced_ai'].individual_models).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">اتفاق النماذج:</span>
                  <span className="text-white ml-2">
                    {analysisData.analysis_layers['3_advanced_ai'].ensemble_prediction?.models_agreement?.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Wyckoff Analysis Details */}
      {analysisData.wyckoff_analysis && !analysisData.wyckoff_analysis.error && (
        <div className="space-y-2">
          <h5 className="text-orange-400 font-semibold text-sm">تحليل وايكوف:</h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {analysisData.wyckoff_analysis.detected_events && (
              <div>
                <span className="text-gray-400">الأحداث المكتشفة:</span>
                <span className="text-white ml-2">
                  {analysisData.wyckoff_analysis.detected_events.length}
                </span>
              </div>
            )}
            
            {analysisData.wyckoff_analysis.volume_analysis && (
              <div>
                <span className="text-gray-400">تحليل الحجم:</span>
                <span className="text-white ml-2">
                  {analysisData.wyckoff_analysis.volume_analysis.status}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Making Process */}
      <div className="space-y-2">
        <h5 className="text-yellow-400 font-semibold text-sm">عملية اتخاذ القرار:</h5>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">طبقات التحليل النشطة:</span>
            <span className="text-white">
              {analysisData.analysis_summary?.total_analysis_methods || 'غير محدد'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">نقاط الثقة الإجمالية:</span>
            <span className="text-white">
              {analysisData.ultimate_decision?.final_confidence?.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">مستوى المخاطر:</span>
            <span className={`${
              analysisData.ultimate_decision?.risk_level === 'LOW' ? 'text-green-400' :
              analysisData.ultimate_decision?.risk_level === 'MEDIUM' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {analysisData.ultimate_decision?.risk_level === 'LOW' ? 'منخفض' :
               analysisData.ultimate_decision?.risk_level === 'MEDIUM' ? 'متوسط' :
               analysisData.ultimate_decision?.risk_level === 'HIGH' ? 'عالي' : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* Raw Data Preview */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            console.log('تفاصيل البيانات الكاملة:', analysisData);
            alert('تم طباعة تفاصيل البيانات في وحدة التحكم (Console)');
          }}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          عرض البيانات الخام في وحدة التحكم
        </button>
      </div>
    </div>
  );
};

export default DetailedCalculations;