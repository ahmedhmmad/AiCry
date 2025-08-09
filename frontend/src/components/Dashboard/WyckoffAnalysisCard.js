// components/Dashboard/WyckoffAnalysisCard.js
import React from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const WyckoffAnalysisCard = ({ wyckoffData, loading }) => {
  if (!wyckoffData || loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">تحليل وايكوف</h3>
          <ChartBarIcon className="w-6 h-6 text-orange-400" />
        </div>
        
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-400 border-t-transparent"></div>
              <span className="text-orange-400">جاري تحليل وايكوف...</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد بيانات تحليل وايكوف</p>
            <p className="text-sm">قم بتفعيل تحليل وايكوف من لوحة التحكم</p>
          </div>
        )}
      </div>
    );
  }

  const getPhaseColor = (phase) => {
    const phaseColors = {
      'accumulation': 'text-green-400',
      'markup': 'text-blue-400',
      'distribution': 'text-orange-400',
      'markdown': 'text-red-400',
      're_accumulation': 'text-purple-400',
      'unknown': 'text-gray-400'
    };
    return phaseColors[phase] || 'text-gray-400';
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'accumulation':
      case 're_accumulation':
        return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case 'markup':
        return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case 'distribution':
        return <MinusIcon className="w-5 h-5" />;
      case 'markdown':
        return <ArrowTrendingDownIcon className="w-5 h-5" />;
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const getPhaseText = (phase) => {
    const phaseTexts = {
      'accumulation': 'مرحلة التجميع',
      'markup': 'مرحلة الارتفاع',
      'distribution': 'مرحلة التوزيع',
      'markdown': 'مرحلة الانخفاض',
      're_accumulation': 'إعادة التجميع',
      'unknown': 'غير محدد'
    };
    return phaseTexts[phase] || phase;
  };

  const getStrengthColor = (strength) => {
    if (strength >= 70) return 'text-green-400';
    if (strength >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy':
      case 'accumulate':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'sell':
      case 'distribute':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">تحليل وايكوف</h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <ChartBarIcon className="w-6 h-6 text-orange-400" />
          <div className="text-xs text-gray-400">
            الثقة: {wyckoffData.confidence}%
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* المرحلة الحالية */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">المرحلة الحالية</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`${getPhaseColor(wyckoffData.current_phase)}`}>
                {getPhaseIcon(wyckoffData.current_phase)}
              </div>
              <div>
                <div className={`text-lg font-semibold ${getPhaseColor(wyckoffData.current_phase)}`}>
                  {getPhaseText(wyckoffData.current_phase)}
                </div>
                <div className="text-gray-400 text-sm">
                  {wyckoffData.phase_description}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {wyckoffData.phase_strength}%
              </div>
              <div className="text-gray-400 text-sm">قوة المرحلة</div>
            </div>
          </div>
        </div>

        {/* التوصية */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">التوصية</h4>
          <div className="flex items-center space-x-3 space-x-reverse">
            {getActionIcon(wyckoffData.recommended_action)}
            <div>
              <div className="text-white font-semibold">
                {wyckoffData.recommended_action}
              </div>
              <div className="text-gray-400 text-sm">
                {wyckoffData.action_reasoning}
              </div>
            </div>
          </div>
        </div>

        {/* المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">قوة العرض/الطلب</div>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">
                {wyckoffData.supply_demand_strength || 'N/A'}%
              </span>
              <div className="w-16 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStrengthColor(wyckoffData.supply_demand_strength)}`}
                  style={{ width: `${wyckoffData.supply_demand_strength || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">مستوى الحجم</div>
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">
                {wyckoffData.volume_analysis?.volume_strength || 'N/A'}%
              </span>
              <div className="w-16 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStrengthColor(wyckoffData.volume_analysis?.volume_strength)}`}
                  style={{ width: `${wyckoffData.volume_analysis?.volume_strength || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">اتجاه السعر</div>
            <div className="text-white font-semibold">
              {wyckoffData.price_trend || 'N/A'}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 text-sm mb-1">مستوى المخاطر</div>
            <div className={`font-semibold ${
              wyckoffData.risk_level === 'LOW' ? 'text-green-400' :
              wyckoffData.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {wyckoffData.risk_level === 'LOW' ? 'منخفض' :
               wyckoffData.risk_level === 'MEDIUM' ? 'متوسط' : 'عالي'}
            </div>
          </div>
        </div>

        {/* النقاط المهمة */}
        {wyckoffData.key_levels && (
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">المستويات المهمة</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {wyckoffData.key_levels.support && (
                <div className="flex justify-between">
                  <span className="text-gray-400">الدعم:</span>
                  <span className="text-green-400 font-semibold">
                    ${wyckoffData.key_levels.support}
                  </span>
                </div>
              )}
              {wyckoffData.key_levels.resistance && (
                <div className="flex justify-between">
                  <span className="text-gray-400">المقاومة:</span>
                  <span className="text-red-400 font-semibold">
                    ${wyckoffData.key_levels.resistance}
                  </span>
                </div>
              )}
              {wyckoffData.key_levels.target && (
                <div className="flex justify-between">
                  <span className="text-gray-400">الهدف:</span>
                  <span className="text-blue-400 font-semibold">
                    ${wyckoffData.key_levels.target}
                  </span>
                </div>
              )}
              {wyckoffData.key_levels.stop_loss && (
                <div className="flex justify-between">
                  <span className="text-gray-400">وقف الخسارة:</span>
                  <span className="text-orange-400 font-semibold">
                    ${wyckoffData.key_levels.stop_loss}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* التحليل متعدد الإطارات */}
        {wyckoffData.multi_timeframe && (
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">التحليل متعدد الإطارات</h4>
            <div className="space-y-3">
              {Object.entries(wyckoffData.multi_timeframe).map(([timeframe, data]) => (
                <div key={timeframe} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-gray-400 text-sm">{timeframe}:</span>
                    <span className={`text-sm font-semibold ${getPhaseColor(data.phase)}`}>
                      {getPhaseText(data.phase)}
                    </span>
                  </div>
                  <span className="text-white text-sm">
                    {data.strength}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ملاحظات إضافية */}
        {wyckoffData.notes && (
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <div className="text-blue-400 text-sm font-semibold mb-1">ملاحظات التحليل:</div>
            <div className="text-blue-200 text-sm">
              {wyckoffData.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
