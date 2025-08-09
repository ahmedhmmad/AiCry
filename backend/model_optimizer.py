import numpy as np
from typing import Dict, List, Any
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

class ModelOptimizer:
    def __init__(self):
        self.best_params = {}
        
    def optimize_random_forest(self, X_train, y_train, X_test, y_test) -> Dict[str, Any]:
        """
        تحسين معاملات Random Forest
        """
        print("بدء تحسين Random Forest...")
        
        # معاملات للاختبار
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        # نموذج أساسي
        rf = RandomForestClassifier(random_state=42)
        
        # البحث عن أفضل معاملات
        grid_search = GridSearchCV(
            rf, param_grid, 
            cv=3, 
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        # أفضل نموذج
        best_model = grid_search.best_estimator_
        
        # اختبار الأداء
        train_accuracy = best_model.score(X_train, y_train)
        test_accuracy = best_model.score(X_test, y_test)
        
        # حفظ أفضل معاملات
        self.best_params['random_forest'] = grid_search.best_params_
        
        return {
            'best_params': grid_search.best_params_,
            'train_accuracy': round(train_accuracy * 100, 2),
            'test_accuracy': round(test_accuracy * 100, 2),
            'improvement': round((test_accuracy - 0.5) * 100, 2),  # تحسن عن العشوائية
            'model': best_model
        }
    
    def feature_importance_analysis(self, model, feature_names: List[str]) -> Dict[str, Any]:
        """
        تحليل أهمية الميزات
        """
        if hasattr(model, 'feature_importances_'):
            importance_dict = dict(zip(feature_names, model.feature_importances_))
            sorted_features = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
            
            return {
                'top_10_features': sorted_features[:10],
                'least_important': sorted_features[-5:],
                'recommendations': self.generate_feature_recommendations(sorted_features)
            }
        
        return {"error": "Model doesn't support feature importance"}
    
    def generate_feature_recommendations(self, sorted_features: List) -> List[str]:
        """
        توصيات تحسين الميزات
        """
        recommendations = []
        
        # تحليل الميزات الأكثر أهمية
        top_features = [f[0] for f in sorted_features[:5]]
        
        if any('rsi' in f for f in top_features):
            recommendations.append("RSI مؤثر جداً - ركز على تحسين معاملاته")
        
        if any('macd' in f for f in top_features):
            recommendations.append("MACD فعال - حسن حساب المتوسطات")
        
        if any('volume' in f for f in top_features):
            recommendations.append("الحجم مهم - أضف مؤشرات حجم إضافية")
        
        if any('volatility' in f for f in top_features):
            recommendations.append("التقلب مؤثر - أضف مؤشرات تقلب متنوعة")
        
        # إزالة الميزات الضعيفة
        weak_features = [f[0] for f in sorted_features[-10:] if f[1] < 0.01]
        if weak_features:
            recommendations.append(f"احذف الميزات الضعيفة: {', '.join(weak_features[:3])}")
        
        return recommendations
    
    def create_ensemble_weights(self, model_performances: Dict[str, float]) -> Dict[str, float]:
        """
        حساب أوزان مثلى للنماذج المختلفة
        """
        total_performance = sum(model_performances.values())
        
        if total_performance == 0:
            # أوزان متساوية إذا لم تكن هناك بيانات أداء
            equal_weight = 1.0 / len(model_performances)
            return {model: equal_weight for model in model_performances.keys()}
        
        # أوزان مبنية على الأداء
        weights = {}
        for model, performance in model_performances.items():
            weights[model] = performance / total_performance
        
        return weights
    
    def suggest_data_improvements(self, current_accuracy: float, data_size: int) -> List[str]:
        """
        اقتراحات تحسين البيانات
        """
        suggestions = []
        
        if current_accuracy < 55:
            suggestions.append("دقة منخفضة - احصل على المزيد من البيانات التاريخية")
            
        if data_size < 1000:
            suggestions.append("حجم البيانات صغير - استخدم فترة زمنية أطول للتدريب")
            
        if current_accuracy < 50:
            suggestions.append("الأداء أسوأ من العشوائية - راجع هندسة الميزات")
            
        suggestions.append("جرب فترات زمنية مختلفة (4h, 1d)")
        suggestions.append("أضف بيانات من عملات أخرى للتدريب المختلط")
        
        return suggestions

# إنشاء instance عام
model_optimizer = ModelOptimizer()
