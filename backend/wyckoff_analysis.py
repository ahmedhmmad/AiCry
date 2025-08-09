import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class WyckoffPhase(Enum):
    """مراحل دورة وايكوف"""
    ACCUMULATION = "Accumulation"
    MARKUP = "Markup" 
    DISTRIBUTION = "Distribution"
    MARKDOWN = "Markdown"
    UNKNOWN = "Unknown"

class WyckoffEvent(Enum):
    """أحداث وايكوف الرئيسية"""
    PS = "Preliminary Support"  # الدعم الأولي
    SC = "Selling Climax"       # ذروة البيع
    AR = "Automatic Rally"      # الارتداد التلقائي
    ST = "Secondary Test"       # الاختبار الثانوي
    SOS = "Sign of Strength"    # علامة القوة
    LPS = "Last Point of Support"  # آخر نقطة دعم
    PSY = "Preliminary Supply"  # العرض الأولي
    BC = "Buying Climax"        # ذروة الشراء
    AD = "Automatic Reaction"   # رد الفعل التلقائي
    UT = "Upthrust"            # الدفعة العلوية
    SOW = "Sign of Weakness"    # علامة الضعف
    LPSY = "Last Point of Supply"  # آخر نقطة عرض

@dataclass
class WyckoffSignal:
    """إشارة وايكوف"""
    event: WyckoffEvent
    phase: WyckoffPhase
    price: float
    volume: float
    timestamp: str
    confidence: float
    description: str

class WyckoffAnalyzer:
    """محلل نموذج وايكوف"""
    
    def __init__(self):
        self.signals: List[WyckoffSignal] = []
        self.current_phase = WyckoffPhase.UNKNOWN
        self.phase_history = []
        
    def analyze_wyckoff_pattern(self, prices: List[float], volumes: List[float], 
                               timestamps: List[str] = None) -> Dict:
        """
        تحليل شامل لنموذج وايكوف
        """
        if len(prices) != len(volumes) or len(prices) < 50:
            return {"error": "البيانات غير كافية للتحليل"}
        
        df = pd.DataFrame({
            'price': prices,
            'volume': volumes,
            'timestamp': timestamps or range(len(prices))
        })
        
        # حساب المؤشرات المساعدة
        df = self._calculate_indicators(df)
        
        # تحديد المراحل
        phases = self._identify_phases(df)
        
        # البحث عن الأحداث الرئيسية
        events = self._detect_wyckoff_events(df, phases)
        
        # تحليل الحجم مقابل السعر
        volume_analysis = self._analyze_volume_price_relationship(df)
        
        # التنبؤ بالمرحلة القادمة
        next_phase_prediction = self._predict_next_phase(phases, events)
        
        # تقييم القوة/الضعف الحالي
        current_strength = self._assess_current_strength(df, events)
        
        return {
            "current_phase": self.current_phase.value,
            "phase_confidence": self._calculate_phase_confidence(df, events),
            "detected_events": [
                {
                    "event": event.event.value,
                    "phase": event.phase.value,
                    "price": event.price,
                    "volume": event.volume,
                    "confidence": event.confidence,
                    "description": event.description
                } for event in events[-10:]  # آخر 10 أحداث
            ],
            "volume_analysis": volume_analysis,
            "next_phase_prediction": next_phase_prediction,
            "current_strength": current_strength,
            "trading_recommendation": self._generate_trading_recommendation(
                self.current_phase, events, current_strength
            ),
            "key_levels": self._identify_key_levels(df, events),
            "wyckoff_score": self._calculate_wyckoff_score(df, events, volume_analysis)
        }
    
    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """حساب المؤشرات المساعدة"""
        # المتوسط المتحرك للحجم
        df['volume_ma'] = df['volume'].rolling(window=20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma']
        
        # تغيير السعر
        df['price_change'] = df['price'].pct_change()
        df['price_ma'] = df['price'].rolling(window=20).mean()
        
        # نطاقات السعر
        df['high_low_range'] = df['price'].rolling(window=5).max() - df['price'].rolling(window=5).min()
        df['range_ma'] = df['high_low_range'].rolling(window=10).mean()
        
        # مؤشر القوة النسبية المعدل للحجم
        df['volume_rsi'] = self._calculate_volume_rsi(df['volume'])
        
        # تحديد النقاط المحورية
        df['pivot_high'] = self._find_pivot_points(df['price'], direction='high')
        df['pivot_low'] = self._find_pivot_points(df['price'], direction='low')
        
        return df
    
    def _identify_phases(self, df: pd.DataFrame) -> List[WyckoffPhase]:
        """تحديد مراحل وايكوف"""
        phases = []
        
        for i in range(len(df)):
            if i < 20:  # نحتاج تاريخ كافي
                phases.append(WyckoffPhase.UNKNOWN)
                continue
            
            # تحليل الاتجاه والحجم
            recent_prices = df['price'].iloc[i-20:i+1]
            recent_volumes = df['volume'].iloc[i-20:i+1]
            
            price_trend = self._calculate_trend(recent_prices)
            volume_trend = self._calculate_trend(recent_volumes)
            volatility = recent_prices.std()
            
            # قواعد تحديد المراحل
            if self._is_accumulation_phase(recent_prices, recent_volumes, price_trend, volume_trend, volatility):
                phase = WyckoffPhase.ACCUMULATION
            elif self._is_markup_phase(recent_prices, recent_volumes, price_trend, volume_trend):
                phase = WyckoffPhase.MARKUP
            elif self._is_distribution_phase(recent_prices, recent_volumes, price_trend, volume_trend, volatility):
                phase = WyckoffPhase.DISTRIBUTION
            elif self._is_markdown_phase(recent_prices, recent_volumes, price_trend, volume_trend):
                phase = WyckoffPhase.MARKDOWN
            else:
                phase = WyckoffPhase.UNKNOWN
            
            phases.append(phase)
        
        # تحديث المرحلة الحالية
        if phases:
            self.current_phase = phases[-1]
        
        return phases
    
    def _detect_wyckoff_events(self, df: pd.DataFrame, phases: List[WyckoffPhase]) -> List[WyckoffSignal]:
        """كشف أحداث وايكوف الرئيسية"""
        events = []
        
        for i in range(20, len(df)):
            current_phase = phases[i]
            price = df['price'].iloc[i]
            volume = df['volume'].iloc[i]
            timestamp = str(df['timestamp'].iloc[i])
            
            # البحث عن الأحداث حسب المرحلة
            if current_phase == WyckoffPhase.ACCUMULATION:
                event = self._detect_accumulation_events(df, i)
            elif current_phase == WyckoffPhase.DISTRIBUTION:
                event = self._detect_distribution_events(df, i)
            elif current_phase == WyckoffPhase.MARKUP:
                event = self._detect_markup_events(df, i)
            elif current_phase == WyckoffPhase.MARKDOWN:
                event = self._detect_markdown_events(df, i)
            else:
                continue
            
            if event:
                signal = WyckoffSignal(
                    event=event['event'],
                    phase=current_phase,
                    price=price,
                    volume=volume,
                    timestamp=timestamp,
                    confidence=event['confidence'],
                    description=event['description']
                )
                events.append(signal)
        
        self.signals = events
        return events
    
    def _detect_accumulation_events(self, df: pd.DataFrame, index: int) -> Optional[Dict]:
        """كشف أحداث مرحلة التجميع"""
        price = df['price'].iloc[index]
        volume = df['volume'].iloc[index]
        volume_ratio = df['volume_ratio'].iloc[index]
        
        # البحث عن ذروة البيع (Selling Climax)
        if (volume_ratio > 2.0 and  # حجم عالي
            df['price_change'].iloc[index] < -0.03 and  # انخفاض حاد
            price == df['price'].iloc[index-5:index+1].min()):  # أدنى سعر محلي
            
            return {
                'event': WyckoffEvent.SC,
                'confidence': 0.8,
                'description': 'ذروة بيع محتملة - حجم عالي مع انخفاض حاد'
            }
        
        # البحث عن الارتداد التلقائي (Automatic Rally)
        if (df['price_change'].iloc[index-5:index+1].sum() > 0.05 and  # ارتفاع تراكمي
            volume_ratio < 0.7):  # حجم منخفض
            
            return {
                'event': WyckoffEvent.AR,
                'confidence': 0.7,
                'description': 'ارتداد تلقائي - ارتفاع بحجم منخفض'
            }
        
        # البحث عن الاختبار الثانوي (Secondary Test)
        recent_low = df['price'].iloc[index-20:index].min()
        if (abs(price - recent_low) / recent_low < 0.02 and  # قريب من القاع
            volume_ratio < 0.8):  # حجم أقل من المتوسط
            
            return {
                'event': WyckoffEvent.ST,
                'confidence': 0.75,
                'description': 'اختبار ثانوي للقاع بحجم منخفض'
            }
        
        return None
    
    def _detect_distribution_events(self, df: pd.DataFrame, index: int) -> Optional[Dict]:
        """كشف أحداث مرحلة التوزيع"""
        price = df['price'].iloc[index]
        volume = df['volume'].iloc[index]
        volume_ratio = df['volume_ratio'].iloc[index]
        
        # البحث عن ذروة الشراء (Buying Climax)
        if (volume_ratio > 2.0 and  # حجم عالي
            df['price_change'].iloc[index] > 0.03 and  # ارتفاع حاد
            price == df['price'].iloc[index-5:index+1].max()):  # أعلى سعر محلي
            
            return {
                'event': WyckoffEvent.BC,
                'confidence': 0.8,
                'description': 'ذروة شراء محتملة - حجم عالي مع ارتفاع حاد'
            }
        
        # البحث عن رد الفعل التلقائي (Automatic Reaction)
        if (df['price_change'].iloc[index-5:index+1].sum() < -0.05 and  # انخفاض تراكمي
            volume_ratio < 0.7):  # حجم منخفض
            
            return {
                'event': WyckoffEvent.AD,
                'confidence': 0.7,
                'description': 'رد فعل تلقائي - انخفاض بحجم منخفض'
            }
        
        # البحث عن الدفعة العلوية (Upthrust)
        recent_high = df['price'].iloc[index-20:index].max()
        if (price > recent_high and  # كسر القمة
            volume_ratio < 0.8 and  # حجم ضعيف
            df['price_change'].iloc[index+1:index+3].sum() < 0):  # فشل في الاستمرار
            
            return {
                'event': WyckoffEvent.UT,
                'confidence': 0.75,
                'description': 'دفعة علوية فاشلة - كسر بحجم ضعيف'
            }
        
        return None
    
    def _detect_markup_events(self, df: pd.DataFrame, index: int) -> Optional[Dict]:
        """كشف أحداث مرحلة الصعود"""
        if (df['price_change'].iloc[index] > 0.02 and  # ارتفاع قوي
            df['volume_ratio'].iloc[index] > 1.5):  # حجم جيد
            
            return {
                'event': WyckoffEvent.SOS,
                'confidence': 0.7,
                'description': 'علامة قوة - ارتفاع بحجم جيد'
            }
        
        return None
    
    def _detect_markdown_events(self, df: pd.DataFrame, index: int) -> Optional[Dict]:
        """كشف أحداث مرحلة الهبوط"""
        if (df['price_change'].iloc[index] < -0.02 and  # انخفاض قوي
            df['volume_ratio'].iloc[index] > 1.5):  # حجم جيد
            
            return {
                'event': WyckoffEvent.SOW,
                'confidence': 0.7,
                'description': 'علامة ضعف - انخفاض بحجم جيد'
            }
        
        return None
    
    def _analyze_volume_price_relationship(self, df: pd.DataFrame) -> Dict:
        """تحليل العلاقة بين الحجم والسعر"""
        recent_data = df.tail(20)
        
        # حساب الارتباط
        correlation = recent_data['price_change'].corr(recent_data['volume_ratio'])
        
        # تحليل الانحراف
        volume_price_divergence = self._detect_volume_price_divergence(recent_data)
        
        # تقييم قوة الاتجاه
        trend_strength = self._assess_trend_strength(recent_data)
        
        return {
            "volume_price_correlation": round(correlation, 3),
            "divergence_detected": volume_price_divergence['detected'],
            "divergence_type": volume_price_divergence['type'],
            "trend_strength": trend_strength,
            "volume_quality": self._assess_volume_quality(recent_data),
            "interpretation": self._interpret_volume_analysis(correlation, volume_price_divergence, trend_strength)
        }
    
    def _generate_trading_recommendation(self, phase: WyckoffPhase, events: List[WyckoffSignal], 
                                       strength: Dict) -> Dict:
        """توليد توصية التداول"""
        if not events:
            return {
                "action": "HOLD",
                "confidence": 0.3,
                "reason": "لا توجد إشارات وايكوف واضحة"
            }
        
        latest_event = events[-1]
        
        # توصيات حسب المرحلة والحدث الأخير
        if phase == WyckoffPhase.ACCUMULATION:
            if latest_event.event in [WyckoffEvent.ST, WyckoffEvent.LPS]:
                return {
                    "action": "BUY",
                    "confidence": latest_event.confidence,
                    "reason": f"مرحلة تجميع - {latest_event.description}",
                    "entry_strategy": "الشراء عند الاختبار الناجح للدعم",
                    "stop_loss": "تحت آخر قاع مهم",
                    "target": "مقاومة المدى أو بداية الصعود"
                }
        
        elif phase == WyckoffPhase.MARKUP:
            if latest_event.event == WyckoffEvent.SOS:
                return {
                    "action": "BUY",
                    "confidence": latest_event.confidence,
                    "reason": f"مرحلة صعود - {latest_event.description}",
                    "entry_strategy": "الشراء عند كسر المقاومة بحجم",
                    "stop_loss": "تحت آخر نقطة دعم",
                    "target": "استمرار الاتجاه الصاعد"
                }
        
        elif phase == WyckoffPhase.DISTRIBUTION:
            if latest_event.event in [WyckoffEvent.UT, WyckoffEvent.LPSY]:
                return {
                    "action": "SELL",
                    "confidence": latest_event.confidence,
                    "reason": f"مرحلة توزيع - {latest_event.description}",
                    "entry_strategy": "البيع عند فشل الاختراق",
                    "stop_loss": "فوق آخر قمة مهمة",
                    "target": "دعم المدى أو بداية الهبوط"
                }
        
        elif phase == WyckoffPhase.MARKDOWN:
            if latest_event.event == WyckoffEvent.SOW:
                return {
                    "action": "SELL",
                    "confidence": latest_event.confidence,
                    "reason": f"مرحلة هبوط - {latest_event.description}",
                    "entry_strategy": "البيع عند كسر الدعم بحجم",
                    "stop_loss": "فوق آخر نقطة مقاومة",
                    "target": "استمرار الاتجاه الهابط"
                }
        
        return {
            "action": "HOLD",
            "confidence": 0.5,
            "reason": "إشارات وايكوف غير واضحة - انتظار تأكيد"
        }
    
    # المساعدات والحسابات الإضافية
    def _calculate_trend(self, prices: pd.Series) -> float:
        """حساب قوة الاتجاه"""
        if len(prices) < 2:
            return 0
        return (prices.iloc[-1] - prices.iloc[0]) / prices.iloc[0]
    
    def _find_pivot_points(self, prices: pd.Series, direction: str, window: int = 5) -> pd.Series:
        """البحث عن النقاط المحورية"""
        pivots = pd.Series([False] * len(prices), index=prices.index)
        
        for i in range(window, len(prices) - window):
            if direction == 'high':
                if all(prices.iloc[i] >= prices.iloc[i-j] for j in range(1, window+1)) and \
                   all(prices.iloc[i] >= prices.iloc[i+j] for j in range(1, window+1)):
                    pivots.iloc[i] = True
            else:  # low
                if all(prices.iloc[i] <= prices.iloc[i-j] for j in range(1, window+1)) and \
                   all(prices.iloc[i] <= prices.iloc[i+j] for j in range(1, window+1)):
                    pivots.iloc[i] = True
        
        return pivots
    
    def _calculate_volume_rsi(self, volumes: pd.Series, period: int = 14) -> pd.Series:
        """حساب RSI للحجم"""
        delta = volumes.diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def _is_accumulation_phase(self, prices, volumes, price_trend, volume_trend, volatility) -> bool:
        """تحديد مرحلة التجميع"""
        return (abs(price_trend) < 0.05 and  # حركة سعر محدودة
                volatility < prices.std() and  # تذبذب منخفض
                volume_trend > 0)  # حجم متزايد
    
    def _is_markup_phase(self, prices, volumes, price_trend, volume_trend) -> bool:
        """تحديد مرحلة الصعود"""
        return (price_trend > 0.1 and  # اتجاه صاعد قوي
                volume_trend > 0)  # حجم داعم
    
    def _is_distribution_phase(self, prices, volumes, price_trend, volume_trend, volatility) -> bool:
        """تحديد مرحلة التوزيع"""
        return (abs(price_trend) < 0.05 and  # حركة سعر محدودة
                volatility < prices.std() and  # تذبذب منخفض
                prices.iloc[-1] > prices.mean())  # سعر عالي نسبياً
    
    def _is_markdown_phase(self, prices, volumes, price_trend, volume_trend) -> bool:
        """تحديد مرحلة الهبوط"""
        return (price_trend < -0.1 and  # اتجاه هابط قوي
                volume_trend > 0)  # حجم داعم
    
    def _calculate_phase_confidence(self, df: pd.DataFrame, events: List[WyckoffSignal]) -> float:
        """حساب ثقة تحديد المرحلة"""
        if not events:
            return 0.3
        
        recent_events = [e for e in events if e.confidence > 0.6]
        if not recent_events:
            return 0.4
        
        avg_confidence = sum(e.confidence for e in recent_events[-3:]) / len(recent_events[-3:])
        return min(avg_confidence + 0.1, 0.95)
    
    def _predict_next_phase(self, phases: List[WyckoffPhase], events: List[WyckoffSignal]) -> Dict:
        """التنبؤ بالمرحلة القادمة"""
        current_phase = phases[-1] if phases else WyckoffPhase.UNKNOWN
        
        phase_transitions = {
            WyckoffPhase.ACCUMULATION: WyckoffPhase.MARKUP,
            WyckoffPhase.MARKUP: WyckoffPhase.DISTRIBUTION,
            WyckoffPhase.DISTRIBUTION: WyckoffPhase.MARKDOWN,
            WyckoffPhase.MARKDOWN: WyckoffPhase.ACCUMULATION
        }
        
        next_phase = phase_transitions.get(current_phase, WyckoffPhase.UNKNOWN)
        
        # تقدير الوقت المتبقي في المرحلة الحالية
        current_phase_duration = sum(1 for p in phases[-20:] if p == current_phase)
        
        return {
            "predicted_next_phase": next_phase.value,
            "current_phase_duration": current_phase_duration,
            "transition_probability": self._calculate_transition_probability(phases, events),
            "estimated_time_to_transition": max(5 - current_phase_duration, 0)
        }
    
    def _assess_current_strength(self, df: pd.DataFrame, events: List[WyckoffSignal]) -> Dict:
        """تقييم القوة/الضعف الحالي"""
        recent_data = df.tail(10)
        
        # تحليل العوامل
        price_momentum = recent_data['price_change'].sum()
        volume_quality = recent_data['volume_ratio'].mean()
        
        # تقييم الأحداث الأخيرة
        strength_events = [WyckoffEvent.SOS, WyckoffEvent.LPS, WyckoffEvent.AR]
        weakness_events = [WyckoffEvent.SOW, WyckoffEvent.UT, WyckoffEvent.LPSY]
        
        recent_strength_signals = sum(1 for e in events[-5:] if e.event in strength_events)
        recent_weakness_signals = sum(1 for e in events[-5:] if e.event in weakness_events)
        
        # النتيجة النهائية
        if recent_strength_signals > recent_weakness_signals and price_momentum > 0:
            assessment = "STRONG"
            confidence = 0.8
        elif recent_weakness_signals > recent_strength_signals and price_momentum < 0:
            assessment = "WEAK"
            confidence = 0.8
        else:
            assessment = "NEUTRAL"
            confidence = 0.6
        
        return {
            "assessment": assessment,
            "confidence": confidence,
            "price_momentum": round(price_momentum, 4),
            "volume_quality": round(volume_quality, 2),
            "strength_signals": recent_strength_signals,
            "weakness_signals": recent_weakness_signals
        }
    
    def _identify_key_levels(self, df: pd.DataFrame, events: List[WyckoffSignal]) -> Dict:
        """تحديد المستويات الرئيسية"""
        # دعم ومقاومة من الأحداث
        event_levels = [e.price for e in events[-10:]]
        
        # النقاط المحورية
        recent_highs = df[df['pivot_high']]['price'].tail(5).tolist()
        recent_lows = df[df['pivot_low']]['price'].tail(5).tolist()
        
        return {
            "key_resistance_levels": sorted(set(recent_highs + [p for p in event_levels if p > df['price'].iloc[-1]]), reverse=True)[:3],
            "key_support_levels": sorted(set(recent_lows + [p for p in event_levels if p < df['price'].iloc[-1]]))[:3],
            "current_price": df['price'].iloc[-1],
            "nearest_resistance": min([p for p in recent_highs if p > df['price'].iloc[-1]], default=None),
            "nearest_support": max([p for p in recent_lows if p < df['price'].iloc[-1]], default=None)
        }
    
    def _calculate_wyckoff_score(self, df: pd.DataFrame, events: List[WyckoffSignal], 
                               volume_analysis: Dict) -> Dict:
        """حساب نقاط وايكوف الإجمالية"""
        base_score = 50
        
        # نقاط للأحداث المكتشفة
        event_score = min(len(events) * 2, 20)
        
        # نقاط لجودة الحجم
        volume_score = min(abs(volume_analysis['volume_price_correlation']) * 20, 15)
        
        # نقاط لوضوح المرحلة
        phase_score = 10 if self.current_phase != WyckoffPhase.UNKNOWN else 0
        
        # نقاط للانحراف
        divergence_score = 10 if volume_analysis['divergence_detected'] else 0
        
        total_score = base_score + event_score + volume_score + phase_score + divergence_score
        
        # التقييم النهائي
        if total_score >= 85:
            rating = "EXCELLENT"
        elif total_score >= 70:
            rating = "GOOD"
        elif total_score >= 55:
            rating = "FAIR"
        else:
            rating = "POOR"
        
        return {
            "total_score": min(total_score, 100),
            "rating": rating,
            "components": {
                "base_score": base_score,
                "event_detection": event_score,
                "volume_quality": volume_score,
                "phase_clarity": phase_score,
                "divergence_bonus": divergence_score
            }
        }
    
    def _detect_volume_price_divergence(self, df: pd.DataFrame) -> Dict:
        """كشف التباعد بين الحجم والسعر"""
        price_trend = df['price_change'].tail(10).sum()
        volume_trend = df['volume_ratio'].tail(10).mean()
        
        if price_trend > 0.02 and volume_trend < 0.8:
            return {"detected": True, "type": "BEARISH_DIVERGENCE"}
        elif price_trend < -0.02 and volume_trend < 0.8:
            return {"detected": True, "type": "BULLISH_DIVERGENCE"}
        else:
            return {"detected": False, "type": "NONE"}
    
    def _assess_trend_strength(self, df: pd.DataFrame) -> str:
        """تقييم قوة الاتجاه"""
        momentum = df['price_change'].tail(10).sum()
        
        if abs(momentum) > 0.1:
            return "STRONG"
        elif abs(momentum) > 0.05:
            return "MODERATE"
        else:
            return "WEAK"
    
    def _assess_volume_quality(self, df: pd.DataFrame) -> str:
        """تقييم جودة الحجم"""
        avg_volume_ratio = df['volume_ratio'].mean()
        
        if avg_volume_ratio > 1.5:
            return "HIGH"
        elif avg_volume_ratio > 0.8:
            return "NORMAL"
        else:
            return "LOW"
    
    def _interpret_volume_analysis(self, correlation: float, divergence: Dict, strength: str) -> str:
        """تفسير تحليل الحجم"""
        if divergence['detected']:
            if divergence['type'] == "BEARISH_DIVERGENCE":
                return "تباعد هبوطي - السعر يرتفع لكن الحجم ضعيف"
            else:
                return "تباعد صعودي - السعر ينخفض لكن الحجم ضعيف"
        
        if abs(correlation) > 0.7:
            return f"ارتباط قوي بين السعر والحجم - اتجاه {strength.lower()}"
        elif abs(correlation) > 0.3:
            return f"ارتباط متوسط بين السعر والحجم - اتجاه {strength.lower()}"
        else:
            return "ارتباط ضعيف بين السعر والحجم - حذر مطلوب"
    
    def _calculate_transition_probability(self, phases: List[WyckoffPhase], 
                                        events: List[WyckoffSignal]) -> float:
        """حساب احتمالية الانتقال للمرحلة التالية"""
        if not phases or not events:
            return 0.3
        
        current_phase = phases[-1]
        current_phase_duration = sum(1 for p in phases[-30:] if p == current_phase)
        
        # الأحداث التي تشير لنهاية المرحلة
        transition_events = {
            WyckoffPhase.ACCUMULATION: [WyckoffEvent.SOS, WyckoffEvent.LPS],
            WyckoffPhase.MARKUP: [WyckoffEvent.PSY, WyckoffEvent.BC],
            WyckoffPhase.DISTRIBUTION: [WyckoffEvent.SOW, WyckoffEvent.LPSY],
            WyckoffPhase.MARKDOWN: [WyckoffEvent.PS, WyckoffEvent.SC]
        }
        
        relevant_events = sum(1 for e in events[-5:] 
                            if e.event in transition_events.get(current_phase, []))
        
        # حساب الاحتمالية
        duration_factor = min(current_phase_duration / 20, 0.4)
        event_factor = min(relevant_events * 0.2, 0.4)
        
        return min(0.2 + duration_factor + event_factor, 0.9)


# مثال على الاستخدام والاختبار
def example_usage():
    """مثال على كيفية استخدام محلل وايكوف"""
    
    # بيانات تجريبية (في الواقع ستأتي من Binance أو مصدر آخر)
    import random
    
    # توليد بيانات تجريبية
    np.random.seed(42)
    base_price = 50000
    prices = []
    volumes = []
    timestamps = []
    
    # محاكاة مرحلة تجميع
    for i in range(50):
        price_change = np.random.normal(0, 0.01)  # تذبذب محدود
        base_price *= (1 + price_change)
        prices.append(base_price)
        volumes.append(np.random.uniform(1000, 3000))  # حجم متغير
        timestamps.append(f"2024-01-{i+1:02d}")
    
    # محاكاة مرحلة صعود
    for i in range(30):
        price_change = np.random.normal(0.02, 0.015)  # اتجاه صاعد
        base_price *= (1 + price_change)
        prices.append(base_price)
        volumes.append(np.random.uniform(2000, 5000))  # حجم أعلى
        timestamps.append(f"2024-02-{i+1:02d}")
    
    # إنشاء المحلل وتشغيل التحليل
    analyzer = WyckoffAnalyzer()
    result = analyzer.analyze_wyckoff_pattern(prices, volumes, timestamps)
    
    return result


# كلاس مساعد لدمج وايكوف مع منصة التداول الموجودة
class WyckoffIntegration:
    """دمج تحليل وايكوف مع منصة التداول"""
    
    def __init__(self, binance_client):
        self.binance_client = binance_client
        self.analyzer = WyckoffAnalyzer()
    
    def get_wyckoff_analysis_for_symbol(self, symbol: str, interval: str = "1h") -> Dict:
        """تحليل وايكوف لرمز معين"""
        try:
            # جلب البيانات من Binance
            klines_data = self.binance_client.get_klines(symbol, interval, 200)
            
            if not klines_data:
                return {"error": f"لا يمكن جلب البيانات لـ {symbol}"}
            
            # استخراج الأسعار والأحجام
            prices = [float(candle['close']) for candle in klines_data]
            volumes = [float(candle['volume']) for candle in klines_data]
            timestamps = [candle['timestamp'] for candle in klines_data]
            
            # تشغيل تحليل وايكوف
            wyckoff_result = self.analyzer.analyze_wyckoff_pattern(prices, volumes, timestamps)
            
            # إضافة معلومات السوق الحالية
            current_price = prices[-1]
            wyckoff_result['market_info'] = {
                'symbol': symbol.upper(),
                'current_price': current_price,
                'interval': interval,
                'data_points': len(prices),
                'analysis_timestamp': timestamps[-1] if timestamps else None
            }
            
            return wyckoff_result
            
        except Exception as e:
            return {"error": f"خطأ في تحليل وايكوف: {str(e)}"}
    
    def get_multi_timeframe_wyckoff(self, symbol: str) -> Dict:
        """تحليل وايكوف متعدد الإطارات الزمنية"""
        timeframes = ["15m", "1h", "4h", "1d"]
        results = {}
        
        for tf in timeframes:
            try:
                result = self.get_wyckoff_analysis_for_symbol(symbol, tf)
                results[tf] = result
            except Exception as e:
                results[tf] = {"error": str(e)}
        
        # تجميع النتائج وإنتاج رأي موحد
        consensus = self._analyze_multi_timeframe_consensus(results)
        
        return {
            "symbol": symbol.upper(),
            "timeframe_analysis": results,
            "consensus_analysis": consensus,
            "overall_recommendation": self._generate_overall_recommendation(consensus)
        }
    
    def _analyze_multi_timeframe_consensus(self, results: Dict) -> Dict:
        """تحليل إجماع الإطارات الزمنية المتعددة"""
        valid_results = {tf: result for tf, result in results.items() 
                        if "error" not in result}
        
        if not valid_results:
            return {"consensus": "NO_DATA", "confidence": 0}
        
        # تجميع المراحل والتوصيات
        phases = []
        recommendations = []
        confidences = []
        
        for tf, result in valid_results.items():
            if "current_phase" in result:
                phases.append(result["current_phase"])
            
            if "trading_recommendation" in result:
                rec = result["trading_recommendation"]
                recommendations.append(rec.get("action", "HOLD"))
                confidences.append(rec.get("confidence", 0.5))
        
        # حساب الإجماع
        if phases:
            most_common_phase = max(set(phases), key=phases.count)
            phase_consensus = phases.count(most_common_phase) / len(phases)
        else:
            most_common_phase = "UNKNOWN"
            phase_consensus = 0
        
        if recommendations:
            most_common_rec = max(set(recommendations), key=recommendations.count)
            rec_consensus = recommendations.count(most_common_rec) / len(recommendations)
            avg_confidence = sum(confidences) / len(confidences)
        else:
            most_common_rec = "HOLD"
            rec_consensus = 0
            avg_confidence = 0.5
        
        return {
            "dominant_phase": most_common_phase,
            "phase_consensus": round(phase_consensus, 2),
            "dominant_recommendation": most_common_rec,
            "recommendation_consensus": round(rec_consensus, 2),
            "average_confidence": round(avg_confidence, 2),
            "analysis_quality": "HIGH" if len(valid_results) >= 3 else "MODERATE"
        }
    
    def _generate_overall_recommendation(self, consensus: Dict) -> Dict:
        """توليد التوصية الإجمالية"""
        phase = consensus.get("dominant_phase", "UNKNOWN")
        recommendation = consensus.get("dominant_recommendation", "HOLD")
        phase_consensus = consensus.get("phase_consensus", 0)
        rec_consensus = consensus.get("recommendation_consensus", 0)
        avg_confidence = consensus.get("average_confidence", 0.5)
        
        # تقييم قوة الإشارة
        if phase_consensus >= 0.75 and rec_consensus >= 0.75:
            signal_strength = "VERY_STRONG"
            final_confidence = min(avg_confidence * 1.2, 0.95)
        elif phase_consensus >= 0.5 and rec_consensus >= 0.5:
            signal_strength = "MODERATE"
            final_confidence = avg_confidence
        else:
            signal_strength = "WEAK"
            final_confidence = max(avg_confidence * 0.8, 0.3)
        
        # تحديد المخاطر
        if signal_strength == "VERY_STRONG" and final_confidence > 0.8:
            risk_level = "LOW"
        elif signal_strength == "MODERATE":
            risk_level = "MODERATE"
        else:
            risk_level = "HIGH"
        
        return {
            "final_action": recommendation,
            "signal_strength": signal_strength,
            "confidence": round(final_confidence, 2),
            "risk_level": risk_level,
            "wyckoff_phase": phase,
            "consensus_score": round((phase_consensus + rec_consensus) / 2, 2),
            "recommendation": self._format_recommendation(
                recommendation, signal_strength, phase, final_confidence
            )
        }
    
    def _format_recommendation(self, action: str, strength: str, phase: str, confidence: float) -> str:
        """تنسيق التوصية النهائية"""
        if action == "BUY":
            return f"شراء {strength.lower()} - المرحلة: {phase} - الثقة: {confidence:.0%}"
        elif action == "SELL":
            return f"بيع {strength.lower()} - المرحلة: {phase} - الثقة: {confidence:.0%}"
        else:
            return f"انتظار - المرحلة: {phase} - إشارة غير واضحة"


# إضافة endpoint جديد لـ FastAPI
def add_wyckoff_endpoint_to_fastapi(app, binance_client):
    """إضافة endpoint وايكوف للتطبيق الموجود"""
    
    wyckoff_integration = WyckoffIntegration(binance_client)
    
    @app.get("/analysis/wyckoff/{symbol}")
    async def get_wyckoff_analysis(
        symbol: str,
        interval: str = Query(default="1h", description="Timeframe for analysis"),
        multi_timeframe: bool = Query(default=False, description="Multi-timeframe analysis")
    ):
        """
        تحليل وايكوف الشامل
        """
        try:
            if multi_timeframe:
                result = wyckoff_integration.get_multi_timeframe_wyckoff(symbol)
            else:
                result = wyckoff_integration.get_wyckoff_analysis_for_symbol(symbol, interval)
            
            if "error" in result:
                raise HTTPException(status_code=400, detail=result["error"])
            
            return result
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"خطأ في تحليل وايكوف: {str(e)}")


# تشغيل مثال للاختبار
if __name__ == "__main__":
    # اختبار التحليل
    print("=== اختبار تحليل وايكوف ===")
    result = example_usage()
    
    print(f"المرحلة الحالية: {result['current_phase']}")
    print(f"الثقة في المرحلة: {result['phase_confidence']:.1%}")
    print(f"عدد الأحداث المكتشفة: {len(result['detected_events'])}")
    print(f"التوصية: {result['trading_recommendation']['action']}")
    print(f"نقاط وايكوف: {result['wyckoff_score']['total_score']}/100 ({result['wyckoff_score']['rating']})")
    
    if result['detected_events']:
        print("\nآخر الأحداث:")
        for event in result['detected_events'][-3:]:
            print(f"- {event['event']}: {event['description']} (ثقة: {event['confidence']:.1%})")
    
    print(f"\nتحليل الحجم: {result['volume_analysis']['interpretation']}")
    print(f"التنبؤ بالمرحلة القادمة: {result['next_phase_prediction']['predicted_next_phase']}")
