import React, { useState, useEffect } from 'react';
import { 
  WalletIcon, 
  BanknotesIcon, 
  ChartPieIcon, 
  ArrowTrendingUpIcon,
  PlusIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export const PortfolioTab = ({ selectedSymbol, currentPrice }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [setupAmount, setSetupAmount] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false);
  const [newPortfolioAmount, setNewPortfolioAmount] = useState('1000');
  const [notification, setNotification] = useState(null);

  // Load portfolios from localStorage on mount
  useEffect(() => {
    const savedPortfolios = localStorage.getItem('trading_portfolios');
    const savedBalance = localStorage.getItem('trading_balance');
    const isSetupComplete = localStorage.getItem('portfolio_setup_complete');
    
    if (savedPortfolios) {
      try {
        setPortfolios(JSON.parse(savedPortfolios));
      } catch (e) {
        console.error('خطأ في تحميل المحافظ:', e);
      }
    }
    
    if (savedBalance) {
      setTotalBalance(parseFloat(savedBalance));
    }

    if (isSetupComplete === 'true' && savedBalance) {
      setIsSetupMode(false);
    }
  }, []);

  // Save to localStorage whenever portfolios or balance changes
  useEffect(() => {
    if (!isSetupMode) {
      localStorage.setItem('trading_portfolios', JSON.stringify(portfolios));
      localStorage.setItem('trading_balance', totalBalance.toString());
    }
  }, [portfolios, totalBalance, isSetupMode]);

  // Setup initial investment amount
  const completeSetup = () => {
    const amount = parseFloat(setupAmount);
    if (amount && amount > 0) {
      setTotalBalance(amount);
      setIsSetupMode(false);
      localStorage.setItem('trading_balance', amount.toString());
      localStorage.setItem('portfolio_setup_complete', 'true');
      showNotification('تم إعداد محفظتك بنجاح!', 'success');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Create new portfolio
  const createPortfolio = () => {
    const amount = parseFloat(newPortfolioAmount);
    if (amount && amount > 0 && amount <= totalBalance) {
      const newPortfolio = {
        id: Date.now().toString(),
        name: `محفظة ${selectedSymbol}`,
        symbol: selectedSymbol,
        initialAmount: amount,
        currentValue: amount,
        position: 0,
        entryPrice: 0,
        pnl: 0,
        pnlPercentage: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      setPortfolios(prev => [...prev, newPortfolio]);
      setTotalBalance(prev => prev - amount);
      setShowCreatePortfolio(false);
      setNewPortfolioAmount('1000');
      showNotification('تم إنشاء المحفظة بنجاح!', 'success');
    }
  };

  if (isSetupMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <WalletIcon className="w-16 h-16 text-blue-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">إعداد محفظة التداول</h2>
          <p className="text-gray-300 mb-6">
            مرحباً! دعنا نبدأ بإعداد محفظة التداول الخاصة بك. كم المبلغ الذي تريد استثماره؟
          </p>
          
          <div className="space-y-4">
            <input
              type="number"
              value={setupAmount}
              onChange={(e) => setSetupAmount(e.target.value)}
              placeholder="أدخل المبلغ بالدولار"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-xl font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex justify-center space-x-2 space-x-reverse">
              {[1000, 5000, 10000, 50000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setSetupAmount(amount.toString())}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={completeSetup}
              disabled={!setupAmount || parseFloat(setupAmount) <= 0}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              إعداد المحفظة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg p-4 border shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
          notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
          'bg-blue-500/20 border-blue-500/30 text-blue-400'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">الرصيد الإجمالي</h3>
            <WalletIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            ${totalBalance.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">متاح للاستثمار</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">المحافظ النشطة</h3>
            <ChartPieIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {portfolios.length}
          </div>
          <div className="text-sm text-gray-400 mt-2">محفظة تداول</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">الربح/الخسارة</h3>
            <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-green-400">
            +$0.00
          </div>
          <div className="text-sm text-gray-400 mt-2">0.00%</div>
        </div>
      </div>

      {/* Create Portfolio Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">محافظ التداول</h2>
        <button
          onClick={() => setShowCreatePortfolio(true)}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 space-x-reverse"
        >
          <PlusIcon className="w-4 h-4" />
          <span>إنشاء محفظة جديدة</span>
        </button>
      </div>

      {/* Create Portfolio Modal */}
      {showCreatePortfolio && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">إنشاء محفظة جديدة</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المبلغ المراد استثماره:
              </label>
              <input
                type="number"
                value={newPortfolioAmount}
                onChange={(e) => setNewPortfolioAmount(e.target.value)}
                max={totalBalance}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-400 mt-1">
                الرصيد المتاح: ${totalBalance.toLocaleString()}
              </div>
            </div>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={createPortfolio}
                disabled={!newPortfolioAmount || parseFloat(newPortfolioAmount) <= 0 || parseFloat(newPortfolioAmount) > totalBalance}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all"
              >
                إنشاء المحفظة
              </button>
              <button
                onClick={() => setShowCreatePortfolio(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolios List */}
      {portfolios.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{portfolio.name}</h3>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="text-gray-400 hover:text-white">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-red-400">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">المبلغ الأولي:</span>
                  <span className="text-white font-semibold">${portfolio.initialAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">القيمة الحالية:</span>
                  <span className="text-white font-semibold">${portfolio.currentValue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">الربح/الخسارة:</span>
                  <span className={`font-semibold ${
                    portfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${portfolio.pnl.toFixed(2)} ({portfolio.pnlPercentage.toFixed(2)}%)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">الحالة:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    portfolio.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {portfolio.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChartPieIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد محافظ بعد</h3>
          <p className="text-gray-400 mb-6">ابدأ بإنشاء محفظة تداول جديدة لتتبع استثماراتك</p>
          <button
            onClick={() => setShowCreatePortfolio(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            إنشاء محفظة جديدة
          </button>
        </div>
      )}
    </div>
  );
};