import React, { useState, useEffect } from 'react';
import ChartDisplay from './ChartDisplay';
import AuditTrail from './AuditTrail';
import EditableTimeEntries from './EditableTimeEntries';
import ProjectManager from './ProjectManager';
import Alerts from './Alerts';
import BudgetNotification from './BudgetNotification';
import Forecasting from './Forecasting';
import { clearAllTimesheetData, clearTimeLogsOnly, clearEventLogsOnly } from '../utils/clearData';
import { getUnreadAlertsCount } from '../utils/projectUtils';
import { getForecastingSummary } from '../utils/forecastingUtils';
import { addSampleData } from '../utils/sampleData';
import cgiLogo from '../assets/cgi-logo.jpg';

const ManagerDashboard = ({ user, onLogout }) => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, projects, audit, entries, analytics, alerts, forecasting
  const [selectedUser, setSelectedUser] = useState('all');

  useEffect(() => {
    // Load time logs from localStorage
    const savedLogs = localStorage.getItem('timesheetLogs');
    if (savedLogs) {
      setTimeLogs(JSON.parse(savedLogs));
    }

    // Load event logs from localStorage
    const savedEvents = localStorage.getItem('timesheetEventLogs');
    if (savedEvents) {
      setEventLogs(JSON.parse(savedEvents));
    }

  }, []);

  const handleLogout = () => {
    onLogout();
  };

  const addEventLog = (event) => {
    const newEvents = [...eventLogs, event];
    setEventLogs(newEvents);
    localStorage.setItem('timesheetEventLogs', JSON.stringify(newEvents));
  };

  const updateTimeLog = (updatedLog) => {
    const newLogs = timeLogs.map(log => log.id === updatedLog.id ? updatedLog : log);
    setTimeLogs(newLogs);
    localStorage.setItem('timesheetLogs', JSON.stringify(newLogs));
    
    // Log the edit event
    addEventLog({
      type: 'LOG_EDITED',
      timestamp: new Date().toISOString(),
      message: `Edited time entry for project ${updatedLog.projectCode}`,
      username: user.username,
      projectCode: updatedLog.projectCode
    });
  };

  const deleteTimeLog = (logId) => {
    const logToDelete = timeLogs.find(log => log.id === logId);
    const newLogs = timeLogs.filter(log => log.id !== logId);
    setTimeLogs(newLogs);
    localStorage.setItem('timesheetLogs', JSON.stringify(newLogs));
    
    // Log the delete event
    addEventLog({
      type: 'LOG_DELETED',
      timestamp: new Date().toISOString(),
      message: `Deleted time entry for project ${logToDelete.projectCode}`,
      username: user.username,
      projectCode: logToDelete.projectCode
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL timesheet data? This action cannot be undone.')) {
      clearAllTimesheetData();
      setTimeLogs([]);
      setEventLogs([]);
      alert('All timesheet data has been cleared successfully!');
    }
  };

  const handleClearTimeLogs = () => {
    if (window.confirm('Are you sure you want to clear all time logs? This action cannot be undone.')) {
      clearTimeLogsOnly();
      setTimeLogs([]);
      alert('Time logs have been cleared successfully!');
    }
  };

  const handleClearEventLogs = () => {
    if (window.confirm('Are you sure you want to clear all event logs? This action cannot be undone.')) {
      clearEventLogsOnly();
      setEventLogs([]);
      alert('Event logs have been cleared successfully!');
    }
  };

  const handleAddSampleData = () => {
    if (window.confirm('Add sample data for testing forecasting analytics? This will add projects and time logs.')) {
      addSampleData();
      // Reload data
      const savedLogs = localStorage.getItem('timesheetLogs');
      if (savedLogs) {
        setTimeLogs(JSON.parse(savedLogs));
      }
      alert('Sample data added successfully! Refresh the page to see forecasting analytics.');
    }
  };

  const handleProjectsUpdate = (projects) => {
    // Trigger a custom event to notify other components about project updates
    window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: projects }));
  };

  // Get unique users from logs
  const users = Array.from(new Set(timeLogs.map(log => log.username))).map(username => ({
    username,
    name: username // In a real app, you'd have user names
  }));

  // Filter logs based on selected user
  const filteredLogs = selectedUser === 'all' 
    ? timeLogs 
    : timeLogs.filter(log => log.username === selectedUser);

  // Get recent activity (last 24 hours)
  const last24h = new Date();
  last24h.setDate(last24h.getDate() - 1);
  const recentActivity = eventLogs.filter(event => new Date(event.timestamp) >= last24h);

  // Calculate summary statistics
  const totalHours = timeLogs.reduce((sum, log) => sum + (log.timeSpent / 3600), 0);
  const totalEntries = timeLogs.length;
  const activeUsers = new Set(timeLogs.map(log => log.username)).size;
  const budgetAlertsCount = getUnreadAlertsCount();
  const forecastingSummary = getForecastingSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={cgiLogo} alt="CGI Logo" className="h-10 w-auto mr-4" />
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <span className="ml-4 px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                {user.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              
              {/* Budget Notification */}
              <BudgetNotification user={user} />
              
              {/* Clear Data Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleAddSampleData}
                  className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Add sample data for testing"
                >
                  Add Sample Data
                </button>
                <button
                  onClick={handleClearTimeLogs}
                  className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Clear all time logs"
                >
                  Clear Logs
                </button>
                <button
                  onClick={handleClearEventLogs}
                  className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  title="Clear all event logs"
                >
                  Clear Events
                </button>
                <button
                  onClick={handleClearAllData}
                  className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Clear all timesheet data"
                >
                  Clear All
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Audit Trail
            </button>
            <button
              onClick={() => setActiveTab('entries')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Time Entries
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('forecasting')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'forecasting'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Forecasting
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alerts
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Hours</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalHours.toFixed(1)}h</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Entries</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalEntries}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Last 24h Activity</p>
                    <p className="text-2xl font-semibold text-gray-900">{recentActivity.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Budget Alerts</p>
                    <p className="text-2xl font-semibold text-gray-900">{budgetAlertsCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Critical Projects</p>
                    <p className="text-2xl font-semibold text-gray-900">{forecastingSummary?.criticalProjects || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Filter and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Filter */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by User</h3>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  {users.map((user) => (
                    <option key={user.username} value={user.username}>
                      {user.name || user.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (Last 24h)</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentActivity.slice().reverse().slice(0, 8).map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {event.type === 'TIMER_START' ? 'Start' :
                           event.type === 'TIMER_PAUSE' ? 'Pause' :
                           event.type === 'TIMER_RESET' ? 'Reset' :
                           event.type === 'TIME_SAVED' ? 'Saved' :
                           event.type === 'TIME_AUTO_SAVED' ? 'Auto Saved' :
                           event.type === 'PROJECT_SWITCH' ? 'Project Switch' :
                           event.type === 'IDLE_ALERT' ? 'Idle Alert' :
                           event.type === 'LOG_EDITED' ? 'Edited' :
                           event.type === 'LOG_DELETED' ? 'Deleted' :
                           event.type === 'PROJECT_ADDED' ? 'Project Added' :
                           event.type === 'PROJECT_UPDATED' ? 'Project Updated' :
                           event.type === 'PROJECT_DELETED' ? 'Project Deleted' : 'Event'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{event.message}</p>
                        <p className="text-xs text-gray-500">
                          {event.username} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Analytics</h3>
              <ChartDisplay 
                logs={filteredLogs}
                userRole="Manager"
                username={selectedUser === 'all' ? 'All Users' : selectedUser}
              />
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <ProjectManager
            user={user}
            onProjectsUpdate={handleProjectsUpdate}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrail
            eventLogs={eventLogs}
            timeLogs={timeLogs}
            users={users}
          />
        )}

        {activeTab === 'entries' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Time Entries</h3>
              <p className="text-sm text-gray-500">Manage and edit time entries for all users</p>
            </div>
            <EditableTimeEntries
              timeLogs={filteredLogs}
              onUpdateLog={updateTimeLog}
              onDeleteLog={deleteTimeLog}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analytics</h3>
            <ChartDisplay 
              logs={filteredLogs}
              userRole="Manager"
              username={selectedUser === 'all' ? 'All Users' : selectedUser}
            />
          </div>
        )}

        {activeTab === 'forecasting' && (
          <Forecasting user={user} />
        )}

        {activeTab === 'alerts' && (
          <Alerts user={user} />
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard; 