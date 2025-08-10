import React, { useState } from 'react';
import { 
  CpuChipIcon, 
  ArrowPathIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CogIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

export const ControlCard = ({ 
  loading, 
  analysisData, 
  onRefresh, 
  selectedSymbol,
  wyckoffEnabled = true,
  wyckoffSettings = {}
}) => {
  const [interval, setInterval] = useState('1h');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60);

  const intervals = [
    { value: '1m', label: '1 دقيقة' },
    { value: '5m', label: '5 دقائق' },
    { value: '15m', label: '15 دقيقة' },
    { value: '1h', label: '1 ساعة' },
    { value: '4h', label: '4 ساعات' },
    { value: '1d', label: '1 يوم' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">لوحة التحكم</h3>
        <CpuChipIcon className="w-6 h-6 text-green-400" />
      </div>
      
      <div className="space-y-4">
        {/* Quick Actions */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'جاري التحليل...' : 'تحديث التحليل'}</span>
        </button>

        {/* Interval Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            الإطار الزمني:
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {intervals.map((int) => (
              <option key={int.value} value={int.value} className="bg-gray-800">
                {int.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auto Refresh Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">التحديث التلقائي:</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative inline-flex h-6 w-12 rounded-full transition-colors ${
              autoRefresh ? 'bg-green-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${
                autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Advanced Controls Toggle */}
        <button
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors flex items-center space-x-2 space-x-reverse"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>الإعدادات المتقدمة</span>
        </button>

        {/* Advanced Controls Panel */}
        {showAdvancedControls && (
          <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-gray-400 mb-2">إعدادات التحليل المتقدم</div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">تحليل وايكوف متعدد الإطارات:</span>
              <span className={`text-xs px-2 py-1 rounded ${
                wyckoffSettings.multi_timeframe ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {wyckoffSettings.multi_timeframe ? 'مفعل' : 'معطل'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">تحليل الحجم:</span>
              <span className={`text-xs px-2 py-1 rounded ${
                wyckoffSettings.volume_analysis ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {wyckoffSettings.volume_analysis ? 'مفعل' : 'معطل'}
              </span>
            </div>

            <div className="text-xs text-gray-300">
              الحساسية: <span className="text-white">{wyckoffSettings.sensitivity || 'متوسط'}</span>
            </div>
          </div>
        )}

        {/* Analysis Status */}
        {analysisData && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-green-500/20 rounded-lg">
              <div className="text-green-400 font-semibold">فني</div>
              <div className="text-gray-400">متاح</div>
            </div>
            <div className="text-center p-2 bg-blue-500/20 rounded-lg">
              <div className="text-blue-400 font-semibold">AI بسيط</div>
              <div className="text-gray-400">متاح</div>
            </div>
            <div className="text-center p-2 bg-purple-500/20 rounded-lg">
              <div className="text-purple-400 font-semibold">AI متقدم</div>
              <div className="text-gray-400">متاح</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};