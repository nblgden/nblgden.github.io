import React, { useState, useEffect, useRef } from 'react';
import { checkBudgetAlerts, addBudgetAlert } from '../utils/projectUtils';

const Timer = ({ currentProject, onTimeLog, user, onEventLog }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(null);
  const [showIdleAlert, setShowIdleAlert] = useState(false);
  const [previousProject, setPreviousProject] = useState(null);
  const intervalRef = useRef(null);
  const idleCheckRef = useRef(null);
  const previousProjectRef = useRef(null);
  const isFirstProjectAssignment = useRef(true);

  // Load timer state on component mount
  useEffect(() => {
    const loadTimerState = () => {
      try {
        const savedTimerState = localStorage.getItem('timesheetTimerState');
        console.log('Loading saved timer state:', savedTimerState);
        
        if (savedTimerState) {
          const parsedState = JSON.parse(savedTimerState);
          console.log('Parsed timer state:', parsedState);
          
          const { isRunning: savedIsRunning, elapsedTime: savedElapsedTime, startTime: savedStartTime } = parsedState;
          
          // If timer was running when page was closed/refreshed, calculate the elapsed time
          if (savedIsRunning && savedStartTime) {
            const now = Date.now();
            const timeSinceStart = Math.floor((now - savedStartTime) / 1000);
            
            console.log('Restoring running timer:', { 
              savedElapsedTime, 
              timeSinceStart, 
              totalElapsed: timeSinceStart,
              savedStartTime: new Date(savedStartTime).toLocaleTimeString(),
              now: new Date(now).toLocaleTimeString()
            });
            
            // Use the time since start as the elapsed time, not adding to savedElapsedTime
            setElapsedTime(timeSinceStart);
            setStartTime(savedStartTime);
            setIsRunning(true);
            setLastActivityTime(now);
          } else {
            console.log('Restoring stopped timer:', { savedElapsedTime });
            setElapsedTime(savedElapsedTime || 0);
            setStartTime(null);
            setIsRunning(false);
          }
        } else {
          console.log('No saved timer state found');
          setElapsedTime(0);
          setStartTime(null);
          setIsRunning(false);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading timer state:', error);
        // Reset to default state if there's an error
        setElapsedTime(0);
        setStartTime(null);
        setIsRunning(false);
        setIsInitialized(true);
      }
    };

    loadTimerState();
  }, []);

  // Save timer state to localStorage whenever it changes (only after initialization)
  useEffect(() => {
    if (!isInitialized) return; // Don't save until we've loaded the initial state
    
    const saveTimerState = () => {
      try {
        const timerState = { 
          isRunning, 
          elapsedTime, 
          startTime 
        };
        localStorage.setItem('timesheetTimerState', JSON.stringify(timerState));
        console.log('Saving timer state:', timerState);
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    };

    saveTimerState();
  }, [isRunning, elapsedTime, startTime, isInitialized]);

  // Timer interval effect
  useEffect(() => {
    if (isRunning && isInitialized) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isInitialized]);

  // Idle time monitoring
  useEffect(() => {
    if (isRunning && isInitialized) {
      idleCheckRef.current = setInterval(() => {
        const now = Date.now();
        const idleTime = now - lastActivityTime;
        const idleMinutes = Math.floor(idleTime / (1000 * 60));
        
        if (idleMinutes >= 30 && !showIdleAlert) {
          setShowIdleAlert(true);
          // Log idle event
          onEventLog({
            type: 'IDLE_ALERT',
            timestamp: new Date().toISOString(),
            message: 'Timer has been running for 30+ minutes without activity',
            username: user?.username,
            projectCode: currentProject
          });
        }
      }, 60000); // Check every minute
    } else {
      if (idleCheckRef.current) {
        clearInterval(idleCheckRef.current);
        idleCheckRef.current = null;
      }
      setShowIdleAlert(false);
    }

    return () => {
      if (idleCheckRef.current) {
        clearInterval(idleCheckRef.current);
      }
    };
  }, [isRunning, isInitialized, lastActivityTime, showIdleAlert, currentProject, user?.username, onEventLog]);

  // Handle page visibility changes (when user switches tabs or minimises)
  useEffect(() => {
    if (!isInitialized) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, just let the interval continue
        console.log('Page hidden, timer continues in background');
      } else {
        // Page is visible again, recalculate if timer was running
        if (isRunning && startTime) {
          const now = Date.now();
          const timeSinceStart = Math.floor((now - startTime) / 1000);
          console.log('Page visible, recalculating time:', { timeSinceStart, currentElapsed: elapsedTime });
          setElapsedTime(timeSinceStart);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, startTime, elapsedTime, isInitialized]);

  // Handle beforeunload event to save state before page closes
  useEffect(() => {
    if (!isInitialized) return;

    const handleBeforeUnload = () => {
      if (isRunning && startTime) {
        const now = Date.now();
        const timeSinceStart = Math.floor((now - startTime) / 1000);
        
        const timerState = { 
          isRunning: true, 
          elapsedTime: timeSinceStart, 
          startTime 
        };
        localStorage.setItem('timesheetTimerState', JSON.stringify(timerState));
        console.log('Beforeunload: saving state with elapsed time:', timeSinceStart);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, startTime, elapsedTime, isInitialized]);

  // Auto-save time when switching projects
  useEffect(() => {
    if (!isInitialized) return;
    // Skip the first project assignment after mount (restoration)
    if (isFirstProjectAssignment.current) {
      isFirstProjectAssignment.current = false;
      previousProjectRef.current = currentProject;
      return;
    }
    if (
      currentProject !== previousProjectRef.current &&
      previousProjectRef.current !== null &&
      isRunning &&
      elapsedTime > 0
    ) {
      // Auto-save the current time for the previous project
      const now = new Date();
      const log = {
        id: Date.now(),
        projectCode: previousProjectRef.current,
        timeSpent: elapsedTime,
        minutes: Math.round(elapsedTime / 60),
        date: now.toISOString().split('T')[0], // YYYY-MM-DD format
        timestamp: now.toISOString(),
        formattedTime: formatTime(elapsedTime),
        username: user?.username || 'unknown',
        notes: `Auto-saved when switching to ${currentProject}`
      };
      // Log auto-save event
      onEventLog({
        type: 'TIME_AUTO_SAVED',
        timestamp: now.toISOString(),
        message: `Auto-saved ${formatTime(elapsedTime)} for project ${previousProjectRef.current} when switching to ${currentProject}`,
        username: user?.username,
        projectCode: previousProjectRef.current,
        timeSpent: elapsedTime,
        newProject: currentProject
      });
      onTimeLog(log);
      // Reset timer for new project
      const newStartTime = Date.now();
      setStartTime(newStartTime);
      setElapsedTime(0);
      setLastActivityTime(newStartTime);
      console.log(`Auto-saved ${formatTime(elapsedTime)} for ${previousProjectRef.current}, starting fresh timer for ${currentProject}`);
    }
    previousProjectRef.current = currentProject;
  }, [currentProject, isInitialized, isRunning, elapsedTime, user?.username, onTimeLog, onEventLog]);

  // Track project changes (for logging only, auto-save is handled above)
  useEffect(() => {
    if (isInitialized && currentProject !== previousProject && previousProject !== null) {
      // Log project switch event
      onEventLog({
        type: 'PROJECT_SWITCH',
        timestamp: new Date().toISOString(),
        message: `Switched from ${previousProject} to ${currentProject}`,
        username: user?.username,
        projectCode: currentProject,
        previousProject: previousProject
      });
    }
    setPreviousProject(currentProject);
  }, [currentProject, previousProject, isInitialized, user?.username, onEventLog]);

  const updateActivityTime = () => {
    const now = Date.now();
    setLastActivityTime(now);
    setShowIdleAlert(false);
  };

  const startTimer = () => {
    if (!currentProject) {
      alert('Please select a project before starting the timer');
      return;
    }
    const now = Date.now();
    console.log('Starting timer at:', now, new Date(now).toLocaleTimeString());
    
    // Log start event
    onEventLog({
      type: 'TIMER_START',
      timestamp: new Date().toISOString(),
      message: `Started timer for project ${currentProject}`,
      username: user?.username,
      projectCode: currentProject
    });
    
    setIsRunning(true);
    setStartTime(now);
    setElapsedTime(0); // Reset elapsed time when starting fresh
    setLastActivityTime(now);
  };

  const pauseTimer = () => {
    console.log('Pausing timer at elapsed time:', elapsedTime);
    
    // Log pause event
    onEventLog({
      type: 'TIMER_PAUSE',
      timestamp: new Date().toISOString(),
      message: `Paused timer at ${formatTime(elapsedTime)}`,
      username: user?.username,
      projectCode: currentProject
    });
    
    setIsRunning(false);
  };

  const resetTimer = () => {
    console.log('Resetting timer');
    
    // Log reset event
    onEventLog({
      type: 'TIMER_RESET',
      timestamp: new Date().toISOString(),
      message: 'Timer reset',
      username: user?.username,
      projectCode: currentProject
    });
    
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
    setShowIdleAlert(false);
  };

  const saveTime = () => {
    if (elapsedTime > 0 && currentProject) {
      const now = new Date();
      const log = {
        id: Date.now(),
        projectCode: currentProject,
        timeSpent: elapsedTime,
        minutes: Math.round(elapsedTime / 60),
        date: now.toISOString().split('T')[0], // YYYY-MM-DD format
        timestamp: now.toISOString(),
        formattedTime: formatTime(elapsedTime),
        username: user?.username || 'unknown'
      };
      
      // Check for overdue entry warning (>24h after activity)
      const timeDiff = Date.now() - startTime;
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        const confirmed = window.confirm(
          `Warning: This time entry is ${Math.round(hoursDiff)} hours old. ` +
          `Memory decay may affect accuracy. Do you want to save anyway?`
        );
        if (!confirmed) return;
      }
      
      // Log save event
      onEventLog({
        type: 'TIME_SAVED',
        timestamp: now.toISOString(),
        message: `Saved ${formatTime(elapsedTime)} for project ${currentProject}`,
        username: user?.username,
        projectCode: currentProject,
        timeSpent: elapsedTime
      });
      
      onTimeLog(log);
      resetTimer();
      
      // Check for budget alerts after saving time
      const newAlerts = checkBudgetAlerts();
      newAlerts.forEach(alert => {
        addBudgetAlert(alert);
      });
    }
  };

  // Test function to manually check localStorage
  const testLocalStorage = () => {
    const saved = localStorage.getItem('timesheetTimerState');
    console.log('Current localStorage:', saved);
    if (saved) {
      console.log('Parsed:', JSON.parse(saved));
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
            00:00:00
          </div>
          <div className="text-sm text-gray-600">Loading timer...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Idle Alert */}
      {showIdleAlert && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Idle Timer Alert
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Timer has been running for 30+ minutes without activity. 
                Consider pausing if you're not actively working.
              </p>
            </div>
            <div className="ml-auto">
              <button
                onClick={updateActivityTime}
                className="text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-sm text-gray-600">
          {currentProject ? `Project: ${currentProject}` : 'No project selected'}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center space-x-3">
        {!isRunning ? (
          <button
            onClick={startTimer}
            disabled={!currentProject}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Start the timer (requires project selection)"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200"
            title="Pause the timer"
          >
            Pause
          </button>
        )}
        
        <button
          onClick={resetTimer}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
          title="Reset the timer to 00:00:00"
        >
          Reset
        </button>
        
        {elapsedTime > 0 && (
          <button
            onClick={saveTime}
            disabled={!currentProject}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Save the current time entry"
          >
            Save Time
          </button>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isRunning 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`}></div>
          {isRunning ? 'Running' : 'Stopped'}
        </div>
      </div>

      {/* Background Running Indicator */}
      {isRunning && (
        <div className="text-center">
          <div className="flex items-center space-x-2 text-sm text-yellow-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Timer continues in background</span>
          </div>
        </div>
      )}

      {/* Auto-save Info */}
      {isRunning && (
        <div className="text-center">
          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Time auto-saves when switching projects</span>
          </div>
        </div>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center text-xs text-gray-500 mt-2 space-y-1">
          <div>Start Time: {startTime ? new Date(startTime).toLocaleTimeString() : 'None'}</div>
          <div>Elapsed: {elapsedTime}s</div>
          <div>Running: {isRunning ? 'Yes' : 'No'}</div>
          <div>Initialized: {isInitialized ? 'Yes' : 'No'}</div>
          <div>Last Activity: {lastActivityTime ? new Date(lastActivityTime).toLocaleTimeString() : 'None'}</div>
          <button 
            onClick={testLocalStorage}
            className="text-blue-500 underline"
          >
            Test localStorage
          </button>
        </div>
      )}
    </div>
  );
};

export default Timer; 