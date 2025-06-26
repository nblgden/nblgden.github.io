import React, { useState, useEffect } from 'react';
import { getActiveProjects } from '../utils/projectUtils';

const TimeLogs = ({ logs, userRole }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjects();
    
    // Listen for project updates
    const handleStorageChange = (e) => {
      if (e.key === 'timesheetProjects') {
        loadProjects();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadProjects = () => {
    const activeProjects = getActiveProjects();
    setProjects(activeProjects);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const deleteLog = (logId) => {
    const updatedLogs = logs.filter(log => log.id !== logId);
    localStorage.setItem('timesheetLogs', JSON.stringify(updatedLogs));
    // Force re-render by reloading the page (simple approach)
    window.location.reload();
  };

  const getProjectName = (projectCode) => {
    const project = projects.find(p => p.code === projectCode);
    return project ? project.name : projectCode;
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No time logs yet</p>
        <p className="text-gray-400 text-xs mt-1">Start tracking your time to see logs here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {logs.slice().reverse().map((log) => (
        <div key={log.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {log.projectCode}
                </span>
                <span className="text-sm font-mono text-blue-600">
                  {log.formattedTime}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 mb-1">
                {getProjectName(log.projectCode)}
              </div>
              
              <div className="text-xs text-gray-500">
                {formatDate(log.timestamp)}
              </div>

              {log.notes && (
                <div className="text-xs text-gray-600 bg-white p-2 rounded mt-2">
                  {log.notes}
                </div>
              )}
            </div>

            {userRole === 'Manager' && (
              <button
                onClick={() => deleteLog(log.id)}
                className="text-xs text-red-600 hover:text-red-800 underline ml-2"
                title="Delete this time entry"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Entries:</span>
            <span className="font-medium">{logs.length}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Total Time:</span>
            <span className="font-medium">
              {formatTotalTime(logs.reduce((total, log) => total + log.timeSpent, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTotalTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export default TimeLogs; 