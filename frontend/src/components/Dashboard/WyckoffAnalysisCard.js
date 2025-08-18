// frontend/src/components/Dashboard/WyckoffAnalysisCard.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

export const WyckoffAnalysisCard = ({ data, loading }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-pulse">
        <div className="flex items-center space-x-2 space-x-reverse mb-3">
          <div className="w-5 h-5 bg-orange-500/20 rounded"></div>
          <div className="h-4 bg-orange-400/20 rounded w-32"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-orange-400/10 rounded"></div>
          <div className="h-4 bg-orange-400/10 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
        <div className="w-8 h-8 bg-orange-500 rounded mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold opacity-50">
          W
        </div>
        <p>لا توجد بيانات تحليل وايكوف</p>
      </div>
    );
  }

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'ACCUMULATE':
        return 'text-green-400';
      case 'SELL':
      case 'DISTRIBUTE':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'ACCUMULATE':
        return <ArrowTrendingUpIcon className="w-4 h-4" />;
      case 'SELL':
      case 'DISTRIBUTE':
        return <ArrowTrendingDownIcon className="w-4 h-4" />;
      default:
        return <MinusIcon className="w-4 h-4" />;
    }
  };

  const formatRecommendation = (rec) => {
    const translations = {
      'BUY': 'شراء',
      'SELL': 'بيع',
      'HOLD': 'انتظار',
      'ACCUMULATE': 'تراكم',
      'DISTRIBUTE': 'توزيع'
    };
    return translations[rec] || rec;
  };

  const getPhaseColor = (phase) => {
    if (phase?.includes('تراكم') || phase?.includes('صعود')) return 'text-green-400';
    if (phase?.includes('توزيع') || phase?.includes('هبوط')) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getPhaseDescription = (phase) => {
    const descriptions = {
      'التراكم': 'مرحلة جمع الأسهم من قبل الأيدي القوية',
      'الصعود': 'مرحلة ارتفاع الأسعار مع زيادة الحجم',
      'التوزيع': 'مرحلة بيع الأسهم من قبل الأيدي القوية',
      'الهبوط': 'مرحلة انخفاض الأسعار مع زيادة البيع'
    };
    return descriptions[phase] || 'تحليل مرحلة السوق الحالية';
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-orange-500/20 to-amber-600/10 backdrop-blur-xl rounded-xl p-4 border border-orange-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
            W
          </div>
          <h3 className="text-white font-semibold">تحليل وايكوف</h3>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
            {data.confidence || 0}%
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* المرحلة الحالية */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">المرحلة:</span>
          <div className={`font-semibold ${getPhaseColor(data.phase)}`}>
            {data.phase || 'غير محدد'}
          </div>
        </div>

        {/* الإجراء الموصى */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400">التوصية:</span>
          <div className={`flex items-center space-x-1 space-x-reverse font-semibold ${getRecommendationColor(data.recommended_action)}`}>
            {getRecommendationIcon(data.recommended_action)}
            <span>{formatRecommendation(data.recommended_action)}</span>
          </div>
        </div>

        {/* شريط الثقة */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">مستوى الثقة</span>
            <span className="text-white font-semibold">{data.confidence || 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
              initial={{ width: 0 }}
              animate={{ width: `${data.confidence || 0}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* قوة الاتجاه */}
        {data.trend_strength && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">قوة الاتجاه:</span>
            <span className="text-orange-400 font-medium">{data.trend_strength}</span>
          </div>
        )}

        {/* التفاصيل الموسعة */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 pt-3 space-y-3"
            >
              {/* وصف المرحلة */}
              <div className="text-xs text-gray-300 bg-white/5 rounded p-2">
                <span className="text-orange-400 font-medium">وصف المرحلة:</span><br />
                {getPhaseDescription(data.phase)}
              </div>

              {/* تحليل السعر والحجم */}
              <div>
                <h4 className="text-orange-400 font-medium text-sm mb-2">تحليل السعر والحجم:</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">اتجاه السعر:</span>
                    <span className={data.price_trend === 'UP' ? 'text-green-400' : data.price_trend === 'DOWN' ? 'text-red-400' : 'text-yellow-400'}>
                      {data.price_trend === 'UP' ? 'صاعد' : data.price_trend === 'DOWN' ? 'هابط' : 'جانبي'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">اتجاه الحجم:</span>
                    <span className={data.volume_trend === 'INCREASING' ? 'text-green-400' : 'text-red-400'}>
                      {data.volume_trend === 'INCREASING' ? 'متزايد' : 'متناقص'}
                    </span>
                  </div>
                  {data.effort_vs_result && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">الجهد مقابل النتيجة:</span>
                      <span className="text-white">{data.effort_vs_result}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* السبب */}
              {data.action_reasoning && (
                <div className="text-xs text-gray-300 bg-white/5 rounded p-2">
                  <span className="text-orange-400 font-medium">التفسير:</span><br />
                  {data.action_reasoning}
                </div>
              )}

              {/* مستويات مهمة */}
              {(data.support_level || data.resistance_level) && (
                <div>
                  <h4 className="text-orange-400 font-medium text-sm mb-2">المستويات المهمة:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {data.support_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">الدعم:</span>
                        <span className="text-green-400">${data.support_level}</span>
                      </div>
                    )}
                    {data.resistance_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">المقاومة:</span>
                        <span className="text-red-400">${data.resistance_level}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* إحصائيات إضافية */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">نقاط وايكوف:</span>
                  <span className="text-white">{data.wyckoff_score || 0}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">قوة الإشارة:</span>
                  <span className="text-orange-400">{data.signal_strength || 'متوسط'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};