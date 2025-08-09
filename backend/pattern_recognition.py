import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional
from scipy.signal import find_peaks, argrelextrema
import math

class PatternRecognition:
    def __init__(self):
        self.min_pattern_length = 10
        self.tolerance = 0.02  # 2% tolerance for pattern matching
    
    def detect_all_patterns(self, prices: List[float], volumes: List[float] = None) -> Dict[str, any]:
        """
        كشف جميع الأنماط السعرية
        """
        if len(prices) < 50:
            return {"error": "Need at least 50 data points for pattern recognition"}
        
        price_series = pd.Series(prices)
        volume_series = pd.Series(volumes) if volumes else pd.Series([1000] * len(prices))
        
        patterns = {}
        
        # كشف أنماط الانعكاس
        patterns.update(self.detect_reversal_patterns(price_series))
        
        # كشف أنماط الاستمرار
        patterns.update(self.detect_continuation_patterns(price_series))
        
        # كشف مستويات الدعم والمقاومة
        patterns.update(self.detect_support_resistance(price_series))
        
        # تحليل حجم التداول
        patterns.update(self.analyze_volume_patterns(price_series, volume_series))
        
        # تقييم قوة الأنماط
        patterns["pattern_strength"] = self.evaluate_pattern_strength(patterns)
        patterns["trading_signal"] = self.generate_pattern_signal(patterns)
        
        return patterns
    
    def detect_reversal_patterns(self, prices: pd.Series) -> Dict[str, any]:
        """
        كشف أنماط الانعكاس (Head & Shoulders, Double Top/Bottom)
        """
        patterns = {}
        
        # العثور على القمم والقيعان
        peaks, _ = find_peaks(prices, distance=5, prominence=prices.std() * 0.5)
        troughs, _ = find_peaks(-prices, distance=5, prominence=prices.std() * 0.5)
        
        # Head & Shoulders
        head_shoulders = self.detect_head_and_shoulders(prices, peaks, troughs)
        if head_shoulders:
            patterns["head_and_shoulders"] = head_shoulders
        
        # Inverse Head & Shoulders
        inv_head_shoulders = self.detect_inverse_head_and_shoulders(prices, peaks, troughs)
        if inv_head_shoulders:
            patterns["inverse_head_and_shoulders"] = inv_head_shoulders
        
        # Double Top
        double_top = self.detect_double_top(prices, peaks)
        if double_top:
            patterns["double_top"] = double_top
        
        # Double Bottom
        double_bottom = self.detect_double_bottom(prices, troughs)
        if double_bottom:
            patterns["double_bottom"] = double_bottom
        
        return patterns
    
    def detect_head_and_shoulders(self, prices: pd.Series, peaks: np.ndarray, troughs: np.ndarray) -> Optional[Dict]:
        """
        كشف نموذج Head & Shoulders
        """
        if len(peaks) < 3:
            return None
        
        # البحث عن آخر 3 قمم
        recent_peaks = peaks[-3:]
        peak_prices = prices.iloc[recent_peaks].values
        
        # شروط Head & Shoulders:
        # 1. القمة الوسطى أعلى من الجانبيتين
        # 2. الكتفان متشابهان تقريباً
        if (peak_prices[1] > peak_prices[0] and 
            peak_prices[1] > peak_prices[2] and
            abs(peak_prices[0] - peak_prices[2]) / max(peak_prices[0], peak_prices[2]) < self.tolerance):
            
            # حساب خط العنق (neckline)
            left_shoulder_idx = recent_peaks[0]
            right_shoulder_idx = recent_peaks[2]
            
            # العثور على القاع بين الكتف الأيسر والرأس
            left_trough_candidates = troughs[(troughs > left_shoulder_idx) & (troughs < recent_peaks[1])]
            right_trough_candidates = troughs[(troughs > recent_peaks[1]) & (troughs < right_shoulder_idx)]
            
            if len(left_trough_candidates) > 0 and len(right_trough_candidates) > 0:
                neckline_level = (prices.iloc[left_trough_candidates[-1]] + prices.iloc[right_trough_candidates[0]]) / 2
                current_price = prices.iloc[-1]
                
                return {
                    "pattern_type": "Head and Shoulders",
                    "signal": "BEARISH",
                    "strength": "HIGH",
                    "neckline_level": round(neckline_level, 2),
                    "target_price": round(neckline_level - (peak_prices[1] - neckline_level), 2),
                    "confirmation": "Break below neckline" if current_price < neckline_level else "Waiting for confirmation",
                    "interpretation": "نموذج الرأس والكتفين - إشارة هبوط قوية"
                }
        
        return None
    
    def detect_inverse_head_and_shoulders(self, prices: pd.Series, peaks: np.ndarray, troughs: np.ndarray) -> Optional[Dict]:
        """
        كشف نموذج Inverse Head & Shoulders
        """
        if len(troughs) < 3:
            return None
        
        recent_troughs = troughs[-3:]
        trough_prices = prices.iloc[recent_troughs].values
        
        # شروط Inverse Head & Shoulders
        if (trough_prices[1] < trough_prices[0] and 
            trough_prices[1] < trough_prices[2] and
            abs(trough_prices[0] - trough_prices[2]) / max(trough_prices[0], trough_prices[2]) < self.tolerance):
            
            # حساب خط العنق
            left_peak_candidates = peaks[(peaks > recent_troughs[0]) & (peaks < recent_troughs[1])]
            right_peak_candidates = peaks[(peaks > recent_troughs[1]) & (peaks < recent_troughs[2])]
            
            if len(left_peak_candidates) > 0 and len(right_peak_candidates) > 0:
                neckline_level = (prices.iloc[left_peak_candidates[-1]] + prices.iloc[right_peak_candidates[0]]) / 2
                current_price = prices.iloc[-1]
                
                return {
                    "pattern_type": "Inverse Head and Shoulders",
                    "signal": "BULLISH",
                    "strength": "HIGH",
                    "neckline_level": round(neckline_level, 2),
                    "target_price": round(neckline_level + (neckline_level - trough_prices[1]), 2),
                    "confirmation": "Break above neckline" if current_price > neckline_level else "Waiting for confirmation",
                    "interpretation": "نموذج الرأس والكتفين المعكوس - إشارة صعود قوية"
                }
        
        return None
    
    def detect_double_top(self, prices: pd.Series, peaks: np.ndarray) -> Optional[Dict]:
        """
        كشف نموذج Double Top
        """
        if len(peaks) < 2:
            return None
        
        # البحث عن آخر قمتين
        recent_peaks = peaks[-2:]
        peak_prices = prices.iloc[recent_peaks].values
        
        # شرط Double Top: القمتان متشابهتان
        if abs(peak_prices[0] - peak_prices[1]) / max(peak_prices[0], peak_prices[1]) < self.tolerance:
            # العثور على القاع بين القمتين
            valley_candidates = np.where((prices.index > recent_peaks[0]) & (prices.index < recent_peaks[1]))[0]
            
            if len(valley_candidates) > 0:
                valley_price = prices.iloc[valley_candidates].min()
                current_price = prices.iloc[-1]
                
                return {
                    "pattern_type": "Double Top",
                    "signal": "BEARISH",
                    "strength": "MEDIUM",
                    "support_level": round(valley_price, 2),
                    "target_price": round(valley_price - (peak_prices[0] - valley_price), 2),
                    "confirmation": "Break below support" if current_price < valley_price else "Waiting for confirmation",
                    "interpretation": "نموذج القمة المزدوجة - إشارة هبوط متوسطة"
                }
        
        return None
    
    def detect_double_bottom(self, prices: pd.Series, troughs: np.ndarray) -> Optional[Dict]:
        """
        كشف نموذج Double Bottom
        """
        if len(troughs) < 2:
            return None
        
        recent_troughs = troughs[-2:]
        trough_prices = prices.iloc[recent_troughs].values
        
        # شرط Double Bottom: القاعان متشابهان
        if abs(trough_prices[0] - trough_prices[1]) / max(trough_prices[0], trough_prices[1]) < self.tolerance:
            # العثور على القمة بين القاعين
            peak_candidates = np.where((prices.index > recent_troughs[0]) & (prices.index < recent_troughs[1]))[0]
            
            if len(peak_candidates) > 0:
                peak_price = prices.iloc[peak_candidates].max()
                current_price = prices.iloc[-1]
                
                return {
                    "pattern_type": "Double Bottom",
                    "signal": "BULLISH",
                    "strength": "MEDIUM",
                    "resistance_level": round(peak_price, 2),
                    "target_price": round(peak_price + (peak_price - trough_prices[0]), 2),
                    "confirmation": "Break above resistance" if current_price > peak_price else "Waiting for confirmation",
                    "interpretation": "نموذج القاع المزدوج - إشارة صعود متوسطة"
                }
        
        return None
    
    def detect_continuation_patterns(self, prices: pd.Series) -> Dict[str, any]:
        """
        كشف أنماط الاستمرار (Triangles, Flags, Pennants)
        """
        patterns = {}
        
        # التحقق من المثلثات
        triangle = self.detect_triangle_pattern(prices)
        if triangle:
            patterns["triangle"] = triangle
        
        # التحقق من العلم (Flag)
        flag = self.detect_flag_pattern(prices)
        if flag:
            patterns["flag"] = flag
        
        return patterns
    
    def detect_triangle_pattern(self, prices: pd.Series) -> Optional[Dict]:
        """
        كشف الأنماط المثلثية
        """
        if len(prices) < 20:
            return None
        
        # آخر 20 نقطة
        recent_prices = prices.tail(20)
        
        # حساب خطوط الاتجاه
        highs = recent_prices.rolling(window=3).max()
        lows = recent_prices.rolling(window=3).min()
        
        # التحقق من التقارب
        high_slope = self.calculate_trendline_slope(highs.dropna())
        low_slope = self.calculate_trendline_slope(lows.dropna())
        
        if high_slope is not None and low_slope is not None:
            # مثلث متماثل: خط المقاومة ينخفض، خط الدعم يرتفع
            if high_slope < -0.1 and low_slope > 0.1:
                return {
                    "pattern_type": "Symmetrical Triangle",
                    "signal": "NEUTRAL",
                    "strength": "MEDIUM",
                    "breakout_direction": "Pending",
                    "interpretation": "مثلث متماثل - انتظار اختراق لتحديد الاتجاه"
                }
            
            # مثلث صاعد: مقاومة أفقية، دعم صاعد
            elif abs(high_slope) < 0.05 and low_slope > 0.1:
                return {
                    "pattern_type": "Ascending Triangle",
                    "signal": "BULLISH",
                    "strength": "MEDIUM",
                    "breakout_direction": "Upward Expected",
                    "interpretation": "مثلث صاعد - توقع اختراق للأعلى"
                }
            
            # مثلث هابط: مقاومة هابطة، دعم أفقي
            elif high_slope < -0.1 and abs(low_slope) < 0.05:
                return {
                    "pattern_type": "Descending Triangle",
                    "signal": "BEARISH",
                    "strength": "MEDIUM",
                    "breakout_direction": "Downward Expected",
                    "interpretation": "مثلث هابط - توقع اختراق للأسفل"
                }
        
        return None
    
    def detect_flag_pattern(self, prices: pd.Series) -> Optional[Dict]:
        """
        كشف نموذج العلم (Flag Pattern)
        """
        if len(prices) < 15:
            return None
        
        # تحليل آخر 15 نقطة للبحث عن حركة قوية متبوعة بتوحيد
        recent_prices = prices.tail(15)
        
        # التحقق من وجود حركة قوية في البداية
        initial_move = (recent_prices.iloc[5] - recent_prices.iloc[0]) / recent_prices.iloc[0]
        
        if abs(initial_move) > 0.03:  # حركة 3% أو أكثر
            # التحقق من التوحيد اللاحق
            consolidation_period = recent_prices.tail(10)
            volatility = consolidation_period.std() / consolidation_period.mean()
            
            if volatility < 0.02:  # تقلب منخفض = توحيد
                direction = "BULLISH" if initial_move > 0 else "BEARISH"
                
                return {
                    "pattern_type": "Flag Pattern",
                    "signal": direction,
                    "strength": "MEDIUM",
                    "initial_move": round(initial_move * 100, 2),
                    "consolidation_volatility": round(volatility * 100, 2),
                    "interpretation": f"نموذج العلم - توقع استمرار الاتجاه {direction.lower()}"
                }
        
        return None
    
    def detect_support_resistance(self, prices: pd.Series) -> Dict[str, any]:
        """
        كشف مستويات الدعم والمقاومة الديناميكية
        """
        # استخدام pivot points
        pivots = self.find_pivot_points(prices)
        
        support_levels = []
        resistance_levels = []
        
        current_price = prices.iloc[-1]
        
        for pivot in pivots:
            if pivot < current_price:
                support_levels.append(pivot)
            else:
                resistance_levels.append(pivot)
        
        # أقوى مستويات (الأكثر اختباراً)
        strong_support = self.find_strongest_levels(support_levels, prices, 'support')
        strong_resistance = self.find_strongest_levels(resistance_levels, prices, 'resistance')
        
        return {
            "support_resistance": {
                "current_price": round(current_price, 2),
                "nearest_support": round(max(support_levels), 2) if support_levels else None,
                "nearest_resistance": round(min(resistance_levels), 2) if resistance_levels else None,
                "strong_support": strong_support,
                "strong_resistance": strong_resistance,
                "interpretation": self.interpret_support_resistance(current_price, strong_support, strong_resistance)
            }
        }
    
    def analyze_volume_patterns(self, prices: pd.Series, volumes: pd.Series) -> Dict[str, any]:
        """
        تحليل أنماط الحجم
        """
        # متوسط الحجم
        avg_volume = volumes.rolling(20).mean()
        current_volume = volumes.iloc[-1]
        recent_avg = avg_volume.iloc[-1]
        
        # تحليل العلاقة بين السعر والحجم
        price_change = prices.pct_change()
        volume_price_corr = price_change.tail(20).corr(volumes.tail(20))
        
        volume_analysis = {
            "current_volume": round(current_volume, 2),
            "average_volume": round(recent_avg, 2),
            "volume_ratio": round(current_volume / recent_avg, 2),
            "volume_trend": "HIGH" if current_volume > recent_avg * 1.5 else "NORMAL" if current_volume > recent_avg * 0.5 else "LOW",
            "price_volume_correlation": round(volume_price_corr, 3)
        }
        
        # تفسير الحجم
        if volume_analysis["volume_ratio"] > 2:
            volume_analysis["interpretation"] = "حجم تداول استثنائي - قد يشير لحركة قوية قادمة"
        elif volume_analysis["volume_ratio"] > 1.5:
            volume_analysis["interpretation"] = "حجم تداول عالي - اهتمام متزايد"
        elif volume_analysis["volume_ratio"] < 0.5:
            volume_analysis["interpretation"] = "حجم تداول منخفض - قد يشير لنقص الاهتمام"
        else:
            volume_analysis["interpretation"] = "حجم تداول طبيعي"
        
        return {"volume_analysis": volume_analysis}
    
    def calculate_trendline_slope(self, data: pd.Series) -> Optional[float]:
        """حساب ميل خط الاتجاه"""
        if len(data) < 3:
            return None
        
        x = np.arange(len(data))
        y = data.values
        slope = np.polyfit(x, y, 1)[0]
        return slope
    
    def find_pivot_points(self, prices: pd.Series, window: int = 5) -> List[float]:
        """العثور على نقاط المحورة"""
        pivots = []
        
        for i in range(window, len(prices) - window):
            # نقطة محورة علوية
            if all(prices.iloc[i] >= prices.iloc[i-j] for j in range(1, window+1)) and \
               all(prices.iloc[i] >= prices.iloc[i+j] for j in range(1, window+1)):
                pivots.append(prices.iloc[i])
            
            # نقطة محورة سفلية
            elif all(prices.iloc[i] <= prices.iloc[i-j] for j in range(1, window+1)) and \
                 all(prices.iloc[i] <= prices.iloc[i+j] for j in range(1, window+1)):
                pivots.append(prices.iloc[i])
        
        return pivots
    
    def find_strongest_levels(self, levels: List[float], prices: pd.Series, level_type: str) -> Optional[float]:
        """العثور على أقوى مستوى دعم/مقاومة"""
        if not levels:
            return None
        
        # حساب عدد مرات اختبار كل مستوى
        level_strength = {}
        
        for level in levels:
            touches = 0
            for price in prices:
                if abs(price - level) / level < 0.01:  # ضمن 1% من المستوى
                    touches += 1
            level_strength[level] = touches
        
        # إرجاع المستوى الأكثر اختباراً
        strongest_level = max(level_strength, key=level_strength.get)
        return round(strongest_level, 2)
    
    def interpret_support_resistance(self, current_price: float, support: Optional[float], resistance: Optional[float]) -> str:
        """تفسير مستويات الدعم والمقاومة"""
        if support and resistance:
            support_distance = ((current_price - support) / support) * 100
            resistance_distance = ((resistance - current_price) / current_price) * 100
            
            if support_distance < 2:
                return f"السعر قريب من الدعم القوي عند {support}"
            elif resistance_distance < 2:
                return f"السعر قريب من المقاومة القوية عند {resistance}"
            else:
                return f"السعر بين الدعم {support} والمقاومة {resistance}"
        elif support:
            return f"الدعم الرئيسي عند {support}"
        elif resistance:
            return f"المقاومة الرئيسية عند {resistance}"
        else:
            return "لا توجد مستويات دعم/مقاومة واضحة"
    
    def evaluate_pattern_strength(self, patterns: Dict) -> str:
        """تقييم قوة الأنماط الإجمالية"""
        strong_patterns = 0
        total_patterns = 0
        
        for key, pattern in patterns.items():
            if isinstance(pattern, dict) and "strength" in pattern:
                total_patterns += 1
                if pattern["strength"] == "HIGH":
                    strong_patterns += 2
                elif pattern["strength"] == "MEDIUM":
                    strong_patterns += 1
        
        if total_patterns == 0:
            return "NO_PATTERNS"
        
        strength_ratio = strong_patterns / (total_patterns * 2)
        
        if strength_ratio >= 0.75:
            return "VERY_STRONG"
        elif strength_ratio >= 0.5:
            return "STRONG"
        elif strength_ratio >= 0.25:
            return "MODERATE"
        else:
            return "WEAK"
    
    def generate_pattern_signal(self, patterns: Dict) -> Dict[str, any]:
        """توليد إشارة تداول من الأنماط"""
        bullish_signals = 0
        bearish_signals = 0
        neutral_signals = 0
        
        signal_weights = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
        
        for key, pattern in patterns.items():
            if isinstance(pattern, dict) and "signal" in pattern:
                weight = signal_weights.get(pattern.get("strength", "LOW"), 1)
                
                if pattern["signal"] == "BULLISH":
                    bullish_signals += weight
                elif pattern["signal"] == "BEARISH":
                    bearish_signals += weight
                else:
                    neutral_signals += weight
        
        total_weight = bullish_signals + bearish_signals + neutral_signals
        
        if total_weight == 0:
            return {
                "signal": "NO_CLEAR_PATTERN",
                "confidence": 0,
                "interpretation": "لا توجد أنماط واضحة للتداول"
            }
        
        if bullish_signals > bearish_signals and bullish_signals > neutral_signals:
            confidence = (bullish_signals / total_weight) * 100
            return {
                "signal": "BULLISH",
                "confidence": round(confidence, 1),
                "interpretation": f"الأنماط تشير لاتجاه صاعد بثقة {confidence:.1f}%"
            }
        elif bearish_signals > bullish_signals and bearish_signals > neutral_signals:
            confidence = (bearish_signals / total_weight) * 100
            return {
                "signal": "BEARISH",
                "confidence": round(confidence, 1),
                "interpretation": f"الأنماط تشير لاتجاه هابط بثقة {confidence:.1f}%"
            }
        else:
            return {
                "signal": "NEUTRAL",
                "confidence": 50.0,
                "interpretation": "الأنماط متضاربة - لا توجد إشارة واضحة"
            }

# إنشاء instance عام
pattern_recognizer = PatternRecognition()
