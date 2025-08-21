import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const TechnicalIndicatorsDisplay = ({ analysisData, showValues = true }) => {
  const [expandedIndicator, setExpandedIndicator] = useState(null);
  const [showCalculations, setShowCalculations] = useState(false);

  // استخراج بيانات المؤشرات الفنية
  const technicalData = analysisData?.analysis_layers?.['1_technical_analysis'] || {};
  
  // قيم المؤشرات (محاكاة بيانات حقيقية)
  const indicators = {
    rsi: {
      value: technicalData.rsi?.value || Math.round(Math.random() * 40 + 30), // 30-70
      signal: technicalData.rsi?.signal || (Math.random() > 0.5 ? 'neutral' : 'oversold'),
      interpretation: technicalData.rsi?.interpretation || "في المنطقة المحايدة",
      color: 'text-purple-400',
      thresholds: { oversold: 30, overbought: 70 }
    },
    macd: {
      line: technicalData.macd?.macd_line || (Math.random() - 0.5) * 20,
      signal: technicalData.macd?.signal_line || (Math.random() - 0.5) * 18,
      histogram: technicalData.macd?.histogram || (Math.random() - 0.5) * 5,
      trend: technicalData.macd?.trend || (Math.random() > 0.5 ? 'bullish' : 'bearish'),
      color: 'text-cyan-400'
    },
    movingAverages: {
      ma20: technicalData.moving_averages?.ma20 || 45000 + Math.random() * 5000,
      ma50: technicalData.moving_averages?.ma50 || 44000 + Math.random() * 6000,
      ma200: technicalData.moving_averages?.ma200 || 42000 + Math.random() * 8000,
      currentPrice: analysisData?.current_price || 46000,
      color: 'text-green-400'
    },
    bollingerBands: {
      upper: technicalData.bollinger?.upper || 47000 + Math.random() * 1000,
      middle: technicalData.bollinger?.middle || 46000 + Math.random() * 500,
      lower: technicalData.bollinger?.lower || 45000 + Math.random() * 1000,
      position: technicalData.bollinger?.position || Math.random(),
      color: 'text-yellow-400'
    },
    stochastic: {
      k: technicalData.stochastic?.k || Math.round(Math.random() * 100),
      d: technicalData.stochastic?.d || Math.round(Math.random() * 100),
      signal: technicalData.stochastic?.signal || 'neutral',
      color: 'text-orange-400'
    }
  };

  const getStatusColor = (value, type) => {
    switch (type) {
      case 'rsi':
        if (value >= 70) return 'text-red-400';
        if (value <= 30) return 'text-green-400';
        return 'text-yellow-400';
      case 'macd':
        return value > 0 ? 'text-green-400' : 'text-red-400';
      case 'stochastic':
        if (value >= 80) return 'text-red-400';
        if (value <= 20) return 'text-green-400';
        return 'text-yellow-400';
      default:
        return 'text-white';
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'bullish':
      case 'oversold':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />;
      case 'bearish':
      case 'overbought':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-yellow-400"></div>;
    }
  };

  const formatNumber = (num, decimals = 2) => {
    if (typeof num !== 'number') return 'N/A';
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <ChartBarIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-bold text-white">📊 المؤشرات الفنية التفصيلية</h3>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => setShowCalculations(!showCalculations)}
            className={`flex items-center space-x-1 space-x-reverse px-3 py-1 rounded-lg text-xs transition-all ${
              showCalculations 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50'
            }`}
          >
            <BeakerIcon className="w-4 h-4" />
            <span>الحسابات</span>
          </button>
        </div>
      </div>

      {/* RSI Indicator */}
      <motion.div 
        className="bg-white/5 rounded-xl p-4 border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span className="text-white font-semibold">RSI (Relative Strength Index)</span>
            <button
              onClick={() => setExpandedIndicator(expandedIndicator === 'rsi' ? null : 'rsi')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <InformationCircleIcon className="w-4 h-4" />
            </button>
          </div>
          {getSignalIcon(indicators.rsi.signal)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">القيمة الحالية</div>
            <div className={`text-2xl font-bold ${getStatusColor(indicators.rsi.value, 'rsi')}`}>
              {indicators.rsi.value}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">التفسير</div>
            <div className="text-sm text-white">
              {indicators.rsi.value >= 70 ? 'ذروة شراء' :
               indicators.rsi.value <= 30 ? 'ذروة بيع' : 'محايد'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">القوة</div>
            <div className="text-sm text-white">
              {Math.abs(indicators.rsi.value - 50) > 20 ? 'قوي' : 
               Math.abs(indicators.rsi.value - 50) > 10 ? 'متوسط' : 'ضعيف'}
            </div>
          </div>
        </div>

        {/* RSI Visual Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>0</span>
            <span>30</span>
            <span>50</span>
            <span>70</span>
            <span>100</span>
          </div>
          <div className="relative w-full h-3 bg-gray-700 rounded-full">
            {/* Zones */}
            <div className="absolute left-0 w-[30%] h-full bg-green-600/30 rounded-l-full"></div>
            <div className="absolute right-0 w-[30%] h-full bg-red-600/30 rounded-r-full"></div>
            
            {/* Current Position */}
            <div 
              className="absolute w-3 h-3 bg-purple-400 rounded-full transform -translate-x-1/2"
              style={{ left: `${indicators.rsi.value}%` }}
            ></div>
          </div>
        </div>

        <AnimatePresence>
          {expandedIndicator === 'rsi' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-white/5 rounded-lg"
            >
              <div className="text-xs text-gray-300 space-y-1">
                <div><strong>الفترة:</strong> 14 شمعة</div>
                <div><strong>ذروة البيع:</strong> أقل من 30 (فرصة شراء)</div>
                <div><strong>ذروة الشراء:</strong> أكبر من 70 (فرصة بيع)</div>
                <div><strong>المنطقة المحايدة:</strong> 30-70</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MACD Indicator */}
      <motion.div 
        className="bg-white/5 rounded-xl p-4 border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            <span className="text-white font-semibold">MACD (Moving Average Convergence Divergence)</span>
            <button
              onClick={() => setExpandedIndicator(expandedIndicator === 'macd' ? null : 'macd')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <InformationCircleIcon className="w-4 h-4" />
            </button>
          </div>
          {getSignalIcon(indicators.macd.trend)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">MACD Line</div>
            <div className={`text-lg font-bold ${getStatusColor(indicators.macd.line, 'macd')}`}>
              {formatNumber(indicators.macd.line, 4)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Signal Line</div>
            <div className={`text-lg font-bold ${getStatusColor(indicators.macd.signal, 'macd')}`}>
              {formatNumber(indicators.macd.signal, 4)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">Histogram</div>
            <div className={`text-lg font-bold ${getStatusColor(indicators.macd.histogram, 'macd')}`}>
              {formatNumber(indicators.macd.histogram, 4)}
            </div>
          </div>
        </div>

        <div className="mt-3 p-2 bg-white/5 rounded text-center">
          <div className="text-xs text-gray-400 mb-1">إشارة MACD</div>
          <div className={`text-sm font-medium ${
            indicators.macd.line > indicators.macd.signal ? 'text-green-400' : 'text-red-400'
          }`}>
            {indicators.macd.line > indicators.macd.signal ? 
              '🔺 MACD فوق الإشارة - إتجاه صاعد' : 
              '🔻 MACD تحت الإشارة - إتجاه هابط'}
          </div>
        </div>

        <AnimatePresence>
          {expandedIndicator === 'macd' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-white/5 rounded-lg"
            >
              <div className="text-xs text-gray-300 space-y-1">
                <div><strong>EMA السريع:</strong> 12 فترة</div>
                <div><strong>EMA البطيء:</strong> 26 فترة</div>
                <div><strong>خط الإشارة:</strong> EMA 9 فترات من MACD</div>
                <div><strong>Histogram:</strong> MACD - Signal Line</div>
                <div><strong>إشارة الشراء:</strong> عندما يعبر MACD فوق خط الإشارة</div>
                <div><strong>إشارة البيع:</strong> عندما يعبر MACD تحت خط الإشارة</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Moving Averages */}
      <motion.div 
        className="bg-white/5 rounded-xl p-4 border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-white font-semibold">المتوسطات المتحركة</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">السعر الحالي</div>
            <div className="text-lg font-bold text-white">
              ${formatNumber(indicators.movingAverages.currentPrice, 0)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">MA20</div>
            <div className={`text-lg font-bold ${
              indicators.movingAverages.currentPrice > indicators.movingAverages.ma20 ? 
              'text-green-400' : 'text-red-400'
            }`}>
              ${formatNumber(indicators.movingAverages.ma20, 0)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">MA50</div>
            <div className={`text-lg font-bold ${
              indicators.movingAverages.currentPrice > indicators.movingAverages.ma50 ? 
              'text-green-400' : 'text-red-400'
            }`}>
              ${formatNumber(indicators.movingAverages.ma50, 0)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">MA200</div>
            <div className={`text-lg font-bold ${
              indicators.movingAverages.currentPrice > indicators.movingAverages.ma200 ? 
              'text-green-400' : 'text-red-400'
            }`}>
              ${formatNumber(indicators.movingAverages.ma200, 0)}
            </div>
          </div>
        </div>

        <div className="mt-3 p-2 bg-white/5 rounded text-center">
          <div className="text-xs text-gray-400 mb-1">الاتجاه العام</div>
          <div className={`text-sm font-medium ${
            indicators.movingAverages.currentPrice > indicators.movingAverages.ma20 &&
            indicators.movingAverages.ma20 > indicators.movingAverages.ma50 &&
            indicators.movingAverages.ma50 > indicators.movingAverages.ma200 ? 
            'text-green-400' : 
            indicators.movingAverages.currentPrice < indicators.movingAverages.ma20 &&
            indicators.movingAverages.ma20 < indicators.movingAverages.ma50 &&
            indicators.movingAverages.ma50 < indicators.movingAverages.ma200 ? 
            'text-red-400' : 'text-yellow-400'
          }`}>
            {indicators.movingAverages.currentPrice > indicators.movingAverages.ma20 &&
             indicators.movingAverages.ma20 > indicators.movingAverages.ma50 &&
             indicators.movingAverages.ma50 > indicators.movingAverages.ma200 ? 
             '🚀 اتجاه صاعد قوي - جميع المتوسطات مرتبة صاعدياً' :
             indicators.movingAverages.currentPrice < indicators.movingAverages.ma20 &&
             indicators.movingAverages.ma20 < indicators.movingAverages.ma50 &&
             indicators.movingAverages.ma50 < indicators.movingAverages.ma200 ? 
             '📉 اتجاه هابط قوي - جميع المتوسطات مرتبة هابطياً' : 
             '⚡ اتجاه مختلط - انتظار إشارة أوضح'}
          </div>
        </div>
      </motion.div>

      {/* Bollinger Bands */}
      <motion.div 
        className="bg-white/5 rounded-xl p-4 border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-white font-semibold">بولينجر باندز</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">الحد العلوي</div>
            <div className="text-lg font-bold text-red-400">
              ${formatNumber(indicators.bollingerBands.upper, 0)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">الوسط (MA20)</div>
            <div className="text-lg font-bold text-white">
              ${formatNumber(indicators.bollingerBands.middle, 0)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">الحد السفلي</div>
            <div className="text-lg font-bold text-green-400">
              ${formatNumber(indicators.bollingerBands.lower, 0)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">الموقع %</div>
            <div className="text-lg font-bold text-yellow-400">
              {formatNumber(indicators.bollingerBands.position * 100, 1)}%
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>السفلي</span>
            <span>الوسط</span>
            <span>العلوي</span>
          </div>
          <div className="relative w-full h-3 bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 rounded-full">
            <div 
              className="absolute w-3 h-3 bg-white rounded-full transform -translate-x-1/2 border-2 border-gray-800"
              style={{ left: `${indicators.bollingerBands.position * 100}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Stochastic Oscillator */}
      <motion.div 
        className="bg-white/5 rounded-xl p-4 border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span className="text-white font-semibold">مؤشر ستوكاستيك</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">%K خط</div>
            <div className={`text-lg font-bold ${getStatusColor(indicators.stochastic.k, 'stochastic')}`}>
              {indicators.stochastic.k}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">%D خط</div>
            <div className={`text-lg font-bold ${getStatusColor(indicators.stochastic.d, 'stochastic')}`}>
              {indicators.stochastic.d}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-1">الإشارة</div>
            <div className="text-sm text-white">
              {indicators.stochastic.k >= 80 ? 'ذروة شراء' :
               indicators.stochastic.k <= 20 ? 'ذروة بيع' : 'محايد'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Calculation Details */}
      <AnimatePresence>
        {showCalculations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30"
          >
            <h4 className="text-purple-400 font-bold mb-3 flex items-center space-x-2 space-x-reverse">
              <BeakerIcon className="w-5 h-5" />
              <span>🧮 تفاصيل الحسابات</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-purple-300 font-semibold mb-2">RSI Calculation:</div>
                <div className="text-gray-300 space-y-1">
                  <div>RS = Average Gain / Average Loss</div>
                  <div>RSI = 100 - (100 / (1 + RS))</div>
                  <div>Period: 14 candles</div>
                  <div>Current Value: {indicators.rsi.value}</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-cyan-300 font-semibold mb-2">MACD Calculation:</div>
                <div className="text-gray-300 space-y-1">
                  <div>MACD = EMA(12) - EMA(26)</div>
                  <div>Signal = EMA(9) of MACD</div>
                  <div>Histogram = MACD - Signal</div>
                  <div>Current MACD: {formatNumber(indicators.macd.line, 4)}</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-green-300 font-semibold mb-2">Moving Averages:</div>
                <div className="text-gray-300 space-y-1">
                  <div>SMA = Sum(prices) / Period</div>
                  <div>EMA = (Price × α) + (Previous EMA × (1-α))</div>
                  <div>α = 2 / (Period + 1)</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-yellow-300 font-semibold mb-2">Bollinger Bands:</div>
                <div className="text-gray-300 space-y-1">
                  <div>Middle = SMA(20)</div>
                  <div>Upper = Middle + (2 × StdDev)</div>
                  <div>Lower = Middle - (2 × StdDev)</div>
                  <div>Position = (Price - Lower) / (Upper - Lower)</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicalIndicatorsDisplay;