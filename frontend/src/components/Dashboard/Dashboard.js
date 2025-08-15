// Dashboard كامل مع جميع طبقات التحليل
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  WalletIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// ✅ API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://152.67.153.191:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

let GLOBAL_INITIALIZED = false;
let GLOBAL_CURRENT_SYMBOL = null;

api.interceptors.request.use((config) => {
  console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌', error.message);
    return Promise.reject(error);
  }
);

// مكونات فرعية
const PriceCard = ({ loading, currentPrice, lastUpdate, selectedSymbol }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">السعر الحالي</h3>
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <ArrowPathIcon className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-blue-400">جاري التحميل...</span>
          </div>
        </div>
      ) : currentPrice ? (
        <div>
          <div className="text-3xl font-bold text-white mb-2">
            ${currentPrice?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 flex items-center space-x-2 space-x-reverse">
            <ClockIcon className="w-4 h-4" />
            <span>آخر تحديث: {lastUpdate}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedSymbol}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center">لا توجد بيانات</div>
      )}
    </div>
  );
};

const DecisionCard = ({ loading, analysisData }) => {
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'STRONG_BUY':
        return 'text-green-400';
      case 'SELL':
      case 'STRONG_SELL':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'BUY':
      case 'STRONG_BUY':
        return <ArrowTrendingUpIcon className="w-6 h-6" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <ArrowTrendingDownIcon className="w-6 h-6" />;
      default:
        return <ClockIcon className="w-6 h-6" />;
    }
  };

  const getRecommendationText = (recommendation) => {
    const texts = {
      'BUY': 'شراء',
      'STRONG_BUY': 'شراء قوي',
      'SELL': 'بيع',
      'STRONG_SELL': 'بيع قوي',
      'HOLD': 'انتظار'
    };
    return texts[recommendation] || recommendation;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">القرار النهائي</h3>
        <SparklesIcon className="w-6 h-6 text-purple-400" />
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <ArrowPathIcon className="w-6 h-6 text-purple-400 animate-spin" />
            <span className="text-purple-400">تحليل البيانات...</span>
          </div>
        </div>
      ) : analysisData?.ultimate_decision ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={`${getRecommendationColor(analysisData.ultimate_decision.final_recommendation)}`}>
              {getRecommendationIcon(analysisData.ultimate_decision.final_recommendation)}
            </div>
            <div>
              <div className={`text-xl font-bold ${getRecommendationColor(analysisData.ultimate_decision.final_recommendation)}`}>
                {getRecommendationText(analysisData.ultimate_decision.final_recommendation)}
              </div>
              <div className="text-gray-400 text-sm">
                ثقة: {analysisData.ultimate_decision.final_confidence?.toFixed(1) || 'N/A'}%
              </div>
            </div>
          </div>
          
          {/* عرض عدد طبقات التحليل */}
          {analysisData.analysis_summary && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">طبقات التحليل النشطة:</div>
              <div className="text-white text-sm font-medium">
                {analysisData.analysis_summary.total_analysis_methods} طبقات
              </div>
            </div>
          )}
          
          {analysisData.ultimate_decision.reasoning && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-300 text-sm">
                {analysisData.ultimate_decision.reasoning}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center">لا توجد توصية</div>
      )}
    </div>
  );
};

const ControlCard = ({ loading, analysisData, onRefresh, backendConnected }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">التحكم</h3>
        <Cog6ToothIcon className="w-6 h-6 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'جاري التحديث...' : 'تحديث البيانات'}</span>
        </button>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">حالة الاتصال:</span>
            <span className={backendConnected ? 'text-green-400' : 'text-red-400'}>
              {backendConnected ? 'متصل' : 'غير متصل'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">البيانات:</span>
            <span className={analysisData ? 'text-green-400' : 'text-red-400'}>
              {analysisData ? 'متوفرة' : 'غير متوفرة'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">مصدر البيانات:</span>
            <span className="text-white">
              {analysisData?.data_source || 'API'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون طبقات التحليل الشامل
const AnalysisLayersDisplay = ({ analysisData }) => {
  const [expandedLayers, setExpandedLayers] = useState({});

  const toggleLayer = (layerId) => {
    setExpandedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const layers = [
    {
      id: '1_technical_analysis',
      title: 'التحليل الفني التقليدي',
      icon: ChartBarIcon,
      color: 'blue',
      data: analysisData?.analysis_layers?.['1_technical_analysis']
    },
    {
      id: '2_simple_ai',
      title: 'الذكاء الاصطناعي البسيط',
      icon: CpuChipIcon,
      color: 'green',
      data: analysisData?.analysis_layers?.['2_simple_ai']
    },
    {
      id: '3_advanced_ai',
      title: 'الذكاء الاصطناعي المتقدم',
      icon: BoltIcon,
      color: 'purple',
      data: analysisData?.analysis_layers?.['3_advanced_ai']
    },
    {
      id: 'wyckoff',
      title: 'تحليل وايكوف',
      icon: () => <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>,
      color: 'orange',
      data: analysisData?.wyckoff_analysis || analysisData?.analysis_layers?.['4_wyckoff_analysis']
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">🔬 طبقات التحليل المفصلة</h3>
      
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isExpanded = expandedLayers[layer.id];
        const hasData = layer.data && !layer.data.error;
        
        return (
          <motion.div
            key={layer.id}
            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden"
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 'auto' }}
          >
            {/* Header */}
            <div
              className={`p-4 cursor-pointer hover:bg-white/5 transition-all border-l-4 border-${layer.color}-500`}
              onClick={() => toggleLayer(layer.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`text-${layer.color}-400`}>
                    {typeof Icon === 'function' ? <Icon /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{layer.title}</h4>
                    <div className="text-gray-400 text-sm">
                      {hasData ? (
                        <>
                          {layer.data.recommendation || layer.data.final_recommendation || 'غير محدد'} 
                          {layer.data.confidence && ` (${layer.data.confidence?.toFixed(1)}%)`}
                        </>
                      ) : (
                        'لا توجد بيانات'
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  {isExpanded ? 
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : 
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </div>
            </div>

            {/* Content */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4"
              >
                {hasData ? (
                  <LayerContent layer={layer} />
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    {layer.data?.error || 'لا توجد بيانات متاحة لهذه الطبقة'}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// مكون محتوى الطبقة
const LayerContent = ({ layer }) => {
  const { data } = layer;

  switch (layer.id) {
    case '1_technical_analysis':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MACD */}
            {data.macd && (
              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="text-gray-400 text-sm">MACD</div>
                <div className="text-blue-400 font-bold">{data.macd.signal || 'N/A'}</div>
                <div className="text-blue-300 text-xs">
                  {data.macd.macd?.toFixed(2) || 'N/A'}
                </div>
              </div>
            )}
            
            {/* RSI */}
            {data.rsi && (
              <div className="bg-purple-500/10 rounded-lg p-3">
                <div className="text-gray-400 text-sm">RSI</div>
                <div className="text-purple-400 font-bold">{data.rsi.current?.toFixed(1) || 'N/A'}</div>
                <div className="text-purple-300 text-xs">{data.rsi.signal || 'N/A'}</div>
              </div>
            )}
            
            {/* Bollinger Bands */}
            {data.bollinger_bands && (
              <div className="bg-yellow-500/10 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Bollinger Bands</div>
                <div className="text-yellow-400 font-bold">{data.bollinger_bands.signal || 'N/A'}</div>
                <div className="text-yellow-300 text-xs">{data.bollinger_bands.position || 'N/A'}</div>
              </div>
            )}
          </div>
          
          {data.reasoning && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">التفسير:</div>
              <div className="text-gray-300 text-sm">{data.reasoning}</div>
            </div>
          )}
        </div>
      );

    case '2_simple_ai':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-lg p-3">
              <div className="text-gray-400 text-sm">التوصية</div>
              <div className="text-green-400 font-bold">{data.recommendation || 'N/A'}</div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-3">
              <div className="text-gray-400 text-sm">مستوى الثقة</div>
              <div className="text-green-400 font-bold">{data.confidence?.toFixed(1) || 'N/A'}%</div>
            </div>
          </div>
          
          {data.reasoning && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">التفسير:</div>
              <div className="text-gray-300 text-sm">{data.reasoning}</div>
            </div>
          )}
        </div>
      );

    case '3_advanced_ai':
      return (
        <div className="space-y-4">
          {data.ensemble_prediction && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-500/10 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">التنبؤ النهائي</div>
                  <div className="text-purple-400 font-bold">
                    {data.ensemble_prediction.final_prediction || 'N/A'}
                  </div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">التوصية</div>
                  <div className="text-purple-400 font-bold">
                    {data.ensemble_prediction.recommendation || 'N/A'}
                  </div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3">
                  <div className="text-gray-400 text-sm">مستوى الثقة</div>
                  <div className="text-purple-400 font-bold">
                    {data.ensemble_prediction.confidence?.toFixed(1) || 'N/A'}%
                  </div>
                </div>
              </div>

              {/* احتماليات التنبؤ */}
              {data.ensemble_prediction.probabilities && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-gray-400 text-sm mb-2">توزيع الاحتماليات:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">صعود:</span>
                      <span className="text-green-400">{data.ensemble_prediction.probabilities.up?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">هبوط:</span>
                      <span className="text-red-400">{data.ensemble_prediction.probabilities.down?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {data.ensemble_prediction?.interpretation && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">التفسير:</div>
              <div className="text-gray-300 text-sm">{data.ensemble_prediction.interpretation}</div>
            </div>
          )}
        </div>
      );

    case 'wyckoff':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-500/10 rounded-lg p-3">
              <div className="text-gray-400 text-sm">المرحلة الحالية</div>
              <div className="text-orange-400 font-bold">{data.current_phase || 'N/A'}</div>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-3">
              <div className="text-gray-400 text-sm">الإجراء الموصى</div>
              <div className="text-orange-400 font-bold">{data.recommended_action || 'N/A'}</div>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-3">
              <div className="text-gray-400 text-sm">مستوى الثقة</div>
              <div className="text-orange-400 font-bold">{data.confidence?.toFixed(1) || 'N/A'}%</div>
            </div>
          </div>
          
          {data.reasoning && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">التفسير:</div>
              <div className="text-gray-300 text-sm">{data.reasoning}</div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="bg-white/5 rounded-lg p-4">
          <pre className="text-gray-300 text-sm whitespace-pre-wrap overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
};

const AnalysisTab = ({ 
  loading, 
  currentPrice, 
  lastUpdate, 
  analysisData, 
  onRefresh,
  backendConnected,
  selectedSymbol
}) => {
  return (
    <div className="space-y-6">
      {/* Grid الأصلي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PriceCard 
          loading={loading} 
          currentPrice={currentPrice} 
          lastUpdate={lastUpdate}
          selectedSymbol={selectedSymbol}
        />
        <DecisionCard 
          loading={loading} 
          analysisData={analysisData} 
        />
        <ControlCard 
          loading={loading} 
          analysisData={analysisData} 
          onRefresh={onRefresh}
          backendConnected={backendConnected}
        />
      </div>

      {/* طبقات التحليل الشامل */}
      {analysisData && (
        <AnalysisLayersDisplay analysisData={analysisData} />
      )}

      {/* Market Context */}
      {analysisData?.market_context && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">📈 سياق السوق</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm">حالة الاتجاه</div>
              <div className="text-white font-bold text-lg">
                {analysisData.market_context.trend_status || 'N/A'}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm">مستوى التذبذب</div>
              <div className="text-white font-bold text-lg">
                {analysisData.market_context.volatility_state || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ selectedSymbol, analysisData, setAnalysisData, setIsLoading, apiHealth }) => {
  console.log('🔧 Dashboard render for:', selectedSymbol);
  console.log('📊 Current analysisData:', analysisData);
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const tabs = useMemo(() => [
    { 
      id: 'analysis', 
      name: 'التحليل الشامل', 
      icon: ChartBarIcon,
      description: 'تحليل شامل مع جميع الطبقات'
    },
    { 
      id: 'ai_suggestions', 
      name: 'اقتراحات الذكي', 
      icon: SparklesIcon,
      description: 'توصيات العملات من الذكاء الصناعي'
    },
    { 
      id: 'settings', 
      name: 'الإعدادات', 
      icon: Cog6ToothIcon,
      description: 'إعدادات التداول والتحليل'
    }
  ], []);

  const checkBackendConnection = async () => {
    try {
      const response = await api.get('/health');
      setBackendConnected(true);
      console.log('✅ Backend connected:', response.data);
      return true;
    } catch (error) {
      setBackendConnected(false);
      console.log('❌ Backend connection failed:', error);
      return false;
    }
  };

  const fetchAnalysis = async (symbol) => {
    console.log(`🔍 Fetching analysis for ${symbol}`);
    
    setLoading(true);
    
    try {
      // طلب التحليل الشامل مع تفعيل جميع الطبقات
      const response = await api.get(`/ai/ultimate-analysis/${symbol}?include_wyckoff=true&multi_timeframe_wyckoff=false`);
      
      if (response.data) {
        console.log('✅ Analysis successful');
        console.log('📊 Received data:', response.data);
        
        setAnalysisData(response.data);
        setCurrentPrice(response.data.current_price);
        setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
        setBackendConnected(true);
        
        GLOBAL_INITIALIZED = true;
        GLOBAL_CURRENT_SYMBOL = symbol;
        console.log('🎯 Data set successfully!');
        return;
      }
    } catch (error) {
      console.log('⚠️ Analysis failed:', error);
      
      // Demo data fallback مع جميع الطبقات
      const demoData = {
        symbol: symbol,
        current_price: symbol === 'BTCUSDT' ? 67000 : 3200,
        ultimate_decision: {
          final_recommendation: 'BUY',
          final_confidence: 75,
          reasoning: 'تحليل متعدد الطبقات يشير إلى اتجاه إيجابي'
        },
        analysis_layers: {
          '1_technical_analysis': {
            overall_recommendation: 'BUY',
            confidence: 70,
            macd: {
              signal: 'BUY',
              macd: 245.67,
              signal_line: 198.34,
              histogram: 47.33
            },
            rsi: {
              current: 65.5,
              signal: 'BUY'
            },
            bollinger_bands: {
              signal: 'HOLD',
              position: 'MIDDLE'
            },
            reasoning: 'المؤشرات الفنية تشير إلى قوة في الاتجاه الصاعد'
          },
          '2_simple_ai': {
            recommendation: 'BUY',
            confidence: 68,
            reasoning: 'النموذج البسيط يتوقع استمرار الاتجاه الإيجابي'
          },
          '3_advanced_ai': {
            ensemble_prediction: {
              final_prediction: 'UP',
              recommendation: 'BUY',
              confidence: 78,
              probabilities: {
                up: 78,
                down: 22
              },
              interpretation: 'مجموعة النماذج المتقدمة تظهر إشارات قوية للصعود'
            }
          }
        },
        wyckoff_analysis: {
          current_phase: 'Markup Phase',
          recommended_action: 'BUY',
          confidence: 72,
          reasoning: 'نمط وايكوف يشير إلى مرحلة الصعود مع قوة في الحجم'
        },
        analysis_summary: {
          total_analysis_methods: 4,
          confidence_score: 75,
          risk_assessment: 'MODERATE',
          recommendation_strength: 'STRONG',
          wyckoff_enabled: true
        },
        market_context: {
          trend_status: 'UPTREND',
          volatility_state: 'MODERATE'
        },
        data_source: 'DEMO_DATA',
        warning: 'بيانات تجريبية - الخادم غير متاح'
      };
      
      console.log('📊 Using demo data:', demoData);
      setAnalysisData(demoData);
      setCurrentPrice(demoData.current_price);
      setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      setBackendConnected(false);
      
      GLOBAL_INITIALIZED = true;
      GLOBAL_CURRENT_SYMBOL = symbol;
    } finally {
      setLoading(false);
      console.log('🏁 Finished loading, analysisData should be set');
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      if (GLOBAL_CURRENT_SYMBOL === selectedSymbol && GLOBAL_INITIALIZED) {
        console.log('⏭️ Skipping - already initialized for', selectedSymbol);
        return;
      }
      
      if (initialized && GLOBAL_CURRENT_SYMBOL === selectedSymbol) {
        console.log('⏭️ Skipping - locally initialized for', selectedSymbol);
        return;
      }
      
      console.log('🚀 Initializing Dashboard for', selectedSymbol);
      setInitialized(true);
      
      await checkBackendConnection();
      await fetchAnalysis(selectedSymbol);
    };
    
    initializeData();
  }, [selectedSymbol]);

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh');
    GLOBAL_INITIALIZED = false;
    setInitialized(false);
    await fetchAnalysis(selectedSymbol);
    await checkBackendConnection();
  };

  const TabNavigation = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 mb-6">
      <div className="flex space-x-1 space-x-reverse overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg transition-all font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title={tab.description}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:block">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const AISuggestionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse">
        <SparklesIcon className="w-8 h-8 text-purple-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">اقتراحات الذكاء الصناعي</h2>
          <p className="text-gray-400">أفضل العملات للاستثمار حالياً</p>
        </div>
      </div>

      {!backendConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-400 font-medium">عرض اقتراحات تجريبية - الخادم غير متاح</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            symbol: 'BTCUSDT',
            recommendation: 'BUY',
            confidence: 78.5,
            current_price: 67350.45,
            score: 85.2,
            reasoning: 'جميع طبقات التحليل تشير إلى اتجاه صاعد قوي'
          },
          {
            symbol: 'ETHUSDT',
            recommendation: 'BUY', 
            confidence: 82.1,
            current_price: 3245.67,
            score: 88.7,
            reasoning: 'تحليل وايكوف والذكاء الاصطناعي يؤكدان القوة'
          },
          {
            symbol: 'BNBUSDT',
            recommendation: 'HOLD',
            confidence: 65.3,
            current_price: 415.23,
            score: 72.4,
            reasoning: 'إشارات متضاربة بين الطبقات، انتظار وضوح أكبر'
          }
        ].map((suggestion, index) => (
          <motion.div
            key={suggestion.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:border-white/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{suggestion.symbol}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                suggestion.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                suggestion.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {suggestion.recommendation === 'BUY' ? 'شراء' :
                 suggestion.recommendation === 'SELL' ? 'بيع' : 'انتظار'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">السعر الحالي:</span>
                <span className="text-white font-medium">${suggestion.current_price?.toFixed(4)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">مستوى الثقة:</span>
                <span className="text-blue-400 font-medium">{suggestion.confidence?.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">النتيجة:</span>
                <span className="text-purple-400 font-medium">{suggestion.score?.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">التحليل:</div>
              <div className="text-sm text-gray-300">{suggestion.reasoning}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <Cog6ToothIcon className="w-8 h-8 text-gray-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">إعدادات النظام</h2>
          <p className="text-gray-400">إعدادات التداول والتحليل والإشعارات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">حالة الاتصال</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Backend Server</span>
              <span className={`px-2 py-1 rounded text-xs ${
                backendConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {backendConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
            <div className="text-xs text-gray-400 break-all">
              API URL: {API_BASE_URL}
            </div>
            <button
              onClick={checkBackendConnection}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-4 rounded-lg text-sm transition-colors"
            >
              اختبار الاتصال
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">حالة الخدمات</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">قاعدة البيانات</span>
              <span className={`px-2 py-1 rounded text-xs ${
                apiHealth?.database === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {apiHealth?.database === 'connected' ? 'متصل' : 'غير متصل'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Redis Cache</span>
              <span className={`px-2 py-1 rounded text-xs ${
                apiHealth?.redis === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {apiHealth?.redis === 'connected' ? 'متصل' : 'غير متصل'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Binance API</span>
              <span className={`px-2 py-1 rounded text-xs ${
                apiHealth?.binance_api === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {apiHealth?.binance_api === 'connected' ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          </div>
        </div>

        {/* معلومات طبقات التحليل */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">طبقات التحليل المتاحة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <ChartBarIcon className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">التحليل الفني التقليدي</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <CpuChipIcon className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm">الذكاء الاصطناعي البسيط</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <BoltIcon className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm">الذكاء الاصطناعي المتقدم</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">W</div>
                <span className="text-white text-sm">تحليل وايكوف</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              <p>جميع طبقات التحليل مفعلة ومتاحة للاستخدام</p>
              <p className="mt-1">يتم دمج النتائج لإنتاج توصية نهائية شاملة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return (
          <AnalysisTab
            loading={loading}
            currentPrice={currentPrice}
            lastUpdate={lastUpdate}
            analysisData={analysisData}
            onRefresh={handleRefresh}
            backendConnected={backendConnected}
            selectedSymbol={selectedSymbol}
          />
        );
      
      case 'ai_suggestions':
        return <AISuggestionsTab />;
      
      case 'settings':
        return <SettingsTab />;
      
      default:
        return (
          <AnalysisTab
            loading={loading}
            currentPrice={currentPrice}
            lastUpdate={lastUpdate}
            analysisData={analysisData}
            onRefresh={handleRefresh}
            backendConnected={backendConnected}
            selectedSymbol={selectedSymbol}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <TabNavigation />
      
      {!backendConnected && (
        <div className="bg-yellow-500/10 backdrop-blur-md rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 font-medium">يتم عرض بيانات تجريبية</span>
              <span className="text-gray-400 text-sm">- الخادم غير متاح</span>
            </div>
            
            <button
              onClick={checkBackendConnection}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1 rounded text-sm transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default Dashboard;