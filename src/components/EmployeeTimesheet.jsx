import React, { useMemo } from 'react';

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const getWeekDates = (start) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
};

const EmployeeTimesheet = ({ username }) => {
  // Get all logs for the current user
  const logs = useMemo(() => {
    const allLogs = JSON.parse(localStorage.getItem('timesheetLogs') || '[]');
    return allLogs.filter(log => log.username === username);
  }, [username]);

  // Get current week
  const today = new Date();
  const weekStart = getStartOfWeek(today);
  const weekDates = getWeekDates(weekStart);
  const weekKeys = weekDates.map(d => d.toISOString().split('T')[0]);

  // Get all projects the user worked on this week
  const projects = Array.from(new Set(
    logs.filter(log => weekKeys.includes(log.timestamp.split('T')[0]))
        .map(log => log.projectCode)
  ));

  // Build grid data: { [projectCode]: { [dateKey]: hours } }
  const grid = {};
  projects.forEach(project => {
    grid[project] = {};
    weekKeys.forEach(dateKey => {
      grid[project][dateKey] = 0;
    });
  });
  logs.forEach(log => {
    const dateKey = log.timestamp.split('T')[0];
    if (projects.includes(log.projectCode) && weekKeys.includes(dateKey)) {
      grid[log.projectCode][dateKey] += log.timeSpent / 3600;
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Timesheet (This Week)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead>
            <tr>
              <th className="border px-4 py-2 bg-gray-100">Project</th>
              {weekDates.map((date, idx) => (
                <th key={idx} className="border px-4 py-2 bg-gray-100">
                  {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">No entries for this week.</td></tr>
            ) : (
              projects.map(project => (
                <tr key={project}>
                  <td className="border px-4 py-2 font-medium">{project}</td>
                  {weekKeys.map(dateKey => (
                    <td key={dateKey} className="border px-4 py-2 text-center">
                      {grid[project][dateKey] > 0 ? grid[project][dateKey].toFixed(2) : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTimesheet; 