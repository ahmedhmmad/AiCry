import React, { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CpuChipIcon,
  SparklesIcon,
  ScaleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// Import separated components
import { TabNavigation } from './TabNavigation';
import { AnalysisTab } from './AnalysisTab';
import { PortfolioTab } from './PortfolioTab';
import { InvestmentTab } from './InvestmentTab';
import { TradingTab } from './TradingTab';
import { BacktestTab } from './BacktestTab';
import { ComparisonTab } from './ComparisonTab';

const Dashboard = (props) => {
  // Protection from undefined props
  const selectedSymbol = props?.selectedSymbol || 'BTCUSDT';
  const analysisData = props?.analysisData || null;
  const setAnalysisData = props?.setAnalysisData || (() => {});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  
  // Wyckoff analysis settings
  const [wyckoffEnabled, setWyckoffEnabled] = useState(true);
  const [wyckoffSettings, setWyckoffSettings] = useState({
    sensitivity: 'medium',
    multi_timeframe: true,
    volume_analysis: true,
    timeframes: ['1h', '4h', '1d']
  });
  const [showWyckoffSettings, setShowWyckoffSettings] = useState(false);

  // Display settings
  const [viewMode, setViewMode] = useState('enhanced');
  const [showCalculations, setShowCalculations] = useState(false);

  // Update function with Wyckoff settings
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Attempting analysis:', selectedSymbol);
      
      const params = new URLSearchParams();
      params.append('interval', '1h'); // Add interval parameter
      params.append('include_wyckoff', wyckoffEnabled.toString());
      
      if (wyckoffEnabled) {
        params.append('multi_timeframe_wyckoff', wyckoffSettings.multi_timeframe.toString());
        // Remove parameters that don't exist in the backend
        // params.append('wyckoff_sensitivity', wyckoffSettings.sensitivity);
        // params.append('wyckoff_timeframes', wyckoffSettings.timeframes.join(','));
        // params.append('volume_analysis', wyckoffSettings.volume_analysis.toString());
      }
      
      console.log('📤 Sending request with params:', params.toString());
      
      const response = await fetch(`/ai/ultimate-analysis/${selectedSymbol}?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`خطأ في الخادم: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📥 Analysis received:', data);
      
      if (data.current_price) {
        setCurrentPrice(data.current_price);
      }
      
      setAnalysisData(data);
      setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh on symbol change
  useEffect(() => {
    handleRefresh();
  }, [selectedSymbol]);

  // Component definitions for tabs
  const AnalysisTabContent = () => (
    <AnalysisTab 
      loading={loading}
      currentPrice={currentPrice}
      lastUpdate={lastUpdate}
      analysisData={analysisData}
      onRefresh={handleRefresh}
      selectedSymbol={selectedSymbol}
      wyckoffEnabled={wyckoffEnabled}
      wyckoffSettings={wyckoffSettings}
      viewMode={viewMode}
      setViewMode={setViewMode}
      showCalculations={showCalculations}
      setShowCalculations={setShowCalculations}
    />
  );

  const PortfolioTabContent = () => (
    <PortfolioTab 
      selectedSymbol={selectedSymbol}
      currentPrice={currentPrice}
      analysisData={analysisData}
    />
  );

  const InvestmentTabContent = () => (
    <InvestmentTab 
      selectedSymbol={selectedSymbol}
      currentPrice={currentPrice}
      analysisData={analysisData}
    />
  );

  const TradingTabContent = () => (
    <TradingTab 
      selectedSymbol={selectedSymbol}
      currentPrice={currentPrice}
      analysisData={analysisData}
    />
  );

  const BacktestTabContent = () => (
    <BacktestTab 
      selectedSymbol={selectedSymbol}
      analysisData={analysisData}
    />
  );

  const ComparisonTabContent = () => (
    <ComparisonTab 
      selectedSymbol={selectedSymbol}
      analysisData={analysisData}
    />
  );

  return (
    <div className="space-y-6">
      {/* Symbol Header with Loading State */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-2xl font-bold text-white">{selectedSymbol}</div>
            {loading && (
              <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
            )}
          </div>
          <div className="text-sm text-gray-400">
            {loading ? 'جاري تحميل البيانات...' : `آخر تحديث: ${lastUpdate || 'لم يتم التحديث'}`}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Wyckoff Settings Panel */}
      {activeTab === 'analysis' && (
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Cog6ToothIcon className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">إعدادات تحليل وايكوف</span>
            </div>
            <button
              onClick={() => setShowWyckoffSettings(!showWyckoffSettings)}
              className="text-gray-400 hover:text-white"
            >
              {showWyckoffSettings ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">تفعيل تحليل وايكوف</span>
            <button
              onClick={() => setWyckoffEnabled(!wyckoffEnabled)}
              className={`relative inline-flex h-6 w-12 rounded-full transition-colors ${
                wyckoffEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${
                  wyckoffEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showWyckoffSettings && wyckoffEnabled && (
            <div className="mt-4 space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">تحليل متعدد الإطارات الزمنية</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({
                    ...prev,
                    multi_timeframe: !prev.multi_timeframe
                  }))}
                  className={`relative inline-flex h-5 w-10 rounded-full transition-colors ${
                    wyckoffSettings.multi_timeframe ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-1 ${
                      wyckoffSettings.multi_timeframe ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">تحليل الحجم</span>
                <button
                  onClick={() => setWyckoffSettings(prev => ({
                    ...prev,
                    volume_analysis: !prev.volume_analysis
                  }))}
                  className={`relative inline-flex h-5 w-10 rounded-full transition-colors ${
                    wyckoffSettings.volume_analysis ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-1 ${
                      wyckoffSettings.volume_analysis ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refresh Button - only shows in analysis tab */}
      {activeTab === 'analysis' && (
        <div className="flex justify-center">
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse">
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

      {/* Tab Content */}
      {activeTab === 'analysis' && <AnalysisTabContent />}
      {activeTab === 'portfolio' && <PortfolioTabContent />}
      {activeTab === 'investment' && <InvestmentTabContent />}
      {activeTab === 'trading' && <TradingTabContent />}
      {activeTab === 'backtest' && <BacktestTabContent />}
      {activeTab === 'comparison' && <ComparisonTabContent />}

      {/* Diagnostic Information */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-xs">
        <div className="text-gray-400 mb-2 flex items-center space-x-2 space-x-reverse">
          <span>🔧 معلومات التشخيص:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-gray-300">
          <div>الرمز: <span className="text-white">{selectedSymbol}</span></div>
          <div>حالة التحميل: <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'جاري التحميل' : 'مكتمل'}
          </span></div>
          <div>البيانات: <span className={analysisData ? 'text-green-400' : 'text-red-400'}>
            {analysisData ? 'متوفرة' : 'غير متوفرة'}
          </span></div>
          <div>وايكوف: <span className={wyckoffEnabled ? 'text-green-400' : 'text-gray-500'}>
            {wyckoffEnabled ? 'مفعل' : 'معطل'}
          </span></div>
          <div>التبويب النشط: <span className="text-white">{activeTab}</span></div>
          <div>آخر تحديث: <span className="text-white">{lastUpdate || 'لم يتم'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;