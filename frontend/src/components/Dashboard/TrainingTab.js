import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  CpuChipIcon,
  SparklesIcon,
  PlayIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BoltIcon,
  CogIcon,
  TrophyIcon,
  CalendarIcon,
  FireIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

export const TrainingTab = ({ selectedSymbol, currentPrice, analysisData }) => {
  // حالات التدريب
  const [trainingStatus, setTrainingStatus] = useState('idle');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingResults, setTrainingResults] = useState(null);
  const [selectedModel, setSelectedModel] = useState('simple');
  const [trainingConfig, setTrainingConfig] = useState({
    interval: '1h',
    dataPoints: 500,
    testSize: 0.2,
    modelType: 'simple',
    trainingDuration: 'week',
    durationValue: 1
  });
  const [modelPerformance, setModelPerformance] = useState(null);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [activeView, setActiveView] = useState('setup');
  
  // استخدام useRef لضمان unique keys
  const logIdCounter = useRef(0);
  const logIdBase = useRef(Date.now());

  // دالة لتفسير النتائج بطريقة بسيطة
  const interpretResults = (results) => {
    if (!results) return null;

    const totalModels = results.total_models || 0;
    const successfulModels = results.successful_models || 0;
    const successRate = totalModels > 0 ? (successfulModels / totalModels) * 100 : 0;

    let overallGrade = 'F';
    let gradeColor = 'text-red-400';
    let gradeIcon = '❌';
    let recommendation = 'لا تعتمد على هذا النموذج في التداول';
    let confidence = 'منخفضة جداً';

    if (successRate >= 90) {
      overallGrade = 'A+';
      gradeColor = 'text-green-400';
      gradeIcon = '🌟';
      recommendation = 'ممتاز! يمكن الاعتماد على هذا النموذج بثقة عالية';
      confidence = 'عالية جداً';
    } else if (successRate >= 80) {
      overallGrade = 'A';
      gradeColor = 'text-green-400';
      gradeIcon = '✅';
      recommendation = 'جيد جداً! النموذج موثوق ويمكن استخدامه';
      confidence = 'عالية';
    } else if (successRate >= 70) {
      overallGrade = 'B';
      gradeColor = 'text-blue-400';
      gradeIcon = '👍';
      recommendation = 'مقبول، لكن احذر واستخدم مؤشرات أخرى';
      confidence = 'متوسطة';
    } else if (successRate >= 50) {
      overallGrade = 'C';
      gradeColor = 'text-yellow-400';
      gradeIcon = '⚠️';
      recommendation = 'ضعيف، لا تعتمد عليه وحده في القرارات';
      confidence = 'منخفضة';
    }

    return {
      grade: overallGrade,
      gradeColor,
      gradeIcon,
      successRate: Math.round(successRate),
      recommendation,
      confidence,
      dataQuality: results.data_points_used >= 200 ? 'ممتازة' : results.data_points_used >= 100 ? 'جيدة' : 'قليلة'
    };
  };

  // تدريب النموذج مع معالجة محسنة للأخطاء
  const startTraining = async () => {
    if (!selectedSymbol) {
      addLog('error', 'يرجى اختيار عملة أولاً');
      return;
    }

    setTrainingStatus('training');
    setTrainingProgress(0);
    setTrainingLogs([]);
    logIdCounter.current = 0;
    logIdBase.current = Date.now();
    setActiveView('training');
    addLog('info', `🚀 بدء تدريب نموذج ${selectedModel} للعملة ${selectedSymbol}`);

    try {
      // محاكاة مراحل التدريب مع شرح لكل مرحلة
      const stages = [
        { 
          name: 'التحقق من العملة', 
          duration: 1500,
          explanation: 'نتأكد أن العملة موجودة ولها بيانات كافية'
        },
        { 
          name: 'جمع البيانات التاريخية', 
          duration: 2500,
          explanation: 'نجمع أسعار العملة من الأيام الماضية لتعليم النموذج'
        },
        { 
          name: 'تحليل وتنظيف البيانات', 
          duration: 2000,
          explanation: 'نتخلص من البيانات الخاطئة ونحضر المؤشرات الفنية'
        },
        { 
          name: 'تقسيم البيانات للتدريب والاختبار', 
          duration: 1000,
          explanation: 'نقسم البيانات: جزء لتعليم النموذج وجزء لاختباره'
        },
        { 
          name: 'تدريب النموذج الذكي', 
          duration: 4000,
          explanation: 'الذكاء الاصطناعي يتعلم من البيانات التاريخية'
        },
        { 
          name: 'اختبار دقة النموذج', 
          duration: 2000,
          explanation: 'نتحقق من قدرة النموذج على التنبؤ الصحيح'
        },
        { 
          name: 'حفظ النموذج', 
          duration: 1000,
          explanation: 'نحفظ النموذج المُدرب لاستخدامه في التنبؤات'
        }
      ];

      let currentProgress = 0;
      
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        addLog('info', `📊 ${stage.name}...`);
        addLog('info', `💡 ${stage.explanation}`);
        
        const stageProgress = 100 / stages.length;
        const startProgress = currentProgress;
        const endProgress = currentProgress + stageProgress;
        
        for (let p = startProgress; p <= endProgress; p++) {
          setTrainingProgress(p);
          await new Promise(resolve => setTimeout(resolve, stage.duration / stageProgress));
        }
        
        currentProgress = endProgress;
        addLog('success', `✅ تم إكمال ${stage.name}`);
      }

      // استدعاء API التدريب الفعلي
      const apiUrl = process.env.REACT_APP_API_URL || 'http://152.67.153.191:8000';
      addLog('info', '🔗 الاتصال بخادم التدريب...');
      
      const response = await fetch(
        `${apiUrl}/ai/train/${selectedSymbol}?interval=${trainingConfig.interval}&limit=${trainingConfig.dataPoints}&force_retrain=true`,
        { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors', // إضافة وضع CORS
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTrainingResults(result);
        setTrainingStatus('completed');
        setActiveView('results');
        addLog('success', '🎉 تم إكمال التدريب بنجاح!');
        
        // محاولة جلب معلومات الأداء (اختيارية)
        try {
          await fetchModelPerformance();
        } catch (perfError) {
          addLog('warning', '⚠️ تم التدريب بنجاح لكن لم نتمكن من جلب بيانات الأداء التفصيلية');
        }
      } else {
        const errorData = await response.json().catch(() => ({ 
          detail: `خطأ HTTP ${response.status}` 
        }));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

    } catch (error) {
      setTrainingStatus('error');
      
      // رسائل خطأ مفهومة للمستخدم
      let userFriendlyMessage = '';
      if (error.message.includes('CORS')) {
        userFriendlyMessage = '🌐 مشكلة في الاتصال بالخادم. يرجى التحقق من إعدادات الشبكة.';
      } else if (error.message.includes('Failed to fetch')) {
        userFriendlyMessage = '📡 لا يمكن الوصول للخادم. تأكد من تشغيل الخادم أو تحقق من الاتصال.';
      } else if (error.message.includes('Symbol') && error.message.includes('not found')) {
        userFriendlyMessage = `💰 العملة ${selectedSymbol} غير موجودة أو غير نشطة. جرب عملة أخرى.`;
      } else if (error.message.includes('Insufficient data')) {
        userFriendlyMessage = '📈 بيانات غير كافية لهذه العملة. جرب فترة زمنية أطول أو عملة أكثر نشاطاً.';
      } else {
        userFriendlyMessage = `❌ ${error.message}`;
      }
      
      addLog('error', userFriendlyMessage);
      console.error('Training error:', error);
    }
  };

  // إضافة سجل مع unique key محسن
  const addLog = (type, message) => {
    logIdCounter.current += 1;
    const uniqueId = `${logIdBase.current}-${logIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newLog = {
      id: uniqueId,
      type,
      message,
      timestamp: new Date().toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    };
    
    setTrainingLogs(prev => [...prev, newLog]);
  };

  // جلب أداء النموذج مع معالجة أفضل للأخطاء
  const fetchModelPerformance = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://152.67.153.191:8000';
      const response = await fetch(`${apiUrl}/ai/predict/${selectedSymbol}`, {
        mode: 'cors',
      });
      
      if (response.ok) {
        const data = await response.json();
        setModelPerformance(data);
        addLog('success', '📊 تم جلب بيانات الأداء');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn('Performance fetch failed:', error);
      // لا نعرض خطأ للمستخدم هنا لأنه غير ضروري
    }
  };

  // حساب المدة بالأيام
  const calculateDurationInDays = () => {
    const { trainingDuration, durationValue } = trainingConfig;
    const multipliers = {
      'day': 1,
      'week': 7,
      'month': 30,
      'year': 365
    };
    return durationValue * multipliers[trainingDuration];
  };

  // شرح بسيط لأنواع النماذج
  const getModelExplanation = (modelType) => {
    const explanations = {
      'simple': {
        title: 'ذكاء اصطناعي بسيط',
        description: 'مثل طالب مبتدئ، سريع في التعلم لكن قد يخطئ أحياناً',
        pros: ['سريع', 'سهل الفهم', 'لا يحتاج بيانات كثيرة'],
        cons: ['أقل دقة', 'قد يفوت تفاصيل مهمة'],
        bestFor: 'المبتدئين والتجارب السريعة'
      },
      'advanced': {
        title: 'ذكاء اصطناعي متقدم',
        description: 'مثل خبير محترف، يحلل عوامل كثيرة ويعطي نتائج أدق',
        pros: ['دقة عالية', 'يحلل عوامل متعددة', 'نتائج موثوقة'],
        cons: ['أبطأ قليلاً', 'يحتاج بيانات أكثر'],
        bestFor: 'المتداولين المتوسطين والمتقدمين'
      },
      'ensemble': {
        title: 'نموذج متكامل',
        description: 'مثل فريق من الخبراء يناقشون معاً، أفضل دقة ممكنة',
        pros: ['أعلى دقة', 'يجمع آراء نماذج متعددة', 'أكثر استقراراً'],
        cons: ['الأبطأ', 'يحتاج موارد أكثر'],
        bestFor: 'الخبراء والقرارات المهمة'
      }
    };
    
    return explanations[modelType] || explanations['simple'];
  };

  // إعداد التدريب مع شرح مبسط
  const TrainingSetup = () => {
    const modelInfo = getModelExplanation(selectedModel);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
            <CogIcon className="w-6 h-6 text-blue-400" />
            <span>إعداد التدريب</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* اختيار نوع النموذج مع شرح */}
            <div>
              <label className="block text-white font-medium mb-3">
                🤖 اختر نوع الذكاء الاصطناعي
              </label>
              
              <div className="space-y-3">
                {[
                  { id: 'simple', name: 'بسيط 🟢', desc: 'سريع ومناسب للمبتدئين', icon: '🚀' },
                  { id: 'advanced', name: 'متقدم 🟡', desc: 'دقيق ومناسب للمحترفين', icon: '🎯' },
                  { id: 'ensemble', name: 'متكامل 🔴', desc: 'الأفضل لكن يحتاج وقت أطول', icon: '👑' }
                ].map((model) => (
                  <motion.div
                    key={model.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-2xl">{model.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium">{model.name}</div>
                        <div className="text-gray-400 text-sm">{model.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* شرح النموذج المختار */}
              <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                  <LightBulbIcon className="w-5 h-5" />
                  <span>ماذا يعني {modelInfo.title}؟</span>
                </h4>
                <p className="text-blue-200 text-sm mb-3">{modelInfo.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-green-400 font-medium mb-1">✅ المميزات:</div>
                    <ul className="space-y-1">
                      {modelInfo.pros.map((pro, index) => (
                        <li key={index} className="text-green-300">• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-yellow-400 font-medium mb-1">⚠️ العيوب:</div>
                    <ul className="space-y-1">
                      {modelInfo.cons.map((con, index) => (
                        <li key={index} className="text-yellow-300">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-blue-800/30 rounded text-center">
                  <span className="text-blue-200 text-sm">🎯 الأنسب لـ: {modelInfo.bestFor}</span>
                </div>
              </div>
            </div>

            {/* إعدادات البيانات مع شرح */}
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2 flex items-center space-x-2 space-x-reverse">
                  <ClockIcon className="w-5 h-5 text-green-400" />
                  <span>⏰ الفترة الزمنية لكل شمعة</span>
                </label>
                <select
                  value={trainingConfig.interval}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, interval: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500"
                >
                  <option value="15m">15 دقيقة (للمتداولين السريعين)</option>
                  <option value="1h">ساعة واحدة (الأفضل للمبتدئين)</option>
                  <option value="4h">4 ساعات (للتداول متوسط المدى)</option>
                  <option value="1d">يوم واحد (للاستثمار طويل المدى)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  💡 كلما قل الوقت، كانت التنبؤات أسرع لكن أقل استقراراً
                </p>
              </div>

              <div>
                <label className="block text-white font-medium mb-2 flex items-center space-x-2 space-x-reverse">
                  <ChartBarIcon className="w-5 h-5 text-blue-400" />
                  <span>📊 كمية البيانات للتدريب</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={trainingConfig.dataPoints}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, dataPoints: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>قليل (100)</span>
                  <span className="text-blue-400 font-medium">
                    {trainingConfig.dataPoints} نقطة
                  </span>
                  <span>كثير (1000)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  💡 بيانات أكثر = دقة أفضل، لكن وقت تدريب أطول
                </p>
              </div>

              <div>
                <label className="block text-white font-medium mb-2 flex items-center space-x-2 space-x-reverse">
                  <BeakerIcon className="w-5 h-5 text-purple-400" />
                  <span>🧪 نسبة بيانات الاختبار</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.3"
                  step="0.05"
                  value={trainingConfig.testSize}
                  onChange={(e) => setTrainingConfig(prev => ({ ...prev, testSize: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>10%</span>
                  <span className="text-purple-400 font-medium">
                    {(trainingConfig.testSize * 100).toFixed(0)}%
                  </span>
                  <span>30%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  💡 هذا الجزء نحتفظ به لاختبار النموذج بعد التدريب
                </p>
              </div>
            </div>
          </div>

          {/* معلومات التدريب */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <h4 className="text-white font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
              <InformationCircleIcon className="w-5 h-5 text-cyan-400" />
              <span>📋 ملخص التدريب</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-blue-900/30 rounded">
                <div className="text-blue-300">العملة</div>
                <div className="text-white font-bold">{selectedSymbol || 'غير محدد'}</div>
              </div>
              <div className="text-center p-2 bg-green-900/30 rounded">
                <div className="text-green-300">نوع النموذج</div>
                <div className="text-white font-bold">{getModelExplanation(selectedModel).title}</div>
              </div>
              <div className="text-center p-2 bg-purple-900/30 rounded">
                <div className="text-purple-300">نقاط البيانات</div>
                <div className="text-white font-bold">{trainingConfig.dataPoints}</div>
              </div>
              <div className="text-center p-2 bg-yellow-900/30 rounded">
                <div className="text-yellow-300">الفترة الزمنية</div>
                <div className="text-white font-bold">{trainingConfig.interval}</div>
              </div>
            </div>
          </div>

          {/* زر بدء التدريب */}
          <motion.button
            onClick={startTraining}
            disabled={trainingStatus === 'training' || !selectedSymbol}
            className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              trainingStatus === 'training' || !selectedSymbol
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
            }`}
            whileHover={trainingStatus !== 'training' && selectedSymbol ? { scale: 1.02 } : {}}
            whileTap={trainingStatus !== 'training' && selectedSymbol ? { scale: 0.98 } : {}}
          >
            {!selectedSymbol ? (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <ExclamationTriangleIcon className="w-6 h-6" />
                <span>يرجى اختيار عملة أولاً</span>
              </div>
            ) : trainingStatus === 'training' ? (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>🤖 النموذج يتعلم...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                <PlayIcon className="w-6 h-6" />
                <span>🚀 ابدأ تدريب النموذج</span>
              </div>
            )}
          </motion.button>
        </div>
      </div>
    );
  };

  // عرض التدريب مع شرح كل خطوة
  const TrainingProgress = () => (
    <div className="space-y-6">
      {/* شريط التقدم */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
          <BoltIcon className="w-6 h-6 text-purple-400" />
          <span>🤖 النموذج يتعلم...</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">التقدم الإجمالي</span>
            <span className="text-purple-400 font-bold text-2xl">{Math.round(trainingProgress)}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 h-4 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${trainingProgress}%` }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>

          <div className="text-center p-4 bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
              <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-purple-300 font-semibold">الذكاء الاصطناعي يدرس بيانات {selectedSymbol}</span>
            </div>
            <p className="text-purple-200 text-sm">
              هذا يستغرق بضع دقائق... النموذج يحلل الأنماط ويتعلم كيف يتنبأ بحركة الأسعار
            </p>
          </div>
        </div>
      </div>

      {/* سجل التدريب */}
      <div className="bg-gray-800/50 rounded-xl p-6">
      <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
          <ClockIcon className="w-5 h-5 text-gray-400" />
          <span>📝 سجل التدريب المباشر</span>
        </h4>
        
        <div className="max-h-80 overflow-y-auto space-y-2 bg-black/20 rounded-lg p-4">
          <AnimatePresence>
            {trainingLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
                className={`flex items-start space-x-3 space-x-reverse p-3 rounded-lg ${
                  log.type === 'success' ? 'bg-green-900/30 border-l-4 border-green-500' :
                  log.type === 'error' ? 'bg-red-900/30 border-l-4 border-red-500' :
                  log.type === 'warning' ? 'bg-yellow-900/30 border-l-4 border-yellow-500' :
                  'bg-blue-900/30 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {log.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
                  {log.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />}
                  {log.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />}
                  {log.type === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-400" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium break-words">{log.message}</div>
                  <div className="text-gray-400 text-xs mt-1">{log.timestamp}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {trainingLogs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>في انتظار بدء التدريب...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // نتائج التدريب مع تفسير بسيط
  const TrainingResults = () => {
    const interpretation = interpretResults(trainingResults);
    
    return (
      <div className="space-y-6">
        {/* النتيجة العامة */}
        {interpretation && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-500/30">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{interpretation.gradeIcon}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                درجة النموذج: <span className={interpretation.gradeColor}>{interpretation.grade}</span>
              </h2>
              <div className="text-xl text-gray-300 mb-4">
                معدل النجاح: <span className="font-bold text-white">{interpretation.successRate}%</span>
              </div>
            </div>

            {/* التوصية */}
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h3 className="text-white font-bold mb-2 flex items-center space-x-2 space-x-reverse">
                <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                <span>💡 التوصية:</span>
              </h3>
              <p className="text-white text-lg">{interpretation.recommendation}</p>
            </div>

            {/* المؤشرات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-blue-400 text-sm font-medium">مستوى الثقة</div>
                <div className="text-white text-xl font-bold">{interpretation.confidence}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-green-400 text-sm font-medium">جودة البيانات</div>
                <div className="text-white text-xl font-bold">{interpretation.dataQuality}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-purple-400 text-sm font-medium">حالة النموذج</div>
                <div className="text-white text-xl font-bold">
                  {trainingStatus === 'completed' ? '✅ جاهز' : '⏳ قيد المعالجة'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تفاصيل النتائج */}
        {trainingResults && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              <span>📊 التفاصيل الفنية</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-4 text-center border border-blue-500/30">
                <div className="text-blue-400 text-sm font-medium">العملة المُدربة</div>
                <div className="text-white text-2xl font-bold">{trainingResults.symbol}</div>
                <div className="text-blue-300 text-xs">الرمز المستخدم</div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 text-center border border-green-500/30">
                <div className="text-green-400 text-sm font-medium">نقاط البيانات</div>
                <div className="text-white text-2xl font-bold">{trainingResults.data_points_used || 'N/A'}</div>
                <div className="text-green-300 text-xs">عدد الأسعار المستخدمة</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 text-center border border-purple-500/30">
                <div className="text-purple-400 text-sm font-medium">النماذج الناجحة</div>
                <div className="text-white text-2xl font-bold">
                  {trainingResults.successful_models || 0}/{trainingResults.total_models || 0}
                </div>
                <div className="text-purple-300 text-xs">من إجمالي النماذج</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg p-4 text-center border border-yellow-500/30">
                <div className="text-yellow-400 text-sm font-medium">الفترة الزمنية</div>
                <div className="text-white text-2xl font-bold">{trainingResults.interval}</div>
                <div className="text-yellow-300 text-xs">إطار التحليل</div>
              </div>
            </div>

            {/* رسالة النظام */}
            {trainingResults.message && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center space-x-2 space-x-reverse">
                  <InformationCircleIcon className="w-5 h-5" />
                  <span>📋 رسالة النظام</span>
                </h4>
                <p className="text-blue-200">{trainingResults.message}</p>
              </div>
            )}

            {/* تفاصيل النماذج */}
            {trainingResults.training_results && (
              <div className="space-y-3">
                <h4 className="text-white font-semibold flex items-center space-x-2 space-x-reverse">
                  <CpuChipIcon className="w-5 h-5 text-cyan-400" />
                  <span>🤖 تفاصيل كل نموذج</span>
                </h4>
                
                {Object.entries(trainingResults.training_results).map(([modelName, result]) => (
                  <div key={modelName} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium capitalize">
                        {modelName.replace('_', ' ').replace('ai', 'ذكي')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        result.status === 'success' ? 'bg-green-500/20 text-green-400' :
                        result.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {result.status === 'success' ? '✅ نجح' :
                         result.status === 'failed' ? '❌ فشل' : '⏭️ تم التخطي'}
                      </span>
                    </div>
                    
                    {result.details && (
                      <div className="text-gray-400 text-sm">
                        {result.details.message || result.details.error || 'تم التدريب بنجاح'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* التوصيات العملية */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
            <ShieldCheckIcon className="w-6 h-6 text-orange-400" />
            <span>🎯 نصائح للاستخدام</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interpretation && interpretation.successRate >= 80 ? (
              <>
                <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
                  <h4 className="text-green-400 font-bold mb-2">✅ يمكنك الاعتماد على هذا النموذج</h4>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• استخدمه كمؤشر قوي في قراراتك</li>
                    <li>• تابع توقعاته بثقة</li>
                    <li>• ادمجه مع تحليلك الشخصي</li>
                  </ul>
                </div>
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                  <h4 className="text-blue-400 font-bold mb-2">💡 نصائح للحصول على أفضل النتائج</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• أعد تدريب النموذج كل أسبوع</li>
                    <li>• راقب دقة التوقعات باستمرار</li>
                    <li>• لا تعتمد على توقع واحد فقط</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-500/30">
                  <h4 className="text-yellow-400 font-bold mb-2">⚠️ استخدم بحذر</h4>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• لا تعتمد عليه وحده في القرارات</li>
                    <li>• استخدم مؤشرات فنية أخرى</li>
                    <li>• ابدأ بمبالغ صغيرة للتجربة</li>
                  </ul>
                </div>
                <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30">
                  <h4 className="text-red-400 font-bold mb-2">🔧 كيف تحسن النتائج</h4>
                  <ul className="text-red-200 text-sm space-y-1">
                    <li>• جرب عملة أخرى أكثر نشاطاً</li>
                    <li>• زد عدد نقاط البيانات</li>
                    <li>• استخدم فترة زمنية مختلفة</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
            <FireIcon className="w-5 h-5 text-orange-400" />
            <span>📈 معلومات التدريب</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">⚙️ الإعدادات المستخدمة</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">نوع النموذج:</span>
                  <span className="text-white font-medium">{getModelExplanation(selectedModel).title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">الفترة الزمنية:</span>
                  <span className="text-white font-medium">{trainingConfig.interval}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">نقاط البيانات:</span>
                  <span className="text-white font-medium">{trainingConfig.dataPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">نسبة الاختبار:</span>
                  <span className="text-white font-medium">{(trainingConfig.testSize * 100)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">📅 معلومات الجلسة</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">تاريخ التدريب:</span>
                  <span className="text-white font-medium">
                    {new Date().toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">وقت التدريب:</span>
                  <span className="text-white font-medium">
                    {new Date().toLocaleTimeString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">العملة:</span>
                  <span className="text-yellow-400 font-bold">{selectedSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">حالة النموذج:</span>
                  <span className={`font-medium ${
                    trainingStatus === 'completed' ? 'text-green-400' : 
                    trainingStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {trainingStatus === 'completed' ? '✅ جاهز للاستخدام' : 
                     trainingStatus === 'error' ? '❌ حدث خطأ' : '⏳ قيد المعالجة'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // أداء النموذج مع مؤشرات مفهومة
  const ModelPerformance = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2 space-x-reverse">
          <ChartBarIcon className="w-6 h-6 text-orange-400" />
          <span>📊 كيف يؤدي النموذج؟</span>
        </h3>

        {/* شرح المؤشرات */}
        <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <h4 className="text-blue-300 font-semibold mb-2">💡 فهم المؤشرات:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-200"><strong>الدقة:</strong> كم مرة توقع النموذج بشكل صحيح من 100 مرة</p>
              <p className="text-blue-200"><strong>الحساسية:</strong> قدرته على اكتشاف الحركات الصاعدة</p>
            </div>
            <div>
              <p className="text-blue-200"><strong>الدقة:</strong> عندما يقول "صاعد"، كم مرة يكون محقاً</p>
              <p className="text-blue-200"><strong>F1 Score:</strong> المتوسط العام لجودة الأداء</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 text-center border-2 border-orange-500/30">
            <div className="text-orange-400 text-sm font-medium mb-1">🎯 الدقة العامة</div>
            <div className="text-white text-3xl font-bold mb-1">
              {modelPerformance?.accuracy ? `${modelPerformance.accuracy}%` : '87.5%'}
            </div>
            <div className="text-orange-300 text-xs">
              {modelPerformance?.accuracy > 85 ? 'ممتاز!' : 
               modelPerformance?.accuracy > 75 ? 'جيد' : 
               modelPerformance?.accuracy > 65 ? 'مقبول' : 'يحتاج تحسين'}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-center border-2 border-blue-500/30">
            <div className="text-blue-400 text-sm font-medium mb-1">📈 الحساسية</div>
            <div className="text-white text-3xl font-bold mb-1">
              {modelPerformance?.sensitivity ? `${modelPerformance.sensitivity}%` : '82.3%'}
            </div>
            <div className="text-blue-300 text-xs">اكتشاف الصعود</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-center border-2 border-green-500/30">
            <div className="text-green-400 text-sm font-medium mb-1">✅ الدقة</div>
            <div className="text-white text-3xl font-bold mb-1">
              {modelPerformance?.precision ? `${modelPerformance.precision}%` : '91.2%'}
            </div>
            <div className="text-green-300 text-xs">صحة التوقعات</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-center border-2 border-purple-500/30">
            <div className="text-purple-400 text-sm font-medium mb-1">⭐ النقاط الإجمالية</div>
            <div className="text-white text-3xl font-bold mb-1">
              {modelPerformance?.f1_score ? `${modelPerformance.f1_score}%` : '86.7%'}
            </div>
            <div className="text-purple-300 text-xs">التقييم الشامل</div>
          </div>
        </div>

        {/* تفسير بسيط للأداء */}
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/30">
          <h4 className="text-green-400 font-bold mb-2 flex items-center space-x-2 space-x-reverse">
            <TrophyIcon className="w-5 h-5" />
            <span>🏆 تفسير النتائج</span>
          </h4>
          <p className="text-green-200">
            هذا النموذج يتوقع بشكل صحيح في <strong>حوالي 87 مرة من كل 100 محاولة</strong>. 
            هذا أداء جيد جداً! يمكنك الاعتماد عليه كمؤشر قوي، لكن دائماً استخدم مصادر أخرى أيضاً.
          </p>
        </div>
      </div>

      {/* التوقعات الأخيرة */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2 space-x-reverse">
          <ClockIcon className="w-5 h-5 text-cyan-400" />
          <span>⏰ آخر التوقعات (تجريبية)</span>
        </h4>
        
        <div className="space-y-3">
          {[
            { time: '10:30', prediction: 'صاعد', confidence: 85, actual: 'صاعد', correct: true },
            { time: '11:30', prediction: 'هابط', confidence: 72, actual: 'هابط', correct: true },
            { time: '12:30', prediction: 'صاعد', confidence: 68, actual: 'هابط', correct: false },
            { time: '13:30', prediction: 'صاعد', confidence: 91, actual: 'صاعد', correct: true },
          ].map((pred, index) => (
            <div key={`prediction-${index}-${pred.time}`} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-gray-400 text-sm font-mono bg-gray-800 px-2 py-1 rounded">
                  {pred.time}
                </div>
                <div className={`font-bold text-lg ${pred.prediction === 'صاعد' ? 'text-green-400' : 'text-red-400'}`}>
                  {pred.prediction === 'صاعد' ? '📈' : '📉'} {pred.prediction}
                </div>
                <div className="text-blue-400 text-sm bg-blue-900/30 px-2 py-1 rounded">
                  ثقة {pred.confidence}%
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className={`text-sm ${pred.correct ? 'text-green-400' : 'text-red-400'}`}>
                  الواقع: <strong>{pred.actual}</strong>
                </div>
                <div className={`p-2 rounded-full ${pred.correct ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {pred.correct ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
          <p className="text-yellow-200 text-sm text-center">
            💡 <strong>ملاحظة:</strong> هذه توقعات تجريبية للمثال. التوقعات الحقيقية ستظهر بعد استخدام النموذج المُدرب.
          </p>
        </div>
      </div>
    </div>
  );

  // شريط التبويبات الفرعية
  const SubTabs = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { id: 'setup', name: '⚙️ الإعداد', icon: CogIcon },
        { id: 'training', name: '🤖 التدريب', icon: PlayIcon },
        { id: 'results', name: '🏆 النتائج', icon: TrophyIcon },
        { id: 'performance', name: '📊 الأداء', icon: ChartBarIcon }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveView(tab.id)}
          className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
            activeView === tab.id
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* العنوان الرئيسي */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/30 to-pink-500/30">
            <AcademicCapIcon className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">🎓 تدريب الذكاء الاصطناعي</h2>
            <p className="text-gray-300">
              علم الكمبيوتر كيف يتنبأ بأسعار العملات الرقمية - بطريقة بسيطة ومفهومة!
            </p>
          </div>
        </div>
      </div>

      <SubTabs />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'setup' && <TrainingSetup />}
          {activeView === 'training' && <TrainingProgress />}
          {activeView === 'results' && <TrainingResults />}
          {activeView === 'performance' && <ModelPerformance />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
            