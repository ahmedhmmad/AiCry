// components/Dashboard/PortfolioTab.js
import React, { useState, useEffect } from 'react';
import { 
  WalletIcon,
  PlusIcon,
  MinusIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export const PortfolioTab = ({ portfolioData, setPortfolioData }) => {
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    amount: '',
    price: ''
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // إذا لم يتم تمرير portfolioData، استخدم بيانات افتراضية
  const defaultPortfolioData = {
    balance: 10000,
    positions: [
      { symbol: 'BTC', amount: 0.25, avgPrice: 45000, currentPrice: 47500, value: 11875, pnl: 625 },
      { symbol: 'ETH', amount: 5.5, avgPrice: 2800, currentPrice: 2950, value: 16225, pnl: 825 },
      { symbol: 'BNB', amount: 20, avgPrice: 320, currentPrice: 315, value: 6300, pnl: -100 },
      { symbol: 'ADA', amount: 1000, avgPrice: 1.2, currentPrice: 1.15, value: 1150, pnl: -50 }
    ],
    totalValue: 35550,
    totalPnl: 1300,
    dailyChange: 2.3
  };

  const currentPortfolio = portfolioData || defaultPortfolioData;

  // حساب إجمالي القيم
  useEffect(() => {
    if (setPortfolioData && portfolioData) {
      const totalValue = portfolioData.positions.reduce((sum, pos) => sum + pos.value, 0) + portfolioData.balance;
      const totalPnl = portfolioData.positions.reduce((sum, pos) => sum + pos.pnl, 0);
      
      setPortfolioData(prev => ({
        ...prev,
        totalValue,
        totalPnl
      }));
    }
  }, [portfolioData?.positions, portfolioData?.balance, setPortfolioData]);

  // إضافة مركز جديد
  const handleAddPosition = () => {
    if (newPosition.symbol && newPosition.amount && newPosition.price && setPortfolioData) {
      const amount = parseFloat(newPosition.amount);
      const price = parseFloat(newPosition.price);
      const value = amount * price;
      
      const position = {
        symbol: newPosition.symbol.toUpperCase(),
        amount: amount,
        avgPrice: price,
        currentPrice: price * (1 + (Math.random() - 0.5) * 0.1), // محاكاة السعر الحالي
        value: value,
        pnl: 0
      };

      setPortfolioData(prev => ({
        ...prev,
        positions: [...prev.positions, position],
        balance: prev.balance - value
      }));

      setNewPosition({ symbol: '', amount: '', price: '' });
      setShowAddPosition(false);
    }
  };

  // حذف مركز
  const handleRemovePosition = (index) => {
    if (setPortfolioData) {
      const position = currentPortfolio.positions[index];
      setPortfolioData(prev => ({
        ...prev,
        positions: prev.positions.filter((_, i) => i !== index),
        balance: prev.balance + position.value
      }));
    }
  };

  // بيانات الأداء للرسم البياني (محاكاة)
  const performanceData = {
    '24h': [
      { time: '00:00', value: 34200 },
      { time: '04:00', value: 34800 },
      { time: '08:00', value: 35100 },
      { time: '12:00', value: 35550 },
      { time: '16:00', value: 35200 },
      { time: '20:00', value: 35550 }
    ],
    '7d': [
      { time: 'Mon', value: 33000 },
      { time: 'Tue', value: 34200 },
      { time: 'Wed', value: 35100 },
      { time: 'Thu', value: 34800 },
      { time: 'Fri', value: 35550 },
      { time: 'Sat', value: 35200 },
      { time: 'Sun', value: 35550 }
    ],
    '30d': [
      { time: 'Week 1', value: 32000 },
      { time: 'Week 2', value: 33500 },
      { time: 'Week 3', value: 34200 },
      { time: 'Week 4', value: 35550 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <WalletIcon className="w-8 h-8 text-green-400" />
            <span className="text-green-400 text-sm">إجمالي القيمة</span>
          </div>
          <div className="text-white text-2xl font-bold">${currentPortfolio.totalValue.toLocaleString()}</div>
          <div className={`text-sm flex items-center mt-1 ${currentPortfolio.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currentPortfolio.dailyChange >= 0 ? 
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : 
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            }
            {Math.abs(currentPortfolio.dailyChange).toFixed(2)}% (24h)
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
            <span className="text-blue-400 text-sm">المراكز المفتوحة</span>
          </div>
          <div className="text-white text-2xl font-bold">{currentPortfolio.positions.length}</div>
          <div className="text-gray-400 text-sm mt-1">عملات مختلفة</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 flex items-center justify-center">
              {currentPortfolio.totalPnl >= 0 ? '📈' : '📉'}
            </div>
            <span className="text-purple-400 text-sm">الربح/الخسارة</span>
          </div>
          <div className={`text-2xl font-bold ${currentPortfolio.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currentPortfolio.totalPnl >= 0 ? '+' : ''}${currentPortfolio.totalPnl.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {((currentPortfolio.totalPnl / (currentPortfolio.totalValue - currentPortfolio.totalPnl)) * 100).toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 flex items-center justify-center text-yellow-400">💰</div>
            <span className="text-yellow-400 text-sm">الرصيد المتاح</span>
          </div>
          <div className="text-white text-2xl font-bold">${currentPortfolio.balance.toLocaleString()}</div>
          <div className="text-gray-400 text-sm mt-1">للاستثمار</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">أداء المحفظة</h3>
          <div className="flex space-x-2 space-x-reverse">
            {['24h', '7d', '30d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
        
        {/* Simple Chart Representation */}
        <div className="h-40 flex items-end space-x-2 space-x-reverse">
          {performanceData[selectedTimeframe].map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg w-full transition-all duration-500"
                style={{ 
                  height: `${((point.value - 30000) / 10000) * 100}%`,
                  minHeight: '20px'
                }}
              ></div>
              <span className="text-xs text-gray-400 mt-2">{point.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Positions List */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">المراكز المفتوحة</h3>
          <button
            onClick={() => setShowAddPosition(!showAddPosition)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="w-4 h-4" />
            <span>إضافة مركز</span>
          </button>
        </div>

        {/* Add Position Form */}
        {showAddPosition && (
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-4">إضافة مركز جديد</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">رمز العملة</label>
                <input
                  type="text"
                  placeholder="BTC"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full bg-gray-600 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">الكمية</label>
                <input
                  type="number"
                  placeholder="0.5"
                  value={newPosition.amount}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-gray-600 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">سعر الشراء</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={newPosition.price}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-gray-600 text-white rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-end space-x-2 space-x-reverse">
                <button
                  onClick={handleAddPosition}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAddPosition(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Positions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPortfolio.positions.map((position, index) => (
            <div key={index} className="bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold text-lg">{position.symbol}</h4>
                  <p className="text-gray-400 text-sm">{position.amount} {position.symbol}</p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-blue-400 hover:text-blue-300">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleRemovePosition(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">متوسط السعر:</span>
                  <span className="text-white text-sm">${position.avgPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">السعر الحالي:</span>
                  <span className="text-white text-sm">${position.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">القيمة الحالية:</span>
                  <span className="text-white text-sm font-medium">${position.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">الربح/الخسارة:</span>
                  <div className="text-right">
                    <div className={`font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                    </div>
                    <div className={`text-xs ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {((position.pnl / (position.amount * position.avgPrice)) * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      position.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(Math.abs((position.pnl / (position.amount * position.avgPrice)) * 100) * 2, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentPortfolio.positions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">لا توجد مراكز مفتوحة</div>
            <button
              onClick={() => setShowAddPosition(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              إضافة أول مركز
            </button>
          </div>
        )}
      </div>

      {/* Portfolio Allocation */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-6">توزيع المحفظة</h3>
        
        <div className="space-y-4">
          {currentPortfolio.positions.map((position, index) => {
            const percentage = (position.value / currentPortfolio.totalValue) * 100;
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500'];
            
            return (
              <div key={index} className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-3 space-x-reverse flex-1">
                  <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                  <span className="text-white font-medium">{position.symbol}</span>
                  <span className="text-gray-400">{position.amount} {position.symbol}</span>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="text-white font-medium">${position.value.toLocaleString()}</span>
                  <span className="text-gray-400 w-12 text-right">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-32">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Cash allocation */}
          <div className="flex items-center space-x-4 space-x-reverse border-t border-gray-600 pt-4">
            <div className="flex items-center space-x-3 space-x-reverse flex-1">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span className="text-white font-medium">نقد</span>
              <span className="text-gray-400">USD</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-white font-medium">${currentPortfolio.balance.toLocaleString()}</span>
              <span className="text-gray-400 w-12 text-right">
                {((currentPortfolio.balance / currentPortfolio.totalValue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-32">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gray-500 transition-all duration-500"
                  style={{ width: `${(currentPortfolio.balance / currentPortfolio.totalValue) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 hover:from-green-500/30 hover:to-emerald-500/30 transition-all">
          <div className="text-green-400 text-center">
            <PlusIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold">إيداع أموال</div>
            <div className="text-sm text-gray-400">إضافة رصيد للمحفظة</div>
          </div>
        </button>
        
        <button className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all">
          <div className="text-blue-400 text-center">
            <ArrowTrendingUpIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold">إعادة توازن</div>
            <div className="text-sm text-gray-400">توزيع المحفظة تلقائياً</div>
          </div>
        </button>
        
        <button className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 hover:from-purple-500/30 hover:to-pink-500/30 transition-all">
          <div className="text-purple-400 text-center">
            <ChartBarIcon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-semibold">تقرير مفصل</div>
            <div className="text-sm text-gray-400">تحليل شامل للأداء</div>
          </div>
        </button>
      </div>
    </div>
  );
};