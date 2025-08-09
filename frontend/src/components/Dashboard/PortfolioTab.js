// components/Dashboard/PortfolioTab.js
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
  XMarkIcon
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

  // Update portfolio values when price changes
  useEffect(() => {
    if (currentPrice) {
      setPortfolios(prev => prev.map(portfolio => {
        if (portfolio.symbol === selectedSymbol) {
          const newValue = (portfolio.position || 0) * currentPrice;
          const newPnl = newValue - ((portfolio.position || 0) * (portfolio.entryPrice || 0));
          const newPnlPercentage = portfolio.entryPrice ? 
            (newPnl / ((portfolio.position || 0) * portfolio.entryPrice)) * 100 : 0;
          
          return {
            ...portfolio,
            currentValue: newValue,
            pnl: newPnl,
            pnlPercentage: newPnlPercentage
          };
        }
        return portfolio;
      }));
    }
  }, [currentPrice, selectedSymbol]);

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

  // Reset portfolio setup
  const resetSetup = () => {
    setIsSetupMode(true);
    setTotalBalance(0);
    setPortfolios([]);
    setSetupAmount('');
    localStorage.removeItem('portfolio_setup_complete');
    localStorage.removeItem('trading_balance');
    localStorage.removeItem('trading_portfolios');
    showNotification('تم إعادة تعيين المحفظة', 'info');
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Create new portfolio
  const createPortfolio = () => {
    const amount = parseFloat(newPortfolioAmount);
    
    if (!currentPrice) {
      showNotification('لا يمكن إنشاء محفظة بدون سعر حالي', 'error');
      return;
    }

    if (amount > totalBalance) {
      showNotification('الرصيد غير كافي', 'error');
      return;
    }

    if (amount <= 0) {
      showNotification('يرجى إدخال مبلغ صالح', 'error');
      return;
    }

    const quantity = amount / currentPrice;
    
    const newPortfolio = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      name: `محفظة ${selectedSymbol}`,
      balance: amount,
      position: quantity,
      entryPrice: currentPrice,
      currentValue: amount,
      pnl: 0,
      pnlPercentage: 0,
      isActive: true,
      risk_level: 'MEDIUM',
      created_at: new Date().toISOString(),
      trades: [{
        type: 'BUY',
        amount: quantity,
        price: currentPrice,
        date: new Date().toLocaleDateString('ar-SA'),
        profit: 0
      }]
    };
    
    setPortfolios(prev => [newPortfolio, ...prev]);
    setTotalBalance(prev => prev - amount);
    setShowCreatePortfolio(false);
    setNewPortfolioAmount('1000');
    
    showNotification(`تم إنشاء محفظة ${selectedSymbol} بنجاح!`, 'success');
  };

  // Delete portfolio
  const deletePortfolio = (portfolioId) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio && portfolio.position > 0) {
      const returnValue = portfolio.position * (currentPrice || portfolio.entryPrice || 0);
      setTotalBalance(prev => prev + returnValue);
    }
    
    setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
    
    if (selectedPortfolio?.id === portfolioId) {
      setSelectedPortfolio(null);
    }
    
    showNotification('تم حذف المحفظة بنجاح', 'success');
  };

  // Toggle portfolio status
  const togglePortfolioStatus = (portfolioId) => {
    setPortfolios(prev => prev.map(p => 
      p.id === portfolioId ? {...p, isActive: !p.isActive} : p
    ));
    
    const portfolio = portfolios.find(p => p.id === portfolioId);
    showNotification(
      `تم ${portfolio?.isActive ? 'إيقاف' : 'تشغيل'} المحفظة`, 
      'info'
    );
  };

  // Calculate total portfolio value
  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const totalPnL = portfolios.reduce((sum, p) => sum + (p.pnl || 0), 0);

  // Setup Mode Component
  if (isSetupMode) {
    return (
      <div className="space-y-6">
        {/* Setup Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
              <WalletIcon className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">مرحباً بك في محفظة التداول</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            لبدء التداول، يرجى تحديد المبلغ الإجمالي الذي تريد استثماره. 
            سيتم استخدام هذا المبلغ لإنشاء وإدارة محافظك الاستثمارية.
          </p>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3">المبلغ الإجمالي للاستثمار</label>
              <div className="relative">
                <input
                  type="number"
                  value={setupAmount}
                  onChange={(e) => setSetupAmount(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-xl font-bold focus:border-blue-400 focus:outline-none"
                  placeholder="100000"
                  min="100"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[10000, 25000, 50000, 100000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setSetupAmount(amount.toString())}
                  className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white transition-colors"
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              onClick={completeSetup}
              disabled={!setupAmount || parseFloat(setupAmount) <= 0}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              بدء التداول
            </button>

            <p className="text-gray-500 text-sm">
              يمكنك تغيير هذا المبلغ لاحقاً من إعدادات المحفظة
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <ChartPieIcon className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">إدارة المحافظ</h3>
            <p className="text-gray-400 text-sm">
              قم بإنشاء وإدارة محافظ متعددة لعملات مختلفة
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">تتبع الأرباح</h3>
            <p className="text-gray-400 text-sm">
              راقب أداء استثماراتك وأرباحك في الوقت الفعلي
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <BanknotesIcon className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">إدارة المخاطر</h3>
            <p className="text-gray-400 text-sm">
              أدوات متقدمة لإدارة المخاطر وحماية رأس المال
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Portfolio Interface
  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg p-4 border shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
          notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
          'bg-blue-500/20 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-center space-x-2 space-x-reverse">
            {notification.type === 'success' && <CheckIcon className="w-5 h-5" />}
            {notification.type === 'error' && <XMarkIcon className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-8 h-8 text-green-400" />
            <div className="text-green-400 text-sm">الرصيد المتاح</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalBalance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            للاستثمار الجديد
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <WalletIcon className="w-8 h-8 text-blue-400" />
            <div className="text-blue-400 text-sm">إجمالي المحافظ</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalPortfolioValue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            القيمة الحالية
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <ChartPieIcon className="w-8 h-8 text-purple-400" />
            <div className="text-purple-400 text-sm">عدد المحافظ</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {portfolios.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            محفظة نشطة
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <ArrowTrendingUpIcon className="w-8 h-8 text-yellow-400" />
            <div className="text-yellow-400 text-sm">إجمالي الربح/الخسارة</div>
          </div>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {((totalPnL / (totalPortfolioValue - totalPnL)) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Create Portfolio Section */}
      {showCreatePortfolio && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6">إنشاء محفظة جديدة - {selectedSymbol}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">مبلغ الاستثمار ($)</label>
              <input
                type="number"
                value={newPortfolioAmount}
                onChange={(e) => setNewPortfolioAmount(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
                placeholder="1000"
                min="1"
                max={totalBalance}
              />
              
              {currentPrice && (
                <div className="mt-2 text-sm text-gray-400">
                  الكمية المتوقعة: {(parseFloat(newPortfolioAmount) / currentPrice).toFixed(6)} {selectedSymbol.replace('USDT', '')}
                </div>
              )}
            </div>

            <div className="flex items-end space-x-3 space-x-reverse">
              <button
                onClick={createPortfolio}
                disabled={!currentPrice || parseFloat(newPortfolioAmount) > totalBalance || parseFloat(newPortfolioAmount) <= 0}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
              >
                إنشاء المحفظة
              </button>
              
              <button
                onClick={() => setShowCreatePortfolio(false)}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>

          {parseFloat(newPortfolioAmount) > totalBalance && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="text-red-400 text-sm">
                المبلغ المطلوب أكبر من الرصيد المتاح (${totalBalance.toLocaleString()})
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolios List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">محافظ التداول</h3>
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={() => setShowCreatePortfolio(!showCreatePortfolio)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <PlusIcon className="w-5 h-5" />
              <span>إنشاء محفظة</span>
            </button>
            
            <button
              onClick={resetSetup}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <CogIcon className="w-5 h-5" />
              <span>إعادة تعيين</span>
            </button>
          </div>
        </div>

        {portfolios.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <WalletIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">لا توجد محافظ حالياً</p>
            <p className="text-sm">ابدأ بإنشاء محفظة جديدة لبدء التداول</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="text-lg font-semibold text-white">
                      {portfolio.symbol}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${portfolio.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePortfolioStatus(portfolio.id)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title={portfolio.isActive ? 'إيقاف' : 'تشغيل'}
                    >
                      {portfolio.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deletePortfolio(portfolio.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="حذف"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">القيمة الحالية:</span>
                    <span className="text-white font-semibold">
                      ${(portfolio.currentValue || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الكمية:</span>
                    <span className="text-white">
                      {(portfolio.position || 0).toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">سعر الشراء:</span>
                    <span className="text-white">
                      ${(portfolio.entryPrice || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الربح/الخسارة:</span>
                    <span className={`font-semibold ${(portfolio.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(portfolio.pnl || 0) >= 0 ? '+' : ''}${(portfolio.pnl || 0).toFixed(2)} ({(portfolio.pnlPercentage || 0).toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">عدد الصفقات:</span>
                    <span className="text-white">
                      {portfolio.trades?.length || 0}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPortfolio(portfolio)}
                  className="w-full mt-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>عرض التفاصيل</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Details Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                تفاصيل محفظة {selectedPortfolio.symbol}
              </h3>
              <button
                onClick={() => setSelectedPortfolio(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Portfolio Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">القيمة الحالية</div>
                  <div className="text-white text-xl font-semibold">
                    ${selectedPortfolio.currentValue.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">الربح/الخسارة</div>
                  <div className={`text-xl font-semibold ${selectedPortfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedPortfolio.pnl >= 0 ? '+' : ''}${selectedPortfolio.pnl.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">الكمية المملوكة</div>
                  <div className="text-white text-xl font-semibold">
                    {selectedPortfolio.position.toFixed(6)}
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">نسبة الربح/الخسارة</div>
                  <div className={`text-xl font-semibold ${selectedPortfolio.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedPortfolio.pnlPercentage >= 0 ? '+' : ''}{selectedPortfolio.pnlPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Trade History */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">سجل التداول</h4>
                {selectedPortfolio.trades && selectedPortfolio.trades.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPortfolio.trades.map((trade, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className={`w-3 h-3 rounded-full ${trade.type === 'BUY' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <div>
                            <div className="text-white font-semibold">{trade.type === 'BUY' ? 'شراء' : 'بيع'}</div>
                            <div className="text-gray-400 text-sm">{trade.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{trade.amount.toFixed(6)} وحدة</div>
                          <div className="text-gray-400 text-sm">${trade.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">لا توجد صفقات</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
