// IconSystem.js - نظام شامل للأيقونات والرموز

import React from 'react';
import {
  // أيقونات التحليل
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  
  // أيقونات الأعمال
  CpuChipIcon,
  BoltIcon,
  SparklesIcon,
  LightBulbIcon,
  FireIcon,
  
  // أيقونات التداول
  CurrencyDollarIcon,
  BanknotesIcon,
  WalletIcon,
  ScaleIcon,
  
  // أيقونات التحكم
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  ClockIcon,
  CogIcon,
  Cog6ToothIcon,
  
  // أيقونات الحالة
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  XCircleIcon,
  
  // أيقونات أخرى
  EyeIcon,
  EyeSlashIcon,
  CalculatorIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// مكون أيقونة الإشارة مع الألوان
export const SignalIcon = ({ signal, size = 'w-6 h-6', className = '' }) => {
  const getSignalIcon = (signal) => {
    const normalizedSignal = signal?.toUpperCase().replace(/[_\s]/g, '');
    
    switch (normalizedSignal) {
      case 'STRONGBUY':
        return { Icon: ArrowTrendingUpIcon, emoji: '🚀', color: 'text-emerald-400' };
      case 'BUY':
        return { Icon: ArrowTrendingUpIcon, emoji: '📈', color: 'text-green-400' };
      case 'WEAKBUY':
        return { Icon: ArrowTrendingUpIcon, emoji: '↗️', color: 'text-green-300' };
      case 'HOLD':
      case 'WAIT':
        return { Icon: MinusIcon, emoji: '⏸️', color: 'text-amber-400' };
      case 'WEAKSELL':
        return { Icon: ArrowTrendingDownIcon, emoji: '↘️', color: 'text-orange-400' };
      case 'SELL':
        return { Icon: ArrowTrendingDownIcon, emoji: '📉', color: 'text-red-400' };
      case 'STRONGSELL':
        return { Icon: ArrowTrendingDownIcon, emoji: '🔻', color: 'text-red-500' };
      default:
        return { Icon: MinusIcon, emoji: '⏸️', color: 'text-gray-400' };
    }
  };

  const { Icon, color } = getSignalIcon(signal);
  
  return <Icon className={`${size} ${color} ${className}`} />;
};

// مكون أيقونة الحالة
export const StatusIcon = ({ status, size = 'w-5 h-5', className = '' }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'connected':
      case 'active':
        return { Icon: CheckCircleIcon, color: 'text-emerald-400' };
      case 'warning':
      case 'pending':
        return { Icon: ExclamationTriangleIcon, color: 'text-amber-400' };
      case 'error':
      case 'failed':
      case 'disconnected':
        return { Icon: XCircleIcon, color: 'text-red-400' };
      case 'info':
      case 'loading':
        return { Icon: InformationCircleIcon, color: 'text-cyan-400' };
      default:
        return { Icon: InformationCircleIcon, color: 'text-gray-400' };
    }
  };

  const { Icon, color } = getStatusIcon(status);
  
  return <Icon className={`${size} ${color} ${className}`} />;
};

// مكون أيقونة متحركة للتحميل
export const LoadingIcon = ({ size = 'w-5 h-5', className = '' }) => {
  return (
    <ArrowPathIcon 
      className={`${size} text-cyan-400 animate-spin ${className}`} 
    />
  );
};

// مكون نقطة الحالة المتحركة
export const StatusDot = ({ status, className = '' }) => {
  const getStatusDotColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'connected':
      case 'active':
        return 'bg-emerald-400';
      case 'warning':
      case 'pending':
        return 'bg-amber-400';
      case 'error':
      case 'failed':
      case 'disconnected':
        return 'bg-red-400';
      case 'info':
      case 'loading':
        return 'bg-cyan-400';
      default:
        return 'bg-gray-400';
    }
  };

  const dotColor = getStatusDotColor(status);
  
  return (
    <div 
      className={`w-2 h-2 rounded-full animate-pulse ${dotColor} ${className}`} 
    />
  );
};

// مجموعة أيقونات التبويبات
export const TabIcons = {
  analysis: ChartBarIcon,
  'ai-insights': SparklesIcon,
  portfolio: WalletIcon,
  investment: BanknotesIcon,
  trading: CurrencyDollarIcon,
  simulation: ClockIcon,
  comparison: ScaleIcon,
  settings: CogIcon
};

// مجموعة أيقونات الأدوات
export const ToolIcons = {
  refresh: ArrowPathIcon,
  ai: CpuChipIcon,
  signal: BoltIcon,
  wyckoff: FireIcon,
  calculate: CalculatorIcon,
  chart: DocumentChartBarIcon,
  settings: Cog6ToothIcon,
  play: PlayIcon,
  stop: StopIcon,
  show: EyeIcon,
  hide: EyeSlashIcon,
  adjust: AdjustmentsHorizontalIcon,
  security: ShieldCheckIcon
};

// مكون أيقونة مخصصة مع تأثيرات
export const EnhancedIcon = ({ 
  icon, 
  size = 'w-6 h-6', 
  color = 'text-gray-400',
  hover = true,
  glow = false,
  spin = false,
  pulse = false,
  className = '' 
}) => {
  const Icon = typeof icon === 'string' ? ToolIcons[icon] : icon;
  
  if (!Icon) return null;

  const effects = [
    size,
    color,
    hover && 'hover:scale-110 transition-transform',
    glow && 'drop-shadow-lg',
    spin && 'animate-spin',
    pulse && 'animate-pulse',
    className
  ].filter(Boolean).join(' ');

  return <Icon className={effects} />;
};

// مكون رمز تعبيري مع تأثيرات
export const EmojiIcon = ({ 
  emoji, 
  size = 'text-2xl', 
  hover = true,
  bounce = false,
  className = '' 
}) => {
  const effects = [
    size,
    hover && 'hover:scale-110 transition-transform cursor-default',
    bounce && 'animate-bounce',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={effects} role="img" aria-label="icon">
      {emoji}
    </span>
  );
};

// مجموعة الرموز التعبيرية للتداول
export const TradingEmojis = {
  signals: {
    strongBuy: '🚀',
    buy: '📈', 
    weakBuy: '↗️',
    hold: '⏸️',
    weakSell: '↘️',
    sell: '📉',
    strongSell: '🔻'
  },
  
  status: {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    loading: '🔄',
    connected: '🟢',
    disconnected: '🔴'
  },
  
  tools: {
    ai: '🤖',
    analysis: '📊',
    wyckoff: '🔥',
    money: '💰',
    chart: '📈',
    time: '⏰',
    settings: '⚙️',
    alert: '🚨',
    target: '🎯',
    shield: '🛡️'
  },

  crypto: {
    bitcoin: '₿',
    ethereum: 'Ξ',
    binance: '🔶',
    up: '🔝',
    down: '📉',
    rocket: '🚀',
    moon: '🌙',
    diamond: '💎',
    hands: '🙌'
  }
};

// مكون أيقونة العملة المشفرة
export const CryptoIcon = ({ symbol, size = 'w-6 h-6', className = '' }) => {
  const getCryptoEmoji = (symbol) => {
    const normalizedSymbol = symbol?.toUpperCase().replace('USDT', '');
    
    switch (normalizedSymbol) {
      case 'BTC':
        return '₿';
      case 'ETH':
        return 'Ξ';
      case 'BNB':
        return '🔶';
      case 'ADA':
        return '🔵';
      case 'SOL':
        return '🌞';
      case 'DOT':
        return '🔴';
      case 'LINK':
        return '🔗';
      case 'MATIC':
        return '🔮';
      default:
        return '🪙';
    }
  };

  const emoji = getCryptoEmoji(symbol);
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${size} ${className}`}
      title={symbol}
    >
      {emoji}
    </span>
  );
};

// مكون مؤشر الاتجاه
export const TrendIndicator = ({ 
  direction, 
  strength = 'normal',
  size = 'w-6 h-6',
  animated = true,
  className = '' 
}) => {
  const getTrendIcon = (direction, strength) => {
    const isUp = direction > 0;
    const isStrong = Math.abs(direction) > 0.5 || strength === 'strong';
    
    if (isUp) {
      return {
        Icon: ArrowTrendingUpIcon,
        color: isStrong ? 'text-emerald-400' : 'text-green-400',
        emoji: isStrong ? '🚀' : '📈'
      };
    } else if (direction < 0) {
      return {
        Icon: ArrowTrendingDownIcon,
        color: isStrong ? 'text-red-500' : 'text-red-400',
        emoji: isStrong ? '🔻' : '📉'
      };
    } else {
      return {
        Icon: MinusIcon,
        color: 'text-amber-400',
        emoji: '⏸️'
      };
    }
  };

  const { Icon, color } = getTrendIcon(direction, strength);
  const effects = [
    size,
    color,
    animated && 'transition-all duration-300',
    className
  ].filter(Boolean).join(' ');

  return <Icon className={effects} />;
};

// مكون شريط قوة الإشارة
export const SignalStrengthBar = ({ 
  strength, 
  maxBars = 5,
  color = 'emerald',
  className = '' 
}) => {
  const bars = Math.round((strength / 100) * maxBars);
  
  return (
    <div className={`flex items-end space-x-1 space-x-reverse ${className}`}>
      {Array.from({ length: maxBars }).map((_, index) => (
        <div
          key={index}
          className={`w-1 transition-all duration-300 ${
            index < bars 
              ? `bg-${color}-400 h-3` 
              : 'bg-gray-600 h-1'
          }`}
          style={{
            height: index < bars ? `${(index + 1) * 4}px` : '4px'
          }}
        />
      ))}
    </div>
  );
};

// تصدير المكونات والمجموعات
export {
  TabIcons,
  ToolIcons,
  TradingEmojis
};

export default {
  SignalIcon,
  StatusIcon,
  LoadingIcon,
  StatusDot,
  EnhancedIcon,
  EmojiIcon,
  CryptoIcon,
  TrendIndicator,
  SignalStrengthBar,
  TabIcons,
  ToolIcons,
  TradingEmojis
};
