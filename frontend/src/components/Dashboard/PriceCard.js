import React from 'react';
import { ChartBarIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const PriceCard = ({ loading, currentPrice, lastUpdate }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">السعر الحالي</h3>
        <ChartBarIcon className="w-6 h-6 text-blue-400" />
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <ArrowPathIcon className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-blue-400">جاري التحميل...</span>
          </div>
        </div>
      ) : currentPrice ? (
        <div>
          <div className="text-3xl font-bold text-white mb-2">
            ${currentPrice?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 flex items-center space-x-2 space-x-reverse">
            <ClockIcon className="w-4 h-4" />
            <span>آخر تحديث: {lastUpdate}</span>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-center">لا توجد بيانات</div>
      )}
    </div>
  );
};