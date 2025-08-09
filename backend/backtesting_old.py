import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import json
from indicators import comprehensive_analysis, calculate_macd, calculate_rsi
from simple_ai import simple_ai
from advanced_ai import advanced_ai
from binance_client import BinanceClient, extract_close_prices

class BacktestingEngine:
   def __init__(self):
       self.binance_client = BinanceClient()
       self.results = {}
       
   def prepare_historical_data(self, symbol: str, days: int = 30, interval: str = "1h") -> List[Dict]:
       """
       جلب البيانات التاريخية للاختبار
       """
       try:
           # حساب عدد النقاط المطلوبة (24 ساعة × عدد الأيام)
           limit = min(days * 24, 1000) if interval == "1h" else days
           
           klines_data = self.binance_client.get_klines(symbol, interval, limit)
           if not klines_data:
               return []
           
           return klines_data
       except Exception as e:
           print(f"خطأ في جلب البيانات التاريخية: {e}")
           return []
   
   def simulate_trading_signals(self, data: List[Dict], lookback_period: int = 50) -> List[Dict]:
       """
       محاكاة إشارات التداول على البيانات التاريخية
       """
       signals = []
       close_prices = extract_close_prices(data)
       
       # نحتاج على الأقل lookback_period نقطة للتحليل
       if len(close_prices) < lookback_period + 10:
           return signals
       
       # تدريب النماذج على البيانات الأولى
       training_prices = close_prices[:lookback_period]
       training_volumes = [item['volume'] for item in data[:lookback_period]]
       
       # تدريب النماذج
       simple_ai.train(training_prices)
       try:
           advanced_result = advanced_ai.train_ensemble(training_prices, training_volumes)
           print(f"Advanced AI training result: {advanced_result}")
       except Exception as e:
           print(f"Advanced AI training failed: {e}")
       
       # محاكاة التداول من النقطة lookback_period فما بعد
       for i in range(lookback_period, len(data) - 1):
           current_data = data[:i+1]
           next_candle = data[i+1]
           
           current_prices = extract_close_prices(current_data)
           current_volumes = [item['volume'] for item in current_data]
           
           # الحصول على التحليلات
           signal_data = self.get_comprehensive_signals(
               current_prices, 
               current_volumes,
               current_data[i]
           )
           
           if signal_data:
               signal_data.update({
                   'timestamp': current_data[i]['timestamp'],
                   'current_price': current_data[i]['close'],
                   'next_price': next_candle['close'],
                   'actual_direction': 'UP' if next_candle['close'] > current_data[i]['close'] else 'DOWN',
                   'price_change_pct': ((next_candle['close'] - current_data[i]['close']) / current_data[i]['close']) * 100
               })
               signals.append(signal_data)
       
       return signals
   
   def get_comprehensive_signals(self, prices: List[float], volumes: List[float], current_candle: Dict) -> Dict:
       """
       الحصول على جميع الإشارات للنقطة الحالية
       """
       try:
           signals = {}
           
           # التحليل الفني
           if len(prices) >= 50:
               technical_analysis = comprehensive_analysis(prices)
               signals['technical'] = {
                   'recommendation': technical_analysis.get('overall_recommendation', 'HOLD'),
                   'confidence': technical_analysis.get('confidence', 50),
                   'macd_signal': technical_analysis.get('macd', {}).get('recommendation', 'NEUTRAL'),
                   'rsi_signal': technical_analysis.get('rsi', {}).get('signal', 'NEUTRAL')
               }
           
           # AI البسيط
           if simple_ai.is_trained and len(prices) >= 30:
               simple_prediction = simple_ai.predict(prices)
               if 'error' not in simple_prediction:
                   signals['simple_ai'] = {
                       'recommendation': simple_prediction.get('recommendation', 'HOLD'),
                       'prediction': simple_prediction.get('prediction', 'NEUTRAL'),
                       'confidence': simple_prediction.get('confidence', 50),
                       'up_probability': simple_prediction.get('probabilities', {}).get('up', 50)
                   }
           
           # AI المتقدم
           if advanced_ai.is_trained and len(prices) >= 50:
               try:
                   advanced_prediction = advanced_ai.predict_ensemble(prices, volumes)
                   if 'error' not in advanced_prediction:
                       ensemble_pred = advanced_prediction.get('ensemble_prediction', {})
                       signals['advanced_ai'] = {
                           'recommendation': ensemble_pred.get('recommendation', 'HOLD'),
                           'prediction': ensemble_pred.get('final_prediction', 'NEUTRAL'),
                           'confidence': ensemble_pred.get('confidence', 50),
                           'up_probability': ensemble_pred.get('probabilities', {}).get('up', 50),
                           'model_agreement': advanced_prediction.get('model_agreement', 'UNKNOWN')
                       }
               except Exception as e:
                   print(f"Advanced AI prediction failed: {e}")
           
           return signals
           
       except Exception as e:
           print(f"خطأ في الحصول على الإشارات: {e}")
           return {}
   
   def calculate_performance_metrics(self, signals: List[Dict]) -> Dict[str, Any]:
       """
       حساب مقاييس الأداء
       """
       if not signals:
           return {"error": "لا توجد إشارات للتحليل"}
       
       metrics = {}
       
       # تحليل كل نوع من الإشارات
       for signal_type in ['technical', 'simple_ai', 'advanced_ai']:
           type_metrics = self.analyze_signal_type(signals, signal_type)
           metrics[signal_type] = type_metrics
       
       # المقاييس الإجمالية
       metrics['overall'] = self.calculate_overall_metrics(signals)
       metrics['summary'] = self.create_performance_summary(metrics)
       
       return metrics
   
   def analyze_signal_type(self, signals: List[Dict], signal_type: str) -> Dict[str, Any]:
       """
       تحليل أداء نوع معين من الإشارات
       """
       valid_signals = [s for s in signals if signal_type in s]
       
       if not valid_signals:
           return {"error": f"لا توجد إشارات من نوع {signal_type}"}
       
       # إحصائيات الدقة
       correct_predictions = 0
       buy_signals = 0
       sell_signals = 0
       hold_signals = 0
       
       # إحصائيات الربحية
       total_trades = 0
       profitable_trades = 0
       total_return = 0
       
       for signal in valid_signals:
           signal_data = signal[signal_type]
           recommendation = signal_data.get('recommendation', 'HOLD')
           actual_direction = signal.get('actual_direction', 'NEUTRAL')
           price_change = signal.get('price_change_pct', 0)
           
           # عد أنواع الإشارات
           if recommendation in ['BUY', 'STRONG_BUY']:
               buy_signals += 1
               if actual_direction == 'UP':
                   correct_predictions += 1
                   if price_change > 0:
                       profitable_trades += 1
                       total_return += price_change
               total_trades += 1
               
           elif recommendation in ['SELL', 'STRONG_SELL']:
               sell_signals += 1
               if actual_direction == 'DOWN':
                   correct_predictions += 1
                   if price_change < 0:
                       profitable_trades += 1
                       total_return += abs(price_change)  # الربح من البيع
               total_trades += 1
               
           else:
               hold_signals += 1
       
       # حساب المقاييس
       total_predictions = buy_signals + sell_signals
       accuracy = (correct_predictions / total_predictions * 100) if total_predictions > 0 else 0
       profitability = (profitable_trades / total_trades * 100) if total_trades > 0 else 0
       avg_return = (total_return / total_trades) if total_trades > 0 else 0
       
       return {
           'total_signals': len(valid_signals),
           'buy_signals': buy_signals,
           'sell_signals': sell_signals,
           'hold_signals': hold_signals,
           'accuracy_percentage': round(accuracy, 2),
           'profitability_percentage': round(profitability, 2),
           'average_return_per_trade': round(avg_return, 3),
           'total_return_percentage': round(total_return, 2),
           'total_trades': total_trades,
           'performance_grade': self.get_performance_grade(accuracy, profitability)
       }
   
   def calculate_overall_metrics(self, signals: List[Dict]) -> Dict[str, Any]:
       """
       حساب المقاييس الإجمالية
       """
       if not signals:
           return {}
       
       # مقاييس زمنية
       first_signal = min(signals, key=lambda x: x['timestamp'])
       last_signal = max(signals, key=lambda x: x['timestamp'])
       
       duration_hours = (last_signal['timestamp'] - first_signal['timestamp']) / (1000 * 60 * 60)
       
       # مقاييس السوق
       prices = [s['current_price'] for s in signals]
       market_volatility = np.std(prices) / np.mean(prices) * 100
       
       return {
           'total_signals': len(signals),
           'time_period_hours': round(duration_hours, 1),
           'time_period_days': round(duration_hours / 24, 1),
           'signals_per_day': round(len(signals) / (duration_hours / 24), 1),
           'market_volatility': round(market_volatility, 2),
           'price_range': {
               'min': round(min(prices), 2),
               'max': round(max(prices), 2),
               'avg': round(np.mean(prices), 2)
           }
       }
   
   def get_performance_grade(self, accuracy: float, profitability: float) -> str:
       """
       تحديد درجة الأداء
       """
       combined_score = (accuracy + profitability) / 2
       
       if combined_score >= 75:
           return "ممتاز"
       elif combined_score >= 65:
           return "جيد جداً"
       elif combined_score >= 55:
           return "جيد"
       elif combined_score >= 45:
           return "مقبول"
       else:
           return "ضعيف"
   
   def create_performance_summary(self, metrics: Dict) -> Dict[str, Any]:
       """
       إنشاء ملخص الأداء
       """
       summary = {
           'best_performer': None,
           'worst_performer': None,
           'recommendations': [],
           'overall_assessment': 'متوسط'
       }
       
       # مقارنة الأنواع المختلفة
       performances = {}
       for signal_type in ['technical', 'simple_ai', 'advanced_ai']:
           if signal_type in metrics and 'accuracy_percentage' in metrics[signal_type]:
               performances[signal_type] = metrics[signal_type]['accuracy_percentage']
       
       if performances:
           best_type = max(performances.keys(), key=lambda k: performances[k])
           worst_type = min(performances.keys(), key=lambda k: performances[k])
           
           summary['best_performer'] = {
               'type': best_type,
               'accuracy': performances[best_type]
           }
           summary['worst_performer'] = {
               'type': worst_type,
               'accuracy': performances[worst_type]
           }
           
           # توصيات التحسين
           avg_accuracy = np.mean(list(performances.values()))
           
           if avg_accuracy < 55:
               summary['recommendations'].append("دقة النماذج منخفضة - يحتاج لتدريب بالمزيد من البيانات")
           if avg_accuracy > 70:
               summary['recommendations'].append("أداء ممتاز - يمكن الاعتماد على النظام")
           
           summary['overall_assessment'] = self.get_performance_grade(avg_accuracy, avg_accuracy)
       
       return summary
   
   def run_backtest(self, symbol: str, days: int = 30, interval: str = "1h") -> Dict[str, Any]:
       """
       تشغيل اختبار الأداء الكامل
       """
       print(f"بدء اختبار الأداء لـ {symbol} لمدة {days} أيام...")
       
       # جلب البيانات التاريخية
       historical_data = self.prepare_historical_data(symbol, days, interval)
       
       if not historical_data:
           return {"error": "فشل في جلب البيانات التاريخية"}
       
       print(f"تم جلب {len(historical_data)} نقطة بيانات")
       
       # محاكاة الإشارات
       signals = self.simulate_trading_signals(historical_data)
       
       if not signals:
           return {"error": "لم يتم توليد أي إشارات"}
       
       print(f"تم توليد {len(signals)} إشارة")
       
       # حساب مقاييس الأداء
       performance_metrics = self.calculate_performance_metrics(signals)
       
       # حفظ النتائج
       self.results[symbol] = {
           'symbol': symbol,
           'test_period': f"{days} days",
           'interval': interval,
           'total_data_points': len(historical_data),
           'total_signals': len(signals),
           'metrics': performance_metrics,
           'test_timestamp': datetime.now().isoformat()
       }
       
       return self.results[symbol]
   
   def compare_models(self, symbols: List[str], days: int = 30) -> Dict[str, Any]:
       """
       مقارنة أداء النماذج على عملات متعددة
       """
       comparison_results = {}
       
       for symbol in symbols:
           print(f"اختبار {symbol}...")
           result = self.run_backtest(symbol, days)
           comparison_results[symbol] = result
       
       # تحليل المقارنة
       comparison_summary = self.analyze_cross_symbol_performance(comparison_results)
       
       return {
           'individual_results': comparison_results,
           'comparison_summary': comparison_summary
       }
   
   def analyze_cross_symbol_performance(self, results: Dict) -> Dict[str, Any]:
       """
       تحليل الأداء عبر العملات المختلفة
       """
       summary = {
           'best_symbol_for_technical': None,
           'best_symbol_for_ai': None,
           'most_consistent_symbol': None,
           'overall_recommendations': []
       }
       
       # جمع الإحصائيات
       technical_accuracies = {}
       ai_accuracies = {}
       
       for symbol, result in results.items():
           if 'error' not in result:
               metrics = result.get('metrics', {})
               
               # دقة التحليل الفني
               technical_acc = metrics.get('technical', {}).get('accuracy_percentage', 0)
               technical_accuracies[symbol] = technical_acc
               
               # دقة AI المتقدم
               advanced_acc = metrics.get('advanced_ai', {}).get('accuracy_percentage', 0)
               ai_accuracies[symbol] = advanced_acc
       
       # أفضل العملات
       if technical_accuracies:
           best_technical_symbol = max(technical_accuracies.keys(), key=lambda k: technical_accuracies[k])
           summary['best_symbol_for_technical'] = {
               'symbol': best_technical_symbol,
               'accuracy': technical_accuracies[best_technical_symbol]
           }
       
       if ai_accuracies:
           best_ai_symbol = max(ai_accuracies.keys(), key=lambda k: ai_accuracies[k])
           summary['best_symbol_for_ai'] = {
               'symbol': best_ai_symbol,
               'accuracy': ai_accuracies[best_ai_symbol]
           }
       
       # توصيات
       if technical_accuracies:
           avg_technical = np.mean(list(technical_accuracies.values()))
           avg_ai = np.mean(list(ai_accuracies.values()))
           
           if avg_ai > avg_technical:
               summary['overall_recommendations'].append("AI المتقدم يتفوق على التحليل الفني")
           else:
               summary['overall_recommendations'].append("التحليل الفني أكثر دقة من AI")
           
           if avg_technical < 55 and avg_ai < 55:
               summary['overall_recommendations'].append("جميع النماذج تحتاج تحسين")
       
       return summary

# إنشاء instance عام
backtesting_engine = BacktestingEngine()
