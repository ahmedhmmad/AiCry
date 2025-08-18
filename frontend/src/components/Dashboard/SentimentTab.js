import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  FaceSmileIcon,
  FaceFrownIcon,
  ExclamationTriangleIcon,
  FireIcon,
  BeakerIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  SparklesIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const SentimentTab = ({ selectedSymbol = 'BTCUSDT', currentPrice = null }) => {
  // States
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [hasRealData, setHasRealData] = useState(false);
  const [dataAvailability, setDataAvailability] = useState({
    basic: false,
    sources: false,
    advanced: false
  });
  const [analysisType, setAnalysisType] = useState('standard');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedSources, setSelectedSources] = useState({
    twitter: true,
    reddit: true,
    news: true,
    telegram: false
  });

  // Utility functions
  const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || isNaN(value)) return defaultValue;
    return Number(value);
  };

  const safeToFixed = (value, decimals = 1, defaultValue = 0) => {
    const num = safeNumber(value, defaultValue);
    return num.toFixed(decimals);
  };

  // Backend status check
  const checkBackendStatus = useCallback(async () => {
    try {
      const response = await axios.get('/sentiment/health');
      setBackendStatus(response.data.sentiment_system);
      return response.data.sentiment_system === 'healthy' || response.data.sentiment_system === 'operational';
    } catch (error) {
      console.log('Backend sentiment check:', error.response?.data || error.message);
      setBackendStatus('unavailable');
      return false;
    }
  }, []);

  // Fetch sentiment data
  const fetchSentimentData = useCallback(async () => {
    if (!selectedSymbol) return;

    setLoading(true);
    setError(null);

    try {
      setHasRealData(true);
      console.log(`🔄 Fetching ${analysisType} sentiment data for ${selectedSymbol}...`);
      
      const response = await fetch(`/api/sentiment/${selectedSymbol}?analysis_type=${analysisType}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const processedData = {
        ...data,
        overall_score: data.overall_score || 50,
        trend: data.trend || 'neutral',
        confidence: data.confidence || 30,
        sources: data.sources && Object.keys(data.sources).length > 0 ? data.sources : null,
        enhanced_features: data.enhanced_features || null,
        sources_available: data.sources ? Object.keys(data.sources).length : 0,
        timestamp: data.timestamp || new Date().toISOString(),
        analysis_type: data.analysis_type || analysisType
      };

      setSentimentData(processedData);
      setLastUpdate(new Date().toLocaleTimeString('ar-SA'));

    } catch (error) {
      setHasRealData(false);
      console.error('❌ Error fetching sentiment data:', error);
      setError(error.message);
      
      setSentimentData({
        symbol: selectedSymbol,
        overall_score: 50,
        trend: 'neutral',
        confidence: 30,
        sources: {
          fallback: {
            sentiment_score: 50,
            trend: 'neutral',
            confidence: 30,
            note: 'Fallback data - API error'
          }
        },
        enhanced_features: {
          market_psychology: {
            greed_level: 50,
            fear_level: 50,
            market_activity: 'low'
          },
          sentiment_momentum: {
            momentum_score: 0,
            trend_direction: 'stable',
            data_volume: 0
          },
          fear_greed_index: {
            index_value: 50,
            level: 'Neutral',
            interpretation: 'No data available'
          }
        },
        analysis_type: 'fallback',
        error_reason: error.message,
        note: 'Failed to fetch real sentiment data',
        timestamp: new Date().toISOString(),
        sources_available: 1
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, analysisType]);

  // Fetch sources data
  const fetchSourcesData = useCallback(async () => {
    if (!selectedSymbol) return;

    setLoading(true);
    setError(null);

    try {
      setHasRealData(true);
      const params = new URLSearchParams({
        include_twitter: selectedSources.twitter,
        include_reddit: selectedSources.reddit,
        include_news: selectedSources.news
      });

      const response = await fetch(`/api/sentiment/${selectedSymbol}/sources?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const processedData = {
        symbol: selectedSymbol,
        sources: data.sources || {},
        analysis_type: 'sources',
        timestamp: data.timestamp || new Date().toISOString(),
        requested_sources: data.requested_sources || selectedSources,
        summary: data.summary || {},
        sources_available: data.sources ? Object.keys(data.sources).length : 0,
        overall_score: data.summary?.average_score || 50,
        trend: data.summary?.consensus || 'neutral',
        confidence: data.sources ? Math.min(...Object.values(data.sources).map(s => s.confidence || 50)) : 30
      };

      setSentimentData(processedData);
      setLastUpdate(new Date().toLocaleTimeString('ar-SA'));

    } catch (error) {
      setHasRealData(false);
      console.error('❌ Error fetching sources sentiment data:', error);
      setError(error.message);
      
      const mockSources = {};
      if (selectedSources.twitter) {
        mockSources.twitter = {
          sentiment_score: 50 + Math.random() * 20 - 10,
          trend: 'neutral',
          confidence: 40,
          posts_analyzed: 0,
          note: 'Mock data - API error'
        };
      }
      if (selectedSources.reddit) {
        mockSources.reddit = {
          sentiment_score: 50 + Math.random() * 20 - 10,
          trend: 'neutral',
          confidence: 40,
          posts_analyzed: 0,
          note: 'Mock data - API error'
        };
      }
      if (selectedSources.news) {
        mockSources.news = {
          sentiment_score: 50 + Math.random() * 20 - 10,
          trend: 'neutral',
          confidence: 40,
          articles_analyzed: 0,
          note: 'Mock data - API error'
        };
      }
      
      setSentimentData({
        symbol: selectedSymbol,
        sources: mockSources,
        analysis_type: 'sources_fallback',
        error_reason: error.message,
        timestamp: new Date().toISOString(),
        sources_available: Object.keys(mockSources).length
      });
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, selectedSources]);

  // Process sentiment data
  const processSentimentData = useCallback((data, source) => {
    if (!data || typeof data !== 'object') {
      setDataAvailability({ basic: false, sources: false, advanced: false });
      return null;
    }

    const hasBasicData = (
      data.overall_score !== undefined || 
      data.sentiment_score !== undefined ||
      data.confidence !== undefined ||
      data.trend !== undefined
    );

    const hasSourcesData = data.sources && 
      Object.keys(data.sources).length > 0 &&
      Object.values(data.sources).some(source => 
        source && (source.score !== undefined || source.volume !== undefined)
      );

    const hasAdvancedData = (
      data.enhanced_features ||
      data.whale_activity ||
      data.fear_greed_index !== undefined ||
      data.social_volume !== undefined
    );

    setDataAvailability({
      basic: hasBasicData,
      sources: hasSourcesData,
      advanced: hasAdvancedData
    });

    if (!hasBasicData) return null;

    let processedData = {
      symbol: selectedSymbol,
      overall_score: null,
      trend: null,
      confidence: null,
      sources: hasSourcesData ? {} : null,
      fear_greed_index: null,
      social_volume: null,
      trending_keywords: [],
      market_sentiment_history: generateDefaultHistory(),
      whale_activity: null,
      institutional_sentiment: null,
      last_updated: new Date().toISOString(),
      data_source: source,
      has_basic_data: hasBasicData,
      has_sources_data: hasSourcesData,
      has_advanced_data: hasAdvancedData
    };

    if (data.overall_score !== undefined) {
      processedData.overall_score = safeNumber(data.overall_score);
    } else if (data.sentiment_score !== undefined) {
      processedData.overall_score = safeNumber(data.sentiment_score);
    }
    
    if (data.trend) {
      processedData.trend = data.trend;
    }
    
    if (data.confidence !== undefined) {
      processedData.confidence = safeNumber(data.confidence);
    }

    if (hasSourcesData && data.sources) {
      processedData.sources = {};
      
      ['twitter', 'reddit', 'news', 'telegram'].forEach(sourceKey => {
        if (data.sources[sourceKey]) {
          const source = data.sources[sourceKey];
          processedData.sources[sourceKey] = {
            score: source.score !== undefined ? safeNumber(source.score) : null,
            volume: source.volume !== undefined ? safeNumber(source.volume) : null,
            trend: source.trend || null
          };
        }
      });
    }

    if (hasAdvancedData) {
      if (data.enhanced_features) {
        const features = data.enhanced_features;
        
        if (features.fear_greed_index && features.fear_greed_index.index_value !== undefined) {
          processedData.fear_greed_index = Math.round(features.fear_greed_index.index_value);
        }
        
        if (features.whale_activity) {
          processedData.whale_activity = features.whale_activity;
        }
      }

      if (data.social_volume !== undefined) {
        processedData.social_volume = safeNumber(data.social_volume);
      }

      if (data.fear_greed_index !== undefined) {
        processedData.fear_greed_index = safeNumber(data.fear_greed_index);
      }
    }

    if (source === 'quick' && data.summary) {
      const summary = data.summary.toLowerCase();
      if (summary.includes('إيجابي') || summary.includes('bullish')) {
        if (processedData.overall_score === null) processedData.overall_score = 70;
        if (processedData.trend === null) processedData.trend = 'bullish';
      } else if (summary.includes('سلبي') || summary.includes('bearish')) {
        if (processedData.overall_score === null) processedData.overall_score = 30;
        if (processedData.trend === null) processedData.trend = 'bearish';
      }
    }

    if (data.current_price || currentPrice) {
      processedData.current_price = safeNumber(data.current_price || currentPrice);
    }

    return processedData;
  }, [selectedSymbol, currentPrice]);

  // Generate default history
  const generateDefaultHistory = useCallback(() => {
    return Array.from({length: 24}, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      sentiment: 45 + Math.random() * 20,
      volume: 800 + Math.random() * 400
    }));
  }, []);

  // Effects
  useEffect(() => {
    const initializeData = async () => {
      await checkBackendStatus();
      await fetchSentimentData();
    };
    
    initializeData();
  }, [selectedSymbol, checkBackendStatus, fetchSentimentData]);

  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        fetchSentimentData();
      }, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [isLive, selectedSymbol, fetchSentimentData]);

  // Sub-components
  const DataAvailabilityStatus = () => (
    <motion.div 
      className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center space-x-3 space-x-reverse">
        <InformationCircleIcon className="w-6 h-6 text-blue-400" />
        <div>
          <h4 className="text-blue-400 font-semibold">حالة البيانات</h4>
          <p className="text-blue-300 text-sm">
            {dataAvailability.basic ? 'البيانات الأساسية متوفرة' : 'البيانات الأساسية غير متوفرة'} • 
            {dataAvailability.sources ? ' المصادر متوفرة' : ' المصادر غير متوفرة'} • 
            {dataAvailability.advanced ? ' الميزات المتقدمة متوفرة' : ' الميزات المتقدمة غير متوفرة'}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // مكون بطاقة المشاعر
  const SentimentCard = ({ title = '', score = null, trend = null, icon: Icon, color = 'from-gray-700 to-gray-800', details = {} }) => {
    const getScoreColor = (score) => {
      if (score === null || score === undefined) return 'text-gray-400';
      const safeScore = safeNumber(score, 0);
      if (safeScore >= 80) return 'text-green-400';
      if (safeScore >= 60) return 'text-yellow-400';
      if (safeScore >= 40) return 'text-orange-400';
      return 'text-red-400';
    };

    const displayScore = score !== null && score !== undefined ? safeToFixed(score, 1) : '--';

    return (
      <motion.div 
        className={`bg-gradient-to-br ${color} rounded-xl p-6 border border-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/30`}
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            {Icon && <Icon className="w-6 h-6 text-white" />}
            <h3 className="text-white font-semibold">{title}</h3>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {displayScore}
            </div>
            <div className="text-xs text-gray-300">النقاط</div>
          </div>
        </div>
        
        <div className="space-y-2">
          {trend && (
            <div className="flex items-center justify-between">
              <span className="text-gray-300">الاتجاه:</span>
              <span className={`text-sm font-semibold ${
                trend === 'bullish' ? 'text-green-400' : 
                trend === 'bearish' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {trend === 'bullish' ? 'صاعد' : trend === 'bearish' ? 'هابط' : 'متذبذب'}
              </span>
            </div>
          )}
          
          {details && Object.keys(details).length > 0 && (
            <div className="space-y-1">
              {Object.entries(details).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-white">
                    {value !== null && value !== undefined
                      ? (typeof value === 'number' ? value.toLocaleString() : value)
                      : 'غير متاح'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // مكون مقياس المشاعر الرئيسي
  const SentimentGauge = ({ score = null, size = 200 }) => {
    const safeScore = score !== null ? safeNumber(score, 0) : 0;
    const color = score === null ? '#6B7280' : 
                  safeScore >= 70 ? '#10B981' : 
                  safeScore >= 50 ? '#F59E0B' : '#EF4444';
    
    const displayScore = score !== null ? safeToFixed(safeScore, 0) : '--';
    
    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size/2 + 40} className="overflow-visible">
          <path
            d={`M 20 ${size/2} A ${size/2-20} ${size/2-20} 0 0 1 ${size-20} ${size/2}`}
            stroke="#374151"
            strokeWidth="8"
            fill="none"
          />
          
          {score !== null && (
            <path
              d={`M 20 ${size/2} A ${size/2-20} ${size/2-20} 0 0 1 ${size-20} ${size/2}`}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(safeScore / 100) * 157} 157`}
              className="transition-all duration-1000"
            />
          )}
          
          <text x={size/2} y={size/2 + 30} textAnchor="middle" className="fill-white text-3xl font-bold">
            {displayScore}
          </text>
          <text x={size/2} y={size/2 + 50} textAnchor="middle" className="fill-gray-400 text-sm">
            {score !== null ? 'مؤشر المشاعر' : 'غير متاح'}
          </text>
        </svg>
      </div>
    );
  };

  // مكون عرض الملخص
  const OverviewMode = () => (
    <div className="space-y-6">
      {/* تحذير حالة البيانات */}
      {!hasRealData && (
        <motion.div 
          className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-400" />
            <div>
              <h4 className="text-orange-400 font-semibold">تنبيه: لا توجد بيانات حقيقية</h4>
              <p className="text-orange-300 text-sm">لا تتوفر بيانات تحليل مشاعر حقيقية للعملة {selectedSymbol} حالياً.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* المؤشر الرئيسي */}
      <motion.div 
        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <SentimentGauge score={sentimentData?.overall_score} />
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">المشاعر العامة لـ {selectedSymbol}</h2>
              <p className="text-gray-300">
                {sentimentData?.overall_score === null || sentimentData?.overall_score === undefined 
                  ? 'لا توجد بيانات متاحة'
                  : sentimentData.overall_score >= 70 ? 'متفائل جداً' :
                    sentimentData.overall_score >= 60 ? 'متفائل' :
                    sentimentData.overall_score >= 50 ? 'متوازن' :
                    sentimentData.overall_score >= 40 ? 'متشائم' : 'متشائم جداً'}
              </p>
              {sentimentData?.current_price && (
                <p className="text-sm text-gray-400 mt-2">
                  السعر الحالي: ${sentimentData.current_price.toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {sentimentData?.confidence !== null && sentimentData?.confidence !== undefined
                    ? `${safeToFixed(sentimentData.confidence, 0)}%`
                    : '--'}
                </div>
                <div className="text-sm text-gray-400">مستوى الثقة</div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {sentimentData?.social_volume !== null && sentimentData?.social_volume !== undefined
                    ? sentimentData.social_volume.toLocaleString()
                    : '--'}
                </div>
                <div className="text-sm text-gray-400">حجم التفاعل</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* بطاقات مصادر المشاعر */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SentimentCard
          title="تويتر"
          score={sentimentData?.sources?.twitter?.score}
          trend={sentimentData?.sources?.twitter?.trend}
          icon={ChatBubbleLeftRightIcon}
          color="from-blue-600 to-blue-800"
          details={{
            'الحجم': sentimentData?.sources?.twitter?.volume
          }}
        />
        
        <SentimentCard
          title="ريديت"
          score={sentimentData?.sources?.reddit?.score}
          trend={sentimentData?.sources?.reddit?.trend}
          icon={UserGroupIcon}
          color="from-orange-600 to-red-700"
          details={{
            'الحجم': sentimentData?.sources?.reddit?.volume
          }}
        />
        
        <SentimentCard
          title="الأخبار"
          score={sentimentData?.sources?.news?.score}
          trend={sentimentData?.sources?.news?.trend}
          icon={GlobeAltIcon}
          color="from-purple-600 to-purple-800"
          details={{
            'المقالات': sentimentData?.sources?.news?.volume
          }}
        />
        
        <SentimentCard
          title="تيليجرام"
          score={sentimentData?.sources?.telegram?.score}
          trend={sentimentData?.sources?.telegram?.trend}
          icon={FireIcon}
          color="from-green-600 to-green-800"
          details={{
            'الرسائل': sentimentData?.sources?.telegram?.volume
          }}
        />
      </div>
    </div>
  );

  // مكون العرض التفصيلي
  const DetailedMode = () => {
    if (!hasRealData) {
      return (
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">العرض التفصيلي غير متاح</h3>
          <p className="text-gray-400">يتطلب بيانات حقيقية لعرض الرسوم البيانية والتحليل التفصيلي</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <DataAvailabilityStatus />
        
        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <ArrowTrendingUpIcon className="w-5 h-5 ml-2" />
              تطور المشاعر (تقديري)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={sentimentData?.market_sentiment_history}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#sentimentGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-white font-semibold mb-4">حالة المصادر</h3>
            <div className="space-y-4">
              {['تويتر', 'ريديت', 'الأخبار', 'تيليجرام'].map((source) => (
                <div key={source} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <span className="text-white">{source}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    dataAvailability.sources ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {dataAvailability.sources ? 'متوفر' : 'قيد التطوير'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="sentiment-tab p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">تحليل المشاعر</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            الملخص
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'detailed' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            التفاصيل
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <ExclamationCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchSentimentData}
            className="mt-4 px-4 py-2 bg-red-600/20 border border-red-600/30 rounded-lg text-red-300 hover:bg-red-600/30 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {viewMode === 'overview' ? <OverviewMode /> : <DetailedMode />}
          
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div className="flex items-center space-x-2 space-x-reverse">
              <ClockIcon className="w-4 h-4" />
              <span>آخر تحديث: {lastUpdate || 'غير متاح'}</span>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <label htmlFor="live-updates" className="cursor-pointer">
                التحديث التلقائي
              </label>
              <input
                type="checkbox"
                id="live-updates"
                checked={isLive}
                onChange={() => setIsLive(!isLive)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentTab;