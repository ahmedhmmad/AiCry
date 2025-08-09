// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   ArrowPathIcon, 
//   ChartBarIcon, 
//   ExclamationTriangleIcon,
//   CpuChipIcon,
//   SparklesIcon,
//   LightBulbIcon,
//   BeakerIcon
// } from '@heroicons/react/24/outline';

// // استيراد useAPI hook
// const useAPI = () => {
//   // في حالة عدم وجود useAPI، قم بإنشاء mock
//   const fetchUltimateAnalysis = async (symbol, setData, setPrice, setUpdate, options) => {
//     console.log('Mock API call:', { symbol, options });
//     // يمكنك استبدال هذا بـ import حقيقي من useAPI
//     throw new Error('useAPI hook غير متصل. تحقق من المسار: import { useAPI } from "../../hooks/useAPI"');
//   };
  
//   return { fetchUltimateAnalysis };
// };

// // مكون بسيط لعرض التحليل الفني
// const TechnicalAnalysisCard = ({ data, loading }) => {
//   if (loading) return <div className="bg-white/5 rounded-xl p-4 animate-pulse h-32"></div>;
  
//   if (!data) return (
//     <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
//       <CpuChipIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
//       <p>لا توجد بيانات التحليل الفني</p>
//     </div>
//   );

//   return (
//     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
//       <div className="flex items-center space-x-2 space-x-reverse mb-3">
//         <CpuChipIcon className="w-5 h-5 text-green-400" />
//         <h3 className="text-white font-semibold">التحليل الفني</h3>
//         <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
//           {data.confidence || 0}%
//         </span>
//       </div>
      
//       <div className="grid grid-cols-2 gap-3 text-sm">
//         <div>
//           <span className="text-gray-400">RSI:</span>
//           <span className="text-white ml-2">{data.rsi?.toFixed(1) || 'N/A'}</span>
//         </div>
//         <div>
//           <span className="text-gray-400">MACD:</span>
//           <span className="text-white ml-2">{data.macd_signal || 'N/A'}</span>
//         </div>
//         <div>
//           <span className="text-gray-400">SMA 20:</span>
//           <span className="text-white ml-2">${data.sma_20?.toFixed(2) || 'N/A'}</span>
//         </div>
//         <div>
//           <span className="text-gray-400">SMA 50:</span>
//           <span className="text-white ml-2">${data.sma_50?.toFixed(2) || 'N/A'}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // مكون بسيط للذكاء الاصطناعي البسيط
// const SimpleAICard = ({ data, loading }) => {
//   if (loading) return <div className="bg-white/5 rounded-xl p-4 animate-pulse h-32"></div>;
  
//   if (!data) return (
//     <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
//       <SparklesIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
//       <p>لا توجد بيانات الذكاء الاصطناعي البسيط</p>
//     </div>
//   );

//   return (
//     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
//       <div className="flex items-center space-x-2 space-x-reverse mb-3">
//         <SparklesIcon className="w-5 h-5 text-blue-400" />
//         <h3 className="text-white font-semibold">الذكاء الاصطناعي البسيط</h3>
//         <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
//           {data.confidence || 0}%
//         </span>
//       </div>
      
//       <div className="space-y-2">
//         <div className="flex justify-between">
//           <span className="text-gray-400">التوصية:</span>
//           <span className={`font-semibold ${
//             data.recommendation === 'BUY' ? 'text-green-400' :
//             data.recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'
//           }`}>
//             {data.recommendation === 'BUY' ? 'شراء' :
//              data.recommendation === 'SELL' ? 'بيع' : 'انتظار'}
//           </span>
//         </div>
//         <div className="text-xs text-gray-300">
//           {data.reasoning?.substring(0, 80) || 'تحليل ذكي بسيط'}...
//         </div>
//       </div>
//     </div>
//   );
// };

// // مكون بسيط للذكاء الاصطناعي المتقدم
// const AdvancedAICard = ({ data, loading }) => {
//   if (loading) return <div className="bg-white/5 rounded-xl p-4 animate-pulse h-32"></div>;
  
//   if (!data) return (
//     <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
//       <BeakerIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
//       <p>لا توجد بيانات الذكاء الاصطناعي المتقدم</p>
//     </div>
//   );

//   const ensemble = data.ensemble_prediction || {};

//   return (
//     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
//       <div className="flex items-center space-x-2 space-x-reverse mb-3">
//         <BeakerIcon className="w-5 h-5 text-purple-400" />
//         <h3 className="text-white font-semibold">الذكاء الاصطناعي المتقدم</h3>
//         <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
//           {ensemble.confidence?.toFixed(0) || 0}%
//         </span>
//       </div>
      
//       <div className="space-y-2">
//         <div className="flex justify-between">
//           <span className="text-gray-400">التوصية:</span>
//           <span className={`font-semibold ${
//             ensemble.final_decision === 'BUY' ? 'text-green-400' :
//             ensemble.final_decision === 'SELL' ? 'text-red-400' : 'text-yellow-400'
//           }`}>
//             {ensemble.final_decision === 'BUY' ? 'شراء' :
//              ensemble.final_decision === 'SELL' ? 'بيع' : 'انتظار'}
//           </span>
//         </div>
//         <div className="text-xs text-gray-300">
//           تحليل متقدم باستخدام خوارزميات متطورة
//         </div>
//       </div>
//     </div>
//   );
// };

// // مكون مبسط لتحليل وايكوف
// const WyckoffSimpleCard = ({ data, loading }) => {
//   if (loading) return (
//     <div className="bg-white/5 rounded-xl p-4 animate-pulse h-32 flex items-center justify-center">
//       <div className="text-purple-400">جاري تحليل وايكوف...</div>
//     </div>
//   );
  
//   if (!data) return (
//     <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
//       <ChartBarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
//       <p>لا توجد بيانات تحليل وايكوف</p>
//       <p className="text-xs mt-1">تحقق من إعدادات API</p>
//     </div>
//   );

//   const getPhaseText = (phase) => {
//     const phases = {
//       'accumulation': 'تجميع',
//       'markup': 'ارتفاع', 
//       'distribution': 'توزيع',
//       'markdown': 'انخفاض',
//       're_accumulation': 'إعادة تجميع'
//     };
//     return phases[phase] || phase;
//   };

//   return (
//     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
//       <div className="flex items-center space-x-2 space-x-reverse mb-3">
//         <ChartBarIcon className="w-5 h-5 text-orange-400" />
//         <h3 className="text-white font-semibold">تحليل وايكوف</h3>
//         <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
//           {data.confidence || 0}%
//         </span>
//       </div>
      
//       <div className="space-y-2">
//         <div className="flex justify-between">
//           <span className="text-gray-400">المرحلة:</span>
//           <span className="text-white font-semibold">
//             {getPhaseText(data.current_phase)}
//           </span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-400">التوصية:</span>
//           <span className={`font-semibold ${
//             data.recommended_action === 'BUY' ? 'text-green-400' :
//             data.recommended_action === 'SELL' ? 'text-red-400' : 'text-yellow-400'
//           }`}>
//             {data.recommended_action === 'BUY' ? 'شراء' :
//              data.recommended_action === 'SELL' ? 'بيع' : 'انتظار'}
//           </span>
//         </div>
//         <div className="text-xs text-gray-300">
//           {data.action_reasoning?.substring(0, 80) || 'تحليل علاقة السعر والحجم'}...
//         </div>
//       </div>
//     </div>
//   );
// };

// // التوصية النهائية المجمعة
// const FinalRecommendationCard = ({ analysisData, loading }) => {
//   if (loading) return (
//     <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 animate-pulse">
//       <div className="text-center text-blue-400">جاري حساب التوصية النهائية...</div>
//     </div>
//   );

//   if (!analysisData?.ultimate_decision) return (
//     <div className="bg-white/5 rounded-xl p-6 text-center text-gray-400">
//       <LightBulbIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
//       <p>لا توجد توصية نهائية</p>
//     </div>
//   );

//   const decision = analysisData.ultimate_decision;
//   const getActionColor = (action) => {
//     switch (action) {
//       case 'BUY': return 'from-green-500 to-emerald-600';
//       case 'SELL': return 'from-red-500 to-red-600';
//       default: return 'from-yellow-500 to-orange-500';
//     }
//   };

//   return (
//     <div className={`bg-gradient-to-r ${getActionColor(decision.final_recommendation)} rounded-xl p-6 text-white`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold mb-2">
//             التوصية النهائية: {
//               decision.final_recommendation === 'BUY' ? 'شراء' :
//               decision.final_recommendation === 'SELL' ? 'بيع' : 'انتظار'
//             }
//           </h2>
//           <p className="opacity-90">{decision.reasoning}</p>
//         </div>
//         <div className="text-right">
//           <div className="text-3xl font-bold">{decision.final_confidence}%</div>
//           <div className="opacity-80">مستوى الثقة</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // لوحة تحكم بسيطة
// const SimpleControlPanel = ({ onRefresh, loading, wyckoffEnabled, onWyckoffToggle }) => {
//   return (
//     <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4 space-x-reverse">
//           <button
//             onClick={onRefresh}
//             disabled={loading}
//             className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 space-x-reverse"
//           >
//             <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
//             <span>{loading ? 'جاري التحليل...' : 'تحديث التحليل'}</span>
//           </button>
          
//           <label className="flex items-center space-x-2 space-x-reverse">
//             <input
//               type="checkbox"
//               checked={wyckoffEnabled}
//               onChange={(e) => onWyckoffToggle(e.target.checked)}
//               className="rounded"
//             />
//             <span className="text-white text-sm">تفعيل تحليل وايكوف</span>
//           </label>
//         </div>
//       </div>
//     </div>
//   );
// };

// // المكون الرئيسي للداشبورد
// const CleanDashboard = ({ selectedSymbol = 'ETHUSDT', analysisData, setAnalysisData }) => {
//   const [loading, setLoading] = useState(false);
//   const [wyckoffEnabled, setWyckoffEnabled] = useState(true);
//   const [currentPrice, setCurrentPrice] = useState(null);
//   const [lastUpdate, setLastUpdate] = useState(null);
//   const [error, setError] = useState(null);

//   // استخدام useAPI hook الحقيقي
//   const { fetchUltimateAnalysis } = useAPI();

//   // تحديث البيانات الفعلي
//   const handleRefresh = useCallback(async () => {
//     if (!fetchUltimateAnalysis || !selectedSymbol) {
//       console.error('❌ fetchUltimateAnalysis غير متوفر أو selectedSymbol فارغ');
//       setError('خطأ في إعدادات API');
//       return;
//     }

//     console.log('🚀 بدء التحليل للرمز:', selectedSymbol);
//     console.log('📊 تحليل وايكوف:', wyckoffEnabled ? 'مفعل' : 'معطل');
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       // الخيارات للإرسال للAPI
//       const options = {
//         include_wyckoff: wyckoffEnabled,
//         multi_timeframe_wyckoff: false,
//         detail_level: 'detailed',
//         depth: 200
//       };

//       // استدعاء API الفعلي
//       await fetchUltimateAnalysis(
//         selectedSymbol,
//         setAnalysisData,
//         setCurrentPrice,
//         setLastUpdate,
//         options
//       );
      
//       console.log('✅ تم التحليل بنجاح');
//     } catch (err) {
//       console.error('❌ خطأ في التحليل:', err);
//       setError(err.message || 'حدث خطأ أثناء التحليل');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedSymbol, wyckoffEnabled, fetchUltimateAnalysis, setAnalysisData]);

//   // تحديث تلقائي عند تغيير الرمز
//   useEffect(() => {
//     if (selectedSymbol) {
//       handleRefresh();
//     }
//   }, [selectedSymbol, handleRefresh]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
        
//         {/* رأس الصفحة */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-white mb-2">تحليل العملات الرقمية</h1>
//             <p className="text-gray-400">تحليل شامل باستخدام الذكاء الاصطناعي وتحليل وايكوف</p>
//           </div>
//           <div className="text-right">
//             <div className="text-2xl font-bold text-white">{selectedSymbol}</div>
//             {currentPrice && (
//               <div className="text-gray-400">${currentPrice.toLocaleString()}</div>
//             )}
//           </div>
//         </div>

//         {/* لوحة التحكم البسيطة */}
//         <SimpleControlPanel 
//           onRefresh={handleRefresh}
//           loading={loading}
//           wyckoffEnabled={wyckoffEnabled}
//           onWyckoffToggle={setWyckoffEnabled}
//         />

//         {/* رسالة توضيحية لحل المشكلة */}
//         {!analysisData && !loading && (
//           <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
//             <h3 className="text-blue-400 font-bold mb-3">🔧 لحل مشكلة عدم ظهور البيانات:</h3>
//             <div className="space-y-2 text-blue-200 text-sm">
//               <p>1. تأكد من أن useAPI hook متصل بشكل صحيح</p>
//               <p>2. تحقق من أن API endpoint يعمل: <code className="bg-blue-500/20 px-2 py-1 rounded">/ai/ultimate-analysis/{selectedSymbol}</code></p>
//               <p>3. تأكد من أن المعامل <code className="bg-blue-500/20 px-2 py-1 rounded">include_wyckoff=true</code> يُرسل للخادم</p>
//               <p>4. فحص استجابة الخادم في Network tab في المتصفح</p>
//             </div>
//           </div>
//         )}

//         {/* عرض الأخطاء */}
//         {error && (
//           <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 space-x-reverse">
//             <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
//             <div>
//               <div className="text-red-400 font-semibold">خطأ في التحليل</div>
//               <div className="text-red-300 text-sm">{error}</div>
//               <button 
//                 onClick={handleRefresh}
//                 className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
//                 disabled={loading}
//               >
//                 إعادة المحاولة
//               </button>
//             </div>
//           </div>
//         )}

//         {/* التوصية النهائية */}
//         <FinalRecommendationCard analysisData={analysisData} loading={loading} />

//         {/* طبقات التحليل */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <TechnicalAnalysisCard 
//             data={analysisData?.analysis_layers?.['1_technical_analysis']} 
//             loading={loading} 
//           />
//           <SimpleAICard 
//             data={analysisData?.analysis_layers?.['2_simple_ai']} 
//             loading={loading} 
//           />
//           <AdvancedAICard 
//             data={analysisData?.analysis_layers?.['3_advanced_ai']} 
//             loading={loading} 
//           />
//           {wyckoffEnabled && (
//             <WyckoffSimpleCard 
//               data={analysisData?.wyckoff_analysis} 
//               loading={loading} 
//             />
//           )}
//         </div>

//         {/* معلومات تشخيصية */}
//         <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
//           <details>
//             <summary className="text-gray-400 cursor-pointer mb-2">🔧 معلومات التشخيص</summary>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300">
//               <div>الرمز: {selectedSymbol}</div>
//               <div>التحميل: {loading ? 'جاري' : 'مكتمل'}</div>
//               <div>وايكوف: {wyckoffEnabled ? 'مفعل' : 'معطل'}</div>
//               <div>بيانات وايكوف: {analysisData?.wyckoff_analysis ? 'متوفرة' : 'غير متوفرة'}</div>
//             </div>
//           </details>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CleanDashboard;
// hooks/useAPI.js - محافظ على الكود الأصلي مع التحسينات
import { useState, useCallback } from 'react';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUltimateAnalysis = useCallback(async (
    selectedSymbol, 
    setAnalysisData, 
    setCurrentPrice, 
    setLastUpdate,
    options = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // بناء معاملات الـ API
      // تأكد من أن الطلب يحتوي على:
      const params = new URLSearchParams({
        include_wyckoff: 'true',
        multi_timeframe_wyckoff: 'true',
        detail_level: 'full',
        explain_reasoning: 'true' // مهم لإظهار التفسير
      });
      
      // المعاملات الأساسية
      if (options.interval) {
        params.append('interval', options.interval);
      }
      
      // معاملات وايكوف الجديدة
      if (options.include_wyckoff !== undefined) {
        params.append('include_wyckoff', options.include_wyckoff.toString());
      }
      
      if (options.multi_timeframe_wyckoff !== undefined) {
        params.append('multi_timeframe_wyckoff', options.multi_timeframe_wyckoff.toString());
      }
      
      // معاملات إضافية للتحليل المتقدم
      if (options.depth) {
        params.append('depth', options.depth.toString());
      }
      
      if (options.detail_level) {
        params.append('detail_level', options.detail_level);
      }

      // معاملات وايكوف المتقدمة
      if (options.wyckoff_sensitivity) {
        params.append('wyckoff_sensitivity', options.wyckoff_sensitivity);
      }

      if (options.volume_threshold) {
        params.append('volume_threshold', options.volume_threshold.toString());
      }

      if (options.price_action_weight) {
        params.append('price_action_weight', options.price_action_weight.toString());
      }

      if (options.timeframes && Array.isArray(options.timeframes)) {
        params.append('timeframes', options.timeframes.join(','));
      }
      
      const queryString = params.toString();
      const url = `/ai/ultimate-analysis/${selectedSymbol}${queryString ? `?${queryString}` : ''}`;
      
      console.log('API Request URL:', url); // للتتبع والتطوير
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.symbol === selectedSymbol.toUpperCase()) {
        setAnalysisData(data);
        setCurrentPrice(data.current_price);
        setLastUpdate(new Date().toLocaleTimeString('ar-SA'));
        
        // تسجيل بيانات وايكوف إذا كانت متوفرة
        if (data.wyckoff_analysis) {
          console.log('Wyckoff Analysis Received:', data.wyckoff_analysis);
        }
      }
    } catch (error) {
      console.error('خطأ في جلب التحليل:', error);
      const fallbackData = await fetchFallbackPrice(selectedSymbol);
      setAnalysisData({ 
        error: 'فشل في جلب البيانات من الخادم.',
        details: error.message,
        ...fallbackData
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFallbackPrice = async (symbol) => {
    try {
      const binanceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      if (binanceResponse.ok) {
        const priceData = await binanceResponse.json();
        return {
          symbol: symbol.toUpperCase(),
          current_price: parseFloat(priceData.price),
          ultimate_decision: {
            final_recommendation: 'HOLD',
            final_confidence: 50,
            reasoning: 'بيانات احتياطية - التحليل الكامل غير متوفر'
          },
          technical_analysis: {
            rsi: null,
            sma_20: null,
            sma_50: null,
            macd: null,
            bollinger_bands: null
          },
          wyckoff_analysis: null,
          timestamp: new Date().toISOString(),
          data_source: 'binance_fallback'
        };
      } else {
        throw new Error(`Binance API error: ${binanceResponse.status}`);
      }
    } catch (binanceError) {
      console.error('Binance fallback failed:', binanceError);
      
      // محاولة أخيرة مع CoinGecko أو مصدر آخر
      try {
        const geckoResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`,
          { 
            method: 'GET',
            timeout: 5000 
          }
        );
        
        if (geckoResponse.ok) {
          const geckoData = await geckoResponse.json();
          const price = geckoData[symbol.toLowerCase()]?.usd;
          
          if (price) {
            return {
              symbol: symbol.toUpperCase(),
              current_price: price,
              ultimate_decision: {
                final_recommendation: 'HOLD',
                final_confidence: 30,
                reasoning: 'بيانات احتياطية من CoinGecko - التحليل الكامل غير متوفر'
              },
              technical_analysis: {
                rsi: null,
                sma_20: null,
                sma_50: null,
                macd: null,
                bollinger_bands: null
              },
              wyckoff_analysis: null,
              timestamp: new Date().toISOString(),
              data_source: 'coingecko_fallback'
            };
          }
        }
        
        throw new Error('No price data available from CoinGecko');
      } catch (geckoError) {
        throw new Error(`All fallback sources failed: ${geckoError.message}`);
      }
    }
  };

  // دالة لجلب تحليل وايكوف منفصل
  const fetchWyckoffAnalysis = useCallback(async (symbol, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      // معاملات وايكوف المحددة
      if (options.timeframes && Array.isArray(options.timeframes)) {
        params.append('timeframes', options.timeframes.join(','));
      }
      
      if (options.sensitivity) {
        params.append('sensitivity', options.sensitivity);
      }

      if (options.include_volume_analysis !== undefined) {
        params.append('include_volume_analysis', options.include_volume_analysis.toString());
      }

      const queryString = params.toString();
      const url = `/ai/wyckoff-analysis/${symbol}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return processWyckoffData(data);
    } catch (error) {
      console.error('خطأ في جلب تحليل وايكوف:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // معالجة وتنسيق بيانات وايكوف
  const processWyckoffData = (wyckoffData) => {
    const processed = { ...wyckoffData };

    // التأكد من وجود القيم الافتراضية
    processed.confidence = processed.confidence || 0;
    processed.phase_strength = processed.phase_strength || 0;
    processed.current_phase = processed.current_phase || 'unknown';
    processed.recommended_action = processed.recommended_action || 'HOLD';
    processed.risk_level = processed.risk_level || 'MEDIUM';

    // معالجة تحليل الحجم
    if (processed.volume_analysis && typeof processed.volume_analysis === 'object') {
      processed.volume_analysis.volume_strength = processed.volume_analysis.volume_strength || 0;
      processed.volume_analysis.volume_trend = processed.volume_analysis.volume_trend || 'neutral';
    }

    // معالجة المستويات المهمة
    if (processed.key_levels && typeof processed.key_levels === 'object') {
      Object.keys(processed.key_levels).forEach(level => {
        if (processed.key_levels[level] && typeof processed.key_levels[level] === 'number') {
          processed.key_levels[level] = processed.key_levels[level].toFixed(2);
        }
      });
    }

    // معالجة التحليل متعدد الإطارات
    if (processed.multi_timeframe && typeof processed.multi_timeframe === 'object') {
      Object.keys(processed.multi_timeframe).forEach(timeframe => {
        const tfData = processed.multi_timeframe[timeframe];
        if (tfData) {
          tfData.phase = tfData.phase || 'unknown';
          tfData.strength = tfData.strength || 0;
        }
      });
    }

    return processed;
  };

  // دالة للحصول على إعدادات وايكوف الافتراضية
  const getDefaultWyckoffOptions = () => ({
    include_wyckoff: true,
    multi_timeframe_wyckoff: true,
    wyckoff_sensitivity: 'medium',
    volume_threshold: 1.5,
    price_action_weight: 0.7,
    timeframes: ['1h', '4h', '1d'],
    depth: 100,
    detail_level: 'full'
  });

console.log('📊 تفاصيل التحليل:', {
  technical: data.analysis_layers?.['1_technical_analysis'],
  simple_ai: data.analysis_layers?.['2_simple_ai'], 
  advanced_ai: data.analysis_layers?.['3_advanced_ai'],
  wyckoff: data.wyckoff_analysis,
  ultimate: data.ultimate_decision
});

  // دالة فحص صحة API (من الكود الأصلي)
  const checkAPIHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        console.log('✅ API Health Check: OK');
        return true;
      } else {
        console.warn('⚠️ API Health Check: Failed');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ API Health Check: Error', error);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    fetchUltimateAnalysis,
    fetchWyckoffAnalysis,
    getDefaultWyckoffOptions,
    processWyckoffData,
    checkAPIHealth
  };
};

// تصدير افتراضي أيضاً للتوافق
export default useAPI;