import React, { useState, useEffect } from 'react';
import { getUnreadAlertsCount } from '../utils/projectUtils';

const BudgetNotification = ({ user }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkAlerts = () => {
      const count = getUnreadAlertsCount();
      setUnreadCount(count);
      
      // Show notification if there are new alerts
      if (count > 0 && !showNotification) {
        setShowNotification(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setShowNotification(false), 5000);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [showNotification]);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <>
      {/* Notification Badge */}
      <div className="relative">
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      </div>

      {/* Popup Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Budget Alert
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {unreadCount} project{unreadCount !== 1 ? 's have' : ' has'} exceeded or is approaching budget limits.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowNotification(false)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetNotification; 