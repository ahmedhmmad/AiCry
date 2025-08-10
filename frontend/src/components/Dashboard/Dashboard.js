// components/Dashboard/Dashboard.js - Fixed Infinite Loading Issue
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  WalletIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Import existing components
import { AnalysisTab } from './AnalysisTab';
import { PriceCard } from './PriceCard';
import { DecisionCard } from './DecisionCard';
import { ControlCard } from './ControlCard';

// Import new components
import PortfolioTab from './PortfolioTab';
import TradingTab from './TradingTab';

const Dashboard = ({ selectedSymbol, analysisData, setAnalysisData, setIsLoading, apiHealth }) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [coinSuggestions, setCoinSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const tabs = [
    { 
      id: 'analysis', 
      name: 'التحليل الفني', 
      icon: ChartBarIcon,
      description: 'تحليل شامل للعملة المختارة'
    },
    { 
      id: 'trading', 
      name: 'التداول التلقائي', 
      icon: CpuChipIcon,
      description: 'تداول مدعوم بالذكاء الصناعي'
    },
    { 
      id: 'portfolio', 
      name: 'إدارة المحافظ', 
      icon: WalletIcon,
      description: 'إنشاء ومتابعة المحافظ'
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
  ];

  // Simple fetch analysis without infinite loop
  const fetchAnalysis = async () => {
    if (loading) return;
    
    setLoading(true);
    if (setIsLoading) setIsLoading(true);
    
    try {
      const response = await axios.get(`/analysis/${selectedSymbol}`);
      if (response.data) {
        setAnalysisData(response.data.comprehensive_analysis || response.data);
        setCurrentPrice(response.data.current_price);
        setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      }
    } catch (error) {
      console.error('خطأ في جلب التحليل:', error);
      // Simple fallback
      try {
        const priceResponse = await axios.get(`/price/${selectedSymbol}`);
        if (priceResponse.data) {
          setCurrentPrice(priceResponse.data.price);
          setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
        }
      } catch (priceError) {
        console.error('خطأ في جلب السعر:', priceError);
      }
    } finally {
      setLoading(false);
      if (setIsLoading) setIsLoading(false);
    }
  };

  // Simple fetch suggestions
  const fetchCoinSuggestions = async (riskLevel = 'MEDIUM') => {
    if (suggestionsLoading) return;
    
    setSuggestionsLoading(true);
    try {
      const response = await axios.get(`/trading/suggest-coins?risk_level=${riskLevel}&count=10`);
      setCoinSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('خطأ في جلب اقتراحات العملات:', error);
      setCoinSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Only fetch on symbol change - NO dependency on activeTab
  useEffect(() => {
    if (selectedSymbol && activeTab === 'analysis') {
      fetchAnalysis();
    }
  }, [selectedSymbol]); // Only selectedSymbol dependency

  const handleRefresh = () => {
    if (activeTab === 'analysis') {
      fetchAnalysis();
    } else if (activeTab === 'ai_suggestions') {
      fetchCoinSuggestions();
    }
  };

  const TabNavigation = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 mb-6">
      <div className="flex space-x-1 space-x-reverse">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg transition-all font-medium ${
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <SparklesIcon className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">اقتراحات الذكاء الصناعي</h2>
            <p className="text-gray-400">أفضل العملات للاستثمار حالياً</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <select
            onChange={(e) => fetchCoinSuggestions(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
            defaultValue="MEDIUM"
          >
            <option value="LOW">مخاطر منخفضة</option>
            <option value="MEDIUM">مخاطر متوسطة</option>
            <option value="HIGH">مخاطر عالية</option>
          </select>
          
          <button
            onClick={() => fetchCoinSuggestions()}
            disabled={suggestionsLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
          >
            {suggestionsLoading ? 'جاري التحميل...' : 'تحديث'}
          </button>
        </div>
      </div>

      {suggestionsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-white/20 rounded"></div>
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : coinSuggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coinSuggestions.map((suggestion, index) => (
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
                <div className="text-sm text-gray-300">{suggestion.reasoning?.substring(0, 100)}...</div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                المصدر: {suggestion.analysis_source}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد اقتراحات</h3>
          <p className="text-gray-400 mb-4">اضغط على تحديث للحصول على اقتراحات جديدة</p>
          <button
            onClick={() => fetchCoinSuggestions()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            جلب الاقتراحات
          </button>
        </div>
      )}
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
        {/* Trading Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">إعدادات التداول</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">استراتيجية التداول الافتراضية</label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none">
                <option value="AI_HYBRID">ذكاء صناعي هجين</option>
                <option value="TECHNICAL">تحليل فني</option>
                <option value="SIMPLE_AI">ذكاء صناعي بسيط</option>
                <option value="ADVANCED_AI">ذكاء صناعي متقدم</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">مستوى المخاطرة الافتراضي</label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none">
                <option value="LOW">منخفض</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HIGH">عالي</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">حالة الاتصالات</h3>
          
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
              <span className="text-gray-300">Binance API</span>
              <span className={`px-2 py-1 rounded text-xs ${
                apiHealth?.binance_api === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {apiHealth?.binance_api === 'connected' ? 'متصل' : 'غير متصل'}
              </span>
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
          />
        );
      
      case 'trading':
        return <TradingTab selectedSymbol={selectedSymbol} />;
      
      case 'portfolio':
        return <PortfolioTab selectedSymbol={selectedSymbol} />;
      
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
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <TabNavigation />
      
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