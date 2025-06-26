// Utility function to clear all timesheet data from localStorage
export const clearAllTimesheetData = () => {
  try {
    // Clear all timesheet-related localStorage items
    localStorage.removeItem('timeLogs');
    localStorage.removeItem('eventLogs');
    localStorage.removeItem('timerState');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('selectedProject');
    
    // Clear any other potential timesheet-related data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('time') || key.includes('log') || key.includes('timer') || key.includes('project'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('All timesheet data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing timesheet data:', error);
    return false;
  }
};

// Function to clear only time logs (keeping other data)
export const clearTimeLogsOnly = () => {
  try {
    localStorage.removeItem('timeLogs');
    console.log('Time logs cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing time logs:', error);
    return false;
  }
};

// Function to clear only event logs (keeping time logs)
export const clearEventLogsOnly = () => {
  try {
    localStorage.removeItem('eventLogs');
    console.log('Event logs cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing event logs:', error);
    return false;
  }
}; 