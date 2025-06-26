import React, { useState, useEffect } from 'react';
import Timer from './Timer';
import ProjectSelector from './ProjectSelector';
import ChartDisplay from './ChartDisplay';
import EditableTimeEntries from './EditableTimeEntries';
import { clearAllTimesheetData, clearTimeLogsOnly } from '../utils/clearData';
import EmployeeTimesheet from './EmployeeTimesheet';
import cgiLogo from '../assets/cgi-logo.jpg';

const EmployeeDashboard = ({ user, onLogout }) => {
  const [currentProject, setCurrentProject] = useState('');
  const [timeLogs, setTimeLogs] = useState([]);
  const [eventLogs, setEventLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('timer'); // timer, entries, analytics, timesheet

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

    // Load saved project selection from localStorage
    const savedProject = localStorage.getItem('timesheetCurrentProject');
    if (savedProject) {
      setCurrentProject(savedProject);
    }
  }, []);

  // Save current project selection to localStorage whenever it changes
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('timesheetCurrentProject', currentProject);
    } else {
      localStorage.removeItem('timesheetCurrentProject');
    }
  }, [currentProject]);

  const handleLogout = () => {
    onLogout();
  };

  const addTimeLog = (log) => {
    const newLogs = [...timeLogs, log];
    setTimeLogs(newLogs);
    localStorage.setItem('timesheetLogs', JSON.stringify(newLogs));
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
      setCurrentProject('');
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

  // Filter logs for current user only
  const userLogs = timeLogs.filter(log => log.username === user.username);
  const userEvents = eventLogs.filter(event => event.username === user.username);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={cgiLogo} alt="CGI Logo" className="h-10 w-auto mr-4" />
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
              <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {user.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
              
              {/* Clear Data Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleClearTimeLogs}
                  className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Clear all time logs"
                >
                  Clear Logs
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
              onClick={() => setActiveTab('timer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timer
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
              onClick={() => setActiveTab('timesheet')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timesheet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timesheet
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'timer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timer and Project Selector */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h2>
                <div className="space-y-4">
                  <ProjectSelector 
                    currentProject={currentProject} 
                    onProjectChange={setCurrentProject} 
                  />
                  <Timer 
                    currentProject={currentProject}
                    onTimeLog={addTimeLog}
                    onEventLog={addEventLog}
                    user={user}
                  />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userEvents.slice().reverse().slice(0, 10).map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {event.type === 'TIMER_START' ? 'Start' :
                           event.type === 'TIMER_PAUSE' ? 'Pause' :
                           event.type === 'TIMER_RESET' ? 'Reset' :
                           event.type === 'TIME_SAVED' ? 'Saved' :
                           event.type === 'TIME_AUTO_SAVED' ? 'Auto Saved' :
                           event.type === 'PROJECT_SWITCH' ? 'Project Switch' :
                           event.type === 'IDLE_ALERT' ? 'Idle Alert' : 'Event'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{event.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {userEvents.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <EditableTimeEntries
              timeLogs={userLogs}
              onUpdateLog={updateTimeLog}
              onDeleteLog={deleteTimeLog}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Time Analytics</h2>
            <ChartDisplay 
              logs={userLogs}
              userRole="Employee"
              username={user.username}
            />
          </div>
        )}

        {activeTab === 'timesheet' && (
          <EmployeeTimesheet username={user.username} />
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard; 