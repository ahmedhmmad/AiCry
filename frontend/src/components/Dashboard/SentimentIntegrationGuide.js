import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  BoltIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// مكون دليل التكامل
const SentimentIntegrationGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const integrationSteps = [
    {
      id: 1,
      title: "تحديث مكون Dashboard الرئيسي",
      description: "إضافة دعم تحليل المشاعر للواجهة الحالية",
      code: `// تحديث ملف Dashboard.js الحالي
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EnhancedSentimentAnalysis } from './components/SentimentAnalysis';

const Dashboard = ({ selectedSymbol, analysisData, setAnalysisData }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);

  // دالة جلب تحليل المشاعر
  const fetchSentimentData = async () => {
    setSentimentLoading(true);
    try {
      const response = await axios.get(\`/sentiment/\${selectedSymbol}\`);
      setSentimentData(response.data);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      setSentimentData({ error: 'فشل في جلب تحليل المشاعر' });
    } finally {
      setSentimentLoading(false);
    }
  };

  // دالة التحليل المحسن (فني + مشاعر)
  const fetchEnhancedAnalysis = async () => {
    try {
      const response = await axios.get(\`/analysis/enhanced/\${selectedSymbol}\`);
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Enhanced analysis error:', error);
    }
  };

  useEffect(() => {
    fetchSentimentData();
    fetchEnhancedAnalysis();
  }, [selectedSymbol]);

  return (
    <div className="space-y-6">
      {/* المكونات الحالية... */}
      
      {/* إضافة مكون تحليل المشاعر */}
      <EnhancedSentimentAnalysis 
        selectedSymbol={selectedSymbol}
        sentimentData={sentimentData}
        loading={sentimentLoading}
        onRefresh={fetchSentimentData}
      />
    </div>
  );
};`,
      status: "required"
    },
    {
      id: 2,
      title: "إنشاء مكون تحليل المشاعر",
      description: "إنشاء ملف منفصل لمكونات تحليل المشاعر",
      code: `// ملف: components/SentimentAnalysis.js
import React, { useState } from 'react';
import axios from 'axios';
import { 
  SparklesIcon, 
  HeartIcon, 
  ChartBarIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export const SentimentOverview = ({ sentimentData, loading }) => {
  // المنطق من المكون السابق...
};

export const SentimentBreakdown = ({ sentimentData }) => {
  // تفصيل المشاعر حسب النوع...
};

export const SentimentSources = ({ sentimentData }) => {
  // تحليل المصادر المختلفة...
};

export const EnhancedSentimentAnalysis = ({ 
  selectedSymbol, 
  sentimentData, 
  loading, 
  onRefresh 
}) => {
  const [viewMode, setViewMode] = useState('overview');
  
  return (
    <div className="space-y-6">
      {/* واجهة تحليل المشاعر الكاملة */}
    </div>
  );
};`,
      status: "required"
    },
    {
      id: 3,
      title: "تحديث بطاقات التحليل الحالية",
      description: "دمج المشاعر في البطاقات الموجودة",
      code: `// تحديث DecisionCard لإضافة تأثير المشاعر
const EnhancedDecisionCard = ({ analysisData, sentimentData }) => {
  const getSentimentImpact = () => {
    if (!sentimentData || sentimentData.error) return null;
    
    const score = sentimentData.overall_sentiment?.score || 0;
    const isPositive = score > 0.2;
    const isNegative = score < -0.2;
    
    if (!isPositive && !isNegative) return null;
    
    return (
      <div className={\`mt-2 p-2 rounded-lg text-xs \${
        isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
      }\`}>
        <div className="flex items-center space-x-2 space-x-reverse">
          <HeartIcon className="w-3 h-3" />
          <span>
            {isPositive ? 'مشاعر إيجابية تدعم القرار' : 'مشاعر سلبية تؤثر على القرار'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      {/* المحتوى الحالي... */}
      {getSentimentImpact()}
    </div>
  );
};`,
      status: "recommended"
    },
    {
      id: 4,
      title: "إضافة endpoints جديدة",
      description: "إضافة استدعاءات API الجديدة",
      code: `// ملف: api/sentimentAPI.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

export const sentimentAPI = {
  // تحليل المشاعر الأساسي
  getSentiment: async (symbol) => {
    try {
      const response = await axios.get(\`\${BASE_URL}/sentiment/\${symbol}\`);
      return response.data;
    } catch (error) {
      console.error('Sentiment API error:', error);
      throw error;
    }
  },

  // ملخص سريع للمشاعر
  getQuickSentiment: async (symbol) => {
    try {
      const response = await axios.get(\`\${BASE_URL}/sentiment/quick/\${symbol}\`);
      return response.data;
    } catch (error) {
      console.error('Quick sentiment API error:', error);
      throw error;
    }
  },

  // التحليل المحسن (فني + مشاعر)
  getEnhancedAnalysis: async (symbol) => {
    try {
      const response = await axios.get(\`\${BASE_URL}/analysis/enhanced/\${symbol}\`);
      return response.data;
    } catch (error) {
      console.error('Enhanced analysis API error:', error);
      throw error;
    }
  },

  // التحليل الشامل
  getCompleteAnalysis: async (symbol) => {
    try {
      const response = await axios.get(\`\${BASE_URL}/analysis/complete/\${symbol}\`);
      return response.data;
    } catch (error) {
      console.error('Complete analysis API error:', error);
      throw error;
    }
  },

  // فحص صحة تحليل المشاعر
  checkSentimentHealth: async () => {
    try {
      const response = await axios.get(\`\${BASE_URL}/sentiment/health\`);
      return response.data;
    } catch (error) {
      console.error('Sentiment health check error:', error);
      throw error;
    }
  }
};`,
      status: "required"
    },
    {
      id: 5,
      title: "إضافة تبويب المشاعر المنفصل",
      description: "تبويب مخصص لتحليل المشاعر المتقدم",
      code: `// تحديث TabNavigation في Dashboard
const tabs = [
  { 
    id: 'analysis', 
    name: 'التحليل', 
    icon: ChartBarIcon, 
    color: 'from-emerald-500 to-teal-600'
  },
  { 
    id: 'sentiment', 
    name: 'المشاعر', 
    icon: HeartIcon, 
    color: 'from-pink-500 to-rose-600',
    isNew: true // مؤشر ميزة جديدة
  },
  // باقي التبويبات...
];

// في محتوى التبويبات
{activeTab === 'sentiment' && (
  <SentimentFocusTab 
    selectedSymbol={selectedSymbol}
    sentimentData={sentimentData}
    onRefresh={fetchSentimentData}
  />
)}`,
      status: "optional"
    },
    {
      id: 6,
      title: "إدارة الأخطاء والحالات",
      description: "التعامل مع حالات فشل تحليل المشاعر",
      code: `// مكون إدارة الأخطاء
const SentimentErrorHandler = ({ error, onRetry }) => {
  const getErrorMessage = (error) => {
    if (error?.response?.status === 503) {
      return {
        title: 'تحليل المشاعر غير متاح',
        message: 'يرجى تثبيت مكتبة vaderSentiment',
        action: 'pip install vaderSentiment==3.3.2'
      };
    }
    
    return {
      title: 'خطأ في تحليل المشاعر',
      message: 'حدث خطأ أثناء تحليل مشاعر السوق',
      action: 'إعادة المحاولة'
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="text-center">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <h3 className="text-xl font-semibold text-white mb-2">{errorInfo.title}</h3>
        <p className="text-gray-400 mb-4">{errorInfo.message}</p>
        
        {errorInfo.action.startsWith('pip') ? (
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <code className="text-green-400">{errorInfo.action}</code>
          </div>
        ) : (
          <button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {errorInfo.action}
          </button>
        )}
      </div>
    </div>
  );
};`,
      status: "recommended"
    },
    {
      id: 7,
      title: "تحسين تجربة المستخدم",
      description: "إضافة انيميشن ومؤثرات بصرية",
      code: `// إضافة انيميشن للمشاعر
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedSentimentIndicator = ({ score, confidence }) => {
  const getEmoji = (score) => {
    if (score >= 0.6) return '🚀';
    if (score >= 0.2) return '📈';
    if (score >= -0.2) return '⚖️';
    if (score >= -0.6) return '📉';
    return '💥';
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="text-6xl"
    >
      {getEmoji(score)}
    </motion.div>
  );
};

// شريط تقدم متحرك للمشاعر
const AnimatedSentimentBar = ({ score, type }) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
      <motion.div
        className={\`h-3 rounded-full \${
          type === 'positive' ? 'bg-gradient-to-r from-green-400 to-green-600' :
          type === 'negative' ? 'bg-gradient-to-r from-red-400 to-red-600' :
          'bg-gradient-to-r from-yellow-400 to-yellow-600'
        }\`}
        initial={{ width: 0 }}
        animate={{ width: \`\${score * 100}%\` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
};`,
      status: "optional"
    },
    {
      id: 8,
      title: "إعدادات المشاعر",
      description: "لوحة تحكم لتخصيص تحليل المشاعر",
      code: `// مكون إعدادات تحليل المشاعر
const SentimentSettings = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState({
    enableSentiment: true,
    sentimentWeight: 25, // النسبة في القرار النهائي
    autoRefresh: false,
    refreshInterval: 5, // بالدقائق
    sources: {
      twitter: true,
      reddit: true,
      news: true
    }
  });

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdate(newSettings);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">إعدادات تحليل المشاعر</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">تفعيل تحليل المشاعر</span>
          <button
            onClick={() => handleSettingChange('enableSentiment', !localSettings.enableSentiment)}
            className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${
              localSettings.enableSentiment ? 'bg-green-600' : 'bg-gray-600'
            }\`}
          >
            <span
              className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${
                localSettings.enableSentiment ? 'translate-x-6' : 'translate-x-1'
              }\`}
            />
          </button>
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            وزن المشاعر في القرار النهائي: {localSettings.sentimentWeight}%
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={localSettings.sentimentWeight}
            onChange={(e) => handleSettingChange('sentimentWeight', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <span className="text-gray-300">المصادر المفعلة:</span>
          {Object.entries(localSettings.sources).map(([source, enabled]) => (
            <div key={source} className="flex items-center justify-between">
              <span className="text-gray-400 capitalize">{source}</span>
              <button
                onClick={() => handleSettingChange('sources', {
                  ...localSettings.sources,
                  [source]: !enabled
                })}
                className={\`text-xs px-2 py-1 rounded \${
                  enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }\`}
              >
                {enabled ? 'مفعل' : 'معطل'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};`,
      status: "optional"
    }
  ];

  const markStepCompleted = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const getStepStatus = (step) => {
    if (completedSteps.includes(step.id)) return 'completed';
    if (step.status === 'required') return 'required';
    if (step.status === 'recommended') return 'recommended';
    return 'optional';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'required': return 'text-red-400 bg-red-400/20';
      case 'recommended': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/20';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* رأس الدليل */}
      <motion.div
        className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <WrenchScrewdriverIcon className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">دليل دمج تحليل المشاعر</h1>
            <p className="text-gray-400 mt-2">
              خطوات تفصيلية لإضافة تحليل المشاعر إلى مشروع التداول بالذكاء الاصطناعي
            </p>
          </div>
        </div>

        {/* إحصائيات التقدم */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{integrationSteps.length}</div>
            <div className="text-sm text-gray-400">إجمالي الخطوات</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{completedSteps.length}</div>
            <div className="text-sm text-gray-400">خطوات مكتملة</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {integrationSteps.filter(s => s.status === 'required').length}
            </div>
            <div className="text-sm text-gray-400">خطوات إجبارية</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((completedSteps.length / integrationSteps.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">نسبة الإنجاز</div>
          </div>
        </div>
      </motion.div>

      {/* قائمة الخطوات */}
      <div className="space-y-4">
        {integrationSteps.map((step, index) => {
          const status = getStepStatus(step);
          const isCurrentStep = currentStep === step.id;
          
          return (
            <motion.div
              key={step.id}
              className={`bg-white/10 backdrop-blur-md rounded-2xl border transition-all duration-300 ${
                isCurrentStep ? 'border-purple-500/50 shadow-lg shadow-purple-500/25' : 'border-white/20'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                {/* رأس الخطوة */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStepColor(status)}`}>
                      {status === 'completed' ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStepColor(status)}`}>
                      {status === 'completed' ? 'مكتمل' :
                       status === 'required' ? 'إجباري' :
                       status === 'recommended' ? 'مستحسن' : 'اختياري'}
                    </span>
                    
                    <button
                      onClick={() => setCurrentStep(currentStep === step.id ? 0 : step.id)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <CodeBracketIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* محتوى الخطوة */}
                <AnimatePresence>
                  {isCurrentStep && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse mb-3">
                          <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                          <span className="text-blue-400 font-medium">الكود المطلوب:</span>
                        </div>
                        
                        <pre className="text-sm text-gray-300 overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
                            <InformationCircleIcon className="w-4 h-4" />
                            <span>انسخ هذا الكود إلى مشروعك</span>
                          </div>
                          
                          <button
                            onClick={() => markStepCompleted(step.id)}
                            disabled={completedSteps.includes(step.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              completedSteps.includes(step.id)
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {completedSteps.includes(step.id) ? 'مكتمل ✓' : 'تمييز كمكتمل'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ملاحظات إضافية */}
      <motion.div
        className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl p-6 border border-blue-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <BoltIcon className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">ملاحظات مهمة</h3>
        </div>
        
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start space-x-3 space-x-reverse">
            <span className="text-blue-400 mt-1">•</span>
            <span>تأكد من تثبيت مكتبة <code className="bg-gray-800 px-2 py-1 rounded">vaderSentiment</code> على الخادم</span>
          </div>
          <div className="flex items-start space-x-3 space-x-reverse">
            <span className="text-blue-400 mt-1">•</span>
            <span>الخطوات المميزة بـ "إجباري" ضرورية للحصول على الوظائف الأساسية</span>
          </div>
          <div className="flex items-start space-x-3 space-x-reverse">
            <span className="text-blue-400 mt-1">•</span>
            <span>يمكن تخصيص تصميم المكونات حسب موضوع مشروعك</span>
          </div>
          <div className="flex items-start space-x-3 space-x-reverse">
            <span className="text-blue-400 mt-1">•</span>
            <span>تحليل المشاعر يعمل بشكل أفضل مع بيانات السوق الحقيقية</span>
          </div>
        </div>
      </motion.div>

      {/* شريط التقدم النهائي */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">التقدم الإجمالي</span>
          <span className="text-gray-400">
            {completedSteps.length} من {integrationSteps.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedSteps.length / integrationSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default SentimentIntegrationGuide;
