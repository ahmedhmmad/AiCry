// src/components/Dashboard/TradingTab.js
import React, { useState, useEffect } from 'react';
import { 
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartBarIcon,
  FireIcon,
  StopIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Helper function for recommendation text
const getRecommendationText = (recommendation) => {
  const texts = {
    'BUY': 'شراء',
    'STRONG_BUY': 'شراء قوي',
    'WEAK_BUY': 'شراء ضعيف',
    'SELL': 'بيع',
    'STRONG_SELL': 'بيع قوي',
    'WEAK_SELL': 'بيع ضعيف',
    'HOLD': 'انتظار',
    'NEUTRAL': 'محايد'
  };
  return texts[recommendation] || recommendation;
};

export const TradingTab = ({ selectedSymbol, currentPrice, analysisData }) => {
  const [availableCapital, setAvailableCapital] = useState(0);
  const [activeTrades, setActiveTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [quickTradeAmount, setQuickTradeAmount] = useState(1000);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [riskWarning, setRiskWarning] = useState(true);

  // Load data from localStorage and portfolio allocation
  useEffect(() => {
    const savedTrades = localStorage.getItem('active_trades');
    const savedHistory = localStorage.getItem('trading_history');
    const portfolioAllocations = localStorage.getItem('portfolio_allocations');
    const warningAccepted = localStorage.getItem('trading_risk_warning_accepted');
    
    if (savedTrades) {
      try {
        setActiveTrades(JSON.parse(savedTrades));
      } catch (e) {
        console.error('خطأ في تحميل الصفقات النشطة:', e);
      }
    }

    if (savedHistory) {
      try {
        setTradeHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('خطأ في تحميل سجل التداول:', e);
      }
    }

    // Get available capital from portfolio allocation
    if (portfolioAllocations) {
      try {
        const allocations = JSON.parse(portfolioAllocations);
        const tradingAllocation = allocations.find(alloc => 
          alloc.category.includes('تداول') || alloc.category.includes('التداول')
        );
        if (tradingAllocation) {
          setAvailableCapital(tradingAllocation.allocated || 5000);
        } else {
          setAvailableCapital(5000); // Default trading capital
        }
      } catch (e) {
        setAvailableCapital(5000);
      }
    } else {
      setAvailableCapital(5000);
    }

    if (warningAccepted === 'true') {
      setRiskWarning(false);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (activeTrades.length > 0) {
      localStorage.setItem('active_trades', JSON.stringify(activeTrades));
    }
    if (tradeHistory.length > 0) {
      localStorage.setItem('trading_history', JSON.stringify(tradeHistory));
    }
  }, [activeTrades, tradeHistory]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const acceptRiskWarning = () => {
    setRiskWarning(false);
    localStorage.setItem('trading_risk_warning_accepted', 'true');
  };

  // Execute quick trade
  const executeQuickTrade = (type) => {
    if (!currentPrice || quickTradeAmount <= 0) {
      showNotification('يرجى إدخال مبلغ صالح', 'error');
      return;
    }

    if (quickTradeAmount > availableCapital) {
      showNotification('المبلغ أكبر من رأس المال المتاح', 'error');
      return;
    }

    const newTrade = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      type: type,
      amount: quickTradeAmount,
      entryPrice: currentPrice,
      leverage: leverage,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: new Date().toISOString(),
      status: 'active',
      pnl: 0,
      pnlPercentage: 0
    };

    setActiveTrades(prev => [...prev, newTrade]);
    setAvailableCapital(prev => prev - quickTradeAmount);
    showNotification(`تم فتح صفقة ${type === 'buy' ? 'شراء' : 'بيع'} بنجاح`, 'success');
    
    // Reset form
    setStopLoss('');
    setTakeProfit('');
  };

  // Close trade
  const closeTrade = (tradeId) => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const currentPnl = calculatePnL(trade);
    const closedTrade = {
      ...trade,
      status: 'closed',
      exitPrice: currentPrice,
      finalPnl: currentPnl,
      closedAt: new Date().toISOString()
    };

    setActiveTrades(prev => prev.filter(t => t.id !== tradeId));
    setTradeHistory(prev => [closedTrade, ...prev]);
    setAvailableCapital(prev => prev + trade.amount + currentPnl);
    
    showNotification(
      `تم إغلاق الصفقة ${currentPnl >= 0 ? 'بربح' : 'بخسارة'}: $${Math.abs(currentPnl).toFixed(2)}`,
      currentPnl >= 0 ? 'success' : 'error'
    );
  };

  // Calculate P&L for a trade
  const calculatePnL = (trade) => {
    if (!currentPrice || !trade.entryPrice) return 0;
    
    const priceChange = trade.type === 'buy' 
      ? currentPrice - trade.entryPrice 
      : trade.entryPrice - currentPrice;
    
    const baseReturn = (priceChange / trade.entryPrice) * trade.amount;
    return baseReturn * trade.leverage;
  };

  // Update active trades P&L
  useEffect(() => {
    if (currentPrice && activeTrades.length > 0) {
      setActiveTrades(prev => prev.map(trade => ({
        ...trade,
        pnl: calculatePnL(trade),
        pnlPercentage: trade.entryPrice ? 
          ((calculatePnL(trade) / trade.amount) * 100) : 0
      })));
    }
  }, [currentPrice]);

  if (riskWarning) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">تحذير المخاطر</h2>
            
            <div className="text-left space-y-3 text-gray-300 mb-6">
              <p>⚠️ التداول في العملات المشفرة ينطوي على مخاطر عالية جداً</p>
              <p>📉 يمكن أن تخسر كامل رأس المال المستثمر</p>
              <p>📊 الأسعار متقلبة للغاية ويمكن أن تتغير بسرعة</p>
              <p>🎯 تأكد من فهمك الكامل للمخاطر قبل التداول</p>
              <p>💡 لا تستثمر أكثر مما تستطيع تحمل خسارته</p>
            </div>

            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={acceptRiskWarning}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all"
              >
                أفهم المخاطر وأرغب في المتابعة
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
              >
                العودة للخلف
              </button>
            </div>
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

      {/* Trading Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">رأس المال المتاح</h3>
            <BanknotesIcon className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${availableCapital.toLocaleString()}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">الصفقات النشطة</h3>
            <FireIcon className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activeTrades.length}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">إجمالي الربح/الخسارة</h3>
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div className={`text-2xl font-bold ${
            activeTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${activeTrades.reduce((sum, trade) => sum + trade.pnl, 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">معدل النجاح</h3>
            <CurrencyDollarIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {tradeHistory.length > 0 ? 
              Math.round((tradeHistory.filter(t => t.finalPnl > 0).length / tradeHistory.length) * 100) : 0
            }%
          </div>
        </div>
      </div>

      {/* Quick Trading Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">التداول السريع</h2>
          <BoltIcon className="w-6 h-6 text-yellow-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trade Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مبلغ التداول:
              </label>
              <input
                type="number"
                value={quickTradeAmount}
                onChange={(e) => setQuickTradeAmount(parseFloat(e.target.value) || 0)}
                max={availableCapital}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
              <div className="text-xs text-gray-400 mt-1">
                المتاح: ${availableCapital.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  وقف الخسارة (اختياري):
                </label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={currentPrice ? (currentPrice * 0.95).toFixed(2) : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  جني الأرباح (اختياري):
                </label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={currentPrice ? (currentPrice * 1.05).toFixed(2) : ''}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الرافعة المالية: {leverage}x
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>
          </div>

          {/* Trading Buttons & Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => executeQuickTrade('buy')}
                disabled={!currentPrice || quickTradeAmount <= 0}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
              >
                <ArrowTrendingUpIcon className="w-5 h-5" />
                <span>شراء</span>
              </button>

              <button
                onClick={() => executeQuickTrade('sell')}
                disabled={!currentPrice || quickTradeAmount <= 0}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse"
              >
                <ArrowTrendingDownIcon className="w-5 h-5" />
                <span>بيع</span>
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">السعر الحالي:</span>
                <span className="text-white font-semibold">
                  ${currentPrice?.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">حجم الصفقة:</span>
                <span className="text-white font-semibold">
                  {currentPrice ? (quickTradeAmount / currentPrice).toFixed(6) : '0'} {selectedSymbol?.replace('USDT', '')}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">الرافعة المالية:</span>
                <span className="text-white font-semibold">{leverage}x</span>
              </div>

              {leverage > 1 && (
                <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded">
                  ⚠️ الرافعة المالية تزيد المخاطر والأرباح
                </div>
              )}
            </div>

            {/* AI Trading Recommendation */}
            {analysisData?.ultimate_decision && (
              <div className={`p-3 rounded-lg text-center ${
                analysisData.ultimate_decision.final_recommendation.includes('BUY') ? 'bg-green-500/20 border border-green-500/30' :
                analysisData.ultimate_decision.final_recommendation.includes('SELL') ? 'bg-red-500/20 border border-red-500/30' :
                'bg-yellow-500/20 border border-yellow-500/30'
              }`}>
                <div className="text-sm font-semibold text-white mb-1">توصية الذكاء الاصطناعي</div>
                <div className={`text-xs ${
                  analysisData.ultimate_decision.final_recommendation.includes('BUY') ? 'text-green-400' :
                  analysisData.ultimate_decision.final_recommendation.includes('SELL') ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {(() => {
                    const rec = analysisData.ultimate_decision.final_recommendation;
                    if (rec.includes('BUY')) return '🚀 الاتجاه صاعد - فرصة ' + getRecommendationText(rec);
                    if (rec.includes('SELL')) return '📉 الاتجاه هابط - تجنب الشراء أو ' + getRecommendationText(rec);
                    return '⏳ السوق غير محدد - انتظار';
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Trades */}
      {activeTrades.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">الصفقات النشطة</h3>
            <FireIcon className="w-6 h-6 text-orange-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-right pb-3">الرمز</th>
                  <th className="text-right pb-3">النوع</th>
                  <th className="text-right pb-3">المبلغ</th>
                  <th className="text-right pb-3">سعر الدخول</th>
                  <th className="text-right pb-3">السعر الحالي</th>
                  <th className="text-right pb-3">الربح/الخسارة</th>
                  <th className="text-right pb-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {activeTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5">
                    <td className="py-3 text-white font-semibold">{trade.symbol}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type === 'buy' ? 'شراء' : 'بيع'}
                      </span>
                    </td>
                    <td className="py-3 text-white">${trade.amount.toLocaleString()}</td>
                    <td className="py-3 text-gray-300">${trade.entryPrice?.toFixed(2)}</td>
                    <td className="py-3 text-white">${currentPrice?.toFixed(2)}</td>
                    <td className="py-3">
                      <div className={`font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.pnl.toFixed(2)}
                      </div>
                      <div className={`text-xs ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnlPercentage.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => closeTrade(trade.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
                      >
                        إغلاق
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trading History */}
      {tradeHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">سجل التداول</h3>
            <ClockIcon className="w-6 h-6 text-gray-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-right pb-3">التاريخ</th>
                  <th className="text-right pb-3">الرمز</th>
                  <th className="text-right pb-3">النوع</th>
                  <th className="text-right pb-3">المبلغ</th>
                  <th className="text-right pb-3">دخول/خروج</th>
                  <th className="text-right pb-3">النتيجة</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5">
                    <td className="py-3 text-gray-300">
                      {new Date(trade.closedAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-3 text-white font-semibold">{trade.symbol}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type === 'buy' ? 'شراء' : 'بيع'}
                      </span>
                    </td>
                    <td className="py-3 text-white">${trade.amount.toLocaleString()}</td>
                    <td className="py-3 text-gray-300">
                      ${trade.entryPrice?.toFixed(2)} / ${trade.exitPrice?.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <div className={`font-semibold ${trade.finalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.finalPnl?.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tradeHistory.length > 10 && (
            <div className="text-center mt-4">
              <span className="text-gray-400 text-sm">
                عرض 10 من أصل {tradeHistory.length} صفقة
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};