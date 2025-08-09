// components/Dashboard/ControlCard.js - محدث مع تحليل وايكوف
import React, { useState, useEffect } from 'react';
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
  onWyckoffToggle,
  wyckoffOptions = {},
  onWyckoffOptionsUpdate
}) => {
  const [interval, setInterval] = useState('1h');
  const [includeWyckoff, setIncludeWyckoff] = useState(wyckoffEnabled);
  const [multiTimeframeWyckoff, setMultiTimeframeWyckoff] = useState(wyckoffOptions.multi_timeframe_wyckoff || false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  
  // إعدادات وايكوف المتقدمة
  const [wyckoffSensitivity, setWyckoffSensitivity] = useState(wyckoffOptions.wyckoff_sensitivity || 'medium');
  const [volumeThreshold, setVolumeThreshold] = useState(wyckoffOptions.volume_threshold || 1.5);
  const [priceActionWeight, setPriceActionWeight] = useState(wyckoffOptions.price_action_weight || 0.7);
  const [analysisDepth, setAnalysisDepth] = useState(wyckoffOptions.depth || 200);
  const [detailLevel, setDetailLevel] = useState(wyckoffOptions.detail_level || 'detailed');
  const [selectedTimeframes, setSelectedTimeframes] = useState(wyckoffOptions.timeframes || ['1h', '4h', '1d']);
  
  // إعدادات التحديث التلقائي
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60); // ثواني
  const [lastRefresh, setLastRefresh] = useState(null);

  // تحديث الإعدادات عند تغيير الخيارات الخارجية
  useEffect(() => {
    setIncludeWyckoff(wyckoffEnabled);
  }, [wyckoffEnabled]);

  useEffect(() => {
    if (wyckoffOptions) {
      setMultiTimeframeWyckoff(wyckoffOptions.multi_timeframe_wyckoff || false);
      setWyckoffSensitivity(wyckoffOptions.wyckoff_sensitivity || 'medium');
      setVolumeThreshold(wyckoffOptions.volume_threshold || 1.5);
      setPriceActionWeight(wyckoffOptions.price_action_weight || 0.7);
      setAnalysisDepth(wyckoffOptions.depth || 200);
      setDetailLevel(wyckoffOptions.detail_level || 'detailed');
      setSelectedTimeframes(wyckoffOptions.timeframes || ['1h', '4h', '1d']);
    }
  }, [wyckoffOptions]);

  // التحديث التلقائي
  useEffect(() => {
    let intervalId;
    if (autoRefresh && !loading) {
      intervalId = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, loading]);

  const handleRefresh = () => {
    const options = {
      interval,
      include_wyckoff: includeWyckoff,
      multi_timeframe_wyckoff: multiTimeframeWyckoff,
      depth: analysisDepth,
      detail_level: detailLevel
    };

    // إضافة معاملات وايكوف المتقدمة إذا كان مفعلاً
    if (includeWyckoff) {
      options.wyckoff_sensitivity = wyckoffSensitivity;
      options.volume_threshold = volumeThreshold;
      options.price_action_weight = priceActionWeight;
      
      if (multiTimeframeWyckoff) {
        options.timeframes = selectedTimeframes;
      }
    }

    // تحديث الإعدادات الخارجية
    if (onWyckoffToggle) {
      onWyckoffToggle(includeWyckoff);
    }
    
    if (onWyckoffOptionsUpdate) {
      onWyckoffOptionsUpdate(options);
    }

    setLastRefresh(new Date());
    onRefresh(options);
  };

  const handleTimeframeToggle = (timeframe) => {
    setSelectedTimeframes(prev => {
      if (prev.includes(timeframe)) {
        return prev.filter(tf => tf !== timeframe);
      } else {
        return [...prev, timeframe].sort((a, b) => {
          const order = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
          return order.indexOf(a) - order.indexOf(b);
        });
      }
    });
  };

  const intervals = [
    { value: '1m', label: '1د' },
    { value: '5m', label: '5د' },
    { value: '15m', label: '15د' },
    { value: '1h', label: '1س' },
    { value: '4h', label: '4س' },
    { value: '1d', label: '1ي' }
  ];

  const wyckoffTimeframes = [
    { value: '1m', label: '1د' },
    { value: '5m', label: '5د' },
    { value: '15m', label: '15د' },
    { value: '1h', label: '1س' },
    { value: '4h', label: '4س' },
    { value: '1d', label: '1ي' },
    { value: '1w', label: '1أ' }
  ];

  const sensitivityLevels = [
    { value: 'low', label: 'منخفض', desc: 'إشارات أقل ولكن أكثر دقة' },
    { value: 'medium', label: 'متوسط', desc: 'توازن بين الدقة والتنبيهات' },
    { value: 'high', label: 'عالي', desc: 'إشارات أكثر مع احتمالية خطأ أعلى' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">لوحة التحكم المتقدمة</h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <CpuChipIcon className="w-6 h-6 text-green-400" />
          <button
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className={`p-1 rounded-lg transition-colors ${
              showAdvancedControls 
                ? 'text-purple-400 bg-purple-400/20' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="الإعدادات المتقدمة"
          >
            <CogIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* معلومات الرمز والحالة */}
        {selectedSymbol && (
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{selectedSymbol}</div>
                <div className="text-xs text-gray-400">
                  {lastRefresh && `آخر تحديث: ${lastRefresh.toLocaleTimeString('ar-SA')}`}
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh 
                      ? 'text-green-400 bg-green-400/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title={autoRefresh ? 'إيقاف التحديث التلقائي' : 'تفعيل التحديث التلقائي'}
                >
                  {autoRefresh ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </button>
                {autoRefresh && (
                  <span className="text-xs text-green-400">
                    كل {refreshInterval}ث
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* الإطار الزمني */}
        <div>
          <label className="block text-gray-400 text-sm mb-3">الإطار الزمني الأساسي</label>
          <div className="grid grid-cols-3 gap-2">
            {intervals.map((int) => (
              <button
                key={int.value}
                onClick={() => setInterval(int.value)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  interval === int.value
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
                }`}
              >
                {int.label}
              </button>
            ))}
          </div>
        </div>

        {/* تحليل وايكوف */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold flex items-center space-x-2 space-x-reverse">
            <ChartBarIcon className="w-5 h-5 text-purple-400" />
            <span>تحليل وايكوف</span>
            <button 
              className="text-gray-400 hover:text-white"
              title="تحليل وايكوف يدرس العلاقة بين السعر والحجم لتحديد مراحل السوق"
            >
              <InformationCircleIcon className="w-4 h-4" />
            </button>
          </h4>
          
          {/* تشغيل/إيقاف تحليل وايكوف */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">تفعيل تحليل وايكوف</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeWyckoff}
                onChange={(e) => setIncludeWyckoff(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          {/* إعدادات وايكوف */}
          {includeWyckoff && (
            <div className="space-y-4 pl-4 border-l-2 border-purple-400/30">
              {/* التحليل متعدد الإطارات */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">متعدد الإطارات الزمنية</span>
                  <span className="text-gray-500 text-xs">تحليل شامل عبر إطارات متعددة</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiTimeframeWyckoff}
                    onChange={(e) => setMultiTimeframeWyckoff(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {/* مستوى الحساسية */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">مستوى الحساسية</label>
                <div className="grid grid-cols-3 gap-2">
                  {sensitivityLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setWyckoffSensitivity(level.value)}
                      className={`p-2 rounded-lg text-xs transition-all ${
                        wyckoffSensitivity === level.value
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:text-white'
                      }`}
                      title={level.desc}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* الإطارات الزمنية لوايكوف */}
              {multiTimeframeWyckoff && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    الإطارات الزمنية ({selectedTimeframes.length}/7)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {wyckoffTimeframes.map((tf) => (
                      <button
                        key={tf.value}
                        onClick={() => handleTimeframeToggle(tf.value)}
                        className={`py-1 px-2 rounded text-xs transition-all ${
                          selectedTimeframes.includes(tf.value)
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* عناصر التحكم المتقدمة */}
        {showAdvancedControls && (
          <div className="border-t border-white/10 pt-4 space-y-4">
            <h4 className="text-white font-semibold text-sm flex items-center space-x-2 space-x-reverse">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>إعدادات متقدمة</span>
            </h4>
            
            {/* مستوى التفصيل */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">مستوى التفصيل</label>
              <select 
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-400 focus:outline-none"
              >
                <option value="basic" className="bg-slate-800">أساسي</option>
                <option value="detailed" className="bg-slate-800">مفصل</option>
                <option value="expert" className="bg-slate-800">خبير</option>
                <option value="full" className="bg-slate-800">كامل</option>
              </select>
            </div>

            {/* عمق التحليل */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                عمق التحليل: {analysisDepth} شمعة
              </label>
              <input
                type="range"
                min="100"
                max="500"
                value={analysisDepth}
                onChange={(e) => setAnalysisDepth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((analysisDepth - 100) / 400) * 100}%, #374151 ${((analysisDepth - 100) / 400) * 100}%, #374151 100%)`
                }}
              />
            </div>

            {/* إعدادات وايكوف المتقدمة */}
            {includeWyckoff && (
              <>
                {/* حد الحجم */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    حد الحجم: {volumeThreshold}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={volumeThreshold}
                    onChange={(e) => setVolumeThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* وزن حركة السعر */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    وزن حركة السعر: {Math.round(priceActionWeight * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.05"
                    value={priceActionWeight}
                    onChange={(e) => setPriceActionWeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* إعدادات التحديث التلقائي */}
            {autoRefresh && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  فترة التحديث التلقائي: {refreshInterval} ثانية
                </label>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="30"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* زر التحديث المحسن */}
        <button
          className="w-full bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>جاري التحليل...</span>
            </>
          ) : (
            <>
              <ArrowPathIcon className="w-5 h-5" />
              <span>
                تحديث التحليل
                {includeWyckoff && (
                  <span className="text-purple-200"> + وايكوف</span>
                )}
                {multiTimeframeWyckoff && (
                  <span className="text-blue-200"> (متعدد)</span>
                )}
              </span>
            </>
          )}
        </button>
        
        {/* معلومات الإعدادات الحالية */}
        {!loading && (
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>الإطار الزمني:</span>
                <span className="text-white">{intervals.find(i => i.value === interval)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span>تحليل وايكوف:</span>
                <span className={includeWyckoff ? 'text-green-400' : 'text-red-400'}>
                  {includeWyckoff ? `مفعل (${wyckoffSensitivity})` : 'معطل'}
                </span>
              </div>
              {includeWyckoff && multiTimeframeWyckoff && (
                <div className="flex justify-between">
                  <span>الإطارات المتعددة:</span>
                  <span className="text-blue-400">
                    {selectedTimeframes.length} إطار
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>عمق التحليل:</span>
                <span className="text-white">{analysisDepth} شمعة</span>
              </div>
            </div>
          </div>
        )}

        {/* عرض طبقات التحليل */}
        {analysisData && !analysisData.error && !loading && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">طبقات التحليل النشطة</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-green-500/20 rounded-lg">
                <div className="text-green-400 font-semibold">فني</div>
                <div className="text-xs text-gray-400">
                  {analysisData.analysis_layers?.['1_technical_analysis']?.confidence || 'N/A'}%
                </div>
              </div>
              <div className="text-center p-2 bg-blue-500/20 rounded-lg">
                <div className="text-blue-400 font-semibold">AI بسيط</div>
                <div className="text-xs text-gray-400">
                  {analysisData.analysis_layers?.['2_simple_ai']?.confidence || 'N/A'}%
                </div>
              </div>
              <div className="text-center p-2 bg-purple-500/20 rounded-lg">
                <div className="text-purple-400 font-semibold">AI متقدم</div>
                <div className="text-xs text-gray-400">
                  {analysisData.analysis_layers?.['3_advanced_ai']?.ensemble_prediction?.confidence?.toFixed(0) || 'N/A'}%
                </div>
              </div>
              {includeWyckoff && analysisData.wyckoff_analysis && (
                <div className="text-center p-2 bg-orange-500/20 rounded-lg">
                  <div className="text-orange-400 font-semibold">وايكوف</div>
                  <div className="text-xs text-gray-400">
                    {analysisData.wyckoff_analysis.confidence || 'N/A'}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* مؤشر حالة التحديث التلقائي */}
        {autoRefresh && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">
                التحديث التلقائي مفعل - التحديث القادم خلال {refreshInterval} ثانية
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};