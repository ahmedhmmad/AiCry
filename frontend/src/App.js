import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import axios from 'axios';
import API_CONFIG from './config/api.config';

// تكوين axios
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.timeout = API_CONFIG.TIMEOUT;
axios.defaults.headers.common = API_CONFIG.DEFAULT_HEADERS;

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  // جلب التحليل
  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/ai/ultimate-analysis/${selectedSymbol}`);
      setAnalysisData(response.data);
      console.log('📊 Analysis Data:', response.data);
    } catch (error) {
      console.error('خطأ في جلب التحليل:', error);
      // محاولة endpoint بديل
      try {
        const fallbackResponse = await axios.get(`/analysis/${selectedSymbol}`);
        setAnalysisData(fallbackResponse.data);
      } catch (fallbackError) {
        console.error('فشل الـ fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // جلب التحليل عند تغيير العملة
  useEffect(() => {
    fetchAnalysis();
  }, [selectedSymbol]);

  return (
    <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        <Dashboard
          selectedSymbol={selectedSymbol}
          analysisData={analysisData}
          setAnalysisData={setAnalysisData}
          loading={loading}
          onRefresh={fetchAnalysis}
          onSymbolChange={setSelectedSymbol}
        />
      </div>
    </div>
  );
}

export default App;