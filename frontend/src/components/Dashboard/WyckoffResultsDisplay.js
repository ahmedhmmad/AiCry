import React from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ShoppingCartIcon,
  XMarkIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  FireIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

export const WyckoffResultsDisplay = ({ wyckoffData, loading, symbol }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-center space-x-3 space-x-reverse">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-400 border-t-transparent"></div>
          <div className="text-blue-400 text-lg font-semibold">جاري تحليل {symbol} بطريقة وايكوف...</div>
        </div>
        <div className="mt-4 text-center text-blue-300 text-sm">
          قد يستغرق هذا بضع ثواني للحصول على أفضل النتائج
        </div>
      </div>
    );
  }

  if (!wyckoffData) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-600/30">
        <div className="text-center">
          <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-bold text-white mb-2">لم يتم العثور على تحليل وايكوف</h3>
          <p className="text-gray-400 mb-4">تأكد من تفعيل تحليل وايكوف من لوحة التحكم</p>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-300 text-sm">
              💡 نصيحة: قم بتفعيل خيار "تفعيل تحليل وايكوف" ثم اضغط على "تحديث التحليل"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // دوال مساعدة للألوان والأيقونات
  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy':
      case 'strong_buy':
        return 'from-green-500 to-emerald-600';
      case 'sell':
      case 'strong_sell':
        return 'from-red-500 to-red-600';
      case 'hold':
      case 'wait':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy':
      case 'strong_buy':
        return <ShoppingCartIcon className="w-8 h-8" />;
      case 'sell':
      case 'strong_sell':
        return <XMarkIcon className="w-8 h-8" />;
      case 'hold':
      case 'wait':
        return <PauseIcon className="w-8 h-8" />;
      default:
        return <InformationCircleIcon className="w-8 h-8" />;
    }
  };

  const getActionText = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy':
        return 'شراء';
      case 'strong_buy':
        return 'شراء قوي';
      case 'sell':
        return 'بيع';
      case 'strong_sell':
        return 'بيع قوي';
      case 'hold':
        return 'انتظار';
      case 'wait':
        return 'انتظار';
      default:
        return action || 'غير محدد';
    }
  };

  const getPhaseText = (phase) => {
    const phases = {
      'accumulation': 'مرحلة التجميع',
      'markup': 'مرحلة الارتفاع', 
      'distribution': 'مرحلة التوزيع',
      'markdown': 'مرحلة الانخفاض',
      're_accumulation': 'إعادة التجميع',
      'unknown': 'غير محدد'
    };
    return phases[phase] || phase;
  };

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'accumulation':
      case 're_accumulation':
        return <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />;
      case 'markup':
        return <ArrowTrendingUpIcon className="w-6 h-6 text-blue-400" />;
      case 'distribution':
        return <MinusIcon className="w-6 h-6 text-orange-400" />;
      case 'markdown':
        return <ArrowTrendingDownIcon className="w-6 h-6 text-red-400" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return <ShieldCheckIcon className="w-5 h-5 text-green-400" />;
      case 'medium':
        return <ShieldExclamationIcon className="w-5 h-5 text-yellow-400" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRiskText = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'منخفض';
      case 'medium': return 'متوسط'; 
      case 'high': return 'عالي';
      default: return risk || 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      {/* التوصية الرئيسية - بارزة */}
      <div className={`bg-gradient-to-r ${getActionColor(wyckoffData.recommended_action)} rounded-2xl p-6 text-white shadow-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="bg-white/20 p-3 rounded-full">
              {getActionIcon(wyckoffData.recommended_action)}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                التوصية: {getActionText(wyckoffData.recommended_action)}
              </h2>
              <p className="text-white/90 text-lg">
                {wyckoffData.action_reasoning || 'تحليل تقني متقدم'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{wyckoffData.confidence}%</div>
            <div className="text-white/80 text-sm">مستوى الثقة</div>
          </div>
        </div>
      </div>

      {/* معلومات أساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* المرحلة الحالية */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2 space-x-reverse">
            <ChartBarIcon className="w-6 h-6 text-purple-400" />
            <span>المرحلة الحالية</span>
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              {getPhaseIcon(wyckoffData.current_phase)}
              <div>
                <div className="text-white font-semibold text-lg">
                  {getPhaseText(wyckoffData.current_phase)}
                </div>
                <div className="text-gray-400 text-sm">
                  قوة المرحلة: {wyckoffData.phase_strength || 0}%
                </div>
              </div>
            </div>
          </div>
          
          {wyckoffData.phase_description && (
            <div className="bg-white/5 rounded-lg p-3 mt-3">
              <p className="text-gray-300 text-sm">{wyckoffData.phase_description}</p>
            </div>
          )}
        </div>

        {/* مستوى المخاطر */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2 space-x-reverse">
            <FireIcon className="w-6 h-6 text-orange-400" />
            <span>تقييم المخاطر</span>
          </h3>
          
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            {getRiskIcon(wyckoffData.risk_level)}
            <div>
              <div className="text-white font-semibold text-lg">
                مخاطر {getRiskText(wyckoffData.risk_level)}
              </div>
              <div className="text-gray-400 text-sm">
                قوة العرض/الطلب: {wyckoffData.supply_demand_strength || 0}%
              </div>
            </div>
          </div>

          {wyckoffData.volume_analysis && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">قوة الحجم:</span>
                <span className="text-white font-semibold">
                  {wyckoffData.volume_analysis.volume_strength}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* المستويات المهمة */}
      {wyckoffData.key_levels && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2 space-x-reverse">
            <BanknotesIcon className="w-6 h-6 text-green-400" />
            <span>المستويات المهمة</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wyckoffData.key_levels.support && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-green-400 text-sm font-semibold mb-1">الدعم</div>
                <div className="text-white text-lg font-bold">${wyckoffData.key_levels.support}</div>
              </div>
            )}
            
            {wyckoffData.key_levels.resistance && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
                <div className="text-red-400 text-sm font-semibold mb-1">المقاومة</div>
                <div className="text-white text-lg font-bold">${wyckoffData.key_levels.resistance}</div>
              </div>
            )}
            
            {wyckoffData.key_levels.target && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                <div className="text-blue-400 text-sm font-semibold mb-1">الهدف</div>
                <div className="text-white text-lg font-bold">${wyckoffData.key_levels.target}</div>
              </div>
            )}
            
            {wyckoffData.key_levels.stop_loss && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
                <div className="text-orange-400 text-sm font-semibold mb-1">وقف الخسارة</div>
                <div className="text-white text-lg font-bold">${wyckoffData.key_levels.stop_loss}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* التحليل متعدد الإطارات */}
      {wyckoffData.multi_timeframe && Object.keys(wyckoffData.multi_timeframe).length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-white font-bold text-lg mb-4">تحليل الإطارات الزمنية المختلفة</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(wyckoffData.multi_timeframe).map(([timeframe, data]) => (
              <div key={timeframe} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 font-semibold">{timeframe}</span>
                  <span className="text-white font-bold">{data.strength}%</span>
                </div>
                <div className="text-white text-sm">
                  {getPhaseText(data.phase)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ملاحظات إضافية */}
      {wyckoffData.notes && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <h4 className="text-blue-400 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
            <InformationCircleIcon className="w-5 h-5" />
            <span>ملاحظات التحليل</span>
          </h4>
          <p className="text-blue-200">{wyckoffData.notes}</p>
        </div>
      )}

      {/* ملخص سريع */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 border border-purple-500/30">
        <h4 className="text-white font-bold mb-2">📊 ملخص التحليل</h4>
        <div className="text-gray-300 text-sm space-y-1">
          <div>🎯 <strong>الرمز:</strong> {symbol}</div>
          <div>📈 <strong>المرحلة:</strong> {getPhaseText(wyckoffData.current_phase)}</div>
          <div>💡 <strong>التوصية:</strong> {getActionText(wyckoffData.recommended_action)}</div>
          <div>🔒 <strong>المخاطر:</strong> {getRiskText(wyckoffData.risk_level)}</div>
          <div>⚡ <strong>الثقة:</strong> {wyckoffData.confidence}%</div>
        </div>
      </div>
    </div>
  );
};