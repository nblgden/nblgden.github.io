import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ChartDisplay = ({ logs, userRole, username, chartType = 'bar' }) => {
  // Colours for charts
  const colours = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  // Process data for project-based charts
  const getProjectData = () => {
    const projectMap = {};
    
    logs.forEach(log => {
      if (!projectMap[log.projectCode]) {
        projectMap[log.projectCode] = 0;
      }
      projectMap[log.projectCode] += log.timeSpent;
    });

    return Object.entries(projectMap).map(([code, time]) => ({
      project: code,
      time: Math.round(time / 60), // Convert to minutes
      hours: Math.round((time / 3600) * 10) / 10 // Convert to hours with 1 decimal
    }));
  };

  // Process data for daily time tracking
  const getDailyData = () => {
    const dailyMap = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!dailyMap[date]) {
        dailyMap[date] = 0;
      }
      dailyMap[date] += log.timeSpent;
    });

    return Object.entries(dailyMap)
      .map(([date, time]) => ({
        date,
        time: Math.round(time / 60), // Convert to minutes
        hours: Math.round((time / 3600) * 10) / 10 // Convert to hours with 1 decimal
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days
  };

  // Process data for pie chart
  const getPieData = () => {
    const projectData = getProjectData();
    return projectData.map((item, index) => ({
      ...item,
      fill: colours[index % colours.length]
    }));
  };

  // Custom tooltip for time display
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} minutes ({Math.round((entry.value / 60) * 10) / 10}h)
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.payload.project}</p>
          <p className="text-sm" style={{ color: data.payload.fill }}>
            {data.value} minutes ({Math.round((data.value / 60) * 10) / 10}h)
          </p>
        </div>
      );
    }
    return null;
  };

  const projectData = getProjectData();
  const dailyData = getDailyData();
  const pieData = getPieData();

  // If no data, show empty state
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No data available</p>
          <p className="text-gray-400 text-xs mt-1">Start tracking time to see charts</p>
        </div>
      </div>
    );
  }

  // Render different chart types
  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ project, percent }) => `${project} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="time"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="time" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="Time (minutes)"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Default bar chart
  return (
    <div className="space-y-6">
      {/* Project Time Chart */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Time by Project</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={projectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="project" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="time" fill="#3B82F6" name="Time (minutes)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Time Chart */}
      {dailyData.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Daily Time Tracking (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="time" fill="#10B981" name="Time (minutes)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChartDisplay; 