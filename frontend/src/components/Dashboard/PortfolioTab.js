import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WalletIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  CpuChipIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BanknotesIcon,
  ScaleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const PortfolioTab = ({ selectedSymbol, currentPrice }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [hideBalances, setHideBalances] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, analytics

  // بيانات تجريبية للمحفظة
  const mockPortfolio = [
    {
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      icon: '₿',
      amount: 0.5,
      avgPrice: 42000,
      currentPrice: 43500,
      value: 21750,
      pnl: 750,
      pnlPercent: 3.57,
      allocation: 45.2,
      color: 'text-orange-400'
    },
    {
      symbol: 'ETHUSDT',
      name: 'Ethereum', 
      icon: 'Ξ',
      amount: 8.2,
      avgPrice: 2500,
      currentPrice: 2650,
      value: 21730,
      pnl: 1230,
      pnlPercent: 6.0,
      allocation: 45.1,
      color: 'text-blue-400'
    },
    {
      symbol: 'ADAUSDT',
      name: 'Cardano',
      icon: '🔵',
      amount: 5000,
      avgPrice: 0.42,
      currentPrice: 0.45,
      value: 2250,
      pnl: 150,
      pnlPercent: 7.14,
      allocation: 4.7,
      color: 'text-blue-500'
    },
    {
      symbol: 'SOLUSDT',
      name: 'Solana',
      icon: '🟣',
      amount: 25,
      avgPrice: 95,
      currentPrice: 98,
      value: 2450,
      pnl: 75,
      pnlPercent: 3.16,
      allocation: 5.0,
      color: 'text-purple-400'
    }
  ];

  useEffect(() => {
    // محاكاة جلب بيانات المحفظة
    setLoading(true);
    setTimeout(() => {
      setPortfolio(mockPortfolio);
      const total = mockPortfolio.reduce((sum, asset) => sum + asset.value, 0);
      const totalPnLValue = mockPortfolio.reduce((sum, asset) => sum + asset.pnl, 0);
      setTotalValue(total);
      setTotalPnL(totalPnLValue);
      setLoading(false);
    }, 1000);
  }, []);

  // دالة حساب إجمالي النسبة المئوية للربح/الخسارة
  const getTotalPnLPercent = () => {
    const totalInvested = totalValue - totalPnL;
    return totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  };

  // مكون بطاقة ملخص المحفظة
  const PortfolioSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">إجمالي القيمة</h3>
          <WalletIcon className="w-6 h-6 text-green-400" />
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-green-400">
            {hideBalances ? '****' : `$${totalValue.toLocaleString()}`}
          </div>
          <div className={`text-sm flex items-center ${
            getTotalPnLPercent() >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {getTotalPnLPercent() >= 0 ? 
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : 
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            }
            {hideBalances ? '**%' : `${getTotalPnLPercent().toFixed(2)}%`}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">الربح/الخسارة</h3>
          <CurrencyDollarIcon className={`w-6 h-6 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`} />
        </div>
        <div className="space-y-2">
          <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {hideBalances ? '****' : `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`}
          </div>
          <div className="text-sm text-gray-400">
            آخر 24 ساعة
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">عدد الأصول</h3>
          <ChartBarIcon className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold text-blue-400">
            {portfolio.length}
          </div>
          <div className="text-sm text-gray-400">
            عملات مختلفة
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">أفضل أداء</h3>
          <SparklesIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="space-y-2">
          {portfolio.length > 0 && (
            <>
              <div className="text-lg font-bold text-purple-400">
                {portfolio.reduce((best, asset) => 
                  asset.pnlPercent > best.pnlPercent ? asset : best
                ).symbol.replace('USDT', '')}
              </div>
              <div className="text-sm text-green-400">
                +{portfolio.reduce((best, asset) => 
                  asset.pnlPercent > best.pnlPercent ? asset : best
                ).pnlPercent.toFixed(2)}%
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );

  // مكون قائمة الأصول
  const AssetsList = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">أصول المحفظة</h3>
        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title={hideBalances ? 'إظهار الأرصدة' : 'إخفاء الأرصدة'}
          >
            {hideBalances ? <EyeIcon className="w-5 h-5 text-gray-400" /> : <EyeSlashIcon className="w-5 h-5 text-gray-400" />}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 space-x-reverse"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>إضافة أصل</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <ArrowPathIcon className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل بيانات المحفظة...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolio.map((asset, index) => (
            <motion.div
              key={asset.symbol}
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="text-3xl">{asset.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h4 className="text-lg font-bold text-white">{asset.symbol.replace('USDT', '')}</h4>
                      <span className={`text-sm px-2 py-1 rounded ${asset.color} bg-white/10`}>
                        {asset.allocation.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{asset.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {hideBalances ? '****' : `$${asset.value.toLocaleString()}`}
                  </div>
                  <div className={`text-sm flex items-center justify-end ${
                    asset.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {asset.pnl >= 0 ? 
                      <ArrowTrendingUpIcon className="w-4 h-4 ml-1" /> : 
                      <ArrowTrendingDownIcon className="w-4 h-4 ml-1" />
                    }
                    {hideBalances ? '**%' : `${asset.pnlPercent >= 0 ? '+' : ''}${asset.pnlPercent.toFixed(2)}%`}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">الكمية:</span>
                  <div className="text-white font-medium">
                    {hideBalances ? '****' : asset.amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">متوسط السعر:</span>
                  <div className="text-white font-medium">
                    ${asset.avgPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">السعر الحالي:</span>
                  <div className="text-white font-medium">
                    ${asset.currentPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* شريط التوزيع */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>نسبة التوزيع</span>
                  <span>{asset.allocation.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${
                      asset.symbol === 'BTCUSDT' ? 'from-orange-500 to-yellow-500' :
                      asset.symbol === 'ETHUSDT' ? 'from-blue-500 to-cyan-500' :
                      asset.symbol === 'ADAUSDT' ? 'from-blue-600 to-indigo-600' :
                      'from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${Math.min(asset.allocation, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // مكون تحليل التوزيع
  const AllocationAnalysis = () => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2 space-x-reverse">
        <ScaleIcon className="w-6 h-6 text-cyan-400" />
        <span>تحليل توزيع المحفظة</span>
      </h3>

      <div className="space-y-6">
        {/* رسم بياني دائري بسيط */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">التوزيع الحالي</h4>
            <div className="space-y-3">
              {portfolio.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className={`w-4 h-4 rounded-full ${
                      asset.symbol === 'BTCUSDT' ? 'bg-orange-500' :
                      asset.symbol === 'ETHUSDT' ? 'bg-blue-500' :
                      asset.symbol === 'ADAUSDT' ? 'bg-blue-600' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-white">{asset.symbol.replace('USDT', '')}</span>
                  </div>
                  <span className="text-gray-300">{asset.allocation.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">التوصيات</h4>
            <div className="space-y-3">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <InformationCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">توزيع متوازن</span>
                </div>
                <p className="text-green-300 text-sm mt-1">
                  محفظتك موزعة بشكل جيد بين الأصول الرئيسية
                </p>
              </div>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">اقتراح</span>
                </div>
                <p className="text-yellow-300 text-sm mt-1">
                  فكر في إضافة المزيد من التنويع مع عملات أخرى
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* مؤشرات الأداء */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h5 className="text-white font-medium mb-2">مؤشر المخاطر</h5>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-yellow-400 text-sm">متوسط</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h5 className="text-white font-medium mb-2">مؤشر التنويع</h5>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-cyan-400 text-sm">جيد</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h5 className="text-white font-medium mb-2">مؤشر الاستقرار</h5>
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="text-emerald-400 text-sm">ممتاز</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // شريط التبويبات الفرعية
  const SubTabs = () => (
    <div className="flex space-x-2 space-x-reverse mb-6">
      {[
        { id: 'overview', name: 'نظرة عامة', icon: WalletIcon },
        { id: 'detailed', name: 'تفصيلي', icon: ChartBarIcon },
        { id: 'analytics', name: 'تحليلات', icon: CpuChipIcon }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setViewMode(tab.id)}
          className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-all duration-300 ${
            viewMode === tab.id
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <motion.div
        className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-500/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
            <WalletIcon className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">إدارة المحفظة الذكية</h2>
            <p className="text-gray-400">
              تتبع وإدارة أصولك الرقمية بذكاء مع تحليلات متقدمة
            </p>
          </div>
        </div>
      </motion.div>

      {/* التبويبات الفرعية */}
      <SubTabs />

      {/* المحتوى حسب التبويب المحدد */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'overview' && (
            <div>
              <PortfolioSummary />
              <AssetsList />
            </div>
          )}

          {viewMode === 'detailed' && (
            <div className="space-y-6">
              <PortfolioSummary />
              <AssetsList />
              <AllocationAnalysis />
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="space-y-6">
              <AllocationAnalysis />
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">تحليلات متقدمة</h3>
                <div className="text-center py-8">
                  <CpuChipIcon className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">تحليلات متقدمة قادمة قريباً...</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export { PortfolioTab };