import React, { useState, useEffect } from 'react';
import { 
  getBudgetAlerts, 
  markAlertAsRead, 
  clearAllAlerts, 
  checkBudgetAlerts
} from '../utils/projectUtils';

const Alerts = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, high, medium
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    loadAlerts();
    // Check for new alerts every 30 seconds
    const interval = setInterval(() => {
      checkForNewAlerts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    const allAlerts = getBudgetAlerts();
    setAlerts(allAlerts);
    setShowEmpty(allAlerts.length === 0);
  };

  const checkForNewAlerts = () => {
    const newAlerts = checkBudgetAlerts();
    if (newAlerts.length > 0) {
      // Add new alerts to existing ones
      const existingAlerts = getBudgetAlerts();
      const updatedAlerts = [...newAlerts, ...existingAlerts];
      setAlerts(updatedAlerts);
    }
  };

  const handleMarkAsRead = (alertId) => {
    markAlertAsRead(alertId);
    loadAlerts();
  };

  const handleMarkAllAsRead = () => {
    alerts.forEach(alert => {
      if (!alert.read) {
        markAlertAsRead(alert.id);
      }
    });
    loadAlerts();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all alerts? This action cannot be undone.')) {
      clearAllAlerts();
      loadAlerts();
    }
  };

  const getFilteredAlerts = () => {
    return alerts.filter(alert => {
      if (filter === 'unread') return !alert.read;
      if (filter === 'high') return alert.severity === 'high';
      if (filter === 'medium') return alert.severity === 'medium';
      return true;
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'over-budget':
        return 'text-red-600';
      case 'near-limit':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = alerts.filter(alert => !alert.read).length;

  if (showEmpty) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Alerts</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
          <p className="text-gray-500">All projects are within their budget limits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alerts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}` : 'All alerts read'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
            filter === 'all' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
            filter === 'unread' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('high')}
          className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
            filter === 'high' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          High Priority ({alerts.filter(a => a.severity === 'high').length})
        </button>
        <button
          onClick={() => setFilter('medium')}
          className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
            filter === 'medium' 
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Medium Priority ({alerts.filter(a => a.severity === 'medium').length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No alerts match the current filter.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                alert.read 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-l-4 border-l-blue-500 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`flex-shrink-0 p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {alert.projectName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity === 'high' ? 'Budget Exceeded' : 'Budget Warning'}
                      </span>
                      {!alert.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {alert.message}
                    </p>
                    
                    {alert.budgetStatus && (
                      <div className="bg-gray-50 rounded-md p-3 mb-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Budget:</span>
                            <span className="ml-2 font-medium">{alert.budgetStatus.budget} hours</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Used:</span>
                            <span className={`ml-2 font-medium ${getBudgetStatusColor(alert.budgetStatus.status)}`}>
                              {alert.budgetStatus.used} hours ({alert.budgetStatus.percentage}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Remaining:</span>
                            <span className={`ml-2 font-medium ${getBudgetStatusColor(alert.budgetStatus.status)}`}>
                              {alert.budgetStatus.remaining} hours
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`ml-2 font-medium ${getBudgetStatusColor(alert.budgetStatus.status)}`}>
                              {alert.budgetStatus.status === 'over-budget' ? 'Over Budget' : 
                               alert.budgetStatus.status === 'near-limit' ? 'Near Limit' : 'Under Budget'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        {new Date(alert.timestamp).toLocaleDateString()} at {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      {alert.read && (
                        <span className="text-green-600">
                          Read {new Date(alert.readAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {!alert.read && (
                  <button
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="flex-shrink-0 ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts; 