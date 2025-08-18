import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// axios will be imported from parent component
import {
  SparklesIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BoltIcon,
  EyeIcon,
  FireIcon
} from '@heroicons/react/24/outline';

// مكون عرض المشاعر العامة
const SentimentOverview = ({ sentimentData, loading }) => {
  const getSentimentEmoji = (score) => {
    if (score >= 0.6) return '🚀';
    if (score >= 0.2) return '📈';
    if (score >= -0.2) return '⚖️';
    if (score >= -0.6) return '📉';
    return '💥';
  };

  const getSentimentColor = (score) => {
    if (score >= 0.4) return 'text-green-400';
    if (score >= 0.1) return 'text-green-300';
    if (score >= -0.1) return 'text-yellow-400';
    if (score >= -0.4) return 'text-red-300';
    return 'text-red-400';
  };

  const getSentimentText = (score) => {
    if (score >= 0.6) return 'إيجابي جداً';
    if (score >= 0.2) return 'إيجابي';
    if (score >= -0.2) return 'محايد';
    if (score >= -0.6) return 'سلبي';
    return 'سلبي جداً';
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <ArrowPathIcon className="w-6 h-6 text-purple-400 animate-spin" />
          <h3 className="text-lg font-semibold text-white">تحليل المشاعر</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/20 rounded"></div>
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sentimentData || sentimentData.error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">تحليل المشاعر</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-400">
            {sentimentData?.error || 'تحليل المشاعر غير متاح حالياً'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            يرجى التأكد من تثبيت المكتبات المطلوبة
          </p>
        </div>
      </div>
    );
  }

  const score = sentimentData.overall_sentiment?.score || 0;
  const confidence = sentimentData.overall_sentiment?.confidence || 0;

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3 space-x-reverse mb-4">
        <SparklesIcon className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">تحليل المشاعر</h3>
      </div>
      
      <div className="flex items-center space-x-4 space-x-reverse mb-4">
        <div className="text-4xl">{getSentimentEmoji(score)}</div>
        <div className="flex-1">
          <div className={`text-2xl font-bold ${getSentimentColor(score)}`}>
            {getSentimentText(score)}
          </div>
          <div className="text-sm text-gray-400">
            مستوى الثقة: {(confidence * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-white">
            {score > 0 ? '+' : ''}{score.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">النتيجة</div>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            score >= 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
            'bg-gradient-to-r from-red-400 to-red-600'
          }`}
          style={{ width: `${Math.abs(score) * 50 + 50}%` }}
        />
      </div>

      {sentimentData.quick_insights && (
        <div className="text-sm text-gray-300">
          💡 {sentimentData.quick_insights}
        </div>
      )}
    </motion.div>
  );
};

// مكون تفصيل المشاعر
const SentimentBreakdown = ({ sentimentData }) => {
  if (!sentimentData?.sentiment_breakdown) return null;

  const breakdown = sentimentData.sentiment_breakdown;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2 space-x-reverse">
        <ChartBarIcon className="w-5 h-5 text-blue-400" />
        <span>تفصيل المشاعر</span>
      </h3>
      
      <div className="space-y-4">
        {Object.entries(breakdown).map(([category, data]) => (
          <div key={category} className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white capitalize">
                {category === 'positive' ? '🟢 إيجابي' :
                 category === 'negative' ? '🔴 سلبي' : '🟡 محايد'}
              </span>
              <span className="text-white font-semibold">
                {(data.score * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  category === 'positive' ? 'bg-green-500' :
                  category === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${data.score * 100}%` }}
              />
            </div>
            
            {data.keywords && data.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.keywords.slice(0, 3).map((keyword, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// مكون مصادر المشاعر
const SentimentSources = ({ sentimentData }) => {
  if (!sentimentData?.sources_analysis) return null;

  const sources = sentimentData.sources_analysis;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2 space-x-reverse">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-400" />
        <span>مصادر التحليل</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(sources).map(([source, data]) => {
          const getSourceIcon = (sourceName) => {
            const icons = {
              'twitter': '🐦',
              'reddit': '🤖',
              'news': '📰',
              'social': '💬',
              'general': '🌐'
            };
            return icons[sourceName.toLowerCase()] || '📊';
          };

          return (
            <div key={source} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <span className="text-xl">{getSourceIcon(source)}</span>
                <span className="font-medium text-white capitalize">{source}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">النتيجة:</span>
                  <span className={`font-semibold ${
                    data.score >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data.score > 0 ? '+' : ''}{data.score.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">الثقة:</span>
                  <span className="text-white">
                    {(data.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                
                {data.trend && (
                  <div className="flex items-center space-x-2 space-x-reverse text-sm">
                    {data.trend === 'improving' ? 
                      <TrendingUpIcon className="w-4 h-4 text-green-400" /> :
                      <TrendingDownIcon className="w-4 h-4 text-red-400" />
                    }
                    <span className="text-gray-400">
                      {data.trend === 'improving' ? 'متحسن' : 'متراجع'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// مكون مؤشر ثقة المشاعر
const SentimentConfidenceIndicator = ({ confidence, compact = false }) => {
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return 'text-green-400 bg-green-400/20';
    if (conf >= 0.6) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const getConfidenceText = (conf) => {
    if (conf >= 0.8) return 'ثقة عالية';
    if (conf >= 0.6) return 'ثقة متوسطة';
    return 'ثقة منخفضة';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className={`w-3 h-3 rounded-full ${getConfidenceColor(confidence).split(' ')[1]}`} />
        <span className="text-sm text-gray-400">
          {(confidence * 100).toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div className={`px-3 py-2 rounded-lg ${getConfidenceColor(confidence)}`}>
      <div className="flex items-center space-x-2 space-x-reverse">
        <CheckCircleIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {getConfidenceText(confidence)} ({(confidence * 100).toFixed(0)}%)
        </span>
      </div>
    </div>
  );
};

// مكون تحليل المشاعر المتقدم مع الذكاء الاصطناعي
const EnhancedSentimentAnalysis = ({ selectedSymbol }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [enhancedData, setEnhancedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, sources
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchSentimentData = async () => {
    setLoading(true);
    try {
      // جلب تحليل المشاعر الأساسي
      const sentimentResponse = await axios.get(`/sentiment/${selectedSymbol}`);
      setSentimentData(sentimentResponse.data);

      // جلب التحليل المحسن إذا كان متاحاً
      try {
        const enhancedResponse = await axios.get(`/analysis/enhanced/${selectedSymbol}`);
        setEnhancedData(enhancedResponse.data);
      } catch (enhancedError) {
        console.warn('Enhanced analysis not available:', enhancedError);
      }
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      setSentimentData({ error: 'فشل في جلب تحليل المشاعر' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentimentData();
  }, [selectedSymbol]);

  // تحديث تلقائي كل 5 دقائق
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchSentimentData, 5 * 60 * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedSymbol]);

  return (
    <div className="space-y-6">
      {/* رأس القسم مع التحكم */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <SparklesIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">تحليل المشاعر المتقدم</h2>
              <p className="text-gray-400">
                تحليل ذكي لمشاعر السوق تجاه {selectedSymbol}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}
              title="التحديث التلقائي"
            >
              <BoltIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={fetchSentimentData}
              disabled={loading}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* أزرار تبديل العرض */}
        <div className="flex space-x-2 space-x-reverse mt-4">
          {[
            { id: 'overview', name: 'النظرة العامة', icon: EyeIcon },
            { id: 'detailed', name: 'التفصيل', icon: ChartBarIcon },
            { id: 'sources', name: 'المصادر', icon: ChatBubbleLeftRightIcon }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                viewMode === mode.id
                  ? 'bg-purple-500/30 text-purple-300'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span className="text-sm">{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* المحتوى الأساسي */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SentimentOverview sentimentData={sentimentData} loading={loading} />
              
              {enhancedData?.sentiment_analysis && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">تأثير على التداول</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">الوزن في القرار:</span>
                      <span className="text-white font-semibold">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">التوصية:</span>
                      <span className="text-green-400 font-semibold">
                        {enhancedData.sentiment_analysis.recommendation || 'محايد'}
                      </span>
                    </div>
                    <SentimentConfidenceIndicator 
                      confidence={enhancedData.sentiment_analysis.confidence || 0.5} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'detailed' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SentimentBreakdown sentimentData={sentimentData} />
              
              {sentimentData?.historical_trend && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">الاتجاه التاريخي</h3>
                  <div className="space-y-3">
                    {sentimentData.historical_trend.map((point, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-400">{point.period}</span>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className={`font-semibold ${
                            point.score >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {point.score > 0 ? '+' : ''}{point.score.toFixed(2)}
                          </span>
                          {point.trend === 'up' ? 
                            <TrendingUpIcon className="w-4 h-4 text-green-400" /> :
                            <TrendingDownIcon className="w-4 h-4 text-red-400" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'sources' && (
            <SentimentSources sentimentData={sentimentData} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* معلومات النظام */}
      {sentimentData && !sentimentData.error && (
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 space-x-reverse text-gray-400">
              <div className="flex items-center space-x-2 space-x-reverse">
                <ClockIcon className="w-4 h-4" />
                <span>آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <FireIcon className="w-4 h-4" />
                <span>مصادر نشطة: {Object.keys(sentimentData.sources_analysis || {}).length}</span>
              </div>
            </div>
            
            {autoRefresh && (
              <div className="flex items-center space-x-2 space-x-reverse text-green-400">
                <BoltIcon className="w-4 h-4" />
                <span>تحديث تلقائي نشط</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// المكون الرئيسي للتصدير
export {
  SentimentOverview,
  SentimentBreakdown,
  SentimentSources,
  SentimentConfidenceIndicator,
  EnhancedSentimentAnalysis
};
