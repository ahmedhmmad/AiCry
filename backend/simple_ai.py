import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from typing import List, Dict, Any
import joblib
import os

class SimpleAI:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42, max_depth=10)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "/app/models/"
        
        # إنشاء مجلد النماذج
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path)
    
    def create_features(self, prices: List[float]) -> pd.DataFrame:
        """
        إنشاء ميزات بسيطة للتعلم الآلي
        """
        df = pd.DataFrame({'price': prices})
        
        # المتوسطات المتحركة
        df['ma5'] = df['price'].rolling(5).mean()
        df['ma10'] = df['price'].rolling(10).mean()
        df['ma20'] = df['price'].rolling(20).mean()
        
        # التغيرات النسبية
        df['price_change_1'] = df['price'].pct_change(1)
        df['price_change_5'] = df['price'].pct_change(5)
        df['price_change_10'] = df['price'].pct_change(10)
        
        # مؤشر RSI مبسط
        df['rsi'] = self.calculate_simple_rsi(df['price'])
        
        # الزخم
        df['momentum_5'] = df['price'] / df['price'].shift(5) - 1
        df['momentum_10'] = df['price'] / df['price'].shift(10) - 1
        
        # التقلب
        df['volatility_5'] = df['price_change_1'].rolling(5).std()
        df['volatility_10'] = df['price_change_1'].rolling(10).std()
        
        # العلاقة مع المتوسطات
        df['price_above_ma5'] = (df['price'] > df['ma5']).astype(int)
        df['price_above_ma10'] = (df['price'] > df['ma10']).astype(int)
        df['price_above_ma20'] = (df['price'] > df['ma20']).astype(int)
        
        # إزالة القيم المفقودة
        # df = df.fillna(method='bfill').fillna(method='ffill')
        df = df.bfill().ffill()

        return df
    
    def calculate_simple_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """حساب RSI مبسط"""
        delta = prices.diff()
        gains = delta.where(delta > 0, 0)
        losses = -delta.where(delta < 0, 0)
        avg_gains = gains.rolling(period).mean()
        avg_losses = losses.rolling(period).mean()
        rs = avg_gains / avg_losses
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)
    
    def prepare_training_data(self, prices: List[float], prediction_hours: int = 1) -> tuple:
        """
        تحضير البيانات للتدريب
        """
        if len(prices) < 50:
            return None, None
        
        # إنشاء الميزات
        features_df = self.create_features(prices)
        
        # الميزات للتدريب
        feature_columns = [
            'ma5', 'ma10', 'ma20', 'price_change_1', 'price_change_5', 'price_change_10',
            'rsi', 'momentum_5', 'momentum_10', 'volatility_5', 'volatility_10',
            'price_above_ma5', 'price_above_ma10', 'price_above_ma20'
        ]
        
        X = features_df[feature_columns].values
        
        # الهدف: هل السعر سيرتفع أم ينخفض؟
        future_prices = pd.Series(prices).shift(-prediction_hours)
        current_prices = pd.Series(prices)
        y = (future_prices > current_prices).astype(int).values
        
        # إزالة القيم المفقودة
        valid_indices = ~(np.isnan(y) | np.isnan(X).any(axis=1))
        X = X[valid_indices]
        y = y[valid_indices]
        
        return X, y
    
    def train(self, prices: List[float]) -> Dict[str, Any]:
        """
        تدريب النموذج
        """
        try:
            X, y = self.prepare_training_data(prices)
            
            if X is None or len(X) < 30:
                return {"error": "البيانات غير كافية للتدريب - يحتاج 50 نقطة على الأقل"}
            
            # تقسيم البيانات
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # تطبيع البيانات
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # تدريب النموذج
            self.model.fit(X_train_scaled, y_train)
            
            # اختبار الأداء
            train_predictions = self.model.predict(X_train_scaled)
            test_predictions = self.model.predict(X_test_scaled)
            
            train_accuracy = accuracy_score(y_train, train_predictions)
            test_accuracy = accuracy_score(y_test, test_predictions)
            
            # حفظ النموذج
            self.save_model()
            self.is_trained = True
            
            return {
                "training_completed": True,
                "training_samples": len(X_train),
                "test_samples": len(X_test),
                "train_accuracy": round(train_accuracy * 100, 2),
                "test_accuracy": round(test_accuracy * 100, 2),
                "model_performance": "جيد" if test_accuracy > 0.55 else "متوسط" if test_accuracy > 0.52 else "ضعيف",
                "interpretation": self.interpret_performance(test_accuracy)
            }
            
        except Exception as e:
            return {"error": f"فشل التدريب: {str(e)}"}
    
    def predict(self, prices: List[float]) -> Dict[str, Any]:
        """
        التنبؤ بالاتجاه
        """
        try:
            if not self.is_trained:
                return {"error": "النموذج غير مدرب"}
            
            if len(prices) < 30:
                return {"error": "يحتاج 30 نقطة على الأقل للتنبؤ"}
            
            # إنشاء الميزات
            features_df = self.create_features(prices)
            
            # استخدام آخر نقطة للتنبؤ
            feature_columns = [
                'ma5', 'ma10', 'ma20', 'price_change_1', 'price_change_5', 'price_change_10',
                'rsi', 'momentum_5', 'momentum_10', 'volatility_5', 'volatility_10',
                'price_above_ma5', 'price_above_ma10', 'price_above_ma20'
            ]
            
            X_current = features_df[feature_columns].iloc[-1:].values
            X_current_scaled = self.scaler.transform(X_current)
            
            # التنبؤ
            prediction = self.model.predict(X_current_scaled)[0]
            prediction_proba = self.model.predict_proba(X_current_scaled)[0]
            
            up_probability = prediction_proba[1] * 100
            down_probability = prediction_proba[0] * 100
            confidence = max(up_probability, down_probability)
            
            # تحديد التوصية
            if up_probability > 60:
                recommendation = "BUY"
            elif down_probability > 60:
                recommendation = "SELL"
            else:
                recommendation = "HOLD"
            
            return {
                "prediction": "UP" if prediction == 1 else "DOWN",
                "probabilities": {
                    "up": round(up_probability, 1),
                    "down": round(down_probability, 1)
                },
                "confidence": round(confidence, 1),
                "recommendation": recommendation,
                "confidence_level": self.get_confidence_level(confidence),
                "interpretation": self.interpret_prediction(recommendation, confidence)
            }
            
        except Exception as e:
            return {"error": f"فشل التنبؤ: {str(e)}"}
    
    def interpret_performance(self, accuracy: float) -> str:
        """تفسير أداء النموذج"""
        if accuracy > 0.65:
            return "أداء ممتاز - النموذج يتنبأ بدقة عالية"
        elif accuracy > 0.60:
            return "أداء جيد جداً - النموذج موثوق للتداول"
        elif accuracy > 0.55:
            return "أداء جيد - النموذج مفيد مع مؤشرات أخرى"
        elif accuracy > 0.52:
            return "أداء متوسط - النموذج أفضل من التخمين العشوائي"
        else:
            return "أداء ضعيف - يحتاج المزيد من البيانات أو التحسين"
    
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
    
    def interpret_prediction(self, recommendation: str, confidence: float) -> str:
        """تفسير التنبؤ"""
        confidence_text = self.get_confidence_level(confidence)
        
        if recommendation == "BUY":
            return f"الذكاء الصناعي يتوقع ارتفاع السعر بثقة {confidence_text}"
        elif recommendation == "SELL":
            return f"الذكاء الصناعي يتوقع انخفاض السعر بثقة {confidence_text}"
        else:
            return f"الذكاء الصناعي لا يرى اتجاه واضح - من الأفضل الانتظار"
    
    def save_model(self):
        """حفظ النموذج"""
        try:
            joblib.dump(self.model, f"{self.model_path}simple_ai_model.pkl")
            joblib.dump(self.scaler, f"{self.model_path}simple_ai_scaler.pkl")
        except Exception as e:
            print(f"خطأ في حفظ النموذج: {e}")
    
    def load_model(self) -> bool:
        """تحميل النموذج المحفوظ"""
        try:
            if os.path.exists(f"{self.model_path}simple_ai_model.pkl"):
                self.model = joblib.load(f"{self.model_path}simple_ai_model.pkl")
                self.scaler = joblib.load(f"{self.model_path}simple_ai_scaler.pkl")
                self.is_trained = True
                return True
        except Exception as e:
            print(f"خطأ في تحميل النموذج: {e}")
        return False

# إنشاء instance عام
simple_ai = SimpleAI()
