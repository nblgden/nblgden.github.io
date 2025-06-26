import React, { useState, useEffect } from 'react';
import { getActiveProjects, checkBudgetAlerts, addBudgetAlert } from '../utils/projectUtils';

const EditableTimeEntries = ({ timeLogs, onUpdateLog, onDeleteLog }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
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

  const getProjectName = (projectCode) => {
    const project = projects.find(p => p.code === projectCode);
    return project ? project.name : projectCode;
  };

  const formatTimeInput = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseTimeInput = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditForm({
      projectCode: log.projectCode,
      timeSpent: log.timeSpent,
      formattedTime: formatTimeInput(log.timeSpent),
      notes: log.notes || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.projectCode || !editForm.formattedTime) {
      alert('Please fill in all required fields');
      return;
    }

    const timeSpent = parseTimeInput(editForm.formattedTime);
    if (isNaN(timeSpent) || timeSpent <= 0) {
      alert('Please enter a valid time');
      return;
    }

    onUpdateLog(editingId, {
      projectCode: editForm.projectCode,
      timeSpent: timeSpent,
      notes: editForm.notes
    });

    // Check for budget alerts after updating time entry
    const newAlerts = checkBudgetAlerts();
    newAlerts.forEach(alert => {
      addBudgetAlert(alert);
    });

    setEditingId(null);
    setEditForm({});
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Time Entries ({timeLogs.length})
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === log.id ? (
                    <select
                      value={editForm.projectCode}
                      onChange={(e) => setEditForm({...editForm, projectCode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {projects.map((project) => (
                        <option key={project.code} value={project.code}>
                          {project.code} - {project.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.projectCode}</div>
                      <div className="text-sm text-gray-500">{getProjectName(log.projectCode)}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === log.id ? (
                    <input
                      type="text"
                      value={editForm.formattedTime}
                      onChange={(e) => setEditForm({...editForm, formattedTime: e.target.value})}
                      placeholder="HH:MM"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{formatTime(log.timeSpent)}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === log.id ? (
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes..."
                    />
                  ) : (
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={log.notes}>
                      {log.notes || '-'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingId === log.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {timeLogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries yet</h3>
          <p className="text-gray-500">Start tracking your time to see entries here.</p>
        </div>
      )}
    </div>
  );
};

export default EditableTimeEntries; 