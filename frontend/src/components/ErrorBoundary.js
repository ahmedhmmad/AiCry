// frontend/src/components/ErrorBoundary.js

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  HomeIcon 
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
          <motion.div
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-red-500/20 shadow-2xl text-center max-w-md w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <ExclamationTriangleIcon className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-4">
              حدث خطأ غير متوقع
            </h2>

            <p className="text-gray-300 mb-6 leading-relaxed">
              نعتذر، حدث خطأ أثناء تشغيل التطبيق. 
              يرجى إعادة تحميل الصفحة أو المحاولة مرة أخرى.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-red-400 cursor-pointer mb-2">
                  تفاصيل الخطأ (وضع التطوير)
                </summary>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 overflow-auto max-h-32">
                  <div className="font-mono">
                    {this.state.error && this.state.error.toString()}
                  </div>
                  <div className="mt-2 font-mono text-red-400">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>إعادة تحميل</span>
              </motion.button>

              <motion.button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <HomeIcon className="w-4 h-4" />
                <span>الصفحة الرئيسية</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
