// frontend/src/components/utils/colorSystem.js
export const colorSystem = {
  signals: {
    strongBuy: {
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      bg: 'bg-emerald-500',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/50',
    },
    buy: {
      gradient: 'from-green-500 via-emerald-500 to-green-600', 
      bg: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500/30',
      glow: 'shadow-green-500/50',
    },
    weakBuy: {
      gradient: 'from-green-400 via-green-500 to-emerald-400',
      bg: 'bg-green-400',
      text: 'text-green-300',
      border: 'border-green-400/30',
      glow: 'shadow-green-400/40',
    },
    hold: {
      gradient: 'from-amber-500 via-yellow-500 to-orange-400',
      bg: 'bg-amber-500',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/50',
    },
    weakSell: {
      gradient: 'from-orange-500 via-red-400 to-orange-600',
      bg: 'bg-orange-500',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/50',
    },
    sell: {
      gradient: 'from-red-500 via-red-600 to-red-500',
      bg: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500/30',
      glow: 'shadow-red-500/50',
    },
    strongSell: {
      gradient: 'from-red-600 via-red-700 to-red-800',
      bg: 'bg-red-600',
      text: 'text-red-400',
      border: 'border-red-600/30',
      glow: 'shadow-red-600/60',
    }
  },

  status: {
    success: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      level: 'منخفض'
    },
    warning: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      level: 'متوسط'
    },
    danger: {
      text: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      level: 'عالي'
    },
    info: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
    },
    neutral: {
      text: 'text-slate-400',
      bg: 'bg-slate-500/20',
      border: 'border-slate-500/30',
    }
  },

  cards: {
    primary: 'bg-slate-800/60 border-slate-700/50',
    secondary: 'bg-slate-700/50 border-slate-600/40',
    success: 'bg-emerald-900/20 border-emerald-500/30',
    warning: 'bg-amber-900/20 border-amber-500/30',
    danger: 'bg-red-900/20 border-red-500/30',
    info: 'bg-cyan-900/20 border-cyan-500/30',
    wyckoff: 'bg-amber-900/30 border-amber-500/30',
    ai: 'bg-purple-900/30 border-purple-500/30'
  },

  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
    accent: 'text-cyan-400',
  },

  backgrounds: {
    main: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
    header: 'bg-slate-800/60',
    card: 'bg-slate-800/60',
  },

  interactive: {
    hover: 'hover:bg-white/10',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-cyan-500/50',
  }
};

export const getSignalColor = (signal) => {
  const normalizedSignal = signal?.toUpperCase().replace(/[_\s]/g, '');
  
  switch (normalizedSignal) {
    case 'STRONGBUY':
      return colorSystem.signals.strongBuy;
    case 'BUY':
      return colorSystem.signals.buy;
    case 'WEAKBUY':
      return colorSystem.signals.weakBuy;
    case 'HOLD':
    case 'WAIT':
      return colorSystem.signals.hold;
    case 'WEAKSELL':
      return colorSystem.signals.weakSell;
    case 'SELL':
      return colorSystem.signals.sell;
    case 'STRONGSELL':
      return colorSystem.signals.strongSell;
    default:
      return colorSystem.signals.hold;
  }
};

export const getSignalText = (signal) => {
  const textMap = {
    'STRONG_BUY': '🚀 شراء قوي',
    'BUY': '📈 شراء',
    'WEAK_BUY': '↗️ شراء ضعيف',
    'HOLD': '⏸️ انتظار',
    'WEAK_SELL': '↘️ بيع ضعيف', 
    'SELL': '📉 بيع',
    'STRONG_SELL': '🔻 بيع قوي'
  };
  return textMap[signal] || '⏸️ انتظار';
};

export const getRiskLevel = (confidence) => {
  if (confidence >= 80) return { ...colorSystem.status.success, level: 'منخفض' };
  if (confidence >= 60) return { ...colorSystem.status.warning, level: 'متوسط' };
  return { ...colorSystem.status.danger, level: 'عالي' };
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'connected':
    case 'active':
      return colorSystem.status.success;
    case 'warning':
    case 'pending':
      return colorSystem.status.warning;
    case 'error':
    case 'failed':
    case 'disconnected':
      return colorSystem.status.danger;
    case 'info':
    case 'loading':
      return colorSystem.status.info;
    default:
      return colorSystem.status.neutral;
  }
};

export default colorSystem;