// frontend/src/components/NotificationSystem.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // إضافة إشعار جديد
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // إزالة الإشعار تلقائياً
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  // إزالة إشعار
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // أيقونات الإشعارات
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-400" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-400" />;
    }
  };

  // ألوان الإشعارات
  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'from-green-500/20 to-emerald-500/10 border-green-500/30';
      case 'warning':
        return 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 'error':
        return 'from-red-500/20 to-rose-500/10 border-red-500/30';
      default:
        return 'from-blue-500/20 to-indigo-500/10 border-blue-500/30';
    }
  };

  // تعريض دالة إضافة الإشعار للاستخدام الخارجي
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-100 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={`bg-gradient-to-r ${getColors(notification.type)} backdrop-blur-xl rounded-xl p-4 border shadow-xl max-w-sm`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 text-white">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* شريط التقدم للإشعار */}
            <motion.div
              className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: notification.duration / 1000, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
