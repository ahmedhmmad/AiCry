// components/Dashboard/PortfolioManagementTab.js
import React, { useState, useEffect } from 'react';
import { 
  WalletIcon, 
  BanknotesIcon, 
  ChartPieIcon, 
  CogIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export const PortfolioManagementTab = () => {
  const [totalCapital, setTotalCapital] = useState(0);
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [setupAmount, setSetupAmount] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [showAddAllocation, setShowAddAllocation] = useState(false);
  const [newAllocation, setNewAllocation] = useState({ category: '', percentage: '', description: '' });
  const [notification, setNotification] = useState(null);

  // Load portfolio setup from localStorage
  useEffect(() => {
    const savedCapital = localStorage.getItem('portfolio_total_capital');
    const savedAllocations = localStorage.getItem('portfolio_allocations');
    const isSetupComplete = localStorage.getItem('portfolio_management_setup');
    
    if (savedCapital) {
      setTotalCapital(parseFloat(savedCapital));
    }
    
    if (savedAllocations) {
      try {
        setAllocations(JSON.parse(savedAllocations));
      } catch (e) {
        console.error('خطأ في تحميل تخصيصات المحفظة:', e);
      }
    }

    if (isSetupComplete === 'true' && savedCapital) {
      setIsSetupMode(false);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isSetupMode) {
      localStorage.setItem('portfolio_total_capital', totalCapital.toString());
      localStorage.setItem('portfolio_allocations', JSON.stringify(allocations));
    }
  }, [totalCapital, allocations, isSetupMode]);

  // Complete initial setup
  const completeSetup = () => {
    const amount = parseFloat(setupAmount);
    if (amount && amount > 0) {
      setTotalCapital(amount);
      setIsSetupMode(false);
      localStorage.setItem('portfolio_total_capital', amount.toString());
      localStorage.setItem('portfolio_management_setup', 'true');
      
      // Default allocations
      const defaultAllocations = [
        { id: '1', category: 'النقد والطوارئ', percentage: 20, description: 'صندوق الطوارئ والسيولة', allocated: amount * 0.2, color: 'blue' },
        { id: '2', category: 'للاستثمار', percentage: 50, description: 'استثمارات طويلة المدى', allocated: amount * 0.5, color: 'green' },
        { id: '3', category: 'للتداول', percentage: 20, description: 'تداول ومضاربة', allocated: amount * 0.2, color: 'orange' },
        { id: '4', category: 'احتياطي', percentage: 10, description: 'احتياطي للفرص', allocated: amount * 0.1, color: 'purple' }
      ];
      
      setAllocations(defaultAllocations);
      showNotification('تم إعداد محفظتك بنجاح!', 'success');
    }
  };

  // Add new allocation
  const addAllocation = () => {
    const percentage = parseFloat(newAllocation.percentage);
    const currentTotal = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
    
    if (currentTotal + percentage > 100) {
      showNotification('إجمالي النسب لا يمكن أن يتجاوز 100%', 'error');
      return;
    }
    
    if (percentage <= 0 || !newAllocation.category) {
      showNotification('يرجى ملء جميع الحقول بقيم صالحة', 'error');
      return;
    }

    const allocation = {
      id: Date.now().toString(),
      category: newAllocation.category,
      percentage: percentage,
      description: newAllocation.description,
      allocated: (totalCapital * percentage) / 100,
      color: ['blue', 'green', 'orange', 'purple', 'pink', 'yellow'][allocations.length % 6]
    };

    setAllocations(prev => [...prev, allocation]);
    setNewAllocation({ category: '', percentage: '', description: '' });
    setShowAddAllocation(false);
    showNotification('تم إضافة التخصيص بنجاح', 'success');
  };

  // Remove allocation
  const removeAllocation = (id) => {
    setAllocations(prev => prev.filter(alloc => alloc.id !== id));
    showNotification('تم حذف التخصيص', 'info');
  };

  // Update allocation percentage
  const updateAllocation = (id, newPercentage) => {
    const percentage = parseFloat(newPercentage);
    const otherAllocations = allocations.filter(alloc => alloc.id !== id);
    const otherTotal = otherAllocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
    
    if (otherTotal + percentage > 100) {
      showNotification('إجمالي النسب لا يمكن أن يتجاوز 100%', 'error');
      return;
    }

    setAllocations(prev => prev.map(alloc => 
      alloc.id === id 
        ? { ...alloc, percentage, allocated: (totalCapital * percentage) / 100 }
        : alloc
    ));
  };

  // Reset portfolio
  const resetPortfolio = () => {
    setIsSetupMode(true);
    setTotalCapital(0);
    setAllocations([]);
    setSetupAmount('');
    localStorage.removeItem('portfolio_management_setup');
    localStorage.removeItem('portfolio_total_capital');
    localStorage.removeItem('portfolio_allocations');
    showNotification('تم إعادة تعيين المحفظة', 'info');
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  const remainingPercentage = 100 - totalAllocated;

  // Setup Mode
  if (isSetupMode) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <WalletIcon className="w-10 h-10 text-green-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">إعداد محفظة إدارة رأس المال</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            المحفظة هي أداة لإدارة رأس المال وتوزيع الأصول. 
            حدد إجمالي رأس المال المتاح لديك لبدء إدارة محفظتك بطريقة احترافية.
          </p>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3">إجمالي رأس المال</label>
              <div className="relative">
                <input
                  type="number"
                  value={setupAmount}
                  onChange={(e) => setSetupAmount(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-xl font-bold focus:border-green-400 focus:outline-none"
                  placeholder="100000"
                  min="1000"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[50000, 100000, 250000, 500000].map(amount => (
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
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              إعداد المحفظة
            </button>
          </div>
        </div>

        {/* Portfolio Management Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <ChartPieIcon className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">توزيع الأصول</h3>
            <p className="text-gray-400 text-sm">
              توزيع رأس المال على فئات مختلفة حسب استراتيجية الاستثمار
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <BanknotesIcon className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">إدارة المخاطر</h3>
            <p className="text-gray-400 text-sm">
              تحديد نسب التخصيص لكل فئة للتحكم في مستوى المخاطر
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <CogIcon className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">المراقبة والتحليل</h3>
            <p className="text-gray-400 text-sm">
              متابعة أداء المحفظة وإعادة التوازن عند الحاجة
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Portfolio Management Interface
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
            <WalletIcon className="w-8 h-8 text-green-400" />
            <div className="text-green-400 text-sm">إجمالي رأس المال</div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalCapital.toLocaleString()}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <ChartPieIcon className="w-8 h-8 text-blue-400" />
            <div className="text-blue-400 text-sm">المخصص</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalAllocated.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <BanknotesIcon className="w-8 h-8 text-purple-400" />
            <div className="text-purple-400 text-sm">المتبقي</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {remainingPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <CogIcon className="w-8 h-8 text-yellow-400" />
            <div className="text-yellow-400 text-sm">عدد الفئات</div>
          </div>
          <div className="text-2xl font-bold text-white">
            {allocations.length}
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">توزيع الأصول</h3>
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={() => setShowAddAllocation(!showAddAllocation)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <PlusIcon className="w-5 h-5" />
              <span>إضافة فئة</span>
            </button>
            
            <button
              onClick={resetPortfolio}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* Add New Allocation Form */}
        {showAddAllocation && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-semibold mb-4">إضافة فئة جديدة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">اسم الفئة</label>
                <input
                  type="text"
                  value={newAllocation.category}
                  onChange={(e) => setNewAllocation({...newAllocation, category: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  placeholder="مثال: الذهب والمعادن"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">النسبة (%)</label>
                <input
                  type="number"
                  value={newAllocation.percentage}
                  onChange={(e) => setNewAllocation({...newAllocation, percentage: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  placeholder="15"
                  min="0"
                  max={remainingPercentage}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">الوصف</label>
                <input
                  type="text"
                  value={newAllocation.description}
                  onChange={(e) => setNewAllocation({...newAllocation, description: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                  placeholder="وصف الفئة..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse mt-4">
              <button
                onClick={() => setShowAddAllocation(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={addAllocation}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                إضافة
              </button>
            </div>

            {remainingPercentage < parseFloat(newAllocation.percentage || 0) && (
              <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
                النسبة المطلوبة أكبر من المتبقي ({remainingPercentage.toFixed(1)}%)
              </div>
            )}
          </div>
        )}

        {/* Allocations List */}
        {allocations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ChartPieIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">لا توجد تخصيصات حالياً</p>
            <p className="text-sm">ابدأ بإضافة فئات لتوزيع رأس المال</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`w-4 h-4 rounded-full bg-${allocation.color}-400`}></div>
                    <div>
                      <h4 className="text-white font-semibold">{allocation.category}</h4>
                      <p className="text-gray-400 text-sm">{allocation.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {allocation.percentage}%
                      </div>
                      <div className="text-gray-400 text-sm">
                        ${allocation.allocated.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={allocation.percentage}
                        onChange={(e) => updateAllocation(allocation.id, e.target.value)}
                        className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm text-center focus:border-blue-400 focus:outline-none"
                        min="0"
                        max="100"
                      />
                      <button
                        onClick={() => removeAllocation(allocation.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="حذف"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${allocation.color}-400`}
                      style={{ width: `${allocation.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Progress */}
        {allocations.length > 0 && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">إجمالي التخصيص</span>
              <span className="text-white font-bold">{totalAllocated.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  totalAllocated === 100 ? 'bg-green-400' : 
                  totalAllocated > 100 ? 'bg-red-400' : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min(totalAllocated, 100)}%` }}
              ></div>
            </div>
            {totalAllocated > 100 && (
              <div className="text-red-400 text-sm mt-2">
                ⚠️ إجمالي التخصيص يتجاوز 100%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
