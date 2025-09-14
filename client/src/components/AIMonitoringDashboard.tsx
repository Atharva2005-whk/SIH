import React, { useState, useEffect } from 'react';
import { SafetyHeatMap } from './SafetyHeatMap';
import { AIAnomalyDetection } from './AIAnomalyDetection';
import {
  Brain,
  MapPin,
  AlertTriangle,
  Users,
  Activity,
  Shield,
  Eye,
  Settings,
  BarChart3,
  Globe,
  Layers,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface DashboardStats {
  totalTourists: number;
  safeCount: number;
  warningCount: number;
  dangerCount: number;
  offlineCount: number;
  anomaliesLast24h: number;
  averageResponseTime: number;
  systemUptime: number;
}

interface AlertSummary {
  id: string;
  type: 'route_deviation' | 'inactivity' | 'zone_breach' | 'communication_loss' | 'panic_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  touristName: string;
  location: string;
  timestamp: Date;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved';
}

export function AIMonitoringDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'heatmap' | 'anomalies'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTourists: 127,
    safeCount: 98,
    warningCount: 23,
    dangerCount: 4,
    offlineCount: 2,
    anomaliesLast24h: 12,
    averageResponseTime: 2.3,
    systemUptime: 99.8
  });

  // Mock alert data
  useEffect(() => {
    const mockAlerts: AlertSummary[] = [
      {
        id: 'alert-1',
        type: 'route_deviation',
        severity: 'medium',
        touristName: 'Carlos Rodriguez',
        location: 'Karol Bagh Market',
        timestamp: new Date(Date.now() - 300000),
        status: 'new'
      },
      {
        id: 'alert-2',
        type: 'zone_breach',
        severity: 'high',
        touristName: 'Yuki Tanaka',
        location: 'Construction Zone - East Delhi',
        timestamp: new Date(Date.now() - 600000),
        status: 'investigating'
      },
      {
        id: 'alert-3',
        type: 'inactivity',
        severity: 'medium',
        touristName: 'Emma Johnson',
        location: 'Red Fort Area',
        timestamp: new Date(Date.now() - 900000),
        status: 'acknowledged'
      }
    ];
    setAlerts(mockAlerts);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalTourists: prev.totalTourists + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3),
        averageResponseTime: Math.max(1.5, Math.min(3.5, prev.averageResponseTime + (Math.random() - 0.5) * 0.2)),
        systemUptime: Math.max(98, Math.min(100, prev.systemUptime + (Math.random() - 0.5) * 0.1))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500';
      case 'acknowledged': return 'bg-blue-500';
      case 'investigating': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'route_deviation': return <MapPin className="h-4 w-4" />;
      case 'inactivity': return <Activity className="h-4 w-4" />;
      case 'zone_breach': return <Shield className="h-4 w-4" />;
      case 'communication_loss': return <Globe className="h-4 w-4" />;
      case 'panic_pattern': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const navigation = [
    { name: 'Overview', id: 'overview', icon: BarChart3 },
    { name: 'Heat Map', id: 'heatmap', icon: MapPin },
    { name: 'AI Detection', id: 'anomalies', icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">AI Monitoring</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-2xl transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200 shadow-lg">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-lg font-semibold text-gray-900">AI Monitor</h1>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">System Status</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-lg font-semibold text-gray-900">{stats.systemUptime.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {activeView === 'heatmap' ? 'Safety Heat Map' : 
                   activeView === 'anomalies' ? 'AI Anomaly Detection' : 
                   'Dashboard Overview'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                {alerts.filter(a => a.status === 'new').length > 0 && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {alerts.filter(a => a.status === 'new').length}
                    </span>
                  </div>
                )}
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-blue-700 transition-colors">
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalTourists}</div>
                      <div className="text-xs text-green-600 flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +2.3%
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">Total Tourists</h3>
                  <p className="text-sm text-gray-600 mt-1">Currently monitored</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.safeCount}</div>
                      <div className="text-xs text-green-600">
                        {((stats.safeCount / stats.totalTourists) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">Safe Status</h3>
                  <p className="text-sm text-gray-600 mt-1">In secure zones</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.anomaliesLast24h}</div>
                      <div className="text-xs text-red-600 flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8.2%
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">Anomalies</h3>
                  <p className="text-sm text-gray-600 mt-1">Last 24 hours</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stats.averageResponseTime.toFixed(1)}s</div>
                      <div className="text-xs text-green-600 flex items-center justify-end">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        -5.1%
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900">Response Time</h3>
                  <p className="text-sm text-gray-600 mt-1">Average detection</p>
                </div>
              </div>

              {/* Tourist Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Tourist Status Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{stats.safeCount}</div>
                        <div className="text-sm text-gray-600">Safe</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{stats.warningCount}</div>
                        <div className="text-sm text-gray-600">Warning</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <div className="w-8 h-8 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{stats.dangerCount}</div>
                        <div className="text-sm text-gray-600">Danger</div>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{stats.offlineCount}</div>
                        <div className="text-sm text-gray-600">Offline</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200 h-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Alerts</h3>
                    <div className="space-y-4">
                      {alerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-2xl">
                          <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {alert.touristName}
                              </p>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`}></div>
                            </div>
                            <p className="text-xs text-gray-600">{alert.location}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All Alerts →
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveView('heatmap')}
                    className="flex items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl hover:from-green-100 hover:to-blue-100 transition-all duration-200"
                  >
                    <MapPin className="h-8 w-8 text-green-600 mr-4" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">View Heat Map</div>
                      <div className="text-sm text-gray-600">Safety zones overview</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveView('anomalies')}
                    className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200"
                  >
                    <Brain className="h-8 w-8 text-purple-600 mr-4" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">AI Detection</div>
                      <div className="text-sm text-gray-600">Anomaly analysis</div>
                    </div>
                  </button>

                  <button className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl hover:from-orange-100 hover:to-red-100 transition-all duration-200">
                    <AlertTriangle className="h-8 w-8 text-orange-600 mr-4" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Emergency Mode</div>
                      <div className="text-sm text-gray-600">Activate alerts</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'heatmap' && <SafetyHeatMap />}
          {activeView === 'anomalies' && <AIAnomalyDetection />}
        </div>
      </div>
    </div>
  );
}
