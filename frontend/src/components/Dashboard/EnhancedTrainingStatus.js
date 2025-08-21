import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CpuChipIcon,
  ChartBarIcon,
  SparklesIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  BeakerIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  CogIcon,
  BoltIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

// دالة فحص حالة النموذج البسيطة والآمنة
const getModelStatus = (layerData) => {
  if (!layerData) {
    return { 
      status: 'غير متاح', 
      color: 'text-gray-400', 
      emoji: '⏸️', 
      trained: false,
      details: 'لا توجد بيانات'
    };
  }
  
  if (layerData.error === true || (typeof layerData.error === 'string' && layerData.error.length > 0)) {
    return { 
      status: 'غير مدرب', 
      color: 'text-red-400', 
      emoji: '❌', 
      trained: false,
      details: layerData.error || 'خطأ في النموذج'
    };
  }
  
  if (layerData.message && (
    layerData.message.includes('not trained') ||
    layerData.message.includes('غير مدرب') ||
    layerData.message.includes('Model not found') ||
    layerData.message.includes('No model available')
  )) {
    return { 
      status: 'غير مدرب', 
      color: 'text-red-400', 
      emoji: '❌', 
      trained: false,
      details: layerData.message
    };
  }

  // التحليل الفني (طبقة 1)
  if (layerData.recommendation || layerData.confidence !== undefined) {
    return { 
      status: 'نشط (لا يحتاج تدريب)', 
      color: 'text-blue-400', 
      emoji: '📊', 
      trained: true,
      details: 'التحليل الفني يعمل بالمؤشرات الرياضية'
    };
  }
  
  // النموذج البسيط (طبقة 2)
  if (layerData.prediction !== undefined || layerData.model_prediction !== undefined) {
    const prediction = layerData.prediction || layerData.model_prediction;
    if (prediction && typeof prediction === 'object' && prediction.recommendation) {
      return { 
        status: 'مدرب وجاهز', 
        color: 'text-green-400', 
        emoji: '✅', 
        trained: true,
        details: 'النموذج البسيط مدرب ويقدم تنبؤات'
      };
    }
  }
  
  // النموذج المتقدم (طبقة 3)
  if (layerData.ensemble_prediction || layerData.advanced_prediction) {
    const advancedPred = layerData.ensemble_prediction || layerData.advanced_prediction;
    if (advancedPred && (advancedPred.final_decision || advancedPred.recommendation)) {
      return { 
        status: 'مدرب وجاهز', 
        color: 'text-purple-400', 
        emoji: '🧠', 
        trained: true,
        details: 'النموذج المتقدم مدرب ويعمل بـ Ensemble Methods'
      };
    }
  }
  
  if (layerData.model_accuracy || layerData.training_score || layerData.model_performance) {
    return { 
      status: 'مدرب وجاهز', 
      color: 'text-green-400', 
      emoji: '✅', 
      trained: true,
      details: 'النموذج مدرب ويظهر مقاييس الأداء'
    };
  }
  
  return { 
    status: 'غير مدرب', 
    color: 'text-orange-400', 
    emoji: '⚠️', 
    trained: false,
    details: 'توجد بيانات لكن النموذج غير مدرب'
  };
};

// دالة الحصول على حالة تفصيلية للنماذج
const getDetailedModelStatuses = (analysisData) => {
  if (!analysisData?.analysis_layers) {
    return {
      technical: { trained: false, name: 'التحليل الفني', type: 'technical', emoji: '📊' },
      simpleAI: { trained: false, name: 'الذكاء الاصطناعي البسيط', type: 'simple_ai', emoji: '🤖' },
      advancedAI: { trained: false, name: 'الذكاء الاصطناعي المتقدم', type: 'advanced_ai', emoji: '🧠' }
    };
  }

  const layers = analysisData.analysis_layers;
  
  return {
    technical: {
      ...getModelStatus(layers['1_technical_analysis']),
      name: 'التحليل الفني',
      type: 'technical',
      description: 'يعتمد على المؤشرات الفنية مثل RSI, MACD, Moving Averages',
      emoji: '📊',
      IconComponent: ChartBarIcon,
      priority: 1
    },
    
    simpleAI: {
      ...getModelStatus(layers['2_simple_ai']),
      name: 'الذكاء الاصطناعي البسيط',
      type: 'simple_ai',
      description: 'نماذج Machine Learning أساسية مثل Random Forest, SVM',
      emoji: '🤖',
      IconComponent: CpuChipIcon,
      priority: 2
    },
    
    advancedAI: {
      ...getModelStatus(layers['3_advanced_ai']),
      name: 'الذكاء الاصطناعي المتقدم', 
      type: 'advanced_ai',
      description: 'نماذج Deep Learning و Ensemble Methods',
      emoji: '🧠',
      IconComponent: SparklesIcon,
      priority: 3
    }
  };
};

// دالة لحساب النسبة الصحيحة للنماذج المدربة
const calculateTrainedModelsStats = (analysisData) => {
  const statuses = getDetailedModelStatuses(analysisData);
  
  const trainedCount = Object.values(statuses).filter(status => status.trained).length;
  const totalCount = Object.keys(statuses).length;
  
  let qualityLevel, qualityColor, qualityIcon;
  
  if (trainedCount === 0) {
    qualityLevel = 'أساسي';
    qualityColor = 'text-red-400';
    qualityIcon = '⚠️';
  } else if (trainedCount === 1) {
    qualityLevel = 'محدود';
    qualityColor = 'text-yellow-400';
    qualityIcon = '📊';
  } else if (trainedCount === 2) {
    qualityLevel = 'جيد';
    qualityColor = 'text-blue-400';
    qualityIcon = '✅';
  } else {
    qualityLevel = 'ممتاز';
    qualityColor = 'text-green-400';
    qualityIcon = '🏆';
  }
  
  return {
    trainedCount,
    totalCount,
    percentage: Math.round((trainedCount / totalCount) * 100),
    qualityLevel,
    qualityColor,
    qualityIcon,
    statuses,
    recommendation: getTrainingRecommendation(trainedCount, statuses)
  };
};

// دالة توصيات التدريب
const getTrainingRecommendation = (trainedCount, statuses) => {
  if (trainedCount === 0) {
    return {
      message: 'ابدأ بتدريب النموذج البسيط أولاً',
      priority: 'عالية',
      nextStep: 'انتقل إلى تبويب "تدريب الذكاء الاصطناعي" ودرب النموذج البسيط',
      urgency: 'critical'
    };
  } else if (trainedCount === 1 && statuses.technical.trained && !statuses.simpleAI.trained) {
    return {
      message: 'التحليل الفني نشط - درب النموذج البسيط لتحسين الدقة',
      priority: 'متوسطة',
      nextStep: 'تدريب النموذج البسيط سيضيف تنبؤات ذكية للتحليل',
      urgency: 'medium'
    };
  } else if (trainedCount === 2 && !statuses.advancedAI.trained) {
    return {
      message: 'النماذج الأساسية مدربة - درب النموذج المتقدم للحصول على أفضل دقة',
      priority: 'منخفضة',
      nextStep: 'النموذج المتقدم سيجمع نتائج متعددة ويحسن من التوصيات',
      urgency: 'low'
    };
  } else {
    return {
      message: 'جميع النماذج مدربة ونشطة - استمتع بالتحليل المتطور!',
      priority: 'مكتمل',
      nextStep: 'يمكنك إعادة تدريب النماذج بانتظام لتحسين الأداء',
      urgency: 'complete'
    };
  }
};

// مكون حالة النموذج الفردي المبسط والآمن
const ModelStatusCard = ({ status, expanded, onToggle }) => {
  const IconComponent = status.IconComponent || ChartBarIcon;
  
  return (
    <motion.div 
      className={`rounded-xl p-4 border-2 transition-all duration-300 cursor-pointer ${
        status.trained 
          ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
          : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
      }`}
      whileHover={{ scale: 1.02 }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 rounded-lg bg-white/10 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="text-white font-semibold">{status.name}</div>
            <div className="text-xs text-gray-400">{status.description}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl mb-1">{status.emoji}</div>
          <div className={`font-medium text-sm ${status.color}`}>
            {status.status}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">النوع:</span>
                <span className="text-white">{status.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">الأولوية:</span>
                <span className="text-yellow-400">#{status.priority}</span>
              </div>
              {status.details && (
                <div className="mt-2 p-2 bg-white/5 rounded text-xs text-gray-300">
                  <strong>التفاصيل:</strong> {status.details}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// مكون التوصيات والإجراءات
const TrainingRecommendations = ({ recommendation, onTrainingClick }) => {
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-200';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
      case 'complete':
        return 'bg-green-500/20 border-green-500/50 text-green-200';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getUrgencyStyle(recommendation.urgency)}`}>
      <div className="flex items-start space-x-3 space-x-reverse">
        <div className="flex-shrink-0 mt-1">
          {recommendation.urgency === 'critical' && <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />}
          {recommendation.urgency === 'medium' && <InformationCircleIcon className="w-6 h-6 text-yellow-400" />}
          {recommendation.urgency === 'low' && <LightBulbIcon className="w-6 h-6 text-blue-400" />}
          {recommendation.urgency === 'complete' && <CheckCircleIcon className="w-6 h-6 text-green-400" />}
        </div>
        
        <div className="flex-1">
          <div className="font-semibold mb-2">
            💡 {recommendation.message}
          </div>
          <div className="text-sm opacity-90 mb-3">
            {recommendation.nextStep}
          </div>
          
          {recommendation.urgency !== 'complete' && onTrainingClick && (
            <button
              onClick={onTrainingClick}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                recommendation.urgency === 'critical' 
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : recommendation.urgency === 'medium'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <AcademicCapIcon className="w-4 h-4 inline-block ml-2" />
              بدء التدريب
            </button>
          )}
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          recommendation.urgency === 'critical' ? 'bg-red-500/30 text-red-300' :
          recommendation.urgency === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
          recommendation.urgency === 'low' ? 'bg-blue-500/30 text-blue-300' :
          'bg-green-500/30 text-green-300'
        }`}>
          {recommendation.priority}
        </div>
      </div>
    </div>
  );
};

// مكون الإحصائيات السريعة
const QuickStatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="text-2xl font-bold text-white mb-1">
          {stats.trainedCount}/{stats.totalCount}
        </div>
        <div className="text-sm text-gray-400">نماذج مدربة</div>
      </div>
      
      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
        <div className={`text-2xl font-bold mb-1 ${stats.qualityColor}`}>
          {stats.percentage}%
        </div>
        <div className="text-sm text-gray-400">نسبة الاكتمال</div>
      </div>
      
      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="text-2xl font-bold text-white mb-1">
          {stats.qualityLevel}
        </div>
        <div className="text-sm text-gray-400">مستوى الجودة</div>
      </div>
      
      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="text-2xl font-bold text-white mb-1">
          {stats.qualityIcon}
        </div>
        <div className="text-sm text-gray-400">التقييم العام</div>
      </div>
    </div>
  );
};

// شريط التقدم المتحرك
const AnimatedProgressBar = ({ percentage, quality }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">تقدم التدريب</span>
        <span className="text-sm font-medium text-white">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <motion.div
          className={`h-3 rounded-full ${
            quality === 'ممتاز' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
            quality === 'جيد' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
            quality === 'محدود' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
            'bg-gradient-to-r from-red-500 to-red-600'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// المكون الرئيسي المبسط
const EnhancedTrainingStatus = ({ 
  analysisData, 
  onTrainingClick, 
  showDetails = true, 
  compact = false 
}) => {
  const [expandedModel, setExpandedModel] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const stats = calculateTrainedModelsStats(analysisData);
  
  if (compact) {
    return (
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
          stats.qualityLevel === 'ممتاز' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          stats.qualityLevel === 'جيد' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          stats.qualityLevel === 'محدود' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
          {stats.qualityIcon} {stats.trainedCount}/{stats.totalCount} نماذج - {stats.qualityLevel}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
            <AcademicCapIcon className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">🎯 حالة تدريب النماذج</h3>
            <p className="text-gray-400 text-sm">تتبع حالة نماذج الذكاء الاصطناعي</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`px-4 py-2 rounded-full text-sm font-medium border ${stats.qualityColor} ${
            stats.qualityLevel === 'ممتاز' ? 'bg-green-500/20 border-green-500/30' :
            stats.qualityLevel === 'جيد' ? 'bg-blue-500/20 border-blue-500/30' :
            stats.qualityLevel === 'محدود' ? 'bg-yellow-500/20 border-yellow-500/30' :
            'bg-red-500/20 border-red-500/30'
          }`}>
            {stats.qualityIcon} {stats.qualityLevel}
          </div>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            {showAdvanced ? 
              <EyeSlashIcon className="w-5 h-5 text-gray-400" /> :
              <EyeIcon className="w-5 h-5 text-gray-400" />
            }
          </button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <QuickStatsGrid stats={stats} />
      
      {/* Progress Bar */}
      <AnimatedProgressBar percentage={stats.percentage} quality={stats.qualityLevel} />
      
      {/* Training Recommendations */}
      <TrainingRecommendations 
        recommendation={stats.recommendation}
        onTrainingClick={onTrainingClick}
      />
      
      {/* Model Status Cards */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BeakerIcon className="w-5 h-5 ml-2 text-cyan-400" />
            تفاصيل النماذج
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.statuses).map(([key, status]) => (
              <ModelStatusCard
                key={key}
                status={status}
                expanded={expandedModel === key}
                onToggle={() => setExpandedModel(expandedModel === key ? null : key)}
              />
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Advanced Details */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h5 className="font-semibold text-white mb-2 flex items-center">
                  <CogIcon className="w-4 h-4 ml-2 text-blue-400" />
                  إعدادات التدريب
                </h5>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>فترة البيانات: 90 يوم</div>
                  <div>نوع التحليل: مؤشرات فنية + AI</div>
                  <div>تحديث النماذج: تلقائي</div>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h5 className="font-semibold text-white mb-2 flex items-center">
                  <TrophyIcon className="w-4 h-4 ml-2 text-yellow-400" />
                  الأداء العام
                </h5>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>دقة التنبؤ: {stats.percentage > 80 ? 'عالية' : stats.percentage > 60 ? 'متوسطة' : 'منخفضة'}</div>
                  <div>سرعة الاستجابة: سريعة</div>
                  <div>استقرار النظام: مستقر</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedTrainingStatus;

// تصدير الدوال المهمة للاستخدام في ملفات أخرى
export { 
  getModelStatus, 
  getDetailedModelStatuses, 
  calculateTrainedModelsStats,
  getTrainingRecommendation
};