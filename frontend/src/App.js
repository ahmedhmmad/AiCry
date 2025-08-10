// // App.js - مُصلح
// import React from 'react';
// // إزالة استيراد App.css إذا لم يكن موجوداً
// // import './App.css';

// // استيراد مُصلح - استخدام named imports بدلاً من default
// import Dashboard from './components/Dashboard/Dashboard';
// // أو إذا كان Dashboard يستخدم named export:
// // import { Dashboard } from './components/Dashboard/Dashboard';

// // استيراد باقي المكونات
// import Header from './components/Header';
// import SymbolSelector from './components/SymbolSelector';
// import LoadingScreen from './components/LoadingScreen';

// function App() {
//   const [selectedSymbol, setSelectedSymbol] = React.useState('BTCUSDT');
//   const [analysisData, setAnalysisData] = React.useState(null);
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [apiHealth, setApiHealth] = React.useState(null);

//   const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];

//   // فحص حالة API عند بدء التشغيل
//   React.useEffect(() => {
//     const checkAPI = async () => {
//       try {
//         const response = await fetch('/health');
//         if (response.ok) {
//           const health = await response.json();
//           setApiHealth(health);
//         }
//       } catch (error) {
//         console.error('API health check failed:', error);
//         setApiHealth({ status: 'error' });
//       }
//     };

//     checkAPI();
//   }, []);

//   const getConnectionStatus = () => {
//     if (!apiHealth) return { color: 'yellow', text: 'جاري الفحص...' };
//     if (apiHealth.binance_api === 'connected') return { color: 'green', text: 'متصل بـ Binance API' };
//     return { color: 'red', text: 'غير متصل' };
//   };

//   const connectionStatus = getConnectionStatus();

//   return (
//     <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Header */}
//       <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center space-x-4 space-x-reverse">
//             <h1 className="text-2xl font-bold text-white">لوحة تحكم التداول</h1>
//             <div className="flex items-center space-x-2 space-x-reverse text-sm">
//               <div className={`w-2 h-2 bg-${connectionStatus.color}-400 rounded-full ${connectionStatus.color === 'green' ? 'animate-pulse' : ''}`}></div>
//               <span className={`text-${connectionStatus.color}-400`}>{connectionStatus.text}</span>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4 space-x-reverse">
//             <select
//               value={selectedSymbol}
//               onChange={(e) => setSelectedSymbol(e.target.value)}
//               className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-blue-400 focus:outline-none"
//             >
//               {symbols.map(symbol => (
//                 <option key={symbol} value={symbol} className="bg-slate-800">
//                   {symbol}
//                 </option>
//               ))}
//             </select>
            
//             {/* زر إعادة فحص API */}
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded-lg transition-colors"
//               title="إعادة تحميل"
//             >
//               🔄
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="main-content">
//         <div className="max-w-7xl mx-auto p-6">
//           {isLoading ? (
//             <LoadingScreen />
//           ) : (
//             <Dashboard 
//               selectedSymbol={selectedSymbol}
//               analysisData={analysisData}
//               setAnalysisData={setAnalysisData}
//               setIsLoading={setIsLoading}
//               apiHealth={apiHealth}
//             />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;
// App.js - Updated with Trading Integration
import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [selectedSymbol, setSelectedSymbol] = React.useState('BTCUSDT');
  const [analysisData, setAnalysisData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiHealth, setApiHealth] = React.useState(null);
  const [connectionStatus, setConnectionStatus] = React.useState('checking');

  // Extended symbol list with more cryptocurrencies
  const symbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
    'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT',
    'MATICUSDT', 'LTCUSDT', 'ATOMUSDT', 'FILUSDT', 'TRXUSDT'
  ];

  // Check API health on startup and periodically
  React.useEffect(() => {
    const checkAPI = async () => {
      try {
        setConnectionStatus('checking');
        const response = await fetch('/health');
        if (response.ok) {
          const health = await response.json();
          setApiHealth(health);
          
          // Determine overall connection status
          if (health.binance_api === 'connected' && 
              health.database === 'connected' && 
              health.redis === 'connected') {
            setConnectionStatus('connected');
          } else if (health.binance_api === 'connected') {
            setConnectionStatus('partial');
          } else {
            setConnectionStatus('disconnected');
          }
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setConnectionStatus('error');
        setApiHealth({ 
          status: 'error', 
          binance_api: 'error',
          database: 'error',
          redis: 'error' 
        });
      }
    };

    // Initial check
    checkAPI();
    
    // Periodic health checks every 30 seconds
    const healthCheckInterval = setInterval(checkAPI, 30000);
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { 
          color: 'green', 
          text: 'متصل بجميع الخدمات', 
          icon: '🟢',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400'
        };
      case 'partial':
        return { 
          color: 'yellow', 
          text: 'اتصال جزئي - Binance فقط', 
          icon: '🟡',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400'
        };
      case 'checking':
        return { 
          color: 'blue', 
          text: 'جاري فحص الاتصال...', 
          icon: '🔄',
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-400'
        };
      case 'disconnected':
        return { 
          color: 'red', 
          text: 'غير متصل', 
          icon: '🔴',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400'
        };
      case 'error':
        return { 
          color: 'red', 
          text: 'خطأ في الاتصال', 
          icon: '❌',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400'
        };
      default:
        return { 
          color: 'gray', 
          text: 'حالة غير معروفة', 
          icon: '❓',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400'
        };
    }
  };

  const connectionInfo = getConnectionStatusInfo();

  const refreshHealth = async () => {
    setConnectionStatus('checking');
    // Trigger health check
    try {
      const response = await fetch('/health');
      if (response.ok) {
        const health = await response.json();
        setApiHealth(health);
        
        if (health.binance_api === 'connected' && 
            health.database === 'connected' && 
            health.redis === 'connected') {
          setConnectionStatus('connected');
        } else if (health.binance_api === 'connected') {
          setConnectionStatus('partial');
        } else {
          setConnectionStatus('disconnected');
        }
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">منصة التداول الذكي</h1>
                <p className="text-sm text-gray-400">مدعوم بالذكاء الصناعي</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg ${connectionInfo.bgColor}`}>
              <span className="text-sm">{connectionInfo.icon}</span>
              <span className={`text-sm font-medium ${connectionInfo.textColor}`}>
                {connectionInfo.text}
              </span>
              {connectionStatus === 'checking' && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Symbol Selector */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <label className="text-sm text-gray-400">العملة:</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none text-sm min-w-[120px]"
              >
                <optgroup label="العملات الرئيسية">
                  <option value="BTCUSDT">Bitcoin (BTC)</option>
                  <option value="ETHUSDT">Ethereum (ETH)</option>
                  <option value="BNBUSDT">Binance Coin (BNB)</option>
                </optgroup>
                <optgroup label="العملات البديلة">
                  <option value="ADAUSDT">Cardano (ADA)</option>
                  <option value="SOLUSDT">Solana (SOL)</option>
                  <option value="XRPUSDT">Ripple (XRP)</option>
                  <option value="DOGEUSDT">Dogecoin (DOGE)</option>
                  <option value="AVAXUSDT">Avalanche (AVAX)</option>
                  <option value="DOTUSDT">Polkadot (DOT)</option>
                  <option value="LINKUSDT">Chainlink (LINK)</option>
                  <option value="MATICUSDT">Polygon (MATIC)</option>
                  <option value="LTCUSDT">Litecoin (LTC)</option>
                  <option value="ATOMUSDT">Cosmos (ATOM)</option>
                  <option value="FILUSDT">Filecoin (FIL)</option>
                  <option value="TRXUSDT">Tron (TRX)</option>
                </optgroup>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Refresh Health Button */}
              <button
                onClick={refreshHealth}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                title="فحص حالة الاتصال"
              >
                🔄
              </button>
              
              {/* Quick Info Button */}
              <button
                onClick={() => window.open('https://www.binance.com/en/trade/' + selectedSymbol, '_blank')}
                className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                title="عرض في Binance"
              >
                📈
              </button>
              
              {/* Settings Button */}
              <button
                onClick={() => {
                  // يمكن إضافة modal للإعدادات هنا
                  console.log('فتح الإعدادات');
                }}
                className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-colors"
                title="الإعدادات"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Health Details Bar (shown when connection issues) */}
        {apiHealth && connectionStatus !== 'connected' && (
          <div className="max-w-7xl mx-auto mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse text-sm">
                <span className="text-yellow-400 font-medium">تفاصيل الاتصال:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  apiHealth.database === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  قاعدة البيانات: {apiHealth.database === 'connected' ? 'متصل' : 'غير متصل'}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  apiHealth.redis === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  Redis: {apiHealth.redis === 'connected' ? 'متصل' : 'غير متصل'}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  apiHealth.binance_api === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  Binance: {apiHealth.binance_api === 'connected' ? 'متصل' : 'غير متصل'}
                </span>
              </div>
              
              <button
                onClick={() => setConnectionStatus('connected')} // Hide the bar
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="max-w-7xl mx-auto p-6">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <Dashboard 
              selectedSymbol={selectedSymbol}
              analysisData={analysisData}
              setAnalysisData={setAnalysisData}
              setIsLoading={setIsLoading}
              apiHealth={apiHealth}
              connectionStatus={connectionStatus}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 p-6 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Platform Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">منصة التداول الذكي</h3>
              <p className="text-sm text-gray-400 mb-3">
                منصة تداول متقدمة مدعومة بالذكاء الصناعي لتحليل العملات الرقمية وتوفير إشارات تداول دقيقة.
              </p>
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-400">
                <span>الإصدار:</span>
                <span className="text-blue-400">v1.0.0</span>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">المميزات</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• تحليل فني متقدم مع مؤشرات MACD و RSI</li>
                <li>• ذكاء صناعي للتنبؤ بحركة الأسعار</li>
                <li>• تداول تلقائي وإدارة المحافظ</li>
                <li>• إشارات تداول في الوقت الفعلي</li>
                <li>• دعم أكثر من 15 عملة رقمية</li>
              </ul>
            </div>

            {/* System Status */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">حالة النظام</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">النظام:</span>
                  <span className="text-green-400">تشغيل</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">API Binance:</span>
                  <span className={connectionStatus === 'connected' || connectionStatus === 'partial' 
                    ? 'text-green-400' : 'text-red-400'}>
                    {connectionStatus === 'connected' || connectionStatus === 'partial' ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">قاعدة البيانات:</span>
                  <span className={apiHealth?.database === 'connected' ? 'text-green-400' : 'text-red-400'}>
                    {apiHealth?.database === 'connected' ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">آخر تحديث:</span>
                  <span className="text-blue-400">{new Date().toLocaleTimeString('ar-SA')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-400">
              © 2025 منصة التداول الذكي. جميع الحقوق محفوظة. 
              <span className="text-blue-400">مدعوم بالذكاء الصناعي</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              تحذير: التداول في العملات الرقمية ينطوي على مخاطر عالية. استثمر بحذر.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;