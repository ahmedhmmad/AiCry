// components/Dashboard/InvestmentTab.js
import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon,  // تم التصحيح من TrendingUpIcon
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTrendingDownIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export const InvestmentTab = ({ selectedSymbol, currentPrice, analysisData }) => {
  const [investments, setInvestments] = useState([]);
  const [availableCapital, setAvailableCapital] = useState(0);
  const [showNewInvestment, setShowNewInvestment] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    amount: '',
    strategy: 'DCA',
    duration: '12',
    frequency: 'monthly'
  });
  const [notification, setNotification] = useState(null);

  // Load data from localStorage and portfolio allocation
  useEffect(() => {
    const savedInvestments = localStorage.getItem('long_term_investments');
    const portfolioAllocations = localStorage.getItem('portfolio_allocations');
    
    if (savedInvestments) {
      try {
        setInvestments(JSON.parse(savedInvestments));
      } catch (e) {
        console.error('خطأ في تحميل الاستثمارات:', e);
      }
    }

    // Get available capital from portfolio allocation
    if (portfolioAllocations) {
      try {
        const allocations = JSON.parse(portfolioAllocations);
        const investmentAllocation = allocations.find(alloc => 
          alloc.category.includes('استثمار') || alloc.category.includes('الاستثمار')
        );
        if (investmentAllocation) {
          setAvailableCapital(investmentAllocation.allocated || 0);
        }
      } catch (e) {
        console.error('خطأ في تحميل تخصيص الاستثمار:', e);
        setAvailableCapital(50000); // Default fallback
      }
    } else {
      setAvailableCapital(50000); // Default fallback
    }
  }, []);

  // Save investments to localStorage
  useEffect(() => {
    localStorage.setItem('long_term_investments', JSON.stringify(investments));
  }, [investments]);

  // Update investment values based on current prices
  useEffect(() => {
    if (currentPrice) {
      setInvestments(prev => prev.map(investment => {
        if (investment.symbol === selectedSymbol) {
          const currentValue = investment.totalShares * currentPrice;
          const totalInvested = investment.purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
          const pnl = currentValue - totalInvested;
          const pnlPercentage = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
          
          return {
            ...investment,
            currentPrice,
            currentValue,
            totalInvested,
            pnl,
            pnlPercentage
          };
        }
        return investment;
      }));
    }
  }, [currentPrice, selectedSymbol]);

  // Create new investment
  const createInvestment = () => {
    const amount = parseFloat(newInvestment.amount);
    
    if (amount <= 0) {
      showNotification('يرجى إدخال مبلغ صالح', 'error');
      return;
    }

    if (amount > availableCapital) {
      showNotification('المبلغ أكبر من رأس المال المتاح للاستثمار', 'error');
      return;
    }

    if (!currentPrice) {
      showNotification('لا يمكن إنشاء استثمار بدون سعر حالي', 'error');
      return;
    }

    const shares = amount / currentPrice;
    const investment = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      strategy: newInvestment.strategy,
      duration: parseInt(newInvestment.duration),
      frequency: newInvestment.frequency,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + parseInt(newInvestment.duration) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      initialAmount: amount,
      totalShares: shares,
      averagePrice: currentPrice,
      currentPrice,
      currentValue: amount,
      totalInvested: amount,
      pnl: 0,
      pnlPercentage: 0,
      isActive: true,
      purchases: [{
        date: new Date().toISOString(),
        amount: amount,
        price: currentPrice,
        shares: shares,
        type: 'initial'
      }],
      nextPurchaseDate: getNextPurchaseDate(newInvestment.frequency)
    };

    setInvestments(prev => [investment, ...prev]);
    setAvailableCapital(prev => prev - amount);
    setShowNewInvestment(false);
    setNewInvestment({ amount: '', strategy: 'DCA', duration: '12', frequency: 'monthly' });
    
    showNotification(`تم إنشاء استثمار في ${selectedSymbol} بنجاح!`, 'success');
  };

  // Calculate next purchase date based on frequency
  const getNextPurchaseDate = (frequency) => {
    const now = new Date();
    switch (frequency) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()).toISOString();
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  // Execute DCA purchase
  const executeDCAPurchase = (investmentId, amount) => {
    if (!currentPrice) return;

    const shares = amount / currentPrice;
    
    setInvestments(prev => prev.map(investment => {
      if (investment.id === investmentId) {
        const newTotalShares = investment.totalShares + shares;
        const newTotalInvested = investment.totalInvested + amount;
        const newAveragePrice = newTotalInvested / newTotalShares;
        
        return {
          ...investment,
          totalShares: newTotalShares,
          averagePrice: newAveragePrice,
          totalInvested: newTotalInvested,
          purchases: [...investment.purchases, {
            date: new Date().toISOString(),
            amount,
            price: currentPrice,
            shares,
            type: 'dca'
          }],
          nextPurchaseDate: getNextPurchaseDate(investment.frequency)
        };
      }
      return investment;
    }));

    setAvailableCapital(prev => prev - amount);
    showNotification(`تم تنفيذ شراء DCA بقيمة ${amount}`, 'success');
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate total portfolio value
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.totalInvested || 0), 0);
  const totalPnL = totalInvestmentValue - totalInvested;
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

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

      {/* Investment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-8 h-8 text-green-400" />
            <div className="text-green-400 text-sm">رأس المال المتاح</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${availableCapital.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">للاستثمار طويل المدى</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <ArrowTrendingUpIcon className="w-8 h-8 text-blue-400" />
            <div className="text-blue-400 text-sm">إجمالي الاستثمارات</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalInvestmentValue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">القيمة الحالية</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-400" />
            <div className="text-purple-400 text-sm">إجمالي المستثمر</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalInvested.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">المبلغ المدفوع</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <ArrowTrendingUpIcon className="w-8 h-8 text-yellow-400" />
            <div className="text-yellow-400 text-sm">الربح/الخسارة</div>
          </div>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </div>
          <div className={`text-xs mt-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* AI Investment Recommendation */}
      {analysisData?.ultimate_decision && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">توصية الاستثمار الذكية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  analysisData.ultimate_decision.final_recommendation === 'BUY' ? 'bg-green-400' :
                  analysisData.ultimate_decision.final_recommendation === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                <span className="text-white font-semibold">
                  توصية للاستثمار في {selectedSymbol}
                </span>
              </div>
              <div className="text-gray-400 text-sm mb-2">
                {analysisData.ultimate_decision.reasoning}
              </div>
              <div className="text-white">
                مستوى الثقة: {analysisData.ultimate_decision.final_confidence}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400 text-sm">مناسب للاستثمار طويل المدى:</div>
              <div className={`text-sm font-semibold ${
                analysisData.ultimate_decision.final_confidence > 70 ? 'text-green-400' :
                analysisData.ultimate_decision.final_confidence > 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {analysisData.ultimate_decision.final_confidence > 70 ? '✅ مناسب جداً' :
                 analysisData.ultimate_decision.final_confidence > 50 ? '⚠️ مناسب مع حذر' : '❌ غير مناسب حالياً'}
              </div>
              <div className="text-xs text-gray-500">
                الاستثمار طويل المدى يتطلب ثقة عالية (70%+)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Investment */}
      {showNewInvestment && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-6">إنشاء استثمار جديد - {selectedSymbol}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">المبلغ الأولي ($)</label>
                <input
                  type="number"
                  value={newInvestment.amount}
                  onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
                  placeholder="5000"
                  min="100"
                  max={availableCapital}
                />
                {currentPrice && newInvestment.amount && (
                  <div className="text-sm text-gray-400 mt-1">
                    الأسهم: {(parseFloat(newInvestment.amount) / currentPrice).toFixed(6)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">استراتيجية الاستثمار</label>
                <select
                  value={newInvestment.strategy}
                  onChange={(e) => setNewInvestment({...newInvestment, strategy: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="DCA" className="bg-slate-800">متوسط التكلفة (DCA)</option>
                  <option value="LUMP_SUM" className="bg-slate-800">استثمار مبلغ مقطوع</option>
                  <option value="VALUE_AVERAGING" className="bg-slate-800">متوسط القيمة</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">مدة الاستثمار (شهر)</label>
                <select
                  value={newInvestment.duration}
                  onChange={(e) => setNewInvestment({...newInvestment, duration: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="6" className="bg-slate-800">6 أشهر</option>
                  <option value="12" className="bg-slate-800">سنة واحدة</option>
                  <option value="24" className="bg-slate-800">سنتان</option>
                  <option value="36" className="bg-slate-800">3 سنوات</option>
                  <option value="60" className="bg-slate-800">5 سنوات</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">تكرار الشراء (DCA)</label>
                <select
                  value={newInvestment.frequency}
                  onChange={(e) => setNewInvestment({...newInvestment, frequency: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
                  disabled={newInvestment.strategy === 'LUMP_SUM'}
                >
                  <option value="weekly" className="bg-slate-800">أسبوعياً</option>
                  <option value="monthly" className="bg-slate-800">شهرياً</option>
                  <option value="quarterly" className="bg-slate-800">ربع سنوي</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse mt-6">
            <button
              onClick={() => setShowNewInvestment(false)}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={createInvestment}
              disabled={!newInvestment.amount || parseFloat(newInvestment.amount) <= 0 || !currentPrice}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              إنشاء الاستثمار
            </button>
          </div>

          {parseFloat(newInvestment.amount) > availableCapital && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              المبلغ أكبر من رأس المال المتاح (${availableCapital.toLocaleString()})
            </div>
          )}
        </div>
      )}

      {/* Investments List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">الاستثمارات طويلة المدى</h3>
          <button
            onClick={() => setShowNewInvestment(!showNewInvestment)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>استثمار جديد</span>
          </button>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ArrowTrendingUpIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">لا توجد استثمارات حالياً</p>
            <p className="text-sm">ابدأ استثمارك طويل المدى اليوم</p>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((investment) => (
              <div
                key={investment.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{investment.symbol}</h4>
                      <p className="text-gray-400 text-sm">
                        {investment.strategy} • {investment.frequency === 'monthly' ? 'شهرياً' : 
                         investment.frequency === 'weekly' ? 'أسبوعياً' : 'ربع سنوي'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold text-lg">
                      ${investment.currentValue?.toFixed(2) || '0.00'}
                    </div>
                    <div className={`text-sm ${(investment.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(investment.pnl || 0) >= 0 ? '+' : ''}${(investment.pnl || 0).toFixed(2)} 
                      ({(investment.pnlPercentage || 0).toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">إجمالي الأسهم</div>
                    <div className="text-white font-semibold">
                      {investment.totalShares?.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">متوسط السعر</div>
                    <div className="text-white font-semibold">
                      ${investment.averagePrice?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">إجمالي المستثمر</div>
                    <div className="text-white font-semibold">
                      ${investment.totalInvested?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">عدد الشراءات</div>
                    <div className="text-white font-semibold">
                      {investment.purchases?.length || 0}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      بدأ: {new Date(investment.startDate).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 space-x-reverse">
                    {investment.strategy === 'DCA' && investment.isActive && (
                      <button
                        onClick={() => executeDCAPurchase(investment.id, investment.initialAmount / 10)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        شراء DCA
                      </button>
                    )}
                    <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1 space-x-reverse">
                      <EyeIcon className="w-4 h-4" />
                      <span>التفاصيل</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar for investment duration */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>تقدم الاستثمار</span>
                    <span>
                      {Math.round(((Date.now() - new Date(investment.startDate).getTime()) / 
                                  (new Date(investment.endDate).getTime() - new Date(investment.startDate).getTime())) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-400"
                      style={{ 
                        width: `${Math.min(((Date.now() - new Date(investment.startDate).getTime()) / 
                                           (new Date(investment.endDate).getTime() - new Date(investment.startDate).getTime())) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
