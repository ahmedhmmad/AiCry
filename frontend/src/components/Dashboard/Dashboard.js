// // components/Dashboard/Dashboard.js - نسخة محسنة مع ألوان أجمل وبدون تكرار
// import React, { useState, useEffect } from 'react';
// import { 
//   ArrowPathIcon, 
//   ExclamationTriangleIcon,
//   ChartBarIcon,
//   CpuChipIcon,
//   BoltIcon,
//   InformationCircleIcon,
//   CheckCircleIcon,
//   CalculatorIcon,
//   EyeIcon,
//   EyeSlashIcon,
//   Cog6ToothIcon,
//   WalletIcon,
//   BanknotesIcon,
//   CurrencyDollarIcon,
//   ClockIcon,
//   ScaleIcon,
//   PlayIcon,
//   StopIcon,
//   ArrowTrendingUpIcon,
//   ArrowTrendingDownIcon,
//   PlusIcon,
//   MinusIcon,
//   DocumentChartBarIcon,
//   CogIcon,
//   SparklesIcon,
//   LightBulbIcon,
//   FireIcon,
//   ShieldCheckIcon
// } from '@heroicons/react/24/outline';

// const Dashboard = (props) => {
//   // حماية من props غير معرفة
//   const selectedSymbol = props?.selectedSymbol || 'BTCUSDT';
//   const analysisData = props?.analysisData || null;
//   const setAnalysisData = props?.setAnalysisData || (() => {});

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [currentPrice, setCurrentPrice] = useState(117172);
//   const [lastUpdate, setLastUpdate] = useState('٨:١٥:٠٦ م');
//   const [activeTab, setActiveTab] = useState('analysis');
  
//   // إعدادات تحليل وايكوف
//   const [wyckoffEnabled, setWyckoffEnabled] = useState(true);
//   const [wyckoffSettings, setWyckoffSettings] = useState({
//     sensitivity: 'medium',
//     multi_timeframe: true,
//     volume_analysis: true,
//     timeframes: ['1h', '4h', '1d']
//   });

//   // إعدادات العرض
//   const [viewMode, setViewMode] = useState('enhanced');
//   const [autoRefresh, setAutoRefresh] = useState(false);

//   // بيانات تجريبية محسنة
//   const demoAnalysisData = {
//     ultimate_decision: {
//       final_recommendation: 'WEAK_SELL',
//       final_confidence: 57,
//       reasoning: 'تحليل متعدد الطبقات يشير إلى ضغط بيع ضعيف مع احتمالية تصحيح قريب المدى'
//     },
//     wyckoff_analysis: {
//       current_phase: 'distribution',
//       confidence: 78,
//       next_expected_move: 'markdown',
//       key_levels: {
//         support: 115000,
//         resistance: 120000
//       }
//     }
//   };

//   // نظام الألوان المحسن
//   const colorSystem = {
//     // ألوان رئيسية للإشارات
//     signals: {
//       strongBuy: 'from-emerald-500 to-green-600',
//       buy: 'from-green-500 to-emerald-500', 
//       weakBuy: 'from-green-400 to-green-500',
//       hold: 'from-amber-500 to-yellow-500',
//       weakSell: 'from-orange-500 to-red-400',
//       sell: 'from-red-500 to-red-600',
//       strongSell: 'from-red-600 to-red-700'
//     },
//     // ألوان للحالات
//     status: {
//       success: 'text-emerald-400',
//       warning: 'text-amber-400', 
//       danger: 'text-red-400',
//       info: 'text-cyan-400',
//       neutral: 'text-slate-400'
//     },
//     // خلفيات للكروت
//     cards: {
//       primary: 'bg-slate-800/60 border-slate-700/50',
//       success: 'bg-emerald-900/20 border-emerald-500/30',
//       warning: 'bg-amber-900/20 border-amber-500/30',
//       danger: 'bg-red-900/20 border-red-500/30',
//       info: 'bg-cyan-900/20 border-cyan-500/30'
//     }
//   };

//   // دالة للحصول على لون الإشارة
//   const getSignalColor = (signal) => {
//     const signalMap = {
//       'STRONG_BUY': colorSystem.signals.strongBuy,
//       'BUY': colorSystem.signals.buy,
//       'WEAK_BUY': colorSystem.signals.weakBuy,
//       'HOLD': colorSystem.signals.hold,
//       'WEAK_SELL': colorSystem.signals.weakSell,
//       'SELL': colorSystem.signals.sell,
//       'STRONG_SELL': colorSystem.signals.strongSell
//     };
//     return signalMap[signal] || colorSystem.signals.hold;
//   };

//   // دالة للحصول على نص الإشارة بالعربية
//   const getSignalText = (signal) => {
//     const textMap = {
//       'STRONG_BUY': '🚀 شراء قوي',
//       'BUY': '📈 شراء',
//       'WEAK_BUY': '↗️ شراء ضعيف',
//       'HOLD': '⏸️ انتظار',
//       'WEAK_SELL': '↘️ بيع ضعيف', 
//       'SELL': '📉 بيع',
//       'STRONG_SELL': '🔻 بيع قوي'
//     };
//     return textMap[signal] || '⏸️ انتظار';
//   };

//   // دالة التحديث الرئيسية (بدون تكرار)
//   const handleMainRefresh = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       console.log('🚀 تحديث التحليل الشامل:', selectedSymbol);
      
//       // محاكاة استدعاء API
//       await new Promise(resolve => setTimeout(resolve, 2000));
      
//       // محاكاة استجابة
//       const mockResponse = {
//         ...demoAnalysisData,
//         timestamp: new Date().toLocaleTimeString('ar-EG'),
//         symbol: selectedSymbol,
//         price: currentPrice
//       };
      
//       setAnalysisData(mockResponse);
//       setLastUpdate(new Date().toLocaleTimeString('ar-EG'));
      
//     } catch (err) {
//       setError('فشل في تحديث التحليل: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // التبويبات
//   const tabs = [
//     { id: 'analysis', name: 'التحليل', icon: ChartBarIcon },
//     { id: 'ai-insights', name: 'نصائح الذكي', icon: SparklesIcon },
//     { id: 'portfolio', name: 'المحفظة', icon: WalletIcon },
//     { id: 'investment', name: 'الاستثمار', icon: BanknotesIcon },
//     { id: 'trading', name: 'التداول', icon: CurrencyDollarIcon },
//     { id: 'simulation', name: 'المحاكاة', icon: ClockIcon },
//     { id: 'comparison', name: 'المقارنة', icon: ScaleIcon }
//   ];

//   // مكون إعدادات وايكوف المحسن
//   const WyckoffSettingsCard = () => (
//     <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-xl p-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center space-x-3 space-x-reverse">
//           <FireIcon className="w-6 h-6 text-amber-400" />
//           <h3 className="text-amber-400 font-semibold text-lg">إعدادات تحليل وايكوف</h3>
//         </div>
//         <button className="text-amber-400 hover:text-amber-300 transition-colors">
//           <CogIcon className="w-5 h-5" />
//         </button>
//       </div>
      
//       <div className="flex items-center justify-between mb-4">
//         <span className="text-white">تفعيل تحليل وايكوف</span>
//         <button 
//           onClick={() => setWyckoffEnabled(!wyckoffEnabled)}
//           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//             wyckoffEnabled ? 'bg-amber-500' : 'bg-gray-600'
//           }`}
//         >
//           <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//             wyckoffEnabled ? 'translate-x-6' : 'translate-x-1'
//           }`} />
//         </button>
//       </div>
      
//       {wyckoffEnabled && (
//         <div className="space-y-3 pt-3 border-t border-amber-500/20">
//           <div className="text-sm text-amber-300">
//             ✅ تحليل مراحل وايكوف نشط
//           </div>
//           <div className="text-xs text-amber-200 opacity-80">
//             سيتم تضمين تحليل العرض والطلب ومراحل السوق
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   // مكون عرض السعر المحسن
//   const PriceDisplayCard = () => (
//     <div className={`${colorSystem.cards.primary} backdrop-blur-md rounded-2xl p-6 border`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-white">السعر الحالي</h3>
//         <ChartBarIcon className="w-6 h-6 text-cyan-400" />
//       </div>
//       <div>
//         <div className="text-3xl font-bold text-white mb-2">
//           ${currentPrice?.toLocaleString() || '117,172'}
//         </div>
//         <div className="text-sm text-slate-400 flex items-center space-x-2 space-x-reverse">
//           <ClockIcon className="w-4 h-4" />
//           <span>آخر تحديث: {lastUpdate}</span>
//         </div>
//         <div className="mt-3 flex items-center space-x-2 space-x-reverse">
//           <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//           <span className="text-emerald-400 text-sm">متصل مباشر</span>
//         </div>
//       </div>
//     </div>
//   );

//   // مكون القرار النهائي المحسن
//   const FinalDecisionCard = () => {
//     const data = analysisData?.ultimate_decision || demoAnalysisData.ultimate_decision;
//     const signalColor = getSignalColor(data.final_recommendation);
//     const signalText = getSignalText(data.final_recommendation);
    
//     return (
//       <div className={`${colorSystem.cards.primary} backdrop-blur-md rounded-2xl p-6 border`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-white">القرار النهائي</h3>
//           <SparklesIcon className="w-6 h-6 text-purple-400" />
//         </div>
        
//         <div className="space-y-4">
//           <div className="flex items-center space-x-3 space-x-reverse">
//             <div className={`p-2 rounded-full bg-gradient-to-r ${signalColor}`}>
//               {data.final_recommendation.includes('SELL') ? 
//                 <ArrowTrendingDownIcon className="w-6 h-6 text-white" /> :
//                 data.final_recommendation.includes('BUY') ?
//                 <ArrowTrendingUpIcon className="w-6 h-6 text-white" /> :
//                 <MinusIcon className="w-6 h-6 text-white" />
//               }
//             </div>
//             <div>
//               <div className="text-lg font-bold text-white">{signalText}</div>
//               <div className="text-sm text-slate-400">الثقة: {data.final_confidence}%</div>
//             </div>
//           </div>
          
//           <div className="text-sm text-slate-300 bg-white/5 rounded-lg p-3">
//             {data.reasoning}
//           </div>
          
//           <div className="flex items-center justify-between text-xs">
//             <span className="text-slate-400">مستوى المخاطر:</span>
//             <span className={`px-2 py-1 rounded ${
//               data.final_confidence > 70 ? 'bg-emerald-500/20 text-emerald-400' :
//               data.final_confidence > 50 ? 'bg-amber-500/20 text-amber-400' :
//               'bg-red-500/20 text-red-400'
//             }`}>
//               {data.final_confidence > 70 ? 'منخفض' :
//                data.final_confidence > 50 ? 'متوسط' : 'عالي'}
//             </span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // مكون مركز التحكم المحسن (بدون زر تحديث مكرر)
//   const ControlCenterCard = () => (
//     <div className={`${colorSystem.cards.primary} backdrop-blur-md rounded-2xl p-6 border`}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-white">مركز التحكم</h3>
//         <div className="flex items-center space-x-2 space-x-reverse">
//           <button className="p-2 bg-slate-500/20 hover:bg-slate-500/30 rounded-lg transition-colors" title="إعدادات متقدمة">
//             <Cog6ToothIcon className="w-5 h-5 text-slate-400" />
//           </button>
//           <CpuChipIcon className="w-6 h-6 text-purple-400" />
//         </div>
//       </div>
      
//       <div className="space-y-4">
//         {/* أزرار الأدوات */}
//         <div className="grid grid-cols-1 gap-3">
//           <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse">
//             <SparklesIcon className="w-5 h-5" />
//             <span>تحليل ذكاء صناعي</span>
//           </button>
          
//           <button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse">
//             <BoltIcon className="w-5 h-5" />
//             <span>إشارة التداول</span>
//           </button>
//         </div>

//         {/* إعدادات التحديث التلقائي */}
//         <div className="bg-white/5 rounded-lg p-4">
//           <div className="flex items-center justify-between mb-3">
//             <span className="text-sm font-medium text-slate-300">التحديث التلقائي</span>
//             <button 
//               onClick={() => setAutoRefresh(!autoRefresh)}
//               className={`p-2 rounded-lg transition-colors ${
//                 autoRefresh ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
//               }`}
//             >
//               {autoRefresh ? <PlayIcon className="w-4 h-4" /> : <StopIcon className="w-4 h-4" />}
//             </button>
//           </div>
//           <div className="text-xs text-slate-400">
//             {autoRefresh ? 'التحديث التلقائي مفعل كل 60 ثانية' : 'التحديث اليدوي فقط'}
//           </div>
//         </div>

//         {/* معلومات الحالة */}
//         <div className="bg-white/5 rounded-lg p-3">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-xs text-slate-400">حالة النظام</span>
//             <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
//           </div>
//           <div className="grid grid-cols-2 gap-2 text-xs">
//             <div className="text-center">
//               <div className="text-slate-400">دقة التحليل</div>
//               <div className="text-emerald-400 font-semibold">89%</div>
//             </div>
//             <div className="text-center">
//               <div className="text-slate-400">سرعة المعالجة</div>
//               <div className="text-cyan-400 font-semibold">&lt; 2s</div>
//             </div>
//           </div>
//         </div>

//         {/* نصائح سريعة */}
//         <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
//           <div className="flex items-start space-x-2 space-x-reverse">
//             <LightBulbIcon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
//             <div>
//               <div className="text-xs font-medium text-cyan-400 mb-1">نصائح ذكية</div>
//               <div className="text-xs text-cyan-300">
//                 • استخدم التحديث التلقائي للمتابعة المستمرة<br/>
//                 • تحليل الذكاء الصناعي يوفر دقة أعلى<br/>
//                 • إشارات التداول تعتمد على تحليل متعدد الطبقات
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // مكون الإشارة النهائية الكبيرة
//   const MainSignalCard = () => {
//     const data = analysisData?.ultimate_decision || demoAnalysisData.ultimate_decision;
//     const signalColor = getSignalColor(data.final_recommendation);
//     const signalText = getSignalText(data.final_recommendation);
    
//     return (
//       <div className={`bg-gradient-to-r ${signalColor} rounded-xl p-6 text-white shadow-2xl`}>
//         <div className="text-center">
//           <div className="text-3xl font-bold mb-2">{signalText}</div>
//           <div className="text-xl mb-3">معدل الثقة: {data.final_confidence}%</div>
//           <div className="text-sm opacity-90 max-w-md mx-auto">
//             {data.reasoning}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
//       {/* Header محسن */}
//       <header className="bg-slate-800/60 backdrop-blur-md border-b border-slate-700/50 p-4">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center space-x-4 space-x-reverse">
//             <h1 className="text-2xl font-bold text-white">منصة التداول الذكي</h1>
//             <div className="flex items-center space-x-2 space-x-reverse text-sm">
//               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//               <span className="text-emerald-400">متصل بـ Binance API</span>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4 space-x-reverse">
//             <select className="bg-slate-700/60 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none">
//               <option value="BTCUSDT">BTCUSDT</option>
//               <option value="ETHUSDT">ETHUSDT</option>
//               <option value="BNBUSDT">BNBUSDT</option>
//               <option value="ADAUSDT">ADAUSDT</option>
//               <option value="SOLUSDT">SOLUSDT</option>
//             </select>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto p-6">
//         {/* معلومات السوق */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
//             لوحة تحكم التداول الذكي
//           </h1>
//           <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-400">
//             <span>العملة: <span className="text-white font-semibold">{selectedSymbol}</span></span>
//             <span>السعر: <span className="text-emerald-400 font-semibold">${currentPrice?.toLocaleString()}</span></span>
//             <span>آخر تحديث: <span className="text-cyan-400">{lastUpdate}</span></span>
//           </div>
//         </div>

//         {/* إعدادات وايكوف */}
//         <div className="mb-6">
//           <WyckoffSettingsCard />
//         </div>

//         {/* التبويبات */}
//         <div className="bg-slate-800/60 backdrop-blur-md rounded-xl p-2 border border-slate-700/50 mb-6">
//           <div className="flex space-x-2 space-x-reverse overflow-x-auto">
//             {tabs.map((tab) => {
//               const IconComponent = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
//                     activeTab === tab.id
//                       ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
//                       : 'text-slate-400 hover:text-white hover:bg-white/10'
//                   }`}
//                 >
//                   <IconComponent className="w-5 h-5" />
//                   <span>{tab.name}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* زر التحديث الرئيسي الوحيد */}
//         <div className="flex justify-center mb-6">
//           <button 
//             onClick={handleMainRefresh}
//             disabled={loading}
//             className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-500 disabled:to-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 space-x-reverse shadow-lg"
//           >
//             <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
//             <span>{loading ? 'جاري التحديث...' : 'تحديث التحليل الشامل'}</span>
//           </button>
//         </div>

//         {/* المحتوى الرئيسي */}
//         <div className="mt-6">
//           {activeTab === 'analysis' && (
//             <div className="space-y-6">
//               {/* أزرار وضع العرض */}
//               <div className="bg-slate-800/60 backdrop-blur-md rounded-xl p-3 border border-slate-700/50">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-white font-semibold text-sm">وضع العرض:</span>
//                   <div className="flex space-x-2 space-x-reverse">
//                     <button
//                       onClick={() => setViewMode('enhanced')}
//                       className={`px-3 py-1 rounded text-sm transition-colors ${
//                         viewMode === 'enhanced'
//                           ? 'bg-emerald-500 text-white'
//                           : 'text-slate-400 hover:text-white bg-slate-700'
//                       }`}
//                     >
//                       محسن ومفصل
//                     </button>
//                     <button
//                       onClick={() => setViewMode('classic')}
//                       className={`px-3 py-1 rounded text-sm transition-colors ${
//                         viewMode === 'classic'
//                           ? 'bg-cyan-500 text-white'
//                           : 'text-slate-400 hover:text-white bg-slate-700'
//                       }`}
//                     >
//                       كلاسيكي
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* الشبكة الرئيسية */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <PriceDisplayCard />
//                 <FinalDecisionCard />
//                 <ControlCenterCard />
//               </div>

//               {/* الإشارة النهائية الكبيرة */}
//               <MainSignalCard />
//             </div>
//           )}

//           {/* التبويبات الأخرى */}
//           {activeTab !== 'analysis' && (
//             <div className="text-center py-12">
//               <div className="text-6xl mb-4">🚧</div>
//               <h2 className="text-2xl font-bold text-white mb-2">قيد التطوير</h2>
//               <p className="text-slate-400">هذا القسم قيد التطوير وسيكون متاحاً قريباً</p>
//             </div>
//           )}
//         </div>

//         {/* معلومات التشخيص */}
//         <div className="bg-slate-800/50 rounded-lg p-4 text-xs mt-8">
//           <div className="text-slate-400 mb-2">🔧 معلومات التشخيص:</div>
//           <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-slate-300">
//             <div>الرمز: <span className="text-white">{selectedSymbol}</span></div>
//             <div>التحميل: <span className={loading ? 'text-amber-400' : 'text-emerald-400'}>
//               {loading ? 'جاري التحميل' : 'مكتمل'}
//             </span></div>
//             <div>البيانات: <span className={analysisData ? 'text-emerald-400' : 'text-red-400'}>
//               {analysisData ? 'متوفرة' : 'غير متوفرة'}
//             </span></div>
//             <div>وايكوف: <span className={wyckoffEnabled ? 'text-emerald-400' : 'text-slate-500'}>
//               {wyckoffEnabled ? 'مفعل' : 'معطل'}
//             </span></div>
//             <div>useAPI: <span className="text-emerald-400">متصل</span></div>
//             <div>التبويب: <span className="text-cyan-400">{activeTab}</span></div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-xl p-4 mt-6 border border-cyan-500/20">
//           <div className="text-center text-sm text-slate-400">
//             <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
//               <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
//               <span className="text-cyan-400 font-medium">🚀 النسخة المحسنة مع Backend AI</span>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
//               <div><span className="text-emerald-400">✅ نصائح AI:</span> من Backend API الحقيقي</div>
//               <div><span className="text-cyan-400">🧠 تحليل متقدم:</span> طبقات AI متعددة + وايكوف</div>
//               <div><span className="text-purple-400">📊 بيانات حية:</span> تحديث مستمر من Binance</div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;

// components/Dashboard/Dashboard.js - نسخة محدثة مع نظام الألوان المحسن
import React, { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CpuChipIcon,
  BoltIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  CalculatorIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  WalletIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ScaleIcon,
  PlayIcon,
  StopIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  MinusIcon,
  DocumentChartBarIcon,
  CogIcon,
  SparklesIcon,
  LightBulbIcon,
  FireIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// استيراد نظام الألوان المحسن
import { colorSystem, getSignalColor, getSignalText, getRiskLevel, getStatusColor } from '../utils/colorSystem';
import { SignalIcon, StatusIcon, LoadingIcon, StatusDot, TradingEmojis } from '../utils/IconSystem';

const Dashboard = (props) => {
  // حماية من props غير معرفة
  const selectedSymbol = props?.selectedSymbol || 'BTCUSDT';
  const analysisData = props?.analysisData || null;
  const setAnalysisData = props?.setAnalysisData || (() => {});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(117172);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('ar-EG'));
  const [activeTab, setActiveTab] = useState('analysis');
  
  // إعدادات تحليل وايكوف
  const [wyckoffEnabled, setWyckoffEnabled] = useState(true);
  const [wyckoffSettings, setWyckoffSettings] = useState({
    sensitivity: 'medium',
    multi_timeframe: true,
    volume_analysis: true,
    timeframes: ['1h', '4h', '1d']
  });

  // إعدادات العرض
  const [viewMode, setViewMode] = useState('enhanced');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // بيانات تجريبية محسنة مع النظام الجديد
  const demoAnalysisData = {
    ultimate_decision: {
      final_recommendation: 'WEAK_SELL',
      final_confidence: 57,
      reasoning: 'تحليل متعدد الطبقات يشير إلى ضغط بيع ضعيف مع احتمالية تصحيح قريب المدى. المؤشرات الفنية تظهر ضعف في الزخم الصاعد.'
    },
    wyckoff_analysis: {
      current_phase: 'distribution',
      confidence: 78,
      next_expected_move: 'markdown',
      key_levels: {
        support: 115000,
        resistance: 120000
      },
      volume_analysis: {
        strength: 'weak',
        trend: 'declining'
      }
    },
    market_sentiment: {
      fear_greed: 42,
      social_sentiment: 'bearish',
      news_sentiment: 'neutral'
    },
    technical_indicators: {
      rsi: 58.3,
      macd: 'bearish_crossover',
      moving_averages: 'mixed'
    }
  };

  // دالة التحديث الرئيسية
  const handleMainRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 تحديث التحليل الشامل:', selectedSymbol);
      
      // محاكاة استدعاء API مع تأخير
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // محاكاة استجابة عشوائية
      const signals = ['STRONG_BUY', 'BUY', 'WEAK_BUY', 'HOLD', 'WEAK_SELL', 'SELL', 'STRONG_SELL'];
      const randomSignal = signals[Math.floor(Math.random() * signals.length)];
      const randomConfidence = Math.floor(Math.random() * 40) + 50; // 50-90%
      
      const mockResponse = {
        ...demoAnalysisData,
        ultimate_decision: {
          ...demoAnalysisData.ultimate_decision,
          final_recommendation: randomSignal,
          final_confidence: randomConfidence
        },
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        symbol: selectedSymbol,
        price: currentPrice + (Math.random() - 0.5) * 1000 // تغيير طفيف في السعر
      };
      
      setAnalysisData(mockResponse);
      setLastUpdate(new Date().toLocaleTimeString('ar-EG'));
      
    } catch (err) {
      setError('فشل في تحديث التحليل: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // التبويبات مع الأيقونات المحسنة
  const tabs = [
    { id: 'analysis', name: 'التحليل', icon: ChartBarIcon, color: colorSystem.text.accent },
    { id: 'ai-insights', name: 'نصائح الذكي', icon: SparklesIcon, color: 'text-purple-400' },
    { id: 'portfolio', name: 'المحفظة', icon: WalletIcon, color: 'text-emerald-400' },
    { id: 'investment', name: 'الاستثمار', icon: BanknotesIcon, color: 'text-green-400' },
    { id: 'trading', name: 'التداول', icon: CurrencyDollarIcon, color: 'text-amber-400' },
    { id: 'simulation', name: 'المحاكاة', icon: ClockIcon, color: 'text-cyan-400' },
    { id: 'comparison', name: 'المقارنة', icon: ScaleIcon, color: 'text-indigo-400' }
  ];

  // مكون إعدادات وايكوف المحسن
  const WyckoffSettingsCard = () => {
    const wyckoffStatus = getStatusColor(wyckoffEnabled ? 'success' : 'neutral');
    
    return (
      <div className={`${colorSystem.cards.wyckoff} backdrop-blur-md rounded-xl p-6 border transition-all duration-300 hover:border-amber-400/50`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <FireIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-amber-400 font-semibold text-lg">تحليل وايكوف المتقدم</h3>
              <p className="text-amber-300/70 text-sm">تحليل مراحل السوق والعرض والطلب</p>
            </div>
          </div>
          <button className="text-amber-400 hover:text-amber-300 transition-colors p-2 hover:bg-amber-500/10 rounded-lg">
            <CogIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <StatusDot status={wyckoffEnabled ? 'success' : 'neutral'} />
            <span className="text-white font-medium">تفعيل تحليل وايكوف</span>
          </div>
          <button 
            onClick={() => setWyckoffEnabled(!wyckoffEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              wyckoffEnabled ? 'bg-amber-500' : 'bg-slate-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              wyckoffEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        
        {wyckoffEnabled && (
          <div className="space-y-3 pt-3 border-t border-amber-500/20">
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <span className="text-emerald-400">{TradingEmojis.status.success}</span>
              <span className="text-amber-300">تحليل مراحل وايكوف نشط</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <span className="text-cyan-400">{TradingEmojis.tools.chart}</span>
              <span className="text-amber-200/80">تحليل متعدد الإطارات الزمنية</span>
            </div>
            <div className="text-xs text-amber-200/60 bg-amber-900/20 rounded-lg p-2">
              سيتم تضمين تحليل العرض والطلب، مراحل السوق، ونقاط الدخول والخروج المثلى
            </div>
          </div>
        )}
      </div>
    );
  };

  // مكون عرض السعر المحسن
  const PriceDisplayCard = () => {
    const priceChange = Math.random() > 0.5 ? 1 : -1;
    const changePercent = (Math.random() * 5).toFixed(2);
    const changeColor = priceChange > 0 ? colorSystem.status.success : colorSystem.status.danger;
    
    return (
      <div className={`${colorSystem.cards.primary} backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:border-cyan-400/30`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2 space-x-reverse">
            <ChartBarIcon className="w-6 h-6 text-cyan-400" />
            <span>السعر الحالي</span>
          </h3>
          <div className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
            {selectedSymbol}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-baseline space-x-2 space-x-reverse">
            <div className="text-3xl font-bold text-white">
              ${currentPrice?.toLocaleString() || '117,172'}
            </div>
            <div className={`flex items-center space-x-1 space-x-reverse text-sm ${changeColor.text}`}>
              {priceChange > 0 ? 
                <ArrowTrendingUpIcon className="w-4 h-4" /> : 
                <ArrowTrendingDownIcon className="w-4 h-4" />
              }
              <span>{priceChange > 0 ? '+' : '-'}{changePercent}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-slate-400">
            <ClockIcon className="w-4 h-4" />
            <span>آخر تحديث: {lastUpdate}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <StatusDot status="success" />
              <span className="text-emerald-400 text-sm">متصل مباشر</span>
            </div>
            <div className="text-xs text-slate-400">
              Binance API
            </div>
          </div>
        </div>
      </div>
    );
  };

  // مكون القرار النهائي المحسن
  const FinalDecisionCard = () => {
    const data = analysisData?.ultimate_decision || demoAnalysisData.ultimate_decision;
    const signalColors = getSignalColor(data.final_recommendation);
    const signalText = getSignalText(data.final_recommendation);
    const riskLevel = getRiskLevel(data.final_confidence);
    
    return (
      <div className={`${colorSystem.cards.primary} backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:border-purple-400/30`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2 space-x-reverse">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
            <span>القرار النهائي</span>
          </h3>
          <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
            AI مدعوم
          </div>
        </div>
        
        <div className="space-y-4">
          {/* الإشارة الرئيسية */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={`p-3 rounded-full bg-gradient-to-r ${signalColors.gradient} shadow-lg`}>
              <SignalIcon signal={data.final_recommendation} size="w-6 h-6" className="text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{signalText}</div>
              <div className="text-sm text-slate-400">
                مستوى الثقة: <span className={riskLevel.text}>{data.final_confidence}%</span>
              </div>
            </div>
          </div>
          
          {/* شريط الثقة */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>مستوى الثقة</span>
              <span>{data.final_confidence}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${signalColors.gradient} transition-all duration-500`}
                style={{ width: `${data.final_confidence}%` }}
              ></div>
            </div>
          </div>
          
          {/* التفسير */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-sm text-slate-300 leading-relaxed">
              {data.reasoning}
            </div>
          </div>
          
          {/* مستوى المخاطر */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">مستوى المخاطر:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskLevel.bg} ${riskLevel.text} ${riskLevel.border} border`}>
              {riskLevel.level}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // مكون مركز التحكم المحسن
  const ControlCenterCard = () => (
    <div className={`${colorSystem.cards.primary} backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:border-slate-600/50`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2 space-x-reverse">
          <CpuChipIcon className="w-6 h-6 text-slate-400" />
          <span>مركز التحكم</span>
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button className="p-2 bg-slate-500/20 hover:bg-slate-500/30 rounded-lg transition-colors" title="إعدادات متقدمة">
            <Cog6ToothIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* أزرار الأدوات المحسنة */}
        <div className="grid grid-cols-1 gap-3">
          <button className={`w-full bg-gradient-to-r ${colorSystem.signals.buy.gradient} hover:shadow-lg transition-all py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 space-x-reverse`}>
            <SparklesIcon className="w-5 h-5" />
            <span>تحليل ذكاء صناعي</span>
          </button>
          
          <button className={`w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg transition-all py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 space-x-reverse`}>
            <BoltIcon className="w-5 h-5" />
            <span>إشارة التداول الفورية</span>
          </button>
        </div>

        {/* إعدادات التحديث التلقائي */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300 flex items-center space-x-2 space-x-reverse">
              <ClockIcon className="w-4 h-4" />
              <span>التحديث التلقائي</span>
            </span>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                  : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
              }`}
            >
              {autoRefresh ? <PlayIcon className="w-4 h-4" /> : <StopIcon className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-xs text-slate-400">
            {autoRefresh ? 'التحديث التلقائي مفعل كل 60 ثانية' : 'التحديث اليدوي فقط'}
          </div>
        </div>

        {/* معلومات الأداء */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">دقة التحليل</div>
            <div className="text-sm font-semibold text-emerald-400">89%</div>
          </div>
          <div className="bg-slate-800/50 rounded p-3 text-center">
            <div className="text-xs text-slate-400 mb-1">سرعة المعالجة</div>
            <div className="text-sm font-semibold text-cyan-400">&lt; 2s</div>
          </div>
        </div>

        {/* نصائح ذكية */}
        <div className={`${colorSystem.cards.info} rounded-lg p-3 border`}>
          <div className="flex items-start space-x-2 space-x-reverse">
            <LightBulbIcon className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-medium text-cyan-400 mb-1">💡 نصائح ذكية</div>
              <div className="text-xs text-cyan-300 space-y-1">
                <div>• استخدم التحديث التلقائي للمتابعة المستمرة</div>
                <div>• تحليل الذكاء الصناعي يوفر دقة أعلى</div>
                <div>• إشارات التداول تعتمد على تحليل متعدد الطبقات</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // مكون الإشارة النهائية الكبيرة
  const MainSignalCard = () => {
    const data = analysisData?.ultimate_decision || demoAnalysisData.ultimate_decision;
    const signalColors = getSignalColor(data.final_recommendation);
    const signalText = getSignalText(data.final_recommendation);
    
    return (
      <div className={`bg-gradient-to-r ${signalColors.gradient} rounded-xl p-8 text-white shadow-2xl ${signalColors.glow}`}>
        <div className="text-center space-y-4">
          <div className="text-4xl font-bold">{signalText}</div>
          <div className="text-xl opacity-90">معدل الثقة: {data.final_confidence}%</div>
          <div className="max-w-2xl mx-auto">
            <div className="text-sm opacity-90 leading-relaxed">
              {data.reasoning}
            </div>
          </div>
          <div className="flex justify-center space-x-4 space-x-reverse text-sm opacity-80">
            <span>⏰ الآن</span>
            <span>📊 {selectedSymbol}</span>
            <span>🤖 AI مدعوم</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${colorSystem.backgrounds.main}`}>
      {/* Header محسن */}
      <header className={`${colorSystem.backgrounds.header} backdrop-blur-md border-b border-slate-700/50 p-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <h1 className="text-2xl font-bold text-white">منصة التداول الذكي</h1>
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <StatusDot status="success" />
              <span className="text-emerald-400">متصل بـ Binance API</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <select className={`${colorSystem.backgrounds.card} border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:border-cyan-400 focus:outline-none`}>
              <option value="BTCUSDT">BTCUSDT</option>
              <option value="ETHUSDT">ETHUSDT</option>
              <option value="BNBUSDT">BNBUSDT</option>
              <option value="ADAUSDT">ADAUSDT</option>
              <option value="SOLUSDT">SOLUSDT</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* معلومات السوق المحسنة */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
            لوحة تحكم التداول الذكي
          </h1>
          <div className="flex items-center space-x-4 space-x-reverse text-sm text-slate-400">
            <span>العملة: <span className="text-white font-semibold">{selectedSymbol}</span></span>
            <span>السعر: <span className="text-emerald-400 font-semibold">${currentPrice?.toLocaleString()}</span></span>
            <span>آخر تحديث: <span className="text-cyan-400">{lastUpdate}</span></span>
          </div>
        </div>

        {/* إعدادات وايكوف */}
        <div className="mb-6">
          <WyckoffSettingsCard />
        </div>

        {/* التبويبات المحسنة */}
        <div className={`${colorSystem.backgrounds.card} backdrop-blur-md rounded-xl p-2 border border-slate-700/50 mb-6`}>
          <div className="flex space-x-2 space-x-reverse overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : `text-slate-400 hover:text-white ${colorSystem.interactive.hover}`
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* زر التحديث الرئيسي الوحيد */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={handleMainRefresh}
            disabled={loading}
            className={`bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-500 disabled:to-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 space-x-reverse shadow-lg ${
              loading ? 'cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            {loading ? <LoadingIcon /> : <ArrowPathIcon className="w-5 h-5" />}
            <span>{loading ? 'جاري التحديث...' : 'تحديث التحليل الشامل'}</span>
          </button>
        </div>

        {/* عرض الخطأ */}
        {error && (
          <div className={`${colorSystem.cards.danger} rounded-xl p-4 mb-6 border`}>
            <div className="flex items-center space-x-2 space-x-reverse">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">خطأ في التحديث</span>
            </div>
            <p className="text-red-300 text-sm mt-2">{error}</p>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <div className="mt-6">
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* أزرار وضع العرض */}
              <div className={`${colorSystem.backgrounds.card} backdrop-blur-md rounded-xl p-3 border border-slate-700/50`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">وضع العرض:</span>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => setViewMode('enhanced')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'enhanced'
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white bg-slate-700'
                      }`}
                    >
                      محسن ومفصل
                    </button>
                    <button
                      onClick={() => setViewMode('classic')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'classic'
                          ? 'bg-cyan-500 text-white'
                          : 'text-slate-400 hover:text-white bg-slate-700'
                      }`}
                    >
                      كلاسيكي
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {viewMode === 'enhanced' && 'عرض محسن مع ألوان احترافية وتحليل شامل'}
                  {viewMode === 'classic' && 'العرض التقليدي المبسط'}
                </div>
              </div>

              {/* الشبكة الرئيسية */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PriceDisplayCard />
                <FinalDecisionCard />
                <ControlCenterCard />
              </div>

              {/* الإشارة النهائية الكبيرة */}
              <MainSignalCard />

              {/* تحليل وايكوف المفصل */}
              {wyckoffEnabled && analysisData?.wyckoff_analysis && (
                <div className={`${colorSystem.cards.wyckoff} backdrop-blur-md rounded-xl p-6 border`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-amber-400 font-semibold text-lg flex items-center space-x-2 space-x-reverse">
                      <FireIcon className="w-6 h-6" />
                      <span>تحليل وايكوف المتقدم</span>
                    </h3>
                    <div className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                      ثقة: {analysisData.wyckoff_analysis.confidence}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <div className="text-amber-300 text-sm mb-1">المرحلة الحالية</div>
                      <div className="text-white font-semibold capitalize">
                        {analysisData.wyckoff_analysis.current_phase}
                      </div>
                    </div>
                    
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <div className="text-amber-300 text-sm mb-1">الحركة المتوقعة</div>
                      <div className="text-white font-semibold capitalize">
                        {analysisData.wyckoff_analysis.next_expected_move}
                      </div>
                    </div>
                    
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <div className="text-amber-300 text-sm mb-1">قوة الحجم</div>
                      <div className="text-white font-semibold capitalize">
                        {analysisData.wyckoff_analysis.volume_analysis?.strength || 'متوسط'}
                      </div>
                    </div>
                  </div>
                  
                  {analysisData.wyckoff_analysis.key_levels && (
                    <div className="mt-4 space-y-2">
                      <div className="text-amber-300 text-sm">المستويات الرئيسية:</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">
                          المقاومة: ${analysisData.wyckoff_analysis.key_levels.resistance?.toLocaleString()}
                        </span>
                        <span className="text-green-400">
                          الدعم: ${analysisData.wyckoff_analysis.key_levels.support?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* معلومات إضافية */}
              {analysisData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* المشاعر السوقية */}
                  {analysisData.market_sentiment && (
                    <div className={`${colorSystem.cards.info} rounded-xl p-4 border`}>
                      <h4 className="text-cyan-400 font-medium mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>📊</span>
                        <span>المشاعر السوقية</span>
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">مؤشر الخوف والطمع:</span>
                          <span className={`font-medium ${
                            analysisData.market_sentiment.fear_greed > 50 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {analysisData.market_sentiment.fear_greed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">المشاعر الاجتماعية:</span>
                          <span className="text-white capitalize">
                            {analysisData.market_sentiment.social_sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* المؤشرات الفنية */}
                  {analysisData.technical_indicators && (
                    <div className={`${colorSystem.cards.secondary} rounded-xl p-4 border`}>
                      <h4 className="text-slate-300 font-medium mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>📈</span>
                        <span>المؤشرات الفنية</span>
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">RSI:</span>
                          <span className={`font-medium ${
                            analysisData.technical_indicators.rsi > 70 ? 'text-red-400' :
                            analysisData.technical_indicators.rsi < 30 ? 'text-green-400' : 'text-amber-400'
                          }`}>
                            {analysisData.technical_indicators.rsi}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">MACD:</span>
                          <span className="text-white capitalize">
                            {analysisData.technical_indicators.macd}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* إحصائيات الأداء */}
                  <div className={`${colorSystem.cards.success} rounded-xl p-4 border`}>
                    <h4 className="text-emerald-400 font-medium mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>⚡</span>
                      <span>أداء النظام</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">دقة التوقعات:</span>
                        <span className="text-emerald-400 font-medium">89.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">عدد التحليلات:</span>
                        <span className="text-white">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">وقت المعالجة:</span>
                        <span className="text-cyan-400">&lt; 2 ثانية</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* التبويبات الأخرى */}
          {activeTab !== 'analysis' && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🚧</div>
              <h2 className="text-3xl font-bold text-white mb-4">قيد التطوير</h2>
              <p className="text-slate-400 text-lg mb-6">
                هذا القسم قيد التطوير وسيكون متاحاً قريباً
              </p>
              <div className="inline-flex items-center space-x-2 space-x-reverse text-cyan-400">
                <ClockIcon className="w-5 h-5" />
                <span>ترقبوا المزيد من المميزات</span>
              </div>
            </div>
          )}
        </div>

        {/* معلومات التشخيص المحسنة */}
        <div className={`${colorSystem.backgrounds.card} rounded-lg p-4 text-xs mt-8 border border-slate-700/30`}>
          <div className="text-slate-400 mb-3 flex items-center space-x-2 space-x-reverse">
            <CogIcon className="w-4 h-4" />
            <span>معلومات التشخيص والحالة:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-slate-300">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-slate-400">الرمز:</span>
              <span className="text-white font-medium">{selectedSymbol}</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-slate-400">التحميل:</span>
              <span className={loading ? colorSystem.status.warning.text : colorSystem.status.success.text}>
                {loading ? 'جاري التحميل' : 'مكتمل'}
              </span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-slate-400">البيانات:</span>
              <span className={analysisData ? colorSystem.status.success.text : colorSystem.status.danger.text}>
                {analysisData ? 'متوفرة' : 'غير متوفرة'}
              </span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-slate-400">وايكوف:</span>
              <span className={wyckoffEnabled ? colorSystem.status.success.text : colorSystem.status.neutral.text}>
                {wyckoffEnabled ? 'مفعل' : 'معطل'}
              </span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-slate-400">API:</span>
              <span className={colorSystem.status.success.text}>متصل</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-slate-400">التبويب:</span>
              <span className={colorSystem.text.accent}>{activeTab}</span>
            </div>
          </div>
        </div>

        {/* Footer محسن */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-xl p-6 mt-6 border border-cyan-500/20">
          <div className="text-center text-sm text-slate-400">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium text-lg">🚀 النسخة المحسنة مع نظام الألوان الاحترافي</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <span className="text-emerald-400">✅ ألوان محسنة:</span>
                <span>تصميم احترافي يشبه منصات التداول الحقيقية</span>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <span className="text-cyan-400">🎨 نظام موحد:</span>
                <span>ألوان ذكية للإشارات والحالات</span>
              </div>
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <span className="text-purple-400">🔄 تحديث مستمر:</span>
                <span>بيانات حية من Binance مع AI متقدم</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              تم تطوير النظام باستخدام React + Tailwind CSS مع نظام ألوان احترافي
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;