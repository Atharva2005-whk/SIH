import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Shield, 
  User, 
  Globe, 
  Eye, 
  Save,
  AlertCircle,
  Check,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Local type definitions
type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

interface NotificationPreference {
  type: string;
  enabled: boolean;
  methods?: string[];
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  countryCode: string;
  isPrimary: boolean;
}

interface UserSettings {
  theme: Theme;
  language: Language;
  notificationPreferences: NotificationPreference[];
  privacySettings: {
    shareLocationWithAuthorities: boolean;
    shareLocationWithEmergencyServices: boolean;
    allowLocationTracking: boolean;
    shareProfileWithOtherTourists: boolean;
    allowDataAnalytics: boolean;
    allowMarketingCommunications: boolean;
  };
  accessibilitySettings: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  emergencyContacts: EmergencyContact[];
}

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
};

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  emergency: 'Emergency Alerts',
  safety: 'Safety Updates',
  location: 'Location Updates',
  general: 'General Notifications',
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  { type: 'emergency', enabled: true, methods: ['push', 'sms'] },
  { type: 'safety', enabled: true, methods: ['push'] },
  { type: 'location', enabled: false, methods: ['push'] },
  { type: 'general', enabled: true, methods: ['push'] },
];

interface SettingsPageProps {
  userSettings?: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => Promise<void>;
  onAddEmergencyContact?: (contact: EmergencyContact) => Promise<void>;
  onRemoveEmergencyContact?: (contactId: string) => Promise<void>;
}

export function SettingsPage({
  userSettings,
  onSaveSettings,
  onAddEmergencyContact,
  onRemoveEmergencyContact,
}: SettingsPageProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Form states
  const [language, setLanguage] = useState<Language>(userSettings?.language || 'en');
  const [notifications, setNotifications] = useState<NotificationPreference[]>(
    userSettings?.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [privacySettings, setPrivacySettings] = useState(
    userSettings?.privacySettings || {
      shareLocationWithAuthorities: true,
      shareLocationWithEmergencyServices: true,
      allowLocationTracking: true,
      shareProfileWithOtherTourists: false,
      allowDataAnalytics: true,
      allowMarketingCommunications: false,
    }
  );
  const [accessibilitySettings, setAccessibilitySettings] = useState(
    userSettings?.accessibilitySettings || {
      fontSize: 'medium' as const,
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      keyboardNavigation: false,
    }
  );
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    userSettings?.emergencyContacts || []
  );
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({});
  const [showAddContact, setShowAddContact] = useState(false);

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('saving');

    try {
      await onSaveSettings({
        theme,
        language,
        notificationPreferences: notifications,
        privacySettings,
        accessibilitySettings,
        emergencyContacts,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Update notification preference
  const updateNotification = (type: string, enabled: boolean, methods?: string[]) => {
    setNotifications(prev => 
      prev.map(pref => 
        pref.type === type 
          ? { ...pref, enabled, ...(methods && { methods }) }
          : pref
      )
    );
  };

  // Add emergency contact
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) return;

    const contact: EmergencyContact = {
      id: crypto.randomUUID?.() || Math.random().toString(36),
      name: newContact.name,
      relationship: newContact.relationship || '',
      phoneNumber: newContact.phoneNumber,
      email: newContact.email,
      countryCode: newContact.countryCode || '+1',
      isPrimary: emergencyContacts.length === 0, // First contact is primary
    };

    try {
      if (onAddEmergencyContact) {
        await onAddEmergencyContact(contact);
      }
      setEmergencyContacts(prev => [...prev, contact]);
      setNewContact({});
      setShowAddContact(false);
    } catch (error) {
      console.error('Failed to add emergency contact:', error);
    }
  };

  // Remove emergency contact
  const handleRemoveContact = async (contactId: string) => {
    try {
      if (onRemoveEmergencyContact) {
        await onRemoveEmergencyContact(contactId);
      }
      setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Failed to remove emergency contact:', error);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'emergency', label: 'Emergency Contacts', icon: Phone },
    { id: 'account', label: 'Account', icon: User },
  ];

  const themeOptions: { value: Theme; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Appearance
                  </h3>
                  
                  {/* Theme Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {themeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setTheme(option.value)}
                            className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${
                              theme === option.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <Icon className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                        <option key={code} value={code}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Notification Preferences
                </h3>
                
                <div className="space-y-4">
                  {notifications.map((pref) => (
                    <div key={pref.type} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {NOTIFICATION_TYPE_LABELS[pref.type]}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Methods: {pref.methods.join(', ')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pref.enabled}
                          onChange={(e) => updateNotification(pref.type, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Privacy & Data
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(privacySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => 
                            setPrivacySettings(prev => ({ ...prev, [key]: e.target.checked }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Emergency Contacts
                  </h3>
                  <button
                    onClick={() => setShowAddContact(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    Add Contact
                  </button>
                </div>

                {/* Existing Contacts */}
                <div className="space-y-3">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {contact.name}
                            </h4>
                            {contact.isPrimary && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.relationship} • {contact.countryCode} {contact.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => contact.id && handleRemoveContact(contact.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Contact Form */}
                {showAddContact && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Add Emergency Contact
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={newContact.name || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <input
                        type="text"
                        placeholder="Relationship *"
                        value={newContact.relationship || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <div className="flex space-x-2">
                        <select
                          value={newContact.countryCode || '+1'}
                          onChange={(e) => setNewContact(prev => ({ ...prev, countryCode: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="+1">+1 (US)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+49">+49 (DE)</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={newContact.phoneNumber || ''}
                          onChange={(e) => setNewContact(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={newContact.email || ''}
                        onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleAddContact}
                        disabled={!newContact.name || !newContact.phoneNumber}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Contact
                      </button>
                      <button
                        onClick={() => {
                          setShowAddContact(false);
                          setNewContact({});
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs would be implemented similarly... */}
          </div>

          {/* Save Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {saveStatus === 'success' && (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">Settings saved successfully!</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-600">Failed to save settings. Please try again.</span>
                  </>
                )}
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center space-x-2 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
