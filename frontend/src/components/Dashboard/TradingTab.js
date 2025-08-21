// components/Dashboard/TradingTab.js
import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  ClockIcon,
  Cog6ToothIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const TradingTab = ({ selectedSymbol, currentPrice, analysisData, tradingData, setTradingData }) => {
  // استخدام بيانات افتراضية إذا لم يتم تمرير tradingData
  const defaultTradingData = {
    orderHistory: [
      { id: 1, symbol: 'BTCUSDT', side: 'BUY', amount: 0.1, price: 45000, pnl: 500, timestamp: '2024-01-15 10:30', status: 'completed' },
      { id: 2, symbol: 'ETHUSDT', side: 'SELL', amount: 2, price: 2800, pnl: -150, timestamp: '2024-01-14 15:45', status: 'completed' },
      { id: 3, symbol: 'BNBUSDT', side: 'BUY', amount: 10, price: 320, pnl: 200, timestamp: '2024-01-13 09:15', status: 'completed' }
    ],
    openOrders: [
      { id: 1, symbol: 'ADAUSDT', side: 'BUY', amount: 1000, price: 1.15, type: 'limit', status: 'pending' },
      { id: 2, symbol: 'SOLUSDT', side: 'SELL', amount: 5, price: 120, type: 'stop-loss', status: 'pending' }
    ],
    tradingSettings: {
      riskPerTrade: 2,
      maxPositions: 5,
      autoTrading: false,
      stopLoss: 5,
      takeProfit: 15,
      trailingStop: true,
      maxDailyLoss: 500,
      tradingHours: { start: '09:00', end: '17:00' },
      allowedSymbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT']
    }
  };

  const currentTradingData = tradingData || defaultTradingData;
  
  const [newOrder, setNewOrder] = useState({
    symbol: selectedSymbol || 'BTCUSDT',
    side: 'BUY',
    type: 'market',
    amount: '',
    price: '',
    stopLoss: '',
    takeProfit: ''
  });

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // محاكاة الاتصال بـ API
  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // تنفيذ أمر جديد
  const handlePlaceOrder = () => {
    if (newOrder.symbol && newOrder.amount && setTradingData) {
      const order = {
        id: Date.now(),
        symbol: newOrder.symbol,
        side: newOrder.side,
        amount: parseFloat(newOrder.amount),
        price: newOrder.type === 'market' ? 'Market' : parseFloat(newOrder.price),
        type: newOrder.type,
        status: 'pending',
        timestamp: new Date().toLocaleString('ar-SA')
      };

      setTradingData(prev => ({
        ...prev,
        openOrders: [...prev.openOrders, order]
      }));

      setNewOrder({
        symbol: selectedSymbol || 'BTCUSDT',
        side: 'BUY',
        type: 'market',
        amount: '',
        price: '',
        stopLoss: '',
        takeProfit: ''
      });
      setShowOrderForm(false);
    }
  };

  // إلغاء أمر
  const handleCancelOrder = (orderId) => {
    if (setTradingData) {
      setTradingData(prev => ({
        ...prev,
        openOrders: prev.openOrders.filter(order => order.id !== orderId)
      }));
    }
  };

  // حساب الإحصائيات
  const stats = {
    totalTrades: currentTradingData.orderHistory.length,
    successRate: currentTradingData.orderHistory.filter(order => order.pnl > 0).length / currentTradingData.orderHistory.length * 100,
    totalPnL: currentTradingData.orderHistory.reduce((sum, order) => sum + order.pnl, 0),
    averagePnL: currentTradingData.orderHistory.reduce((sum, order) => sum + order.pnl, 0) / currentTradingData.orderHistory.length,
    bestTrade: Math.max(...currentTradingData.orderHistory.map(order => order.pnl)),
    worstTrade: Math.min(...currentTradingData.orderHistory.map(order => order.pnl))
  };

  return (
    <div className="space-y-6">
      {/* Trading Status & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-cyan-400 text-sm">حالة الاتصال</span>
          </div>
          <div className="text-white text-lg font-bold">
            {isConnected ? 'متصل' : 'غير متصل'}
          </div>
          <div className="text-gray-400 text-sm">
            {isConnected ? 'Binance API' : 'محاولة الاتصال...'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
            <span className="text-green-400 text-sm">إجمالي الأرباح</span>
          </div>
          <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">
            متوسط: ${stats.averagePnL.toFixed(0)}/صفقة
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-purple-400">📊</div>
            <span className="text-purple-400 text-sm">معدل النجاح</span>
          </div>
          <div className="text-white text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
          <div className="text-gray-400 text-sm">
            من {stats.totalTrades} صفقة
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-6 h-6 text-orange-400" />
            <span className="text-orange-400 text-sm">الأوامر المفتوحة</span>
          </div>
          <div className="text-white text-2xl font-bold">{currentTradingData.openOrders.length}</div>
          <div className="text-gray-400 text-sm">أوامر نشطة</div>
        </div>
      </div>

      {/* Trading Settings */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Cog6ToothIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="text-cyan-400 font-semibold text-lg">إعدادات التداول</h3>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-gray-400">التداول التلقائي</span>
            <button
              onClick={() => setTradingData && setTradingData(prev => ({
                ...prev,
                tradingSettings: { ...prev.tradingSettings, autoTrading: !prev.tradingSettings.autoTrading }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentTradingData.tradingSettings.autoTrading ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentTradingData.tradingSettings.autoTrading ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">المخاطرة لكل صفقة (%)</label>
              <input 
                type="number" 
                value={currentTradingData.tradingSettings.riskPerTrade}
                onChange={(e) => setTradingData && setTradingData(prev => ({
                  ...prev,
                  tradingSettings: { ...prev.tradingSettings, riskPerTrade: Number(e.target.value) }
                }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">الحد الأقصى للمراكز</label>
              <input 
                type="number" 
                value={currentTradingData.tradingSettings.maxPositions}
                onChange={(e) => setTradingData && setTradingData(prev => ({
                  ...prev,
                  tradingSettings: { ...prev.tradingSettings, maxPositions: Number(e.target.value) }
                }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">وقف الخسارة (%)</label>
              <input 
                type="number" 
                value={currentTradingData.tradingSettings.stopLoss}
                onChange={(e) => setTradingData && setTradingData(prev => ({
                  ...prev,
                  tradingSettings: { ...prev.tradingSettings, stopLoss: Number(e.target.value) }
                }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                min="1"
                max="20"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">جني الأرباح (%)</label>
              <input 
                type="number" 
                value={currentTradingData.tradingSettings.takeProfit}
                onChange={(e) => setTradingData && setTradingData(prev => ({
                  ...prev,
                  tradingSettings: { ...prev.tradingSettings, takeProfit: Number(e.target.value) }
                }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                min="5"
                max="100"
                step="1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">الحد الأقصى للخسارة اليومية ($)</label>
              <input 
                type="number" 
                value={currentTradingData.tradingSettings.maxDailyLoss}
                onChange={(e) => setTradingData && setTradingData(prev => ({
                  ...prev,
                  tradingSettings: { ...prev.tradingSettings, maxDailyLoss: Number(e.target.value) }
                }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                min="100"
                max="5000"
                step="50"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Trailing Stop</span>
              <button
                onClick={() => setTradingData && setTradingData(prev => ({
                  ...prev,
                  tradingSettings: { ...prev.tradingSettings, trailingStop: !prev.tradingSettings.trailingStop }
                }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  currentTradingData.tradingSettings.trailingStop ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    currentTradingData.tradingSettings.trailingStop ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Order Form */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-blue-400 font-semibold text-lg">أمر سريع</h3>
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showOrderForm ? 'إخفاء' : 'إظهار النموذج'}
          </button>
        </div>

        {showOrderForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">العملة</label>
              <select
                value={newOrder.symbol}
                onChange={(e) => setNewOrder(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="BTCUSDT">BTCUSDT</option>
                <option value="ETHUSDT">ETHUSDT</option>
                <option value="BNBUSDT">BNBUSDT</option>
                <option value="ADAUSDT">ADAUSDT</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">نوع الأمر</label>
              <select
                value={newOrder.side}
                onChange={(e) => setNewOrder(prev => ({ ...prev, side: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="BUY">شراء</option>
                <option value="SELL">بيع</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">الكمية</label>
              <input
                type="number"
                value={newOrder.amount}
                onChange={(e) => setNewOrder(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                placeholder="0.1"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePlaceOrder}
                disabled={!newOrder.amount}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                تنفيذ الأمر
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Open Orders */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">الأوامر المفتوحة</h3>
        
        {currentTradingData.openOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div>لا توجد أوامر مفتوحة</div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTradingData.openOrders.map((order) => (
              <div key={order.id} className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-white font-semibold">{order.symbol}</div>
                  <div className="text-sm text-gray-400">
                    {order.side} • {order.amount} • ${typeof order.price === 'number' ? order.price.toLocaleString() : order.price}
                  </div>
                  <div className="text-xs text-gray-500">{order.type}</div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.status === 'filled' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {order.status === 'pending' ? 'معلق' :
                     order.status === 'filled' ? 'منفذ' : 'ملغي'}
                  </span>
                  
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trading History */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">تاريخ التداول</h3>
        
        {currentTradingData.orderHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div>لا يوجد تاريخ تداول</div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentTradingData.orderHistory.slice(0, 5).map((order) => (
              <div key={order.id} className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-white font-semibold">{order.symbol}</div>
                  <div className="text-sm text-gray-400">{order.side} • {order.timestamp}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${order.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {order.pnl >= 0 ? '+' : ''}${order.pnl}
                  </div>
                  <div className="text-sm text-gray-400">${order.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
            
            {currentTradingData.orderHistory.length > 5 && (
              <div className="text-center pt-4">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  عرض المزيد ({currentTradingData.orderHistory.length - 5} صفقة أخرى)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Integration */}
      {analysisData && (
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-purple-400 font-semibold text-lg mb-4">🧠 نصائح التداول من التحليل</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">التوصية الحالية:</div>
              <div className="text-white font-semibold">
                {analysisData.ultimate_decision?.final_recommendation || 'غير متاح'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                ثقة: {(analysisData.ultimate_decision?.final_confidence || 0).toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">السعر المقترح:</div>
              <div className="text-white font-semibold">
                ${currentPrice?.toLocaleString() || 'غير متاح'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                العملة: {selectedSymbol}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            💡 استخدم التحليل كدليل فقط. تأكد دائماً من إجراء البحث الخاص بك قبل التداول.
          </div>
        </div>
      )}
    </div>
  );
};