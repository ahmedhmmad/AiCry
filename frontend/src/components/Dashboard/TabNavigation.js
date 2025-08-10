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
