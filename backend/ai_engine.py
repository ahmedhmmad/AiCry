import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib
import os
from typing import List, Dict, Tuple, Any
from datetime import datetime, timedelta
from pattern_recognition import pattern_recognizer

class TradingAI:
    def __init__(self):
        self.price_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.direction_classifier = GradientBoostingClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "/app/models/"
        
        # إنشاء مجلد النماذج
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
    
    def engineer_features(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
        """
        هندسة الميزات للتعلم الآلي
        """
        df = pd.DataFrame({'price': prices})
        
        if volumes:
            df['volume'] = volumes
        else:
            df['volume'] = [1000] * len(prices)  # قيم افتراضية
        
        # الميزات السعرية
        df['price_change'] = df['price'].pct_change()
        df['price_ma5'] = df['price'].rolling(5).mean()
        df['price_ma10'] = df['price'].rolling(10).mean()
        df['price_ma20'] = df['price'].rolling(20).mean()
        
        # مؤشرات فنية
        df['rsi'] = self.calculate_rsi_series(df['price'])
        df['macd'], df['macd_signal'] = self.calculate_macd_series(df['price'])
        
        # ميزات الزخم
        df['momentum_5'] = df['price'] / df['price'].shift(5) - 1
        df['momentum_10'] = df['price'] / df['price'].shift(10) - 1
        
        # ميزات التقلب
        df['volatility_5'] = df['price_change'].rolling(5).std()
        df['volatility_10'] = df['price_change'].rolling(10).std()
        
        # ميزات الحجم
        df['volume_ma5'] = df['volume'].rolling(5).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma5']
        
        # الميزات الزمنية
        df['hour'] = range(len(df))  # محاكاة الساعة
        df['day_of_week'] = (df.index // 24) % 7  # محاكاة يوم الأسبوع
        
        # إزالة القيم المفقودة
        df = df.fillna(method='bfill').fillna(method='ffill')
        
        return df
    
    def calculate_rsi_series(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """حساب RSI للسلسلة"""
        delta = prices.diff()
        gains = delta.where(delta > 0, 0)
        losses = -delta.where(delta < 0, 0)
        avg_gains = gains.rolling(period).mean()
        avg_losses = losses.rolling(period).mean()
        rs = avg_gains / avg_losses
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)
    
    def calculate_macd_series(self, prices: pd.Series) -> Tuple[pd.Series, pd.Series]:
        """حساب MACD للسلسلة"""
        ema12 = prices.ewm(span=12).mean()
        ema26 = prices.ewm(span=26).mean()
        macd = ema12 - ema26
        signal = macd.ewm(span=9).mean()
        return macd.fillna(0), signal.fillna(0)
    
    def prepare_training_data(self, features_df: pd.DataFrame, prediction_horizon: int = 1) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        تحضير البيانات للتدريب
        """
        # الميزات المطلوبة
        feature_columns = [
            'price_change', 'price_ma5', 'price_ma10', 'price_ma20',
            'rsi', 'macd', 'macd_signal', 'momentum_5', 'momentum_10',
            'volatility_5', 'volatility_10', 'volume_ratio', 'hour', 'day_of_week'
        ]
        
        # التأكد من وجود الميزات
        available_features = [col for col in feature_columns if col in features_df.columns]
        
        X = features_df[available_features].values
        
        # الهدف: السعر المستقبلي
        y_price = features_df['price'].shift(-prediction_horizon).values
        
        # الهدف: اتجاه الحركة (صاعد/هابط)
        future_price = features_df['price'].shift(-prediction_horizon)
        current_price = features_df['price']
        y_direction = (future_price > current_price).astype(int).values
        
        # إزالة القيم المفقودة
        valid_indices = ~(np.isnan(y_price) | np.isnan(X).any(axis=1))
        X = X[valid_indices]
        y_price = y_price[valid_indices]
        y_direction = y_direction[valid_indices]
        
        return X, y_price, y_direction
    
    def train_models(self, historical_data: List[Dict]) -> Dict[str, Any]:
        """
        تدريب نماذج التعلم الآلي
        """
        try:
            # تحويل البيانات التاريخية
            prices = [item['close'] for item in historical_data]
            volumes = [item['volume'] for item in historical_data]
            
            if len(prices) < 50:
                return {"error": "Need at least 50 data points for training"}
            
            # هندسة الميزات
            features_df = self.engineer_features(prices, volumes)
            
            # تحضير بيانات التدريب
            X, y_price, y_direction = self.prepare_training_data(features_df)
            
            if len(X) < 30:
                return {"error": "Not enough valid data for training"}
            
            # تقسيم البيانات
            X_train, X_test, y_price_train, y_price_test, y_dir_train, y_dir_test = train_test_split(
                X, y_price, y_direction, test_size=0.2, random_state=42
            )
            
            # تطبيع البيانات
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # تدريب نموذج التنبؤ بالسعر
            self.price_predictor.fit(X_train_scaled, y_price_train)
            price_predictions = self.price_predictor.predict(X_test_scaled)
            price_mse = mean_squared_error(y_price_test, price_predictions)
            
            # تدريب نموذج التنبؤ بالاتجاه
            self.direction_classifier.fit(X_train_scaled, y_dir_train)
            direction_predictions = self.direction_classifier.predict(X_test_scaled)
            direction_accuracy = accuracy_score(y_dir_test, direction_predictions)
            
            # حفظ النماذج
            self.save_models()
            self.is_trained = True
            
            return {
                "training_completed": True,
                "data_points_used": len(X),
                "price_prediction_mse": round(price_mse, 4),
                "direction_accuracy": round(direction_accuracy * 100, 2),
                "model_performance": {
                    "price_rmse": round(np.sqrt(price_mse), 2),
                    "direction_accuracy_pct": round(direction_accuracy * 100, 1)
                }
            }
            
        except Exception as e:
            return {"error": f"Training failed: {str(e)}"}
    
    def predict_future(self, current_data: List[Dict], hours_ahead: int = 1) -> Dict[str, Any]:
        """
        التنبؤ بالسعر والاتجاه المستقبلي
        """
        try:
            if not self.is_trained:
                return {"error": "Model not trained yet"}
            
            # تحضير البيانات الحالية
            prices = [item['close'] for item in current_data]
            volumes = [item['volume'] for item in current_data]
            
            features_df = self.engineer_features(prices, volumes)
            
            # الميزات للتنبؤ (آخر نقطة)
            feature_columns = [
                'price_change', 'price_ma5', 'price_ma10', 'price_ma20',
                'rsi', 'macd', 'macd_signal', 'momentum_5', 'momentum_10',
                'volatility_5', 'volatility_10', 'volume_ratio', 'hour', 'day_of_week'
            ]
            
            available_features = [col for col in feature_columns if col in features_df.columns]
            X_current = features_df[available_features].iloc[-1:].values
            
            # تطبيع البيانات
            X_current_scaled = self.scaler.transform(X_current)
            
            # التنبؤ
            predicted_price = self.price_predictor.predict(X_current_scaled)[0]
            direction_probabilities = self.direction_classifier.predict_proba(X_current_scaled)[0]
            
            current_price = prices[-1]
            price_change_pct = ((predicted_price - current_price) / current_price) * 100
            
            # تحديد الثقة
            direction_confidence = max(direction_probabilities) * 100
            up_probability = direction_probabilities[1] * 100
            down_probability = direction_probabilities[0] * 100
            
            # تحديد التوصية
            if up_probability > 60:
                recommendation = "BUY"
            elif down_probability > 60:
                recommendation = "SELL"
            else:
                recommendation = "HOLD"
            
            return {
                "prediction_horizon_hours": hours_ahead,
                "current_price": round(current_price, 2),
                "predicted_price": round(predicted_price, 2),
                "expected_change_pct": round(price_change_pct, 2),
                "direction_prediction": {
                    "up_probability": round(up_probability, 1),
                    "down_probability": round(down_probability, 1),
                    "confidence": round(direction_confidence, 1)
                },
                "ai_recommendation": recommendation,
                "confidence_level": self.get_confidence_level(direction_confidence),
                "interpretation": self.get_ai_interpretation(recommendation, price_change_pct, direction_confidence)
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}
def advanced_analysis(self, historical_data: List[Dict]) -> Dict[str, Any]:
        """
        تحليل متقدم يجمع ML + Pattern Recognition
        """
        try:
            prices = [item['close'] for item in historical_data]
            volumes = [item['volume'] for item in historical_data]
            
            # التحليل التقليدي بالـ ML
            ml_prediction = self.predict_future(historical_data) if self.is_trained else {"error": "Model not trained"}
            
            # كشف الأنماط
            patterns = pattern_recognizer.detect_all_patterns(prices, volumes)
            
            # دمج النتائج
            combined_signal = self.combine_ml_and_patterns(ml_prediction, patterns)
            
            return {
                "ml_prediction": ml_prediction,
                "pattern_analysis": patterns,
                "combined_recommendation": combined_signal,
                "analysis_type": "ADVANCED_AI_WITH_PATTERNS"
            }
            
        except Exception as e:
            return {"error": f"Advanced analysis failed: {str(e)}"}
    
    def combine_ml_and_patterns(self, ml_result: Dict, patterns: Dict) -> Dict[str, Any]:
        """
        دمج نتائج ML مع Pattern Recognition
        """
        if "error" in ml_result or "error" in patterns:
            return {
                "final_signal": "INSUFFICIENT_DATA",
                "confidence": 0,
                "reasoning": "بيانات غير كافية للتحليل المتقدم"
            }
        
        # استخراج الإشارات
        ml_signal = ml_result.get("ai_recommendation", "HOLD")
        ml_confidence = ml_result.get("direction_prediction", {}).get("confidence", 50)
        
        pattern_signal = patterns.get("trading_signal", {}).get("signal", "NEUTRAL")
        pattern_confidence = patterns.get("trading_signal", {}).get("confidence", 50)
        
        # حساب الإشارة المدمجة
        if ml_signal == pattern_signal and ml_signal != "HOLD":
            # توافق قوي
            combined_confidence = min((ml_confidence + pattern_confidence) / 2 * 1.2, 95)
            return {
                "final_signal": ml_signal,
                "confidence": round(combined_confidence, 1),
                "reasoning": f"توافق قوي بين الذكاء الصناعي والأنماط السعرية",
                "ml_contribution": ml_confidence,
                "pattern_contribution": pattern_confidence
            }
        elif ml_signal in ["BUY", "SELL"] and pattern_signal == "NEUTRAL":
            # اعتماد على ML
            return {
                "final_signal": ml_signal,
                "confidence": round(ml_confidence * 0.8, 1),
                "reasoning": "اعتماد على الذكاء الصناعي - الأنماط محايدة",
                "ml_contribution": ml_confidence,
                "pattern_contribution": pattern_confidence
            }
        elif pattern_signal in ["BULLISH", "BEARISH"] and ml_signal == "HOLD":
            # اعتماد على الأنماط
            signal = "BUY" if pattern_signal == "BULLISH" else "SELL"
            return {
                "final_signal": signal,
                "confidence": round(pattern_confidence * 0.8, 1),
                "reasoning": "اعتماد على الأنماط السعرية - الذكاء الصناعي محايد",
                "ml_contribution": ml_confidence,
                "pattern_contribution": pattern_confidence
            }
        else:
            # تضارب أو ضعف في الإشارات
            return {
                "final_signal": "HOLD",
                "confidence": 30.0,
                "reasoning": "تضارب بين الذكاء الصناعي والأنماط السعرية",
                "ml_contribution": ml_confidence,
                "pattern_contribution": pattern_confidence
            }
    
    def get_confidence_level(self, confidence: float) -> str:
        """تحديد مستوى الثقة"""
        if confidence >= 80:
            return "عالية جداً"
        elif confidence >= 70:
            return "عالية"
        elif confidence >= 60:
            return "متوسطة"
        else:
            return "منخفضة"
    
    def get_ai_interpretation(self, recommendation: str, change_pct: float, confidence: float) -> str:
        """تفسير نتائج AI"""
        confidence_text = self.get_confidence_level(confidence)
        
        if recommendation == "BUY":
            return f"الذكاء الصناعي يتوقع ارتفاع {abs(change_pct):.1f}% بثقة {confidence_text}"
        elif recommendation == "SELL":
            return f"الذكاء الصناعي يتوقع انخفاض {abs(change_pct):.1f}% بثقة {confidence_text}"
        else:
            return f"الذكاء الصناعي يتوقع استقرار نسبي مع تقلبات محدودة"
    
    def save_models(self):
        """حفظ النماذج المدربة"""
        try:
            joblib.dump(self.price_predictor, f"{self.model_path}price_predictor.pkl")
            joblib.dump(self.direction_classifier, f"{self.model_path}direction_classifier.pkl")
            joblib.dump(self.scaler, f"{self.model_path}scaler.pkl")
        except Exception as e:
            print(f"Error saving models: {e}")
    
    def load_models(self):
        """تحميل النماذج المحفوظة"""
        try:
            if os.path.exists(f"{self.model_path}price_predictor.pkl"):
                self.price_predictor = joblib.load(f"{self.model_path}price_predictor.pkl")
                self.direction_classifier = joblib.load(f"{self.model_path}direction_classifier.pkl")
                self.scaler = joblib.load(f"{self.model_path}scaler.pkl")
                self.is_trained = True
                return True
        except Exception as e:
            print(f"Error loading models: {e}")
        return False

# إنشاء instance عام
trading_ai = TradingAI()
