// frontend/src/components/Settings.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CogIcon,
  PaletteIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Settings = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'ar',
    notifications: true,
    soundEffects: true,
    autoRefresh: true,
    showPrices: true,
    currency: 'USD',
    refreshInterval: 30
  });

  const sections = [
    { id: 'appearance', name: 'المظهر', icon: PaletteIcon },
    { id: 'notifications', name: 'الإشعارات', icon: BellIcon },
    { id: 'privacy', name: 'الخصوصية', icon: ShieldCheckIcon },
    { id: 'language', name: 'اللغة والمنطقة', icon: GlobeAltIcon }
  ];

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* خلفية مظلمة */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* نافذة الإعدادات */}
          <motion.div
            className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* رأس الإعدادات */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <CogIcon className="w-8 h-8 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">الإعدادات</h2>
                </div>
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex h-96">
              {/* القائمة الجانبية */}
              <div className="w-64 bg-white/5 border-r border-white/10 p-4">
                <div className="space-y-2">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <motion.button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-lg transition-all duration-300 ${
                          activeSection === section.id
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{section.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* محتوى الإعدادات */}
              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeSection === 'appearance' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white mb-4">إعدادات المظهر</h3>
                        
                        {/* نمط السمة */}
                        <div className="space-y-3">
                          <label className="block text-gray-300 font-medium">السمة</label>
                          <div className="flex space-x-3 space-x-reverse">
                            {[
                              { id: 'dark', name: 'داكن', icon: MoonIcon },
                              { id: 'light', name: 'فاتح', icon: SunIcon }
                            ].map((theme) => {
                              const IconComponent = theme.icon;
                              return (
                                <button
                                  key={theme.id}
                                  onClick={() => updateSetting('theme', theme.id)}
                                  className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border transition-all ${
                                    settings.theme === theme.id
                                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                  }`}
                                >
                                  <IconComponent className="w-5 h-5" />
                                  <span>{theme.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* عرض الأسعار */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-gray-300 font-medium">عرض الأسعار</label>
                            <p className="text-sm text-gray-500">إظهار أسعار العملات في القوائم</p>
                          </div>
                          <button
                            onClick={() => updateSetting('showPrices', !settings.showPrices)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.showPrices ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.showPrices ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* العملة المفضلة */}
                        <div className="space-y-3">
                          <label className="block text-gray-300 font-medium">العملة المفضلة</label>
                          <select
                            value={settings.currency}
                            onChange={(e) => updateSetting('currency', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                          >
                            <option value="USD" className="bg-gray-800">دولار أمريكي (USD)</option>
                            <option value="EUR" className="bg-gray-800">يورو (EUR)</option>
                            <option value="SAR" className="bg-gray-800">ريال سعودي (SAR)</option>
                            <option value="AED" className="bg-gray-800">درهم إماراتي (AED)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {activeSection === 'notifications' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white mb-4">إعدادات الإشعارات</h3>
                        
                        {/* الإشعارات العامة */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-gray-300 font-medium">تفعيل الإشعارات</label>
                            <p className="text-sm text-gray-500">استقبال إشعارات عن التحديثات والتنبيهات</p>
                          </div>
                          <button
                            onClick={() => updateSetting('notifications', !settings.notifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.notifications ? 'bg-green-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* المؤثرات الصوتية */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-gray-300 font-medium">المؤثرات الصوتية</label>
                            <p className="text-sm text-gray-500">تشغيل الأصوات عند الإشعارات</p>
                          </div>
                          <button
                            onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.soundEffects ? 'bg-purple-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* التحديث التلقائي */}
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-gray-300 font-medium">التحديث التلقائي</label>
                            <p className="text-sm text-gray-500">تحديث البيانات تلقائياً</p>
                          </div>
                          <button
                            onClick={() => updateSetting('autoRefresh', !settings.autoRefresh)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* فترة التحديث */}
                        {settings.autoRefresh && (
                          <div className="space-y-3">
                            <label className="block text-gray-300 font-medium">فترة التحديث (ثانية)</label>
                            <input
                              type="range"
                              min="10"
                              max="300"
                              step="10"
                              value={settings.refreshInterval}
                              onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="text-center text-blue-400 font-semibold">
                              {settings.refreshInterval} ثانية
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeSection === 'privacy' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white mb-4">إعدادات الخصوصية</h3>
                        
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <div className="flex items-center space-x-2 space-x-reverse text-yellow-400 mb-2">
                            <ShieldCheckIcon className="w-5 h-5" />
                            <span className="font-semibold">أمان البيانات</span>
                          </div>
                          <p className="text-sm text-gray-300">
                            جميع البيانات مشفرة ومحفوظة محلياً على جهازك فقط. 
                            لا نقوم بجمع أو مشاركة أي معلومات شخصية.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">تخزين البيانات محلياً</span>
                            <span className="text-green-400">✓ مفعل</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">تشفير البيانات</span>
                            <span className="text-green-400">✓ مفعل</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">مشاركة البيانات</span>
                            <span className="text-red-400">✗ معطل</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === 'language' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white mb-4">اللغة والمنطقة</h3>
                        
                        {/* اللغة */}
                        <div className="space-y-3">
                          <label className="block text-gray-300 font-medium">اللغة</label>
                          <select
                            value={settings.language}
                            onChange={(e) => updateSetting('language', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                          >
                            <option value="ar" className="bg-gray-800">العربية</option>
                            <option value="en" className="bg-gray-800">English</option>
                          </select>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-sm text-gray-300">
                            <strong className="text-blue-400">ملاحظة:</strong> 
                            تغيير اللغة سيتطلب إعادة تحميل التطبيق لتطبيق التغييرات.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="bg-white/5 border-t border-white/10 p-4 flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                إلغاء
              </button>
              
              <motion.button
                onClick={() => {
                  // حفظ الإعدادات
                  localStorage.setItem('appSettings', JSON.stringify(settings));
                  if (window.showNotification) {
                    window.showNotification('تم حفظ الإعدادات بنجاح!', 'success');
                  }
                  onClose();
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                حفظ التغييرات
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Settings;
