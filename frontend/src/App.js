import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);

  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];

  // Check API health only once on mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch('http://152.67.153.191:8000/health');
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
  }, []); // Empty dependency array - only run once

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="max-w-7xl mx-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white">جاري التحميل...</div>
            </div>
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