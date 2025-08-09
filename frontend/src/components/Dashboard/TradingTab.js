// components/Dashboard/TradingTab.js - النسخة الكاملة والنهائية
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
          setAvailableCapital(tradingAllocation.allocated || 0);
        } else {
          setAvailableCapital(20000); // Default fallback
        }
      } catch (e) {
        console.error('خطأ في تحميل تخصيص التداول:', e);
        setAvailableCapital(20000); // Default fallback
      }
    } else {
      setAvailableCapital(20000); // Default fallback
    }

    if (warningAccepted === 'true') {
      setRiskWarning(false);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('active_trades', JSON.stringify(activeTrades));
  }, [activeTrades]);

  useEffect(() => {
    localStorage.setItem('trading_history', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  // Update active trades with current price
  useEffect(() => {
    if (currentPrice) {
      setActiveTrades(prev => prev.map(trade => {
        if (trade.symbol === selectedSymbol) {
          const currentValue = trade.position * currentPrice;
          const pnl = trade.type === 'LONG' 
            ? (currentPrice - trade.entryPrice) * trade.position 
            : (trade.entryPrice - currentPrice) * trade.position;
          const pnlPercentage = (pnl / trade.initialValue) * 100;

          // Check stop loss and take profit
          let shouldClose = false;
          let closeReason = '';

          if (trade.stopLoss && (
            (trade.type === 'LONG' && currentPrice <= trade.stopLoss) ||
            (trade.type === 'SHORT' && currentPrice >= trade.stopLoss)
          )) {
            shouldClose = true;
            closeReason = 'Stop Loss';
          }

          if (trade.takeProfit && (
            (trade.type === 'LONG' && currentPrice >= trade.takeProfit) ||
            (trade.type === 'SHORT' && currentPrice <= trade.takeProfit)
          )) {
            shouldClose = true;
            closeReason = 'Take Profit';
          }

          if (shouldClose) {
            closeTrade(trade.id, closeReason, currentPrice);
          }

          return {
            ...trade,
            currentPrice,
            currentValue,
            pnl,
            pnlPercentage
          };
        }
        return trade;
      }));
    }
  }, [currentPrice, selectedSymbol]);

  // Execute quick trade
  const executeQuickTrade = (type) => {
    if (!currentPrice) {
      showNotification('لا يمكن تنفيذ الصفقة بدون سعر حالي', 'error');
      return;
    }

    if (quickTradeAmount > availableCapital) {
      showNotification('رأس المال غير كافي', 'error');
      return;
    }

    if (quickTradeAmount <= 0) {
      showNotification('يرجى إدخال مبلغ صالح', 'error');
      return;
    }

    const position = (quickTradeAmount * leverage) / currentPrice;
    const trade = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      type: type, // 'LONG' or 'SHORT'
      entryPrice: currentPrice,
      position: position,
      initialValue: quickTradeAmount,
      leverage: leverage,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      openTime: new Date().toISOString(),
      currentPrice: currentPrice,
      currentValue: quickTradeAmount,
      pnl: 0,
      pnlPercentage: 0,
      status: 'OPEN'
    };

    setActiveTrades(prev => [trade, ...prev]);
    setAvailableCapital(prev => prev - quickTradeAmount);
    
    showNotification(`تم فتح صفقة ${type} في ${selectedSymbol}`, 'success');
  };

  // Close trade manually or automatically
  const closeTrade = (tradeId, reason = 'Manual', closePrice = null) => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const finalPrice = closePrice || currentPrice;
    const finalPnl = trade.type === 'LONG' 
      ? (finalPrice - trade.entryPrice) * trade.position 
      : (trade.entryPrice - finalPrice) * trade.position;
    
    const finalValue = trade.initialValue + finalPnl;
    
    // Move to history
    const closedTrade = {
      ...trade,
      closePrice: finalPrice,
      closeTime: new Date().toISOString(),
      finalPnl: finalPnl,
      finalValue: finalValue,
      closeReason: reason,
      status: 'CLOSED'
    };

    setTradeHistory(prev => [closedTrade, ...prev]);
    setActiveTrades(prev => prev.filter(t => t.id !== tradeId));
    setAvailableCapital(prev => prev + finalValue);

    showNotification(
      `تم إغلاق الصفقة (${reason}): ${finalPnl >= 0 ? '+' : ''}$${finalPnl.toFixed(2)}`, 
      finalPnl >= 0 ? 'success' : 'error'
    );
  };

  // Accept risk warning
  const acceptRiskWarning = () => {
    setRiskWarning(false);
    localStorage.setItem('trading_risk_warning_accepted', 'true');
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate statistics
  const totalActiveValue = activeTrades.reduce((sum, trade) => sum + (trade.currentValue || 0), 0);
  const totalActivePnL = activeTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const todayTrades = tradeHistory.filter(trade => 
    new Date(trade.closeTime).toDateString() === new Date().toDateString()
  );
  const todayPnL = todayTrades.reduce((sum, trade) => sum + (trade.finalPnl || 0), 0);

  // Risk Warning Modal
  if (riskWarning) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-8 border border-red-500/30 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">تحذير مخاطر التداول</h2>
          
          <div className="max-w-2xl mx-auto space-y-4 text-gray-300 text-sm">
            <p className="text-red-400 font-semibold">
              ⚠️ التداول قصير المدى والمضاربة ينطوي على مخاطر عالية جداً
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
              <div className="space-y-2">
                <h3 className="text-white font-semibold">المخاطر:</h3>
                <ul className="space-y-1">
                  <li>• خسارة كامل رأس المال المخصص للتداول</li>
                  <li>• تقلبات سعرية حادة ومفاجئة</li>
                  <li>• خسائر مضاعفة عند استخدام الرافعة المالية</li>
                  <li>• ضغط نفسي وقرارات متسرعة</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-white font-semibold">الإرشادات:</h3>
                <ul className="space-y-1">
                  <li>• لا تستثمر أكثر مما يمكنك تحمل خسارته</li>
                  <li>• استخدم أوامر وقف الخسارة دائماً</li>
                  <li>• ابدأ بمبالغ صغيرة لتعلم السوق</li>
                  <li>• لا تتاجر بالعواطف</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
              <p className="text-yellow-400 font-semibold">
                هذا القسم مخصص للمتداولين ذوي الخبرة فقط. 
                إذا كنت مبتدئاً، ننصحك بالبدء بقسم الاستثمار طويل المدى.
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4 space-x-reverse mt-8">
            <button
              onClick={acceptRiskWarning}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              أفهم المخاطر وأريد المتابعة
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
          <div className="flex items-center space-x-2 space-x-reverse">
            {notification.type === 'success' && <CheckIcon className="w-5 h-5" />}
            {notification.type === 'error' && <XMarkIcon className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Trading Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-8 h-8 text-green-400" />
            <div className="text-green-400 text-sm">رأس المال المتاح</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${availableCapital.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">للتداول السريع</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <BoltIcon className="w-8 h-8 text-orange-400" />
            <div className="text-orange-400 text-sm">الصفقات النشطة</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalActiveValue.toLocaleString()}
          </div>
          <div className={`text-xs mt-1 ${totalActivePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalActivePnL >= 0 ? '+' : ''}${totalActivePnL.toFixed(2)}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
            <div className="text-blue-400 text-sm">صفقات اليوم</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {todayTrades.length}
          </div>
          <div className={`text-xs mt-1 ${todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(2)}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <FireIcon className="w-8 h-8 text-red-400" />
            <div className="text-red-400 text-sm">مستوى المخاطر</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {leverage}x
          </div>
          <div className="text-xs text-red-400 mt-1">الرافعة المالية</div>
        </div>
      </div>

      {/* AI Trading Signal */}
      {analysisData?.ultimate_decision && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2 space-x-reverse">
            <BoltIcon className="w-5 h-5 text-orange-400" />
            <span>إشارة التداول السريع</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className={`text-lg font-semibold mb-2 ${
                analysisData.ultimate_decision.final_recommendation === 'BUY' ? 'text-green-400' :
                analysisData.ultimate_decision.final_recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {analysisData.ultimate_decision.final_recommendation === 'BUY' ? '📈 LONG' :
                 analysisData.ultimate_decision.final_recommendation === 'SELL' ? '📉 SHORT' : '⏸️ HOLD'}
              </div>
              <div className="text-gray-400 text-sm">
                {analysisData.ultimate_decision.reasoning}
              </div>
            </div>
            
            <div>
              <div className="text-white font-semibold">
                قوة الإشارة: {analysisData.ultimate_decision.final_confidence}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="h-2 rounded-full bg-blue-400"
                  style={{ width: `${analysisData.ultimate_decision.final_confidence}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className={`text-sm font-semibold ${
                analysisData.ultimate_decision.final_confidence > 75 ? 'text-green-400' :
                analysisData.ultimate_decision.final_confidence > 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {analysisData.ultimate_decision.final_confidence > 75 ? '✅ إشارة قوية للتداول' :
                 analysisData.ultimate_decision.final_confidence > 60 ? '⚠️ إشارة متوسطة' : '❌ إشارة ضعيفة'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Trading Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">التداول السريع - {selectedSymbol}</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trade Setup */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">مبلغ الصفقة ($)</label>
              <input
                type="number"
                value={quickTradeAmount}
                onChange={(e) => setQuickTradeAmount(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
                placeholder="1000"
                min="100"
                max={availableCapital}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">وقف الخسارة ($)</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-red-400 focus:outline-none"
                  placeholder={currentPrice ? (currentPrice * 0.95).toFixed(2) : ''}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">جني الأرباح ($)</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-green-400 focus:outline-none"
                  placeholder={currentPrice ? (currentPrice * 1.05).toFixed(2) : ''}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">الرافعة المالية: {leverage}x</label>
              <input
                type="range"
                min="1"
                max="10"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1x (آمن)</span>
                <span>5x (متوسط)</span>
                <span>10x (عالي المخاطر)</span>
              </div>
            </div>

            {currentPrice && (
              <div className="bg-white/5 rounded-lg p-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-gray-400">
                  <div>السعر الحالي: ${currentPrice.toFixed(2)}</div>
                  <div>الكمية: {((quickTradeAmount * leverage) / currentPrice).toFixed(6)}</div>
                  <div>القيمة الفعلية: ${(quickTradeAmount * leverage).toLocaleString()}</div>
                  <div>الهامش المطلوب: ${quickTradeAmount.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Trading Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => executeQuickTrade('LONG')}
              disabled={!currentPrice || quickTradeAmount > availableCapital}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <ArrowTrendingUpIcon className="w-6 h-6" />
              <span>LONG (شراء)</span>
            </button>
            
            <button
              onClick={() => executeQuickTrade('SHORT')}
              disabled={!currentPrice || quickTradeAmount > availableCapital}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2 space-x-reverse"
            >
              <ArrowTrendingDownIcon className="w-6 h-6" />
              <span>SHORT (بيع)</span>
            </button>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[500, 1000, 2500, 5000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setQuickTradeAmount(amount)}
                  className="bg-white/10 hover:bg-white/20 text-white py-2 rounded text-sm transition-colors"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {leverage > 5 && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                ⚠️ رافعة مالية عالية - مخاطر مضاعفة!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Trades */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">الصفقات النشطة</h3>
        
        {activeTrades.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BoltIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد صفقات نشطة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-3 h-3 rounded-full ${
                      trade.type === 'LONG' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <span className="text-white font-semibold text-lg">
                        {trade.symbol} {trade.type}
                      </span>
                      <div className="text-gray-400 text-sm">
                        {trade.leverage}x • فتحت: ${trade.entryPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold">
                      ${trade.currentValue?.toFixed(2)}
                    </div>
                    <div className={`text-sm ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)} 
                      ({(trade.pnlPercentage || 0).toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-gray-400">الكمية</div>
                    <div className="text-white">{trade.position.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">وقف الخسارة</div>
                    <div className="text-red-400">
                      {trade.stopLoss ? `$${trade.stopLoss.toFixed(2)}` : 'غير محدد'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">جني الأرباح</div>
                    <div className="text-green-400">
                      {trade.takeProfit ? `$${trade.takeProfit.toFixed(2)}` : 'غير محدد'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">المدة</div>
                    <div className="text-white">
                      {Math.floor((Date.now() - new Date(trade.openTime).getTime()) / 60000)}د
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => closeTrade(trade.id)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  إغلاق الصفقة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Trading History */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">سجل التداول الأخير</h3>
        
        {tradeHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد صفقات مُنجزة بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tradeHistory.slice(0, 10).map((trade) => (
              <div
                key={trade.id}
                className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`w-3 h-3 rounded-full ${
                    trade.type === 'LONG' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <div className="text-white font-semibold">
                      {trade.symbol} {trade.type}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {new Date(trade.closeTime).toLocaleString('ar-SA')} • {trade.closeReason}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-semibold ${trade.finalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.finalPnl >= 0 ? '+' : ''}${trade.finalPnl.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    ${trade.entryPrice.toFixed(2)} → ${trade.closePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            {tradeHistory.length > 10 && (
              <div className="text-center pt-4">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  عرض المزيد ({tradeHistory.length - 10} صفقة أخرى)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trading Statistics */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-6">إحصائيات التداول</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {tradeHistory.length}
            </div>
            <div className="text-gray-400 text-sm">إجمالي الصفقات</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {tradeHistory.filter(t => t.finalPnl > 0).length}
            </div>
            <div className="text-gray-400 text-sm">صفقات رابحة</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {tradeHistory.filter(t => t.finalPnl < 0).length}
            </div>
            <div className="text-gray-400 text-sm">صفقات خاسرة</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              tradeHistory.length > 0 && (tradeHistory.filter(t => t.finalPnl > 0).length / tradeHistory.length) >= 0.5 
                ? 'text-green-400' : 'text-red-400'
            }`}>
              {tradeHistory.length > 0 
                ? ((tradeHistory.filter(t => t.finalPnl > 0).length / tradeHistory.length) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-gray-400 text-sm">نسبة النجاح</div>
          </div>
        </div>

        {tradeHistory.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">أفضل صفقة</h4>
              <div className="text-green-400 font-bold">
                +${Math.max(...tradeHistory.map(t => t.finalPnl)).toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">أسوأ صفقة</h4>
              <div className="text-red-400 font-bold">
                ${Math.min(...tradeHistory.map(t => t.finalPnl)).toFixed(2)}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">متوسط الربح/الخسارة</h4>
              <div className={`font-bold ${
                (tradeHistory.reduce((sum, t) => sum + t.finalPnl, 0) / tradeHistory.length) >= 0 
                  ? 'text-green-400' : 'text-red-400'
              }`}>
                ${(tradeHistory.reduce((sum, t) => sum + t.finalPnl, 0) / tradeHistory.length).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Risk Management Tips */}
      <div className="bg-yellow-500/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/20">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center space-x-2 space-x-reverse">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>نصائح إدارة المخاطر</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <h4 className="text-white font-semibold">قواعد أساسية:</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• لا تخاطر بأكثر من 2-5% من رأس المال في صفقة واحدة</li>
              <li>• استخدم وقف الخسارة في كل صفقة</li>
              <li>• لا تضاعف الصفقات الخاسرة</li>
              <li>• حدد هدف الربح مسبقاً والتزم به</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-white font-semibold">علامات التحذير:</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• خسارة أكثر من 3 صفقات متتالية</li>
              <li>• التداول بناءً على العواطف</li>
              <li>• زيادة حجم الصفقات بعد الخسائر</li>
              <li>• إهمال وقف الخسارة</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
          <p className="text-red-400 text-sm font-semibold">
            إذا خسرت أكثر من 10% من رأس المال المخصص للتداول، توقف وراجع استراتيجيتك.
          </p>
        </div>
      </div>

      {/* Market Analysis Integration */}
      {analysisData && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">تحليل السوق للتداول</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">التحليل الفني</h4>
              <div className="text-white">
                الثقة: {analysisData.analysis_layers?.['1_technical_analysis']?.confidence || 'N/A'}%
              </div>
              <div className="text-gray-400 text-sm">
                مناسب للتداول قصير المدى
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">AI البسيط</h4>
              <div className="text-white">
                الثقة: {analysisData.analysis_layers?.['2_simple_ai']?.confidence || 'N/A'}%
              </div>
              <div className="text-gray-400 text-sm">
                إشارات سريعة للدخول والخروج
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-purple-400 font-semibold mb-2">AI المتقدم</h4>
              <div className="text-white">
                الثقة: {analysisData.analysis_layers?.['3_advanced_ai']?.ensemble_prediction?.confidence?.toFixed(0) || 'N/A'}%
              </div>
              <div className="text-gray-400 text-sm">
                تحليل شامل ومتقدم
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="text-blue-400 text-sm font-semibold mb-1">نصيحة للتداول:</div>
            <div className="text-blue-200 text-sm">
              {analysisData.ultimate_decision?.final_confidence > 75 
                ? '✅ إشارة قوية - مناسبة للتداول'
                : analysisData.ultimate_decision?.final_confidence > 60 
                ? '⚠️ إشارة متوسطة - تداول بحذر'
                : '❌ إشارة ضعيفة - تجنب التداول'}
            </div>
          </div>
        </div>
      )}

      {/* Performance Warning */}
      {tradeHistory.length >= 5 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">تقييم الأداء</h3>
          
          {(() => {
            const recentTrades = tradeHistory.slice(0, 5);
            const recentLosses = recentTrades.filter(t => t.finalPnl < 0).length;
            const totalPnL = tradeHistory.reduce((sum, t) => sum + t.finalPnl, 0);
            const winRate = (tradeHistory.filter(t => t.finalPnl > 0).length / tradeHistory.length) * 100;
            
            if (recentLosses >= 4) {
              return (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="text-red-400 font-semibold mb-2">🚨 تحذير: خسائر متتالية</div>
                  <div className="text-red-300 text-sm">
                    لديك {recentLosses} خسائر في آخر 5 صفقات. ننصح بالتوقف ومراجعة الاستراتيجية.
                  </div>
                </div>
              );
            } else if (totalPnL < -availableCapital * 0.1) {
              return (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                  <div className="text-orange-400 font-semibold mb-2">⚠️ تحذير: خسائر مرتفعة</div>
                  <div className="text-orange-300 text-sm">
                    خسرت أكثر من 10% من رأس المال. فكر في تقليل حجم الصفقات.
                  </div>
                </div>
              );
            } else if (winRate >= 70) {
              return (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-400 font-semibold mb-2">🎉 أداء ممتاز!</div>
                  <div className="text-green-300 text-sm">
                    نسبة نجاح {winRate.toFixed(1)}%. حافظ على استراتيجيتك الحالية.
                  </div>
                </div>
              );
            } else {
              return (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-400 font-semibold mb-2">📊 أداء متوسط</div>
                  <div className="text-blue-300 text-sm">
                    نسبة نجاح {winRate.toFixed(1)}%. يمكن تحسين الاستراتيجية.
                  </div>
                </div>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};
