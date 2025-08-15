// Dashboard.js - النسخة المحدثة مع Backend AI
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CpuChipIcon,
  BoltIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  WalletIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ScaleIcon,
  PlayIcon,
  StopIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// استيراد المكونات المحدثة
import { AISuggestionsTab } from './AISuggestionsTab';
import { AnalysisTab } from './AnalysisTab';
import { PortfolioTab } from './PortfolioTab';
import { InvestmentTab } from './InvestmentTab';
import { TradingTab } from './TradingTab';
import { BacktestTab } from './BacktestTab';

// استيراد useAPI hook مع معالجة الأخطاء
let useAPI;
try {
  useAPI = require('../../hooks/useAPI').useAPI;
} catch (error) {
  console.warn('useAPI hook not found:', error);
  useAPI = () => ({ fetchUltimateAnalysis: null });
}

const Dashboard = (props) => {
  const selectedSymbol = props?.selectedSymbol || 'BTCUSDT';
  const analysisData = props?.analysisData || null;
  const setAnalysisData = props?.setAnalysisData || (() => {});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  
  // إعدادات وايكوف
  const [wyckoffEnabled, setWyckoffEnabled] = useState(true);
  const [wyckoffSettings, setWyckoffSettings] = useState({
    sensitivity: 'medium',
    multi_timeframe: true,
    volume_analysis: true,
    timeframes: ['1h', '4h', '1d']
  });
  const [showWyckoffSettings, setShowWyckoffSettings] = useState(false);

  // بيانات التبويبات
  const [portfolioData, setPortfolioData] = useState({
    balance: 10000,
    positions: [],
    pnl: 0,
    totalValue: 10000
  });

  const [tradingData, setTradingData] = useState({
    orderHistory: [],
    openOrders: [],
    tradingSettings: {
      riskPerTrade: 2,
      maxPositions: 5,
      autoTrading: false
    }
  });

  const [backtestData, setBacktestData] = useState({
    results: null,
    isRunning: false,
    settings: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      initialBalance: 10000,
      strategy: 'ai_combined'
    }
  });

  const { fetchUltimateAnalysis } = useAPI();

  const tabs = [
    { id: 'analysis', name: 'التحليل', icon: ChartBarIcon },
    { id: 'ai_suggestions', name: 'نصائح الذكي', icon: BoltIcon },
    { id: 'portfolio', name: 'المحفظة', icon: WalletIcon },
    { id: 'investment', name: 'الاستثمار', icon: BanknotesIcon },
    { id: 'trading', name: 'التداول', icon: CurrencyDollarIcon },
    { id: 'backtest', name: 'المحاكاة', icon: ClockIcon },
    { id: 'comparison', name: 'المقارنة', icon: ScaleIcon }
  ];

  // دالة التحديث الرئيسية
  const handleRefresh = useCallback(async () => {
    if (!fetchUltimateAnalysis) {
      setError('useAPI hook غير متصل');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const options = {
        include_wyckoff: wyckoffEnabled,
        multi_timeframe_wyckoff: wyckoffSettings.multi_timeframe,
        detail_level: 'detailed',
        depth: 200,
        wyckoff_sensitivity: wyckoffSettings.sensitivity,
        volume_analysis: wyckoffSettings.volume_analysis,
        timeframes: wyckoffSettings.timeframes
      };

      await fetchUltimateAnalysis(
        selectedSymbol,
        setAnalysisData,
        setCurrentPrice,
        setLastUpdate,
        options
      );
      
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, wyckoffEnabled, wyckoffSettings, fetchUltimateAnalysis, setAnalysisData, setCurrentPrice, setLastUpdate]);

  // Effects
  useEffect(() => {
    if (selectedSymbol && fetchUltimateAnalysis) {
      handleRefresh();
    }
  }, [selectedSymbol, handleRefresh]);

  // مكونات التبويبات
  const TabNavigation = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
      <div className="flex space-x-2 space-x-reverse overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // مكون المقارنة المبسط (سيتم استبداله بمكون منفصل لاحقاً)
  const ComparisonTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <ScaleIcon className="w-6 h-6 text-orange-400" />
          <h3 className="text-orange-400 font-semibold text-lg">مقارنة العملات الرقمية</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['BTCUSDT', 'ETHUSDT', 'BNBUSDT'].map((symbol, index) => (
            <div key={symbol} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">{symbol}</h4>
                <div className="flex items-center space-x-1">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">+{(Math.random() * 10 + 2).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">السعر:</span>
                  <span className="text-white">${(Math.random() * 100000 + 1000).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">AI Score:</span>
                  <span className="text-purple-400">{(Math.random() * 40 + 60).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Volatility:</span>
                  <span className="text-yellow-400">{(Math.random() * 20 + 5).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* إضافة تحذير للمطور */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center space-x-2 space-x-reverse text-blue-400">
          <InformationCircleIcon className="w-5 h-5" />
          <span className="text-sm">
            💡 يمكن تطوير هذا التبويب ليستخدم Backend API لمقارنة حقيقية بين العملات
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
          لوحة تحكم التداول الذكي
        </h1>
        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
          <span>العملة: <span className="text-white font-semibold">{selectedSymbol}</span></span>
          {currentPrice && (
            <span>السعر: <span className="text-green-400 font-semibold">${currentPrice.toLocaleString()}</span></span>
          )}
          {lastUpdate && (
            <span>آخر تحديث: <span className="text-blue-400">{lastUpdate}</span></span>
          )}
        </div>
      </div>

      {/* إعدادات وايكوف */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <CogIcon className="w-6 h-6 text-orange-400" />
              <h3 className="text-orange-400 font-semibold text-lg">إعدادات تحليل وايكوف</h3>
            </div>
            
            <button
              onClick={() => setShowWyckoffSettings(!showWyckoffSettings)}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-white">تفعيل تحليل وايكوف</span>
            <button
              onClick={() => setWyckoffEnabled(!wyckoffEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                wyckoffEnabled ? 'bg-orange-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  wyckoffEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showWyckoffSettings && wyckoffEnabled && (
            <div className="space-y-4 pt-4 border-t border-orange-500/20">
              <div>
                <label className="block text-sm text-gray-400 mb-2">حساسية التحليل</label>
                <select
                  value={wyckoffSettings.sensitivity}
                  onChange={(e) => setWyckoffSettings(prev => ({ ...prev, sensitivity: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value="low">منخفض</option>
                  <option value="medium">متوسط</option>
                  <option value="high">عالي</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">تحليل متعدد الإطارات</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({ ...prev, multi_timeframe: !prev.multi_timeframe }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    wyckoffSettings.multi_timeframe ? 'bg-orange-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      wyckoffSettings.multi_timeframe ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">تحليل الحجم</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({ ...prev, volume_analysis: !prev.volume_analysis }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    wyckoffSettings.volume_analysis ? 'bg-orange-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      wyckoffSettings.volume_analysis ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* التبويبات */}
      <TabNavigation />

      {/* زر التحديث للتحليل */}
      {activeTab === 'analysis' && (
        <div className="flex justify-center mb-6">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 space-x-reverse"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'جاري التحليل...' : 'تحديث التحليل'}</span>
          </button>
        </div>
      )}

      {/* عرض الأخطاء */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse mb-6">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
          <div>
            <div className="text-red-400 font-semibold">خطأ في التحليل</div>
            <div className="text-red-300 text-sm">{error}</div>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
              disabled={loading}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* تحذير useAPI */}
      {!fetchUltimateAnalysis && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse mb-6">
          <InformationCircleIcon className="w-6 h-6 text-yellow-400" />
          <div>
            <div className="text-yellow-400 font-semibold">تحذير: useAPI hook غير متصل</div>
            <div className="text-yellow-300 text-sm">
              تأكد من وجود ملف useAPI.js في: <code className="bg-yellow-500/20 px-1 rounded">src/hooks/useAPI.js</code>
            </div>
          </div>
        </div>
      )}

      {/* محتوى التبويبات */}
      <div className="mt-6">
        {activeTab === 'analysis' && (
          <AnalysisTab 
            analysisData={analysisData}
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            loading={loading}
            onRefresh={handleRefresh}
          />
        )}
        
        {activeTab === 'ai_suggestions' && (
          <AISuggestionsTab 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
          />
        )}
        
        {activeTab === 'portfolio' && (
          <PortfolioTab 
            portfolioData={portfolioData}
            setPortfolioData={setPortfolioData}
          />
        )}
        
        {activeTab === 'investment' && (
          <InvestmentTab 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            analysisData={analysisData}
          />
        )}
        
        {activeTab === 'trading' && (
          <TradingTab 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            analysisData={analysisData}
            tradingData={tradingData}
            setTradingData={setTradingData}
          />
        )}
        
        {activeTab === 'backtest' && (
          <BacktestTab 
            selectedSymbol={selectedSymbol}
            analysisData={analysisData}
            backtestData={backtestData}
            setBacktestData={setBacktestData}
          />
        )}
        
        {activeTab === 'comparison' && <ComparisonTab />}
      </div>

      {/* معلومات التشخيص */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-xs mt-8">
        <div className="text-gray-400 mb-2">🔧 معلومات التشخيص:</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-gray-300">
          <div>الرمز: <span className="text-white">{selectedSymbol}</span></div>
          <div>التحميل: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'جاري' : 'مكتمل'}
          </span></div>
          <div>البيانات: <span className={analysisData ? 'text-green-400' : 'text-red-400'}>
            {analysisData ? 'متوفرة' : 'غير متوفرة'}
          </span></div>
          <div>وايكوف: <span className={wyckoffEnabled ? 'text-green-400' : 'text-gray-400'}>
            {wyckoffEnabled ? 'مفعل' : 'معطل'}
          </span></div>
          <div>useAPI: <span className={fetchUltimateAnalysis ? 'text-green-400' : 'text-red-400'}>
            {fetchUltimateAnalysis ? 'متصل' : 'غير متصل'}
          </span></div>
          <div>التبويب: <span className="text-blue-400">{activeTab}</span></div>
        </div>
      </div>

      {/* Footer للمطورين */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 mt-6 border border-blue-500/20">
        <div className="text-center text-sm text-gray-400">
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
            <CpuChipIcon className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">🚀 نسخة محسنة مع Backend AI</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-green-400">✅ نصائح AI:</span> من Backend API الحقيقي
            </div>
            <div>
              <span className="text-blue-400">🧠 تحليل متقدم:</span> طبقات AI متعددة + وايكوف
            </div>
            <div>
              <span className="text-purple-400">📊 بيانات حية:</span> تحديث مستمر من Binance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;