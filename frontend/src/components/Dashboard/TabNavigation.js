// // components/Dashboard/TabNavigation.js
// import { 
//   ChartBarIcon,        // التحليل
//   WalletIcon,          // المحفظة - إدارة رأس المال
//   ArrowTrendingUpIcon, // الاستثمار - طويل المدى (تم التصحيح)
//   BoltIcon,            // التداول - قصير المدى/المضاربة
//   BeakerIcon,          // اختبار الاستراتيجيات
//   ScaleIcon            // المقارنة
// } from '@heroicons/react/24/outline';

// export const TabNavigation = ({ activeTab, setActiveTab }) => {
//   const tabs = [
//     { 
//       id: 'analysis', 
//       name: 'تحليل السوق', 
//       icon: ChartBarIcon,
//       description: 'تحليل الأسعار والتوصيات'
//     },
//     { 
//       id: 'portfolio', 
//       name: 'إدارة المحفظة', 
//       icon: WalletIcon,
//       description: 'إدارة رأس المال والأصول'
//     },
//     { 
//       id: 'investment', 
//       name: 'الاستثمار', 
//       icon: ArrowTrendingUpIcon,
//       description: 'استثمارات طويلة المدى'
//     },
//     { 
//       id: 'trading', 
//       name: 'التداول', 
//       icon: BoltIcon,
//       description: 'تداول قصير المدى ومضاربة'
//     },
//     { 
//       id: 'backtest', 
//       name: 'اختبار الاستراتيجيات', 
//       icon: BeakerIcon,
//       description: 'اختبار أداء الاستراتيجيات'
//     },
//     { 
//       id: 'comparison', 
//       name: 'مقارنة الأصول', 
//       icon: ScaleIcon,
//       description: 'مقارنة العملات والأصول'
//     }
//   ];

//   return (
//     <div className="space-y-4">
//       {/* Main Tab Navigation */}
//       <div className="flex flex-wrap gap-2">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`group flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === tab.id 
//                 ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg' 
//                 : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
//             }`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             <tab.icon className="w-5 h-5" />
//             <span className="hidden sm:block">{tab.name}</span>
//           </button>
//         ))}
//       </div>

//       {/* Active Tab Description */}
//       <div className="bg-white/5 rounded-lg p-3 border border-white/10">
//         <div className="flex items-center space-x-2 space-x-reverse">
//           {(() => {
//             const activeTabData = tabs.find(tab => tab.id === activeTab);
//             const IconComponent = activeTabData?.icon;
//             return IconComponent ? <IconComponent className="w-4 h-4 text-blue-400" /> : null;
//           })()}
//           <span className="text-blue-400 text-sm font-semibold">
//             {tabs.find(tab => tab.id === activeTab)?.name}
//           </span>
//           <span className="text-gray-400 text-sm">
//             - {tabs.find(tab => tab.id === activeTab)?.description}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };
// components/Dashboard/TabNavigation.js
import React from 'react';
import { 
  ChartBarIcon,
  WalletIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'analysis', name: 'التحليل', icon: ChartBarIcon },
    { id: 'portfolio', name: 'المحفظة', icon: WalletIcon },
    { id: 'investment', name: 'الاستثمار', icon: BanknotesIcon },
    { id: 'trading', name: 'التداول', icon: CurrencyDollarIcon },
    { id: 'backtest', name: 'المحاكاة', icon: ClockIcon },
    { id: 'comparison', name: 'المقارنة', icon: ScaleIcon }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
      <div className="flex space-x-2 space-x-reverse overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};