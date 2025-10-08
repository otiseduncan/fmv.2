import React, { useState } from 'react';
import { User, Bell, Shield, Database, Palette, Globe, Save, Check } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { useAuth } from '@/contexts/AuthContext';

const Settings: React.FC = () => {
  const { profile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [settings, setSettings] = useState({

    phone: '+1 555-0101',
    notifications: {
      email: true,
      sms: true,
      critical: true,
      tasks: true,
      weather: false
    },
    units: 'imperial',
    theme: 'light',
    language: 'en'
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-8 text-glass-primary">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-glass-secondary">Manage your account and preferences</p>
      </div>

      <div className="glass-card rounded-xl">
        <div className="border-b border-white/20">
          <div className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-glass-secondary hover:text-glass-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <UserProfile />
          )}


          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 text-glass-primary">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Get text messages for urgent updates' },
                  { key: 'critical', label: 'Critical Alerts', desc: 'Immediate notifications for critical job issues' },
                  { key: 'tasks', label: 'Task Reminders', desc: 'Reminders for upcoming and overdue tasks' },
                  { key: 'weather', label: 'Weather Alerts', desc: 'Daily weather updates and severe weather warnings' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div>
                      <p className="font-medium text-glass-primary">{item.label}</p>
                      <p className="text-sm text-glass-secondary">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [item.key]: !settings.notifications[item.key as keyof typeof settings.notifications]
                        }
                      })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'bg-primary'
                          : 'bg-white/20'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'translate-x-6'
                          : ''
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 text-glass-primary">Security Settings</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-glass-primary mb-3">Change Password</p>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary placeholder:text-glass-secondary/60"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary placeholder:text-glass-secondary/60"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary placeholder:text-glass-secondary/60"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-glass-primary mb-2">Two-Factor Authentication</p>
                  <p className="text-sm text-glass-secondary mb-3">Add an extra layer of security to your account</p>
                  <button className="cherry-red-btn px-4 py-2 rounded-lg">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 text-glass-primary">Data Management</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-glass-primary mb-2">Export Data</p>
                  <p className="text-sm text-glass-secondary mb-3">Download all your job and task data</p>
                  <div className="flex gap-3">
                    <button className="cherry-red-btn px-4 py-2 rounded-lg">
                      Export as CSV
                    </button>
                    <button className="cherry-red-btn px-4 py-2 rounded-lg">
                      Export as JSON
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="font-medium text-glass-primary mb-2">Automatic Backups</p>
                  <p className="text-sm text-glass-secondary mb-3">Last backup: Today at 3:00 AM</p>
                  <button className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-glass-primary transition-colors">
                    Backup Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
                  <select
                    value={settings.units}
                    onChange={(e) => setSettings({...settings, units: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="imperial">Imperial (mi, °F)</option>
                    <option value="metric">Metric (km, °C)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'cherry-red-btn'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
