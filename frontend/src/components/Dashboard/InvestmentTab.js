// frontend/src/components/Dashboard/InvestmentTab.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export const InvestmentTab = ({ selectedSymbol, currentPrice, analysisData }) => {
  const [investments] = useState([
    {
      id: 1,
      symbol: 'BTCUSDT',
      strategy: 'DCA',
      amount: 15000,
      currentValue: 18500,
      pnl: 3500,
      pnlPercentage: 23.33,
      startDate: '2024-01-15',
      status: 'نشط'
    },
    {
      id: 2,
      symbol: 'ETHUSDT',
      strategy: 'طويل المدى',
      amount: 8000,
      currentValue: 7200,
      pnl: -800,
      pnlPercentage: -10.0,
      startDate: '2024-02-10',
      status: 'نشط'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* رأس الاستثمار */}
      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <BanknotesIcon className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">الاستثمار طويل المدى</h2>
          </div>
          
          <button className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-violet-700 transition-all flex items-center space-x-2 space-x-reverse">
            <PlusIcon className="w-5 h-5" />
            <span>استثمار جديد</span>
          </button>
        </div>

        {/* ملخص الاستثمارات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div 
            className="bg-gradient-to-r from-purple-500/20 to-violet-600/10 rounded-xl p-4 border border-purple-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-purple-400 text-sm font-medium">إجمالي المستثمر</div>
            <div className="text-2xl font-bold text-white">$23,000</div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-blue-500/20 to-indigo-600/10 rounded-xl p-4 border border-blue-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-blue-400 text-sm font-medium">القيمة الحالية</div>
            <div className="text-2xl font-bold text-white">$25,700</div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-green-500/20 to-emerald-600/10 rounded-xl p-4 border border-green-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-green-400 text-sm font-medium">إجمالي الربح</div>
            <div className="text-2xl font-bold text-green-400">+$2,700</div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-r from-yellow-500/20 to-amber-600/10 rounded-xl p-4 border border-yellow-500/20"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-yellow-400 text-sm font-medium">نسبة العائد</div>
            <div className="text-2xl font-bold text-yellow-400">+11.7%</div>
          </motion.div>
        </div>
      </div>

      {/* قائمة الاستثمارات */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2 space-x-reverse">
          <ChartBarIcon className="w-6 h-6 text-blue-400" />
          <span>الاستثمارات الحالية</span>
        </h3>

        <div className="space-y-4">
          {investments.map((investment, index) => (
            <motion.div
              key={investment.id}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">العملة والاستراتيجية</div>
                  <div className="text-white font-semibold text-lg">{investment.symbol}</div>
                  <div className="text-gray-300 text-sm">{investment.strategy}</div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">المبلغ المستثمر</div>
                  <div className="text-white font-semibold">${investment.amount.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-400">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{investment.startDate}</span>
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">القيمة الحالية</div>
                  <div className="text-white font-semibold">${investment.currentValue.toLocaleString()}</div>
                  <div className={`text-sm ${investment.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {investment.pnl >= 0 ? '+' : ''}${investment.pnl.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-1">نسبة العائد</div>
                  <div className={`text-lg font-bold flex items-center space-x-1 space-x-reverse ${investment.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <ArrowTrendingUpIcon className={`w-4 h-4 ${investment.pnlPercentage < 0 ? 'rotate-180' : ''}`} />
                    <span>{investment.pnlPercentage >= 0 ? '+' : ''}{investment.pnlPercentage}%</span>
                  </div>
                  <div className="text-xs text-gray-400">{investment.status}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* نصائح الاستثمار */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-white font-semibold mb-4">💡 نصائح الاستثمار طويل المدى</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>✅ استخدم استراتيجية DCA للتقليل من المخاطر</div>
          <div>📈 ركز على العملات ذات الأساسيات القوية</div>
          <div>⏰ لا تتاجر بناءً على العواطف</div>
          <div>🎯 حدد أهدافاً واضحة وواقعية</div>
        </div>
      </div>
    </div>
  );
};