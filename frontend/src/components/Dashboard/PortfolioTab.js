// components/Dashboard/PortfolioTab.js
import React, { useState, useEffect } from 'react';
import { 
  WalletIcon, 
  PlusIcon, 
  TrashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlayIcon,
  PauseIcon
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

const PortfolioTab = ({ selectedSymbol }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    user_id: 'user_001',
    symbol: selectedSymbol || 'BTCUSDT',
    initial_balance: 1000,
    risk_level: 'MEDIUM'
  });
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    setNewPortfolio(prev => ({ ...prev, symbol: selectedSymbol || 'BTCUSDT' }));
  }, [selectedSymbol]);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trading/portfolios/user_001');
      setPortfolios(response.data.portfolios || []);
      setBackendConnected(true);
    } catch (error) {
      console.error('خطأ في جلب المحافظ:', error);
      setBackendConnected(false);
      // Use demo data
      setPortfolios([
        {
          id: 'demo-1',
          symbol: 'BTCUSDT',
          strategy: 'AI_HYBRID',
          risk_level: 'MEDIUM',
          is_active: true,
          created_at: new Date().toISOString(),
          performance: {
            current_balance: 1050.75,
            total_portfolio_value: 1125.30,
            total_return: 125.30,
            return_percentage: 12.53,
            success_rate: 75.5,
            total_trades: 8,
            successful_trades: 6
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async () => {
    try {
      const response = await api.post('/trading/portfolio/create', newPortfolio);
      setShowCreateModal(false);
      setNewPortfolio({
        user_id: 'user_001',
        symbol: selectedSymbol || 'BTCUSDT',
        initial_balance: 1000,
        risk_level: 'MEDIUM'
      });
      fetchPortfolios();
      setBackendConnected(true);
    } catch (error) {
      console.error('خطأ في إنشاء المحفظة:', error);
      setBackendConnected(false);
      // Show demo success
      alert('تم إنشاء المحفظة (وضع تجريبي)');
      setShowCreateModal(false);
    }
  };

  const deletePortfolio = async (portfolioId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المحفظة؟')) {
      try {
        await api.delete(`/trading/portfolio/${portfolioId}`);
        fetchPortfolios();
        setBackendConnected(true);
      } catch (error) {
        console.error('خطأ في حذف المحفظة:', error);
        setBackendConnected(false);
        // Demo delete
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      }
    }
  };

  const getPerformanceData = async (portfolioId) => {
    try {
      const response = await api.get(`/trading/portfolio/performance/${portfolioId}`);
      setPerformanceData(response.data);
      setSelectedPortfolio(portfolioId);
      setBackendConnected(true);
    } catch (error) {
      console.error('خطأ في جلب بيانات الأداء:', error);
      setBackendConnected(false);
      // Demo performance data
      setPerformanceData({
        total_portfolio_value: 1125.30,
        current_balance: 1050.75,
        current_position_value: 74.55,
        total_return: 125.30,
        return_percentage: 12.53,
        success_rate: 75.5,
        total_trades: 8,
        successful_trades: 6
      });
      setSelectedPortfolio(portfolioId);
    }
  };

  const executeAutoTrade = async (portfolioId) => {
    try {
      const response = await api.post(`/trading/portfolio/auto-trade/${portfolioId}`);
      console.log('نتيجة التداول التلقائي:', response.data);
      fetchPortfolios();
      setBackendConnected(true);
    } catch (error) {
      console.error('خطأ في التداول التلقائي:', error);
      setBackendConnected(false);
      // Demo trade execution
      alert('تم تنفيذ تداول تجريبي');
      fetchPortfolios();
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-green-400 bg-green-500/20';
      case 'HIGH': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getRiskLevelText = (level) => {
    switch (level) {
      case 'LOW': return 'منخفض';
      case 'HIGH': return 'عالي';
      default: return 'متوسط';
    }
  };

  const getReturnColor = (returnValue) => {
    if (returnValue > 0) return 'text-green-400';
    if (returnValue < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const PortfolioCard = ({ portfolio }) => {
    const performance = portfolio.performance;
    
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <WalletIcon className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">{portfolio.symbol}</h3>
              <span className={`px-2 py-1 rounded text-xs ${getRiskLevelColor(portfolio.risk_level)}`}>
                {getRiskLevelText(portfolio.risk_level)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => getPerformanceData(portfolio.id)}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
              title="عرض التفاصيل"
            >
              <ChartBarIcon className="w-5 h-5 text-blue-400" />
            </button>
            
            <button
              onClick={() => executeAutoTrade(portfolio.id)}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
              title="تنفيذ تداول تلقائي"
            >
              <PlayIcon className="w-5 h-5 text-green-400" />
            </button>
            
            <button
              onClick={() => deletePortfolio(portfolio.id)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              title="حذف المحفظة"
            >
              <TrashIcon className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {performance && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">الرصيد الحالي</div>
                <div className="text-xl font-bold text-white">
                  ${performance.current_balance?.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">إجمالي القيمة</div>
                <div className="text-xl font-bold text-white">
                  ${performance.total_portfolio_value?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">العائد</div>
                <div className={`text-lg font-semibold ${getReturnColor(performance.total_return)}`}>
                  {performance.return_percentage?.toFixed(2)}%
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">معدل النجاح</div>
                <div className="text-lg font-semibold text-blue-400">
                  {performance.success_rate?.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 pt-2 border-t border-white/10">
              إجمالي الصفقات: {performance.total_trades} | 
              الصفقات الناجحة: {performance.successful_trades}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CreatePortfolioModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">إنشاء محفظة جديدة</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">العملة</label>
              <select
                value={newPortfolio.symbol}
                onChange={(e) => setNewPortfolio(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="BTCUSDT">Bitcoin (BTC)</option>
                <option value="ETHUSDT">Ethereum (ETH)</option>
                <option value="BNBUSDT">Binance Coin (BNB)</option>
                <option value="SOLUSDT">Solana (SOL)</option>
                <option value="ADAUSDT">Cardano (ADA)</option>
                <option value="XRPUSDT">Ripple (XRP)</option>
                <option value="DOGEUSDT">Dogecoin (DOGE)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">الرصيد الأولي ($)</label>
              <input
                type="number"
                value={newPortfolio.initial_balance}
                onChange={(e) => setNewPortfolio(prev => ({ ...prev, initial_balance: parseFloat(e.target.value) }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                min="100"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">مستوى المخاطرة</label>
              <select
                value={newPortfolio.risk_level}
                onChange={(e) => setNewPortfolio(prev => ({ ...prev, risk_level: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              >
                <option value="LOW">منخفض - استثمار آمن</option>
                <option value="MEDIUM">متوسط - متوازن</option>
                <option value="HIGH">عالي - مخاطر عالية</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 space-x-reverse mt-6">
            <button
              onClick={createPortfolio}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg font-semibold transition-all"
            >
              إنشاء المحفظة
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <WalletIcon className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">إدارة المحافظ</h2>
            <p className="text-gray-400">إنشاء ومتابعة محافظ التداول التلقائي</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={fetchPortfolios}
            disabled={loading}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
            title="تحديث"
          >
            <ArrowPathIcon className={`w-5 h-5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>محفظة جديدة</span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!backendConnected && (
        <div className="bg-yellow-500/10 backdrop-blur-md rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center space-x-3 space-x-reverse">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">وضع تجريبي</span>
            <span className="text-gray-400 text-sm">- لا يمكن الاتصال بالخادم</span>
          </div>
        </div>
      )}

      {/* Portfolios Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-white/20 rounded"></div>
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : portfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد محافظ</h3>
          <p className="text-gray-400 mb-6">ابدأ بإنشاء محفظة تداول جديدة</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>إنشاء محفظة</span>
          </button>
        </div>
      )}

      {/* Performance Details Modal */}
      {performanceData && selectedPortfolio && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl mx-4 border border-white/20 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">تفاصيل الأداء</h2>
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400 mb-1">إجمالي القيمة</div>
                <div className="text-2xl font-bold text-white">
                  ${performanceData.total_portfolio_value?.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400 mb-1">العائد الإجمالي</div>
                <div className={`text-2xl font-bold ${getReturnColor(performanceData.total_return)}`}>
                  ${performanceData.total_return?.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">الرصيد الحالي:</span>
                <span className="text-white font-semibold">${performanceData.current_balance?.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">قيمة المراكز:</span>
                <span className="text-white font-semibold">${performanceData.current_position_value?.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">نسبة العائد:</span>
                <span className={`font-semibold ${getReturnColor(performanceData.return_percentage)}`}>
                  {performanceData.return_percentage?.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">معدل النجاح:</span>
                <span className="text-blue-400 font-semibold">{performanceData.success_rate?.toFixed(1)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">إجمالي الصفقات:</span>
                <span className="text-white font-semibold">{performanceData.total_trades}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">الصفقات الناجحة:</span>
                <span className="text-green-400 font-semibold">{performanceData.successful_trades}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreatePortfolioModal />
    </div>
  );
};

export default PortfolioTab;