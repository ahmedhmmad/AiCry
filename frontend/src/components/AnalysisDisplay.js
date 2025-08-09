import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// Helper functions
const getSignalColor = (signal) => {
  if (signal?.includes('BUY') || signal === 'BULLISH' || signal === 'UP') return 'text-green-400';
  if (signal?.includes('SELL') || signal === 'BEARISH' || signal === 'DOWN') return 'text-red-400';
  return 'text-yellow-400';
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value?.toFixed(1)}%`;
};

const AnalysisDisplay = ({ data, symbol }) => {
  const [activeTab, setActiveTab] = useState('technical');
  const [showDetails, setShowDetails] = useState({
    technical: false,
    simple: false,
    advanced: false
  });

  const toggleDetails = (tab) => {
    setShowDetails(prev => ({
      ...prev,
      [tab]: !prev[tab]
    }));
  };

  const tabs = [
    { id: 'technical', name: 'التحليل الفني', icon: ChartBarIcon, color: 'text-green-400' },
    { id: 'simple', name: 'AI البسيط', icon: CpuChipIcon, color: 'text-blue-400' },
    { id: 'advanced', name: 'AI المتقدم', icon: SparklesIcon, color: 'text-purple-400' }
  ];

  if (!data) {
    return (
      <div className="glass-effect rounded-2xl p-6 text-center">
        <div className="text-gray-400">لا توجد بيانات تحليل متاحة</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 space-x-reverse">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === tab.id 
                ? 'glass-effect text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon className={`w-5 h-5 ${tab.color}`} />
            <span>{tab.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-effect rounded-2xl p-6"
      >
        {activeTab === 'technical' && (
          <TechnicalAnalysisTab 
            data={data.analysis_layers?.['1_technical_analysis']} 
            showDetails={showDetails.technical}
            toggleDetails={() => toggleDetails('technical')}
          />
        )}
        
        {activeTab === 'simple' && (
          <SimpleAITab 
            data={data.analysis_layers?.['2_simple_ai']} 
            showDetails={showDetails.simple}
            toggleDetails={() => toggleDetails('simple')}
          />
        )}
        
        {activeTab === 'advanced' && (
          <AdvancedAITab 
            data={data.analysis_layers?.['3_advanced_ai']} 
            showDetails={showDetails.advanced}
            toggleDetails={() => toggleDetails('advanced')}
          />
        )}
      </motion.div>
    </div>
  );
};

// Technical Analysis Component
const TechnicalAnalysisTab = ({ data, showDetails, toggleDetails }) => {
  if (!data) {
    return <div className="text-gray-400 text-center">لا توجد بيانات تحليل فني</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">التحليل الفني التقليدي</h3>
        <button
          onClick={toggleDetails}
          className="flex items-center space-x-2 space-x-reverse text-gray-400 hover:text-white transition-colors"
        >
          {showDetails ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          <span>{showDetails ? 'إخفاء التفاصيل' : 'إظهار التفاصيل'}</span>
        </button>
      </div>

      {/* Main Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4">
          <div className="text-green-400 text-sm font-semibold mb-1">التوصية العامة</div>
          <div className="text-white text-lg font-bold">{data.overall_recommendation || 'N/A'}</div>
          <div className="text-green-300 text-sm">ثقة: {formatPercentage(data.confidence)}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4">
          <div className="text-blue-400 text-sm font-semibold mb-1">MACD</div>
          <div className={`text-lg font-bold ${getSignalColor(data.macd?.recommendation)}`}>
            {data.macd?.recommendation || 'N/A'}
          </div>
          <div className="text-blue-300 text-sm">{data.macd?.strength || 'N/A'}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4">
          <div className="text-purple-400 text-sm font-semibold mb-1">RSI</div>
          <div className={`text-lg font-bold ${getSignalColor(data.rsi?.signal)}`}>
            {data.rsi?.signal || 'N/A'}
          </div>
          <div className="text-purple-300 text-sm">قيمة: {data.rsi?.rsi?.toFixed(1) || 'N/A'}</div>
        </div>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">تفاصيل MACD</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">MACD:</span>
                  <span className="text-white">{data.macd?.macd?.toFixed(6) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Signal:</span>
                  <span className="text-white">{data.macd?.signal?.toFixed(6) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Histogram:</span>
                  <span className="text-white">{data.macd?.histogram?.toFixed(6) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">المتوسطات المتحركة</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">MA20:</span>
                  <span className="text-white">${data.moving_averages?.ma20?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MA50:</span>
                  <span className="text-white">${data.moving_averages?.ma50?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cross Signal:</span>
                  <span className={getSignalColor(data.moving_averages?.cross_signal)}>
                    {data.moving_averages?.cross_signal || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Simple AI Component  
const SimpleAITab = ({ data, showDetails, toggleDetails }) => {
  if (!data) {
    return <div className="text-gray-400 text-center">لا توجد بيانات AI بسيط</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">الذكاء الصناعي البسيط</h3>
        <button
          onClick={toggleDetails}
          className="flex items-center space-x-2 space-x-reverse text-gray-400 hover:text-white transition-colors"
        >
          {showDetails ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          <span>{showDetails ? 'إخفاء التفاصيل' : 'إظهار التفاصيل'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4">
            <div className="text-blue-400 text-sm font-semibold mb-1">التنبؤ</div>
            <div className={`text-2xl font-bold ${getSignalColor(data.prediction)}`}>
              {data.prediction === 'UP' ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ArrowTrendingUpIcon className="w-6 h-6" />
                  <span>صعود</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ArrowTrendingDownIcon className="w-6 h-6" />
                  <span>هبوط</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4">
            <div className="text-green-400 text-sm font-semibold mb-1">التوصية</div>
            <div className={`text-xl font-bold ${getSignalColor(data.recommendation)}`}>
              {data.recommendation || 'N/A'}
            </div>
            <div className="text-green-300 text-sm mt-1">{data.confidence_level || 'N/A'}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">الاحتماليات</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">صعود:</span>
                  <span className="text-green-400">{formatPercentage(data.probabilities?.up)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-400"
                    style={{ width: `${data.probabilities?.up || 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">هبوط:</span>
                  <span className="text-red-400">{formatPercentage(data.probabilities?.down)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-red-400"
                    style={{ width: `${data.probabilities?.down || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-800/50 rounded-xl p-4"
        >
          <h4 className="text-white font-semibold mb-2">التفسير</h4>
          <p className="text-gray-300 text-sm">{data.interpretation || 'لا يوجد تفسير متاح'}</p>
        </motion.div>
      )}
    </div>
  );
};

// Advanced AI Component
const AdvancedAITab = ({ data, showDetails, toggleDetails }) => {
  if (!data) {
    return <div className="text-gray-400 text-center">لا توجد بيانات AI متقدم</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">الذكاء الصناعي المتقدم</h3>
        <button
          onClick={toggleDetails}
          className="flex items-center space-x-2 space-x-reverse text-gray-400 hover:text-white transition-colors"
        >
          {showDetails ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          <span>{showDetails ? 'إخفاء التفاصيل' : 'إظهار التفاصيل'}</span>
        </button>
      </div>

      {/* Ensemble Prediction */}
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6">
        <h4 className="text-purple-400 font-semibold mb-4">النتيجة المدمجة</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-gray-400 text-sm">التنبؤ النهائي</div>
            <div className={`text-xl font-bold ${getSignalColor(data.ensemble_prediction?.final_prediction)}`}>
              {data.ensemble_prediction?.final_prediction || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">التوصية</div>
            <div className={`text-xl font-bold ${getSignalColor(data.ensemble_prediction?.recommendation)}`}>
              {data.ensemble_prediction?.recommendation || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">مستوى الثقة</div>
            <div className="text-white text-xl font-bold">
              {formatPercentage(data.ensemble_prediction?.confidence)}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-gray-400 text-sm mb-2">توزيع الاحتماليات</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>صعود:</span>
                <span className="text-green-400">{formatPercentage(data.ensemble_prediction?.probabilities?.up)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-400"
                  style={{ width: `${data.ensemble_prediction?.probabilities?.up || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>هبوط:</span>
                <span className="text-red-400">{formatPercentage(data.ensemble_prediction?.probabilities?.down)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-red-400"
                  style={{ width: `${data.ensemble_prediction?.probabilities?.down || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Agreement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">اتفاق النماذج</h4>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {data.model_agreement || 'N/A'}
            </div>
            <div className="text-sm text-gray-400">
              {data.ensemble_prediction?.consensus || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-3">تحليل الميزات</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">RSI:</span>
              <span className="text-white">{data.feature_analysis?.rsi_signal || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">MACD:</span>
              <span className="text-white">{data.feature_analysis?.macd_signal || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bollinger:</span>
              <span className="text-white">{data.feature_analysis?.bb_signal || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الاتجاه:</span>
              <span className="text-white">{data.feature_analysis?.trend_signal || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Individual Model Predictions */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-4">تنبؤات النماذج الفردية</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.individual_predictions || {}).map(([model, prediction]) => (
                <div key={model} className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-gray-400 text-sm capitalize mb-1">{model}</div>
                  <div className={`font-bold ${prediction === 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {prediction === 1 ? 'صعود' : 'هبوط'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    صعود: {data.individual_probabilities?.[model]?.up?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">التفسير المتقدم</h4>
            <p className="text-gray-300 text-sm">{data.ensemble_prediction?.interpretation || 'لا يوجد تفسير متاح'}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalysisDisplay;
