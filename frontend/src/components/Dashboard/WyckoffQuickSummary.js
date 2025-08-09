import React from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export const WyckoffQuickSummary = ({ wyckoffData, symbol, currentPrice }) => {
  if (!wyckoffData) return null;

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy':
      case 'strong_buy':
        return 'border-green-500 bg-green-500/10 text-green-400';
      case 'sell':
      case 'strong_sell':
        return 'border-red-500 bg-red-500/10 text-red-400';
      case 'hold':
      case 'wait':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy':
      case 'strong_buy':
        return <CheckCircleIcon className="w-6 h-6" />;
      case 'sell':
      case 'strong_sell':
        return <XCircleIcon className="w-6 h-6" />;
      case 'hold':
      case 'wait':
        return <ClockIcon className="w-6 h-6" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6" />;
    }
  };

  const getActionText = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy': return 'اشتري الآن';
      case 'strong_buy': return 'اشتري بقوة';
      case 'sell': return 'بيع';
      case 'strong_sell': return 'بيع فوري';
      case 'hold': return 'انتظر';
      case 'wait': return 'انتظر';
      default: return action || 'غير واضح';
    }
  };

  const getPhaseEmoji = (phase) => {
    switch (phase) {
      case 'accumulation': return '📈';
      case 'markup': return '🚀';
      case 'distribution': return '⚖️';
      case 'markdown': return '📉';
      case 're_accumulation': return '🔄';
      default: return '❓';
    }
  };

  const getPhaseText = (phase) => {
    const phases = {
      'accumulation': 'التجميع',
      'markup': 'الارتفاع', 
      'distribution': 'التوزيع',
      'markdown': 'الانخفاض',
      're_accumulation': 'إعادة التجميع',
      'unknown': 'غير محدد'
    };
    return phases[phase] || phase;
  };

  const calculatePotentialProfit = () => {
    if (wyckoffData.key_levels?.target && currentPrice) {
      const target = parseFloat(wyckoffData.key_levels.target);
      const current = parseFloat(currentPrice);
      const profit = ((target - current) / current * 100).toFixed(1);
      return profit > 0 ? `+${profit}%` : `${profit}%`;
    }
    return null;
  };

  const potentialProfit = calculatePotentialProfit();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">⚡ ملخص سريع - {symbol}</h3>
        <div className="text-xs text-gray-400">
          ثقة {wyckoffData.confidence}%
        </div>
      </div>

      {/* التوصية الرئيسية */}
      <div className={`border-2 rounded-lg p-4 mb-4 ${getActionColor(wyckoffData.recommended_action)}`}>
        <div className="flex items-center space-x-3 space-x-reverse">
          {getActionIcon(wyckoffData.recommended_action)}
          <div className="flex-1">
            <div className="font-bold text-lg">
              {getActionText(wyckoffData.recommended_action)}
            </div>
            <div className="text-sm opacity-80">
              {wyckoffData.action_reasoning?.substring(0, 80) || 'تحليل وايكوف متقدم'}...
            </div>
          </div>
        </div>
      </div>

      {/* معلومات سريعة */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">المرحلة</div>
          <div className="text-white font-semibold text-sm flex items-center space-x-1 space-x-reverse">
            <span>{getPhaseEmoji(wyckoffData.current_phase)}</span>
            <span>{getPhaseText(wyckoffData.current_phase)}</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">المخاطر</div>
          <div className={`font-semibold text-sm ${
            wyckoffData.risk_level === 'LOW' ? 'text-green-400' :
            wyckoffData.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {wyckoffData.risk_level === 'LOW' ? '🟢 منخفض' :
             wyckoffData.risk_level === 'MEDIUM' ? '🟡 متوسط' : '🔴 عالي'}
          </div>
        </div>
      </div>

      {/* النقاط الرئيسية */}
      {wyckoffData.key_levels && (
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-sm mb-2">🎯 النقاط المهمة:</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {wyckoffData.key_levels.support && (
              <div className="flex justify-between bg-green-500/10 rounded px-2 py-1">
                <span className="text-green-400">الدعم:</span>
                <span className="text-white font-bold">${wyckoffData.key_levels.support}</span>
              </div>
            )}
            
            {wyckoffData.key_levels.resistance && (
              <div className="flex justify-between bg-red-500/10 rounded px-2 py-1">
                <span className="text-red-400">المقاومة:</span>
                <span className="text-white font-bold">${wyckoffData.key_levels.resistance}</span>
              </div>
            )}
            
            {wyckoffData.key_levels.target && (
              <div className="flex justify-between bg-blue-500/10 rounded px-2 py-1">
                <span className="text-blue-400">الهدف:</span>
                <span className="text-white font-bold">${wyckoffData.key_levels.target}</span>
              </div>
            )}
            
            {wyckoffData.key_levels.stop_loss && (
              <div className="flex justify-between bg-orange-500/10 rounded px-2 py-1">
                <span className="text-orange-400">إيقاف:</span>
                <span className="text-white font-bold">${wyckoffData.key_levels.stop_loss}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* الربح المحتمل */}
      {potentialProfit && (
        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-400 text-sm">الربح المحتمل:</span>
            <span className={`font-bold ${
              potentialProfit.startsWith('+') ? 'text-green-400' : 'text-red-400'
            }`}>
              {potentialProfit}
            </span>
          </div>
        </div>
      )}

      {/* خلاصة بسيطة */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-300 text-center">
          {wyckoffData.recommended_action?.toLowerCase() === 'buy' && '💡 الوضع إيجابي للشراء'}
          {wyckoffData.recommended_action?.toLowerCase() === 'sell' && '⚠️ فكر في البيع'}
          {wyckoffData.recommended_action?.toLowerCase() === 'hold' && '⏳ انتظر لفرصة أفضل'}
        </div>
      </div>
    </div>
  );
};