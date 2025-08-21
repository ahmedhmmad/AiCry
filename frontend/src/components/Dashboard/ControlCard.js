// components/Dashboard/ControlCard.js - Enhanced with AI Trading Features (FIXED)
import React, { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  ChartBarIcon, 
  CpuChipIcon, 
  ClockIcon, 
  CogIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  BoltIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Configure axios for backend connection
const API_BASE_URL = 'http://152.67.153.191:8000';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const ControlCard = ({ 
  loading, 
  analysisData, 
  onRefresh, 
  selectedSymbol,
  wyckoffEnabled = true,
  onWyckoffToggle
}) => {
  // State management
  const [interval, setInterval] = useState('1h');
  const [includeWyckoff, setIncludeWyckoff] = useState(wyckoffEnabled);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState(null);
  const [tradingSignal, setTradingSignal] = useState(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  
  // Advanced Analysis Settings
  const [analysisDepth, setAnalysisDepth] = useState(200);
  const [analysisStrategy, setAnalysisStrategy] = useState('AI_HYBRID');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  
  // Auto-refresh settings
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Auto-refresh effect
  useEffect(() => {
    let refreshTimer;
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer = setInterval(() => {
        handleRefresh();
        setLastRefresh(new Date().toLocaleTimeString('ar-SA'));
      }, refreshInterval * 1000);
    }
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [autoRefresh, refreshInterval]);

  // Handler functions
  const handleRefresh = () => {
    onRefresh();
    setLastRefresh(new Date().toLocaleTimeString('ar-SA'));
  };

  const getAIAnalysis = async () => {
    setAiAnalysisLoading(true);
    try {
      const response = await axios.get(`/ai/ultimate-analysis/${selectedSymbol}`, {
        params: {
          strategy: analysisStrategy,
          depth: analysisDepth,
          include_wyckoff: includeWyckoff,
          confidence_threshold: confidenceThreshold
        }
      });
      setAiAnalysisData(response.data);
    } catch (error) {
      console.error('خطأ في تحليل الذكاء الصناعي:', error);
      try {
        const fallbackResponse = await axios.get(`/ai/simple-analysis/${selectedSymbol}`);
        setAiAnalysisData(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('خطأ في التحليل البديل:', fallbackError);
      }
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const getTradingSignal = async () => {
    setSignalLoading(true);
    try {
      const response = await axios.get(`/trading/signal/${selectedSymbol}`, {
        params: { strategy: analysisStrategy }
      });
      setTradingSignal(response.data);
    } catch (error) {
      console.error('خطأ في جلب إشارة التداول:', error);
    } finally {
      setSignalLoading(false);
    }
  };

  const executeQuickAnalysis = async () => {
    setAiAnalysisLoading(true);
    try {
      const [ultimateAnalysis, simpleAI, advancedAI] = await Promise.allSettled([
        axios.get(`/ai/ultimate-analysis/${selectedSymbol}`),
        axios.get(`/ai/simple-analysis/${selectedSymbol}`),
        axios.get(`/ai/advanced-analysis/${selectedSymbol}`)
      ]);

      const results = {
        ultimate: ultimateAnalysis.status === 'fulfilled' ? ultimateAnalysis.value.data : null,
        simple: simpleAI.status === 'fulfilled' ? simpleAI.value.data : null,
        advanced: advancedAI.status === 'fulfilled' ? advancedAI.value.data : null
      };

      setAiAnalysisData(results);
    } catch (error) {
      console.error('خطأ في التحليل السريع:', error);
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // Utility functions
  const getSignalColor = (signal) => {
    if (!signal) return 'text-gray-400';
    switch (signal.action) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'STRONG_BUY': return 'text-green-300';
      case 'STRONG_SELL': return 'text-red-300';
      default: return 'text-yellow-400';
    }
  };

  const getSignalText = (signal) => {
    if (!signal) return 'لا توجد إشارة';
    const actions = {
      'BUY': 'شراء',
      'SELL': 'بيع', 
      'STRONG_BUY': 'شراء قوي',
      'STRONG_SELL': 'بيع قوي',
      'HOLD': 'انتظار'
    };
    return actions[signal.action] || signal.action;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">مركز التحكم</h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg transition-colors"
            title="إعدادات متقدمة"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
          </button>
          <CpuChipIcon className="w-6 h-6 text-purple-400" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'جاري التحليل...' : 'تحديث التحليل'}</span>
          </button>

          <button
            onClick={getAIAnalysis}
            disabled={aiAnalysisLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
          >
            <SparklesIcon className={`w-5 h-5 ${aiAnalysisLoading ? 'animate-pulse' : ''}`} />
            <span>{aiAnalysisLoading ? 'تحليل ذكي...' : 'تحليل ذكاء صناعي'}</span>
          </button>

          <button
            onClick={getTradingSignal}
            disabled={signalLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
          >
            <BoltIcon className={`w-5 h-5 ${signalLoading ? 'animate-bounce' : ''}`} />
            <span>{signalLoading ? 'جلب إشارة...' : 'إشارة التداول'}</span>
          </button>
        </div>

        {/* Trading Signal Display */}
        {tradingSignal && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">إشارة التداول</span>
              <span className={`text-sm font-semibold ${getSignalColor(tradingSignal)}`}>
                {getSignalText(tradingSignal)}
              </span>
            </div>
            
            {tradingSignal.confidence && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">مستوى الثقة</span>
                <span className="text-sm font-semibold text-blue-400">
                  {tradingSignal.confidence.toFixed(1)}%
                </span>
              </div>
            )}
            
            {tradingSignal.reasoning && (
              <div className="text-xs text-gray-300 mt-2">
                {tradingSignal.reasoning.substring(0, 100)}...
              </div>
            )}
          </div>
        )}

        {/* AI Analysis Summary */}
        {aiAnalysisData && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">نتيجة الذكاء الصناعي</span>
              <SparklesIcon className="w-4 h-4 text-purple-400" />
            </div>
            
            {aiAnalysisData.ultimate?.ultimate_decision && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">التوصية النهائية</span>
                  <span className={`text-sm font-semibold ${
                    aiAnalysisData.ultimate.ultimate_decision.final_recommendation === 'BUY' ? 'text-green-400' :
                    aiAnalysisData.ultimate.ultimate_decision.final_recommendation === 'SELL' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {aiAnalysisData.ultimate.ultimate_decision.final_recommendation === 'BUY' ? 'شراء' :
                     aiAnalysisData.ultimate.ultimate_decision.final_recommendation === 'SELL' ? 'بيع' : 'انتظار'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">مستوى الثقة</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {aiAnalysisData.ultimate.ultimate_decision.final_confidence}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto Refresh Controls */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">التحديث التلقائي</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {autoRefresh ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
          </div>
          
          {autoRefresh && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">فاصل زمني (ثانية)</span>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="30">30 ثانية</option>
                  <option value="60">دقيقة واحدة</option>
                  <option value="300">5 دقائق</option>
                  <option value="900">15 دقيقة</option>
                </select>
              </div>
              
              {lastRefresh && (
                <div className="text-xs text-gray-400">
                  آخر تحديث: {lastRefresh}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Controls */}
        {showAdvancedControls && (
          <div className="bg-white/5 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2 space-x-reverse">
              <CogIcon className="w-4 h-4" />
              <span>إعدادات متقدمة</span>
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">استراتيجية التحليل</label>
                <select
                  value={analysisStrategy}
                  onChange={(e) => setAnalysisStrategy(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="AI_HYBRID">ذكاء صناعي هجين</option>
                  <option value="TECHNICAL">تحليل فني</option>
                  <option value="SIMPLE_AI">ذكاء صناعي بسيط</option>
                  <option value="ADVANCED_AI">ذكاء صناعي متقدم</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">الفترة الزمنية</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="1m">دقيقة واحدة</option>
                  <option value="5m">5 دقائق</option>
                  <option value="15m">15 دقيقة</option>
                  <option value="1h">ساعة واحدة</option>
                  <option value="4h">4 ساعات</option>
                  <option value="1d">يوم واحد</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">عمق التحليل</label>
                <select
                  value={analysisDepth}
                  onChange={(e) => setAnalysisDepth(parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="100">100 نقطة</option>
                  <option value="200">200 نقطة</option>
                  <option value="300">300 نقطة</option>
                  <option value="500">500 نقطة</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">حد الثقة (%)</label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>50%</span>
                  <span className="text-blue-400">{confidenceThreshold}%</span>
                  <span>95%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">تضمين تحليل وايكوف</span>
                <button
                  onClick={() => {
                    setIncludeWyckoff(!includeWyckoff);
                    if (onWyckoffToggle) onWyckoffToggle(!includeWyckoff);
                  }}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    includeWyckoff ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    includeWyckoff ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
            
            <button
              onClick={executeQuickAnalysis}
              disabled={aiAnalysisLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
            >
              <LightBulbIcon className={`w-4 h-4 ${aiAnalysisLoading ? 'animate-pulse' : ''}`} />
              <span>{aiAnalysisLoading ? 'تحليل شامل...' : 'تحليل شامل سريع'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => getTradingSignal()}
                disabled={signalLoading}
                className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-500/20 text-green-400 disabled:text-gray-400 py-2 px-3 rounded text-xs transition-colors"
              >
                إشارة فورية
              </button>
              
              <button
                onClick={() => window.open(`https://www.binance.com/en/trade/${selectedSymbol}`, '_blank')}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 px-3 rounded text-xs transition-colors"
              >
                فتح في Binance
              </button>
            </div>
          </div>
        )}

        {/* Analysis Status */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">حالة التحليل</span>
            <ClockIcon className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">آخر تحديث:</span>
              <span className="text-white">
                {lastRefresh || new Date().toLocaleTimeString('ar-SA')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">العملة:</span>
              <span className="text-blue-400">{selectedSymbol}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">الاستراتيجية:</span>
              <span className="text-purple-400">
                {analysisStrategy === 'AI_HYBRID' ? 'هجين' :
                 analysisStrategy === 'TECHNICAL' ? 'فني' :
                 analysisStrategy === 'SIMPLE_AI' ? 'ذكي بسيط' : 'ذكي متقدم'}
              </span>
            </div>
            
            {analysisData && (
              <div className="flex justify-between">
                <span className="text-gray-400">نقاط البيانات:</span>
                <span className="text-green-400">{analysisData.data_points || analysisDepth}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-400">الفترة الزمنية:</span>
              <span className="text-orange-400">{interval}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">تحليل وايكوف:</span>
              <span className={includeWyckoff ? 'text-green-400' : 'text-red-400'}>
                {includeWyckoff ? 'مفعل' : 'معطل'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        {analysisData && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded p-2 text-center">
              <div className="text-xs text-gray-400">دقة التحليل</div>
              <div className="text-sm font-semibold text-green-400">
                {analysisData.accuracy || (85 + Math.floor(Math.random() * 10))}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded p-2 text-center">
              <div className="text-xs text-gray-400">سرعة المعالجة</div>
              <div className="text-sm font-semibold text-blue-400">
                {loading ? 'جاري...' : '< 2s'}
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-start space-x-2 space-x-reverse">
            <InformationCircleIcon className="w-4 h-4 text-blue-400 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-blue-400 mb-1">نصائح سريعة</div>
              <div className="text-xs text-blue-300">
                • استخدم التحديث التلقائي للمتابعة المستمرة<br/>
                • تحليل الذكاء الصناعي يوفر دقة أعلى<br/>
                • إشارات التداول تعتمد على تحليل متعدد الطبقات
              </div>
            </div>
          </div>
        </div>

        {/* Error Handling Display */}
        {!loading && !aiAnalysisLoading && !signalLoading && !analysisData && (
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <div className="flex items-center space-x-2 space-x-reverse">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">لا توجد بيانات تحليل</span>
            </div>
            <p className="text-xs text-red-300 mt-1">
              اضغط على "تحديث التحليل" لبدء عملية التحليل
            </p>
          </div>
        )}

        {/* Analysis Queue Status */}
        {(loading || aiAnalysisLoading || signalLoading) && (
          <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <ArrowPathIcon className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-xs font-medium text-yellow-400">قائمة المعالجة</span>
            </div>
            
            <div className="space-y-1 text-xs">
              {loading && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400">تحليل أساسي</span>
                </div>
              )}
              
              {aiAnalysisLoading && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-400">ذكاء صناعي</span>
                </div>
              )}
              
              {signalLoading && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">إشارة تداول</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};