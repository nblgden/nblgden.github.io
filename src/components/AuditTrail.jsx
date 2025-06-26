import React, { useState } from 'react';

const AuditTrail = ({ eventLogs, timeLogs, users }) => {
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, all
  const [searchTerm, setSearchTerm] = useState('');

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'TIMER_START', label: 'Timer Start' },
    { value: 'TIMER_PAUSE', label: 'Timer Pause' },
    { value: 'TIMER_RESET', label: 'Timer Reset' },
    { value: 'TIME_SAVED', label: 'Time Saved' },
    { value: 'TIME_AUTO_SAVED', label: 'Time Auto-Saved' },
    { value: 'PROJECT_SWITCH', label: 'Project Switch' },
    { value: 'IDLE_ALERT', label: 'Idle Alert' },
    { value: 'LOG_EDITED', label: 'Log Edited' },
    { value: 'LOG_DELETED', label: 'Log Deleted' }
  ];

  const getEventIcon = (eventType) => {
    const icons = {
      'TIMER_START': 'Start',
      'TIMER_PAUSE': 'Pause',
      'TIMER_RESET': 'Reset',
      'TIME_SAVED': 'Saved',
      'TIME_AUTO_SAVED': 'Auto Saved',
      'PROJECT_SWITCH': 'Project Switch',
      'IDLE_ALERT': 'Idle Alert',
      'LOG_EDITED': 'Edited',
      'LOG_DELETED': 'Deleted'
    };
    return icons[eventType] || 'Event';
  };

  const getEventColor = (eventType) => {
    const colors = {
      'TIMER_START': 'text-green-600 bg-green-50',
      'TIMER_PAUSE': 'text-yellow-600 bg-yellow-50',
      'TIMER_RESET': 'text-gray-600 bg-gray-50',
      'TIME_SAVED': 'text-blue-600 bg-blue-50',
      'TIME_AUTO_SAVED': 'text-emerald-600 bg-emerald-50',
      'PROJECT_SWITCH': 'text-purple-600 bg-purple-50',
      'IDLE_ALERT': 'text-orange-600 bg-orange-50',
      'LOG_EDITED': 'text-indigo-600 bg-indigo-50',
      'LOG_DELETED': 'text-red-600 bg-red-50'
    };
    return colors[eventType] || 'text-gray-600 bg-gray-50';
  };

  const filterEvents = () => {
    let filtered = [...eventLogs];

    // Filter by user
    if (selectedUser !== 'all') {
      filtered = filtered.filter(event => event.username === selectedUser);
    }

    // Filter by event type
    if (selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedEventType);
    }

    // Filter by date range
    const now = new Date();
    const cutoffDate = new Date();
    switch (dateRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'all':
      default:
        cutoffDate.setFullYear(2000); // Very old date to include all
        break;
    }
    filtered = filtered.filter(event => new Date(event.timestamp) >= cutoffDate);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.projectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getEventDetails = (event) => {
    switch (event.type) {
      case 'TIMER_START':
        return `Started timer for project ${event.projectCode}`;
      case 'TIMER_PAUSE':
        return `Paused timer at ${event.message?.split('at ')[1] || 'unknown time'}`;
      case 'TIMER_RESET':
        return 'Timer was reset';
      case 'TIME_SAVED':
        return `Saved ${event.message?.split('Saved ')[1]?.split(' for')[0] || 'time'} for project ${event.projectCode}`;
      case 'TIME_AUTO_SAVED':
        return `Auto-saved ${event.message?.split('Auto-saved ')[1]?.split(' for')[0] || 'time'} for project ${event.projectCode} when switching to ${event.newProject}`;
      case 'PROJECT_SWITCH':
        return `Switched from ${event.previousProject} to ${event.projectCode}`;
      case 'IDLE_ALERT':
        return 'Timer running for 30+ minutes without activity';
      case 'LOG_EDITED':
        return `Edited time entry for project ${event.projectCode}`;
      case 'LOG_DELETED':
        return `Deleted time entry for project ${event.projectCode}`;
      default:
        return event.message || 'No details available';
    }
  };

  const getActivitySummary = () => {
    const filteredEvents = filterEvents();
    const summary = {
      totalEvents: filteredEvents.length,
      byType: {},
      byUser: {},
      recentActivity: 0
    };

    const last24h = new Date();
    last24h.setDate(last24h.getDate() - 1);

    filteredEvents.forEach(event => {
      // Count by type
      summary.byType[event.type] = (summary.byType[event.type] || 0) + 1;
      
      // Count by user
      summary.byUser[event.username] = (summary.byUser[event.username] || 0) + 1;
      
      // Count recent activity
      if (new Date(event.timestamp) >= last24h) {
        summary.recentActivity++;
      }
    });

    return summary;
  };

  const filteredEvents = filterEvents();
  const summary = getActivitySummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Audit Trail</h2>
        <div className="text-sm text-gray-500">
          {filteredEvents.length} events found
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalEvents}</p>
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
              <p className="text-sm font-medium text-gray-500">Today's Activity</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.recentActivity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{Object.keys(summary.byUser).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No events found</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEvents.map((event, index) => (
                <div key={`${event.timestamp}-${index}`} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                            {eventTypes.find(t => t.value === event.type)?.label || event.type}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {event.username}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {getEventDetails(event)}
                      </p>
                      
                      {event.projectCode && (
                        <p className="text-xs text-gray-500 mt-1">
                          Project: {event.projectCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Type Breakdown */}
      {Object.keys(summary.byType).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Event Type Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(summary.byType).map(([type, count]) => (
              <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">{getEventIcon(type)}</div>
                <div className="text-sm font-medium text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">
                  {eventTypes.find(t => t.value === type)?.label || type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail; 