import React, { useState, useEffect } from 'react';
import { 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export const InvestmentTab = ({ selectedSymbol, currentPrice, analysisData }) => {
  const [investmentPlan, setInvestmentPlan] = useState({
    strategy: 'dca', // Dollar Cost Averaging
    amount: 1000,
    frequency: 'weekly',
    duration: 12, // months
    riskLevel: 'medium'
  });

  const [projections, setProjections] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);

  // Helper function for recommendation text
  const getRecommendationText = (recommendation) => {
    const texts = {
      'BUY': 'شراء',
      'STRONG_BUY': 'شراء قوي',
      'WEAK_BUY': 'شراء ضعيف',
      'SELL': 'بيع',
      'STRONG_SELL': 'بيع قوي',
      'WEAK_SELL': 'بيع ضعيف',
      'HOLD': 'انتظار',
      'NEUTRAL': 'محايد'
    };
    return texts[recommendation] || recommendation;
  };

  // Calculate investment projections
  useEffect(() => {
    calculateProjections();
  }, [investmentPlan, selectedSymbol]);

  const calculateProjections = () => {
    const { amount, frequency, duration } = investmentPlan;
    
    const frequencyMultiplier = {
      'daily': 365,
      'weekly': 52,
      'monthly': 12
    };

    const periodsPerYear = frequencyMultiplier[frequency];
    const totalPeriods = (duration / 12) * periodsPerYear;
    const amountPerPeriod = amount / periodsPerYear;

    // Conservative projections based on crypto market
    const scenarios = {
      conservative: { return: 0.08, volatility: 0.3 },
      moderate: { return: 0.15, volatility: 0.5 },
      aggressive: { return: 0.25, volatility: 0.8 }
    };

    const results = {};
    
    Object.entries(scenarios).forEach(([scenario, params]) => {
      const expectedReturn = params.return;
      const finalValue = amountPerPeriod * totalPeriods * (1 + expectedReturn);
      const totalInvested = amountPerPeriod * totalPeriods;
      const profit = finalValue - totalInvested;
      const roi = (profit / totalInvested) * 100;

      results[scenario] = {
        finalValue,
        totalInvested,
        profit,
        roi,
        monthlyContribution: amountPerPeriod * (periodsPerYear / 12)
      };
    });

    setProjections(results);
  };

  const strategies = [
    {
      id: 'dca',
      name: 'متوسط التكلفة الدولارية (DCA)',
      description: 'استثمار مبلغ ثابت بانتظام بغض النظر عن السعر',
      pros: ['يقلل مخاطر التوقيت', 'مناسب للمبتدئين', 'يقلل التقلبات'],
      cons: ['قد يفوت الفرص الكبيرة', 'عوائد أقل في الأسواق الصاعدة']
    },
    {
      id: 'value',
      name: 'الاستثمار في القيمة',
      description: 'شراء عند انخفاض الأسعار عن القيمة العادلة',
      pros: ['عوائد أعلى محتملة', 'يستفيد من تقلبات السوق'],
      cons: ['يتطلب خبرة أكبر', 'صعوبة تحديد القيمة العادلة']
    },
    {
      id: 'momentum',
      name: 'استثمار الزخم',
      description: 'شراء الأصول التي تظهر اتجاهاً صاعداً قوياً',
      pros: ['يستفيد من الاتجاهات القوية', 'عوائد سريعة محتملة'],
      cons: ['مخاطر عالية', 'تقلبات كبيرة']
    }
  ];

  const frequencies = [
    { value: 'daily', label: 'يومي', description: 'استثمار يومي صغير' },
    { value: 'weekly', label: 'أسبوعي', description: 'استثمار أسبوعي منتظم' },
    { value: 'monthly', label: 'شهري', description: 'استثمار شهري كبير' }
  ];

  const riskLevels = [
    { value: 'low', label: 'منخفض', color: 'green', description: 'استثمار آمن ومستقر' },
    { value: 'medium', label: 'متوسط', color: 'yellow', description: 'توازن بين المخاطر والعوائد' },
    { value: 'high', label: 'عالي', color: 'red', description: 'مخاطر عالية، عوائد محتملة عالية' }
  ];

  return (
    <div className="space-y-6">
      {/* Investment Plan Configuration */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">خطة الاستثمار طويل المدى</h2>
          <BanknotesIcon className="w-6 h-6 text-green-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategy Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">اختيار الاستراتيجية:</label>
            <div className="space-y-2">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setInvestmentPlan(prev => ({ ...prev, strategy: strategy.id }))}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    investmentPlan.strategy === strategy.id
                      ? 'bg-blue-500/20 border-blue-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold">{strategy.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{strategy.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Parameters */}
          <div className="space-y-4">
            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                إجمالي المبلغ المراد استثماره:
              </label>
              <input
                type="number"
                value={investmentPlan.amount}
                onChange={(e) => setInvestmentPlan(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">تكرار الاستثمار:</label>
              <select
                value={investmentPlan.frequency}
                onChange={(e) => setInvestmentPlan(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value} className="bg-gray-800">
                    {freq.label} - {freq.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مدة الاستثمار (بالأشهر):
              </label>
              <input
                type="number"
                value={investmentPlan.duration}
                onChange={(e) => setInvestmentPlan(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="120"
              />
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">مستوى المخاطر:</label>
              <div className="grid grid-cols-3 gap-2">
                {riskLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setInvestmentPlan(prev => ({ ...prev, riskLevel: level.value }))}
                    className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                      investmentPlan.riskLevel === level.value
                        ? `bg-${level.color}-500/20 border-${level.color}-500/50 text-${level.color}-400 border`
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Projections */}
      {projections && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">توقعات الاستثمار</h3>
            <ChartBarIcon className="w-6 h-6 text-purple-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(projections).map(([scenario, data]) => (
              <div
                key={scenario}
                className={`p-4 rounded-xl border ${
                  scenario === 'conservative' ? 'bg-green-500/10 border-green-500/30' :
                  scenario === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="text-center">
                  <div className={`text-sm font-semibold mb-2 ${
                    scenario === 'conservative' ? 'text-green-400' :
                    scenario === 'moderate' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {scenario === 'conservative' ? 'محافظ' :
                     scenario === 'moderate' ? 'متوسط' : 'مجازف'}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-400">القيمة النهائية</div>
                      <div className="text-lg font-bold text-white">
                        ${data.finalValue.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-400">إجمالي الاستثمار</div>
                      <div className="text-sm text-gray-300">
                        ${data.totalInvested.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-400">الربح المتوقع</div>
                      <div className={`text-sm font-semibold ${
                        data.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${data.profit.toLocaleString()} ({data.roi.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-sm text-gray-300">
              <div className="flex items-center justify-between mb-2">
                <span>المساهمة الشهرية:</span>
                <span className="text-white font-semibold">
                  ${projections.moderate.monthlyContribution.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>مدة الاستثمار:</span>
                <span className="text-white font-semibold">
                  {investmentPlan.duration} شهر
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Analysis Integration */}
      {analysisData && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">تحليل الاستثمار الحالي</h3>
            <TrophyIcon className="w-6 h-6 text-yellow-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">توصية الاستثمار طويل المدى</h4>
              <div className={`p-4 rounded-lg ${
                analysisData.ultimate_decision?.final_recommendation === 'BUY' ? 'bg-green-500/20' :
                analysisData.ultimate_decision?.final_recommendation === 'SELL' ? 'bg-red-500/20' :
                'bg-yellow-500/20'
              }`}>
                <div className="text-center">
                  <div className={`text-lg font-bold mb-2 ${
                    analysisData.ultimate_decision?.final_recommendation === 'BUY' ? 'text-green-400' :
                    analysisData.ultimate_decision?.final_recommendation === 'SELL' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {analysisData.ultimate_decision?.final_recommendation === 'BUY' ? 'مناسب للاستثمار' :
                     analysisData.ultimate_decision?.final_recommendation === 'SELL' ? 'تجنب الاستثمار' :
                     'انتظار فرصة أفضل'}
                  </div>
                  <div className="text-sm text-gray-300">
                    مستوى الثقة: {analysisData.ultimate_decision?.final_confidence}%
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">نقطة الدخول المقترحة</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">السعر الحالي:</span>
                  <span className="text-white font-semibold">${currentPrice?.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">نقطة الدخول المثلى:</span>
                  <span className="text-green-400 font-semibold">
                    ${(currentPrice * 0.95)?.toFixed(2)} - ${(currentPrice * 1.05)?.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">الهدف طويل المدى:</span>
                  <span className="text-blue-400 font-semibold">
                    ${(currentPrice * 1.5)?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Tips */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">نصائح الاستثمار طويل المدى</h3>
          <ScaleIcon className="w-6 h-6 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <div className="text-white font-semibold text-sm">التنويع مهم</div>
                <div className="text-gray-400 text-xs">لا تضع كل أموالك في عملة واحدة</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <div className="text-white font-semibold text-sm">الصبر مفتاح النجاح</div>
                <div className="text-gray-400 text-xs">الاستثمار طويل المدى يتطلب صبراً</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <div className="text-white font-semibold text-sm">مراجعة دورية</div>
                <div className="text-gray-400 text-xs">راجع استراتيجيتك كل 3-6 أشهر</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <div className="text-white font-semibold text-sm">إدارة المخاطر</div>
                <div className="text-gray-400 text-xs">لا تستثمر أكثر مما تستطيع خسارته</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <div className="text-white font-semibold text-sm">تجنب القرارات العاطفية</div>
                <div className="text-gray-400 text-xs">التزم بخطتك ولا تتأثر بالتقلبات</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <div>
                <div className="text-white font-semibold text-sm">التعلم المستمر</div>
                <div className="text-gray-400 text-xs">ابق على اطلاع بتطورات السوق</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
