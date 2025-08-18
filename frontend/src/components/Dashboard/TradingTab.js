import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BoltIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  CpuChipIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  FireIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const TradingTab = ({ selectedSymbol, currentPrice, analysisData }) => {
  const [activeSignals, setActiveSignals] = useState([]);
  const [tradingMode, setTradingMode] = useState('manual'); // manual, semi-auto, auto
  const [openPositions, setOpenPositions] = useState([]);
  const [tradingHistory, setTradingHistory] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    priceAlerts: true,
    technicalAlerts: true,
    aiAlerts: true,
    soundEnabled: true
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('signals'); // signals, positions, history, settings

  // بيانات تجريبية للإشارات النشطة
  const mockSignals = [
    {
      id: 1,
      symbol: 'BTCUSDT',
      type: 'BUY',
      strength: 'STRONG',
      price: 43520,
      target: 45000,
      stopLoss: 42000,
      confidence: 85,
      timeframe: '4h',
      indicator: 'MACD + RSI',
      aiScore: 92,
      timestamp: new Date().toISOString(),
      status: 'active',
      reason: 'تقاطع MACD إيجابي مع RSI في منطقة ذروة البيع'
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      type: 'SELL',
      strength: 'MEDIUM',
      price: 2655,
      target: 2580,
      stopLoss: 2720,
      confidence: 72,
      timeframe: '1h',
      indicator: 'Bollinger Bands',
      aiScore: 78,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
      reason: 'السعر يلامس الحد العلوي لبولينجر باند مع تشبع شرائي'
    },
    {
      id: 3,
      symbol: 'ADAUSDT',
      type: 'BUY',
      strength: 'WEAK',
      price: 0.452,
      target: 0.475,
      stopLoss: 0.440,
      confidence: 65,
      timeframe: '15m',
      indicator: 'Support Level',
      aiScore: 68,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'pending',
      reason: 'ارتداد من مستوى دعم قوي مع حجم تداول متزايد'
    }
  ];

  // بيانات تجريبية للمراكز المفتوحة
  const mockPositions = [
    {
      id: 1,
      symbol: 'BTCUSDT',
      type: 'LONG',
      entryPrice: 42800,
      currentPrice: 43520,
      amount: 0.25,
      value: 10880,
      pnl: 180,
      pnlPercent: 1.68,
      stopLoss: 41500,
      takeProfit: 45000,
      openTime: new Date(Date.now() - 7200000).toISOString(),
      leverage: 1,
      status: 'open'
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      type: 'SHORT',
      entryPrice: 2680,
      currentPrice: 2655,
      amount: 4,
      value: 10620,
      pnl: 100,
      pnlPercent: 0.93,
      stopLoss: 2750,
      takeProfit: 2580,
      openTime: new Date(Date.now() - 5400000).toISOString(),
      leverage: 1,
      status: 'open'
    }
  ];

  // بيانات تجريبية لسجل التداول
  const mockHistory = [
    {
      id: 1,
      symbol: 'BTCUSDT',
      type: 'LONG',
      entryPrice: 41200,
      exitPrice: 42800,
      amount: 0.5,
      pnl: 800,
      pnlPercent: 3.88,
      openTime: new Date(Date.now() - 86400000).toISOString(),
      closeTime: new Date(Date.now() - 7200000).toISOString(),
      status: 'closed'
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      type: 'LONG',
      entryPrice: 2520,
      exitPrice: 2580,
      amount: 5,
      pnl: 300,
      pnlPercent: 2.38,
      openTime: new Date(Date.now() - 172800000).toISOString(),
      closeTime: new Date(Date.now() - 86400000).toISOString(),
      status: 'closed'
    }
  ];

  useEffect(() => {
    // محاكاة جلب البيانات
    setLoading(true);
    setTimeout(() => {
      setActiveSignals(mockSignals);
      setOpenPositions(mockPositions);
      setTradingHistory(mockHistory);
      setLoading(false);
    }, 1000);
  }, [selectedSymbol]);

  // مكون الإشارات النشطة
  const ActiveSignals = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2 space-x-reverse">
          <BoltIcon className="w-6 h-6 text-yellow-400" />
          <span>الإشارات النشطة</span>
        </h3>
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="text-sm text-gray-400">التحديث التلقائي</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <ArrowPathIcon className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الإشارات...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSignals.map((signal, index) => (
            <motion.div
              key={signal.id}
              className={`bg-white/5 rounded-xl p-5 border-l-4 ${
                signal.type === 'BUY' ? 'border-green-500' : 'border-red-500'
              } hover:bg-white/10 transition-all duration-300`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-lg ${
                    signal.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {signal.type === 'BUY' ? 
                      <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" /> :
                      <ArrowTrendingDownIcon className="w-6 h-6 text-red-400" />
                    }
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{signal.symbol}</h4>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className={`text-sm font-medium ${
                        signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {signal.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        signal.strength === 'STRONG' ? 'bg-green-500/20 text-green-300' :
                        signal.strength === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {signal.strength}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${signal.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    {signal.timeframe} • {new Date(signal.timestamp).toLocaleTimeString('ar-SA')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">الهدف:</span>
                  <div className="text-green-400 font-medium">${signal.target.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">وقف الخسارة:</span>
                  <div className="text-red-400 font-medium">${signal.stopLoss.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">الثقة:</span>
                  <div className="text-blue-400 font-medium">{signal.confidence}%</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">AI Score:</span>
                  <div className="text-purple-400 font-medium">{signal.aiScore}</div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <LightBulbIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">تحليل الإشارة</span>
                </div>
                <p className="text-gray-300 text-sm">{signal.reason}</p>
                <div className="flex items-center space-x-2 space-x-reverse mt-2">
                  <span className="text-gray-400 text-xs">المؤشر:</span>
                  <span className="text-cyan-400 text-xs">{signal.indicator}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className={`w-3 h-3 rounded-full ${
                    signal.status === 'active' ? 'bg-green-400 animate-pulse' :
                    signal.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-400">
                    {signal.status === 'active' ? 'نشطة' :
                     signal.status === 'pending' ? 'معلقة' : 'منتهية'}
                  </span>
                </div>

                <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  signal.type === 'BUY' 
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                }`}>
                  {signal.type === 'BUY' ? '📈 تنفيذ شراء' : '📉 تنفيذ بيع'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // مكون المراكز المفتوحة
  const OpenPositions = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2 space-x-reverse">
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
        <span>المراكز المفتوحة</span>
      </h3>

      {openPositions.length === 0 ? (
        <div className="text-center py-8">
          <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">لا توجد مراكز مفتوحة حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {openPositions.map((position, index) => (
            <motion.div
              key={position.id}
              className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-lg ${
                    position.type === 'LONG' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {position.type === 'LONG' ? 
                      <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" /> :
                      <ArrowTrendingDownIcon className="w-6 h-6 text-red-400" />
                    }
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{position.symbol}</h4>
                    <span className={`text-sm font-medium ${
                      position.type === 'LONG' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {position.type}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                  </div>
                  <div className={`text-sm ${
                    position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">سعر الدخول:</span>
                  <div className="text-white font-medium">${position.entryPrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">السعر الحالي:</span>
                  <div className="text-white font-medium">${position.currentPrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">الكمية:</span>
                  <div className="text-white font-medium">{position.amount}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">القيمة:</span>
                  <div className="text-white font-medium">${position.value.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">وقف الخسارة:</span>
                  <div className="text-red-400 font-medium">${position.stopLoss.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">جني الأرباح:</span>
                  <div className="text-green-400 font-medium">${position.takeProfit.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  فتح في: {new Date(position.openTime).toLocaleString('ar-SA')}
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded text-sm transition-colors">
                    تعديل
                  </button>
                  <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm transition-colors">
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // مكون إعدادات التداول
  const TradingSettings = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2 space-x-reverse">
        <AdjustmentsHorizontalIcon className="w-6 h-6 text-orange-400" />
        <span>إعدادات التداول</span>
      </h3>

      <div className="space-y-6">
        {/* وضع التداول */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">وضع التداول</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'manual', name: 'يدوي', desc: 'تنفيذ جميع الصفقات يدوياً', icon: EyeIcon },
              { id: 'semi-auto', name: 'شبه آلي', desc: 'إشارات تلقائية مع تأكيد يدوي', icon: CpuChipIcon },
              { id: 'auto', name: 'آلي', desc: 'تنفيذ تلقائي للإشارات', icon: BoltIcon }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTradingMode(mode.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  tradingMode === mode.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <mode.icon className={`w-8 h-8 mx-auto mb-2 ${
                  tradingMode === mode.id ? 'text-blue-400' : 'text-gray-400'
                }`} />
                <h5 className="font-semibold text-white mb-1">{mode.name}</h5>
                <p className="text-gray-400 text-sm">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* إعدادات التنبيهات */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">إعدادات التنبيهات</h4>
          <div className="space-y-4">
            {Object.entries(alertSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div>
                  <h5 className="text-white font-medium">
                    {key === 'priceAlerts' ? 'تنبيهات الأسعار' :
                     key === 'technicalAlerts' ? 'تنبيهات المؤشرات الفنية' :
                     key === 'aiAlerts' ? 'تنبيهات الذكاء الاصطناعي' :
                     'تفعيل الصوت'}
                  </h5>
                  <p className="text-gray-400 text-sm">
                    {key === 'priceAlerts' ? 'تنبيهات عند الوصول لأسعار محددة' :
                     key === 'technicalAlerts' ? 'تنبيهات المؤشرات الفنية' :
                     key === 'aiAlerts' ? 'تنبيهات توصيات الذكاء الاصطناعي' :
                     'تشغيل الأصوات للتنبيهات'}
                  </p>
                </div>
                <button
                  onClick={() => setAlertSettings(prev => ({ ...prev, [key]: !value }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    value ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* إعدادات إدارة المخاطر */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">إدارة المخاطر</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-white font-medium mb-2">الحد الأقصى للمخاطرة لكل صفقة</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="2"
                  className="flex-1"
                />
                <span className="text-blue-400 font-medium">2%</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-white font-medium mb-2">الحد الأقصى للخسارة اليومية</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="range"
                  min="5"
                  max="25"
                  defaultValue="10"
                  className="flex-1"
                />
                <span className="text-red-400 font-medium">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // شريط التبويبات الفرعية
  const SubTabs = () => (
    <div className="flex space-x-2 space-x-reverse mb-6">
      {[
        { id: 'signals', name: 'الإشارات', icon: BoltIcon },
        { id: 'positions', name: 'المراكز', icon: ChartBarIcon },
        { id: 'history', name: 'السجل', icon: ClockIcon },
        { id: 'settings', name: 'الإعدادات', icon: AdjustmentsHorizontalIcon }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setViewMode(tab.id)}
          className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-300 ${
            viewMode === tab.id
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <motion.div
        className="bg-gradient-to-r from-orange-900/30 to-amber-900/30 rounded-2xl p-6 border border-orange-500/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20">
            <BoltIcon className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">التداول الذكي قصير المدى</h2>
            <p className="text-gray-400">
              إشارات تداول مدعومة بالذكاء الاصطناعي مع إدارة المخاطر المتقدمة
            </p>
          </div>
        </div>
      </motion.div>

      {/* ملخص سريع */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">الإشارات النشطة</span>
            <BellIcon className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{activeSignals.length}</div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">المراكز المفتوحة</span>
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{openPositions.length}</div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">الربح/الخسارة اليوم</span>
            <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">+$280</div>
        </motion.div>

        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">معدل النجاح</span>
            <FireIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">78%</div>
        </motion.div>
      </div>

      {/* التبويبات الفرعية */}
      <SubTabs />

      {/* المحتوى حسب التبويب المحدد */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'signals' && <ActiveSignals />}
          {viewMode === 'positions' && <OpenPositions />}
          {viewMode === 'history' && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">سجل التداول</h3>
              <div className="text-center py-8">
                <ClockIcon className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">سجل التداول قادم قريباً...</p>
              </div>
            </div>
          )}
          {viewMode === 'settings' && <TradingSettings />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export { TradingTab };