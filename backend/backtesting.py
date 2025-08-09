import pandas as pd
import numpy as np
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import json
from indicators import comprehensive_analysis, calculate_macd, calculate_rsi
from simple_ai import simple_ai
from advanced_ai import advanced_ai
from binance_client import BinanceClient, extract_close_prices

class ImprovedBacktestingEngine:
    def __init__(self):
        self.binance_client = BinanceClient()
        self.results = {}
        
    def prepare_extended_historical_data(self, symbol: str, days: int = 90, interval: str = "1h") -> List[Dict]:
        """
        جلب بيانات تاريخية موسعة للتدريب الأفضل
        """
        try:
            # زيادة حجم البيانات للتدريب
            training_limit = min(days * 24 * 2, 1500) if interval == "1h" else days * 2
            
            klines_data = self.binance_client.get_klines(symbol, interval, training_limit)
            if not klines_data:
                return []
            
            print(f"تم جلب {len(klines_data)} نقطة بيانات للتدريب المحسن")
            return klines_data
        except Exception as e:
            print(f"خطأ في جلب البيانات التاريخية: {e}")
            return []
    
    def create_better_targets(self, prices: List[float], prediction_horizon: int = 4) -> np.ndarray:
        """
        إنشاء أهداف أكثر واقعية - التنبؤ بـ 4 ساعات بدلاً من ساعة واحدة
        """
        targets = []
        for i in range(len(prices) - prediction_horizon):
            current_price = prices[i]
            future_price = prices[i + prediction_horizon]
            
            # استخدام threshold أكبر لتجنب الضوضاء
            price_change = (future_price - current_price) / current_price
            
            # تصنيف أكثر وضوحاً: صعود/هبوط أكبر من 0.5%
            if price_change > 0.005:  # صعود أكبر من 0.5%
                target = 1
            elif price_change < -0.005:  # هبوط أكبر من 0.5%
                target = 0
            else:  # استقرار - نتجاهل هذه النقاط
                target = -1  # سنحذفها لاحقاً
            
            targets.append(target)
        
        # إضافة نقاط للوصول لنفس طول المصفوفة
        for _ in range(prediction_horizon):
            targets.append(targets[-1] if targets else 0)
        
        return np.array(targets)
    
    def simulate_improved_trading_signals(self, data: List[Dict], lookback_period: int = 200) -> List[Dict]:
        """
        محاكاة محسنة مع تدريب أفضل وأهداف أكثر واقعية
        """
        signals = []
        close_prices = extract_close_prices(data)
        
        # زيادة فترة التدريب للحصول على نماذج أفضل
        if len(close_prices) < lookback_period + 50:
            print(f"بيانات غير كافية: {len(close_prices)} نقطة، نحتاج {lookback_period + 50}")
            return signals
        
        # تدريب على بيانات أكثر
        training_prices = close_prices[:lookback_period]
        training_volumes = [item['volume'] for item in data[:lookback_period]]
        
        print(f"تدريب النماذج على {len(training_prices)} نقطة...")
        
        # تدريب النماذج مع معلمات محسنة
        simple_ai.train(training_prices)
        try:
            advanced_result = advanced_ai.train_ensemble(training_prices, training_volumes)
            print(f"Advanced AI training result: {advanced_result}")
        except Exception as e:
            print(f"Advanced AI training failed: {e}")
        
        # اختبار على فترات أطول (كل 4 ساعات بدلاً من كل ساعة)
        test_step = 4  # اختبار كل 4 ساعات
        
        for i in range(lookback_period, len(data) - 4, test_step):
            current_data = data[:i+1]
            future_candle = data[i+4]  # التنبؤ بـ 4 ساعات
            
            current_prices = extract_close_prices(current_data)
            current_volumes = [item['volume'] for item in current_data]
            
            # الحصول على التحليلات
            signal_data = self.get_comprehensive_signals(
                current_prices, 
                current_volumes,
                current_data[i]
            )
            
            if signal_data:
                current_price = current_data[i]['close']
                future_price = future_candle['close']
                price_change = (future_price - current_price) / current_price
                
                # تصنيف محسن للاتجاه
                if price_change > 0.005:
                    actual_direction = 'UP'
                elif price_change < -0.005:
                    actual_direction = 'DOWN'
                else:
                    actual_direction = 'SIDEWAYS'
                
                signal_data.update({
                    'timestamp': current_data[i]['timestamp'],
                    'current_price': current_price,
                    'future_price': future_price,
                    'actual_direction': actual_direction,
                    'price_change_pct': price_change * 100,
                    'prediction_horizon': '4h'
                })
                signals.append(signal_data)
        
        return signals
    
    def get_comprehensive_signals(self, prices: List[float], volumes: List[float], current_candle: Dict) -> Dict:
        """
        الحصول على جميع الإشارات مع تحسينات
        """
        try:
            signals = {}
            
            # التحليل الفني مع فترات أطول
            if len(prices) >= 100:  # تقليل المتطلبات
                technical_analysis = comprehensive_analysis(prices)
                signals['technical'] = {
                    'recommendation': technical_analysis.get('overall_recommendation', 'HOLD'),
                    'confidence': technical_analysis.get('confidence', 50),
                    'macd_signal': technical_analysis.get('macd', {}).get('recommendation', 'NEUTRAL'),
                    'rsi_signal': technical_analysis.get('rsi', {}).get('signal', 'NEUTRAL')
                }
            
            # AI البسيط
            if simple_ai.is_trained and len(prices) >= 50:
                simple_prediction = simple_ai.predict(prices)
                if 'error' not in simple_prediction:
                    signals['simple_ai'] = {
                        'recommendation': simple_prediction.get('recommendation', 'HOLD'),
                        'prediction': simple_prediction.get('prediction', 'NEUTRAL'),
                        'confidence': simple_prediction.get('confidence', 50),
                        'up_probability': simple_prediction.get('probabilities', {}).get('up', 50)
                    }
            
            # AI المتقدم
            if advanced_ai.is_trained and len(prices) >= 100:
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
    
    def calculate_improved_performance_metrics(self, signals: List[Dict]) -> Dict[str, Any]:
        """
        حساب مقاييس أداء محسنة مع تجاهل الحركات الجانبية
        """
        if not signals:
            return {"error": "لا توجد إشارات للتحليل"}
        
        metrics = {}
        
        # تحليل كل نوع من الإشارات
        for signal_type in ['technical', 'simple_ai', 'advanced_ai']:
            type_metrics = self.analyze_improved_signal_type(signals, signal_type)
            metrics[signal_type] = type_metrics
        
        # المقاييس الإجمالية
        metrics['overall'] = self.calculate_overall_metrics(signals)
        metrics['summary'] = self.create_performance_summary(metrics)
        
        return metrics
    
    def analyze_improved_signal_type(self, signals: List[Dict], signal_type: str) -> Dict[str, Any]:
        """
        تحليل محسن يتجاهل الحركات الجانبية
        """
        valid_signals = [s for s in signals if signal_type in s]
        
        if not valid_signals:
            return {"error": f"لا توجد إشارات من نوع {signal_type}"}
        
        # إحصائيات الدقة (تجاهل SIDEWAYS)
        correct_predictions = 0
        buy_signals = 0
        sell_signals = 0
        hold_signals = 0
        
        total_predictions = 0  # عدد التنبؤات الفعلية (غير HOLD)
        
        # إحصائيات الربحية
        profitable_trades = 0
        total_return = 0
        
        for signal in valid_signals:
            signal_data = signal[signal_type]
            recommendation = signal_data.get('recommendation', 'HOLD')
            actual_direction = signal.get('actual_direction', 'SIDEWAYS')
            price_change = signal.get('price_change_pct', 0)
            
            # تجاهل الحركات الجانبية في التقييم
            if actual_direction == 'SIDEWAYS':
                continue
            
            # عد أنواع الإشارات
            if recommendation in ['BUY', 'STRONG_BUY']:
                buy_signals += 1
                total_predictions += 1
                if actual_direction == 'UP':
                    correct_predictions += 1
                    if price_change > 0.5:  # ربح معقول
                        profitable_trades += 1
                        total_return += price_change
                
            elif recommendation in ['SELL', 'STRONG_SELL']:
                sell_signals += 1
                total_predictions += 1
                if actual_direction == 'DOWN':
                    correct_predictions += 1
                    if price_change < -0.5:  # ربح من البيع
                        profitable_trades += 1
                        total_return += abs(price_change)
                        
            else:
                hold_signals += 1
        
        # حساب المقاييس المحسنة
        accuracy = (correct_predictions / total_predictions * 100) if total_predictions > 0 else 0
        profitability = (profitable_trades / total_predictions * 100) if total_predictions > 0 else 0
        avg_return = (total_return / total_predictions) if total_predictions > 0 else 0
        
        # درجة محسنة
        performance_grade = self.get_improved_performance_grade(accuracy, profitability, total_predictions)
        
        return {
            'total_signals': len(valid_signals),
            'buy_signals': buy_signals,
            'sell_signals': sell_signals,
            'hold_signals': hold_signals,
            'accuracy_percentage': round(accuracy, 2),
            'profitability_percentage': round(profitability, 2),
            'average_return_per_trade': round(avg_return, 3),
            'total_return_percentage': round(total_return, 2),
            'total_predictions': total_predictions,
            'performance_grade': performance_grade,
            'prediction_horizon': '4 hours',
            'noise_filtered': True
        }
    
    def get_improved_performance_grade(self, accuracy: float, profitability: float, sample_size: int) -> str:
        """
        تحديد درجة أداء محسنة تأخذ في الاعتبار حجم العينة
        """
        # تعديل الدرجة حسب حجم العينة
        sample_adjustment = min(sample_size / 50, 1.0)  # تعديل حتى 50 عينة
        adjusted_score = (accuracy + profitability) / 2 * sample_adjustment
        
        if adjusted_score >= 70:
            return "ممتاز"
        elif adjusted_score >= 60:
            return "جيد جداً"
        elif adjusted_score >= 50:
            return "جيد"
        elif adjusted_score >= 40:
            return "مقبول"
        else:
            return "يحتاج تحسين"
    
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
        
        # إحصائيات الاتجاه
        directions = [s['actual_direction'] for s in signals]
        up_count = directions.count('UP')
        down_count = directions.count('DOWN')
        sideways_count = directions.count('SIDEWAYS')
        
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
            },
            'market_direction_stats': {
                'up_movements': up_count,
                'down_movements': down_count,
                'sideways_movements': sideways_count,
                'trending_ratio': round((up_count + down_count) / len(signals) * 100, 1)
            }
        }
    
    def create_performance_summary(self, metrics: Dict) -> Dict[str, Any]:
        """
        إنشاء ملخص أداء محسن
        """
        summary = {
            'best_performer': None,
            'worst_performer': None,
            'recommendations': [],
            'overall_assessment': 'متوسط',
            'data_quality': 'جيد'
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
            
            # توصيات محسنة
            avg_accuracy = np.mean(list(performances.values()))
            
            if avg_accuracy < 45:
                summary['recommendations'].append("دقة منخفضة - النماذج تحتاج إعادة تدريب بمعاملات مختلفة")
                summary['recommendations'].append("جرب فترات زمنية أطول للتنبؤ (8h, 1d)")
            elif avg_accuracy < 55:
                summary['recommendations'].append("دقة متوسطة - أضف المزيد من الميزات والمؤشرات")
                summary['recommendations'].append("حسن هندسة الميزات وقم بفلترة الضوضاء")
            else:
                summary['recommendations'].append("أداء جيد - يمكن الاعتماد على النظام")
                summary['recommendations'].append("فكر في تطبيق استراتيجيات التداول")
            
            # تقييم جودة البيانات
            trending_ratio = metrics.get('overall', {}).get('market_direction_stats', {}).get('trending_ratio', 50)
            if trending_ratio < 60:
                summary['data_quality'] = 'سوق جانبي - صعب التنبؤ'
            elif trending_ratio > 80:
                summary['data_quality'] = 'سوق متقلب - فرص جيدة'
            
            summary['overall_assessment'] = self.get_improved_performance_grade(avg_accuracy, avg_accuracy, 100)
        
        return summary
    
    def run_improved_backtest(self, symbol: str, days: int = 30, interval: str = "1h") -> Dict[str, Any]:
        """
        تشغيل اختبار أداء محسن
        """
        print(f"بدء اختبار الأداء المحسن لـ {symbol} لمدة {days} أيام...")
        
        # جلب بيانات أكثر للتدريب الأفضل
        extended_days = max(days * 2, 90)  # بيانات إضافية للتدريب
        historical_data = self.prepare_extended_historical_data(symbol, extended_days, interval)
        
        if not historical_data:
            return {"error": "فشل في جلب البيانات التاريخية"}
        
        print(f"تم جلب {len(historical_data)} نقطة بيانات")
        
        # محاكاة محسنة
        signals = self.simulate_improved_trading_signals(historical_data)
        
        if not signals:
            return {"error": "لم يتم توليد أي إشارات"}
        
        print(f"تم توليد {len(signals)} إشارة محسنة")
        
        # حساب مقاييس الأداء المحسنة
        performance_metrics = self.calculate_improved_performance_metrics(signals)
        
        # حفظ النتائج
        self.results[symbol] = {
            'symbol': symbol,
            'test_period': f"{days} days",
            'training_period': f"{extended_days} days",
            'interval': interval,
            'total_data_points': len(historical_data),
            'total_signals': len(signals),
            'metrics': performance_metrics,
            'improvements': [
                'فترة تدريب أطول',
                'تنبؤ بـ 4 ساعات بدلاً من 1',
                'تجاهل الحركات الجانبية',
                'عتبة أكبر للحركات المعنوية'
            ],
            'test_timestamp': datetime.now().isoformat()
        }
        
        return self.results[symbol]
# للتوافق مع النسخة القديمة
class BacktestingEngine(ImprovedBacktestingEngine):
    def run_backtest(self, symbol: str, days: int = 30, interval: str = "1h"):
        """wrapper للطريقة القديمة"""
        return self.run_improved_backtest(symbol, days, interval)

# إنشاء instances
backtesting_engine = BacktestingEngine()
improved_backtesting_engine = ImprovedBacktestingEngine()
# إنشاء instance محسن
improved_backtesting_engine = ImprovedBacktestingEngine()
