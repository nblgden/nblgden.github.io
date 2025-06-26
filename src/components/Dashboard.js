import React, { useState, useEffect } from 'react';
import Timer from './Timer';
import ProjectSelector from './ProjectSelector';
import TimeLogs from './TimeLogs';

const Dashboard = ({ user, onLogout }) => {
  const [currentProject, setCurrentProject] = useState('');
  const [timeLogs, setTimeLogs] = useState([]);

  useEffect(() => {
    // Load time logs from localStorage
    const savedLogs = localStorage.getItem('timesheetLogs');
    if (savedLogs) {
      setTimeLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleLogout = () => {
    onLogout();
  };

  const addTimeLog = (log) => {
    const newLogs = [...timeLogs, log];
    setTimeLogs(newLogs);
    localStorage.setItem('timesheetLogs', JSON.stringify(newLogs));
  };

  const clearLogs = () => {
    setTimeLogs([]);
    localStorage.removeItem('timesheetLogs');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Timesheet Tracker</h1>
              <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {user.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer and Project Selector */}
          <div className="lg:col-span-2 space-y-6">
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
                />
              </div>
            </div>
          </div>

          {/* Time Logs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Time Logs</h2>
                {user.role === 'Manager' && (
                  <button
                    onClick={clearLogs}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <TimeLogs logs={timeLogs} userRole={user.role} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 