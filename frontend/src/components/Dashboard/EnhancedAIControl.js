// components/Dashboard/EnhancedAIControl.js
import React, { useState, useEffect } from 'react';
import {
  BoltIcon,
  SparklesIcon,
  ArrowPathIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// ===============================================
// مكون النظام المحسن للذكاء الاصطناعي
// ===============================================
export const EnhancedAIControl = ({ selectedSymbol, onAnalysisComplete }) => {
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [enhancedPrediction, setEnhancedPrediction] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [error, setError] = useState(null);

  // جلب معلومات النماذج
  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await axios.get('/ai/enhanced/info');
      setModelInfo(response.data);
    } catch (err) {
      console.error('Error fetching model info:', err);
    }
  };

  // تدريب النظام المحسن
  const trainEnhancedModel = async () => {
    setTrainingLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `/ai/enhanced/train/${selectedSymbol}`,
        {},
        { 
          params: { 
            days: 90,
            optimize: false 
          }
        }
      );
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        // عرض نتائج التدريب
        alert(`
          ✅ التدريب اكتمل بنجاح!
          
          📊 النتائج:
          - الدقة المتوسطة: ${(response.data.average_accuracy * 100).toFixed(1)}%
          - F1 Score: ${(response.data.average_f1_score * 100).toFixed(1)}%
          - أفضل نموذج: ${response.data.best_model}
          - عدد الميزات: ${response.data.feature_count}
          - وقت التدريب: ${response.data.training_time_seconds} ثانية
        `);
        
        // تحديث معلومات النماذج
        fetchModelInfo();
      }
    } catch (err) {
      setError('فشل التدريب: ' + err.message);
    } finally {
      setTrainingLoading(false);
    }
  };

  // التنبؤ المحسن
  const getEnhancedPrediction = async () => {
    setEnhancedLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/ai/enhanced/predict/${selectedSymbol}`);
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setEnhancedPrediction(response.data);
        
        // إرسال النتائج للمكون الأب
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data);
        }
      }
    } catch (err) {
      setError('فشل التنبؤ: ' + err.message);
    } finally {
      setEnhancedLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2 space-x-reverse">
          <BoltIcon className="w-6 h-6 text-purple-400" />
          <span>النظام المحسن للذكاء الاصطناعي</span>
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          {modelInfo?.is_trained && (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              مدرب ✓
            </span>
          )}
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {modelInfo?.models_count || 0} نماذج
          </span>
        </div>
      </div>

      {/* معلومات النماذج */}
      {modelInfo && modelInfo.is_trained && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 text-sm">الدقة المتوسطة</div>
            <div className="text-xl font-bold text-green-400">
              {(modelInfo.average_accuracy * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 text-sm">F1 Score</div>
            <div className="text-xl font-bold text-blue-400">
              {(modelInfo.average_f1_score * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* أزرار التحكم */}
      <div className="flex space-x-3 space-x-reverse mb-6">
        <button
          onClick={trainEnhancedModel}
          disabled={trainingLoading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
        >
          {trainingLoading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>جاري التدريب...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>تدريب النماذج</span>
            </>
          )}
        </button>
        
        <button
          onClick={getEnhancedPrediction}
          disabled={enhancedLoading || !modelInfo?.is_trained}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
        >
          {enhancedLoading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>جاري التحليل...</span>
            </>
          ) : (
            <>
              <CpuChipIcon className="w-5 h-5" />
              <span>تحليل محسن</span>
            </>
          )}
        </button>
      </div>

      {/* عرض الأخطاء */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2 space-x-reverse text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* عرض نتائج التنبؤ المحسن */}
      {enhancedPrediction && (
        <EnhancedPredictionDisplay prediction={enhancedPrediction} />
      )}
    </div>
  );
};

// ===============================================
// مكون عرض التنبؤ المحسن
// ===============================================
const EnhancedPredictionDisplay = ({ prediction }) => {
  const ensemble = prediction.ensemble_prediction || {};
  const market = prediction.market_analysis || {};
  const risk = prediction.risk_assessment || {};
  const action = prediction.suggested_action || {};

  return (
    <div className="space-y-4">
      {/* التنبؤ الرئيسي */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300">التنبؤ النهائي</span>
          <span className={`text-2xl font-bold ${
            ensemble.final_prediction === 'UP' ? 'text-green-400' : 'text-red-400'
          }`}>
            {ensemble.final_prediction} {ensemble.final_prediction === 'UP' ? '↑' : '↓'}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-gray-400 text-xs">التوصية</div>
            <div className={`font-bold ${
              ensemble.recommendation?.includes('BUY') ? 'text-green-400' : 
              ensemble.recommendation?.includes('SELL') ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {ensemble.recommendation}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs">الثقة</div>
            <div className="font-bold text-blue-400">
              {ensemble.confidence?.toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs">قوة الإشارة</div>
            <div className="font-bold text-purple-400">
              {ensemble.signal_strength}
            </div>
          </div>
        </div>

        {/* شريط الاحتمالات */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>احتمال الهبوط</span>
            <span>احتمال الصعود</span>
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden flex">
            <div 
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${ensemble.probabilities?.down || 50}%` }}
            />
            <div 
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${ensemble.probabilities?.up || 50}%` }}
            />
          </div>
        </div>
      </div>

      {/* تحليل السوق */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span>تحليل السوق</span>
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">الاتجاه:</span>
            <span className={`font-semibold ${
              market.trend?.direction === 'UPTREND' ? 'text-green-400' : 
              market.trend?.direction === 'DOWNTREND' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {market.trend?.direction}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">التقلب:</span>
            <span className={`font-semibold ${
              market.volatility?.level === 'HIGH' || market.volatility?.level === 'EXTREME' ? 'text-red-400' : 
              market.volatility?.level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {market.volatility?.level}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">الزخم:</span>
            <span className="text-white font-semibold">
              {market.momentum?.value?.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">المرحلة:</span>
            <span className="text-white font-semibold">
              {market.market_phase}
            </span>
          </div>
        </div>
      </div>

      {/* تقييم المخاطر */}
      <div className={`rounded-xl p-4 ${
        risk.risk_level === 'منخفض' ? 'bg-green-500/10 border border-green-500/30' :
        risk.risk_level === 'متوسط' ? 'bg-yellow-500/10 border border-yellow-500/30' :
        'bg-red-500/10 border border-red-500/30'
      }`}>
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
          <span className={`w-2 h-2 rounded-full ${
            risk.risk_level === 'منخفض' ? 'bg-green-400' :
            risk.risk_level === 'متوسط' ? 'bg-yellow-400' :
            'bg-red-400'
          }`}></span>
          <span>المخاطر: {risk.risk_level}</span>
        </h4>
        
        {risk.risk_factors && risk.risk_factors.length > 0 && (
          <div className="space-y-1">
            {risk.risk_factors.map((factor, index) => (
              <div key={index} className="text-sm text-gray-300 flex items-center space-x-2 space-x-reverse">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-white/10">
          <span className="text-sm text-gray-300">{risk.recommendation}</span>
        </div>
      </div>

      {/* الإجراء المقترح */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4">
        <h4 className="text-white font-semibold mb-3">💡 الإجراء المقترح</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">الإجراء:</span>
            <span className={`font-bold text-lg ${
              action.action === 'شراء' ? 'text-green-400' : 
              action.action === 'بيع' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {action.action}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">حجم المركز:</span>
            <span className="text-white font-semibold">{action.position_size}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">وقف الخسارة:</span>
            <span className="text-orange-400">{action.stop_loss}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">جني الأرباح:</span>
            <span className="text-green-400">{action.take_profit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">التوقيت:</span>
            <span className="text-blue-400">{action.timing}</span>
          </div>
        </div>
      </div>

      {/* تنبؤات النماذج الفردية */}
      {prediction.individual_predictions && (
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">النماذج الفردية</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(prediction.individual_predictions).map(([model, pred]) => (
              <div key={model} className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-400 truncate">{model}</div>
                <div className={`font-bold ${pred === 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {pred === 1 ? 'UP' : 'DOWN'}
                </div>
                <div className="text-xs text-gray-500">
                  {prediction.individual_probabilities?.[model]?.up?.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
