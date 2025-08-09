// App.js - مُصلح
import React from 'react';
// إزالة استيراد App.css إذا لم يكن موجوداً
// import './App.css';

// استيراد مُصلح - استخدام named imports بدلاً من default
import Dashboard from './components/Dashboard/Dashboard';
// أو إذا كان Dashboard يستخدم named export:
// import { Dashboard } from './components/Dashboard/Dashboard';

// استيراد باقي المكونات
import Header from './components/Header';
import SymbolSelector from './components/SymbolSelector';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [selectedSymbol, setSelectedSymbol] = React.useState('BTCUSDT');
  const [analysisData, setAnalysisData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiHealth, setApiHealth] = React.useState(null);

  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];

  // فحص حالة API عند بدء التشغيل
  React.useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch('/health');
        if (response.ok) {
          const health = await response.json();
          setApiHealth(health);
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setApiHealth({ status: 'error' });
      }
    };

    checkAPI();
  }, []);

  const getConnectionStatus = () => {
    if (!apiHealth) return { color: 'yellow', text: 'جاري الفحص...' };
    if (apiHealth.binance_api === 'connected') return { color: 'green', text: 'متصل بـ Binance API' };
    return { color: 'red', text: 'غير متصل' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <h1 className="text-2xl font-bold text-white">لوحة تحكم التداول</h1>
            <div className="flex items-center space-x-2 space-x-reverse text-sm">
              <div className={`w-2 h-2 bg-${connectionStatus.color}-400 rounded-full ${connectionStatus.color === 'green' ? 'animate-pulse' : ''}`}></div>
              <span className={`text-${connectionStatus.color}-400`}>{connectionStatus.text}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-blue-400 focus:outline-none"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol} className="bg-slate-800">
                  {symbol}
                </option>
              ))}
            </select>
            
            {/* زر إعادة فحص API */}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded-lg transition-colors"
              title="إعادة تحميل"
            >
              🔄
            </button>
          </div>
        </div>
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
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
