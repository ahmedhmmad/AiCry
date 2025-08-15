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
      
      // ✅ تسجيل تفاصيل التحليل - مُصحح
      console.log('📊 تفاصيل التحليل:', {
        technical: data.analysis_layers?.['1_technical_analysis'],
        simple_ai: data.analysis_layers?.['2_simple_ai'], 
        advanced_ai: data.analysis_layers?.['3_advanced_ai'],
        wyckoff: data.wyckoff_analysis,
        ultimate: data.ultimate_decision
      });
      
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