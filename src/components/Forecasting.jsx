import React, { useState, useEffect, useCallback } from 'react';
import { 
  forecastBudget, 
  forecastProjectCompletion, 
  forecastResourceDemand, 
  getForecastingSummary 
} from '../utils/forecastingUtils';
import { loadProjects } from '../utils/projectUtils';
import ForecastingCharts from './ForecastingCharts';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const Forecasting = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [forecastDays, setForecastDays] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [resourceDemand, setResourceDemand] = useState(null);
  const [showCharts, setShowCharts] = useState(true);

  const loadData = useCallback(() => {
    const allProjects = loadProjects();
    const activeProjects = allProjects.filter(p => p.status === 'active' && p.budget > 0);
    setProjects(activeProjects);
    setSummary(getForecastingSummary());
    setResourceDemand(forecastResourceDemand(forecastDays));
  }, [forecastDays]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBudgetForecast = () => {
    if (!selectedProject) return null;
    return forecastBudget(selectedProject, forecastDays);
  };

  const getCompletionForecast = () => {
    if (!selectedProject) return null;
    return forecastProjectCompletion(selectedProject);
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing':
      case 'accelerating':
        return 'text-red-600';
      case 'decreasing':
      case 'slowing':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handleExportData = () => {
    // Create CSV data with usable forecasting information
    let csvContent = '';
    
    // Add header
    csvContent += 'Forecasting Data Export\n';
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Forecast Period: ${forecastDays} days\n\n`;
    
    // Summary Statistics
    csvContent += 'SUMMARY STATISTICS\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Projects,${summary.totalProjects}\n`;
    csvContent += `Critical Projects,${summary.criticalProjects}\n`;
    csvContent += `Delayed Projects,${summary.delayedProjects}\n`;
    csvContent += `Total Predicted Hours,${(summary.totalPredictedHours || 0).toFixed(1)}\n\n`;
    
    // Project Forecasts
    if (projects.length > 0) {
      csvContent += 'PROJECT FORECASTS\n';
      csvContent += 'Project Code,Project Name,Current Budget (hours),Predicted Budget (hours),Budget Variance,Completion Date,Status\n';
      
      projects.forEach(project => {
        const budgetForecast = forecastBudget(project, forecastDays);
        const completionForecast = forecastProjectCompletion(project);
        
        csvContent += `${project.code},"${project.name}",${project.budget || 0},${(budgetForecast?.predictedBudget || 0).toFixed(1)},${(budgetForecast?.variance || 0).toFixed(1)},${completionForecast?.predictedDate || 'N/A'},${budgetForecast?.status || 'Unknown'}\n`;
      });
      csvContent += '\n';
    }
    
    // Resource Demand Forecast
    if (resourceDemand && resourceDemand.length > 0) {
      csvContent += 'RESOURCE DEMAND FORECAST\n';
      csvContent += 'Date,Demand Level,Required Hours,Notes\n';
      
      resourceDemand.forEach(day => {
        csvContent += `${day.date},${day.level},${day.hours},${day.notes}\n`;
      });
      csvContent += '\n';
    }
    
    // Selected Project Detailed Forecast (if available)
    if (selectedProject) {
      const budgetForecast = getBudgetForecast();
      const completionForecast = getCompletionForecast();
      
      if (budgetForecast) {
        csvContent += 'SELECTED PROJECT DETAILED FORECAST\n';
        csvContent += 'Project Code,Project Name,Current Budget,Predicted Budget,Variance,Status,Trend\n';
        csvContent += `${selectedProject},"${projects.find(p => p.code === selectedProject)?.name || ''}",${budgetForecast.currentBudget || 0},${(budgetForecast.predictedBudget || 0).toFixed(1)},${(budgetForecast.variance || 0).toFixed(1)},${budgetForecast.status || 'Unknown'},${budgetForecast.trend || 'Unknown'}\n\n`;
      }
      
      if (completionForecast) {
        csvContent += 'COMPLETION FORECAST DETAILS\n';
        csvContent += 'Metric,Value\n';
        csvContent += `Current Progress,${(completionForecast.currentProgress || 0).toFixed(1)}%\n`;
        csvContent += `Predicted Completion Date,${completionForecast.predictedDate || 'N/A'}\n`;
        csvContent += `Days Remaining,${completionForecast.daysRemaining || 'N/A'}\n`;
        csvContent += `Risk Level,${completionForecast.riskLevel || 'Unknown'}\n\n`;
      }
    }
    
    // Historical Data (if available for selected project)
    if (selectedProject) {
      const budgetForecast = getBudgetForecast();
      if (budgetForecast?.historicalData && budgetForecast.historicalData.length > 0) {
        csvContent += 'HISTORICAL DATA (Selected Project)\n';
        csvContent += 'Date,Hours Logged,Budget Used,Progress\n';
        
        budgetForecast.historicalData.forEach(entry => {
          csvContent += `${entry.date},${entry.hours || 0},${entry.budgetUsed || 0},${(entry.progress || 0).toFixed(1)}%\n`;
        });
      }
    }

    // Create and download CSV file
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecasting-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportChart = () => {
    // This would require a chart export library like html2canvas
    // For now, we'll just show a message
    alert('Chart export functionality would require additional libraries. Data export is available.');
  };

  if (!summary) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Forecasting Analytics</h2>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forecasting data available</h3>
          <p className="text-gray-500">Add projects with budgets to see forecasting analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Forecasting Analytics</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showCharts}
              onChange={(e) => setShowCharts(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Charts</span>
          </label>
          <button
            onClick={handleExportData}
            className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportChart}
            className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Export Charts
          </button>
          <label className="text-sm font-medium text-gray-700">Forecast Period:</label>
          <select
            value={forecastDays}
            onChange={(e) => {
              setForecastDays(parseInt(e.target.value));
              setResourceDemand(forecastResourceDemand(parseInt(e.target.value)));
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeTab === 'project' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Project Forecast
        </button>
        <button
          onClick={() => setActiveTab('resource')}
          className={`px-3 py-1 text-sm rounded-md ${
            activeTab === 'resource' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Resource Demand
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.totalProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Critical Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.criticalProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Delayed Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">{summary.delayedProjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Predicted Hours</p>
                  <p className="text-2xl font-semibold text-gray-900">{(summary.totalPredictedHours || 0).toFixed(1)}h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'Critical',
                        value: summary.criticalProjects,
                        fill: '#EF4444'
                      },
                      {
                        name: 'Delayed',
                        value: summary.delayedProjects,
                        fill: '#F59E0B'
                      },
                      {
                        name: 'On Track',
                        value: Math.max(0, summary.totalProjects - summary.criticalProjects - summary.delayedProjects),
                        fill: '#10B981'
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {[
                      { name: 'Critical', value: summary.criticalProjects, fill: '#EF4444' },
                      { name: 'Delayed', value: summary.delayedProjects, fill: '#F59E0B' },
                      { name: 'On Track', value: Math.max(0, summary.totalProjects - summary.criticalProjects - summary.delayedProjects), fill: '#10B981' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Project Forecast Tab */}
      {activeTab === 'project' && (
        <div className="space-y-6">
          {/* Project Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Forecast</h3>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Project:</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a project...</option>
                {projects.map(project => (
                  <option key={project.code} value={project.code}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProject && (
            <div className="space-y-6">
              {/* Charts Section */}
              {showCharts && (
                <ForecastingCharts
                  budgetForecast={getBudgetForecast()}
                  completionForecast={getCompletionForecast()}
                  historicalData={getBudgetForecast()?.historicalData}
                />
              )}

              {/* Budget Forecast */}
              {getBudgetForecast() && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Forecast Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Budget:</span>
                          <span className="text-sm font-medium">{getBudgetForecast().currentBudget || 0}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Usage:</span>
                          <span className="text-sm font-medium">{getBudgetForecast().currentUsage || 0}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Remaining:</span>
                          <span className="text-sm font-medium">{getBudgetForecast().remainingBudget || 0}h</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Forecast</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Predicted Daily Usage:</span>
                          <span className="text-sm font-medium">{(getBudgetForecast().predictedDailyUsage || 0).toFixed(2)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Predicted Total:</span>
                          <span className="text-sm font-medium">{(getBudgetForecast().predictedTotalUsage || 0).toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Budget Variance:</span>
                          <span className={`text-sm font-medium ${(getBudgetForecast().budgetVariance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(getBudgetForecast().budgetVariance || 0).toFixed(1)}h ({(getBudgetForecast().budgetVariancePercentage || 0).toFixed(1)}%)
                          </span>
                        </div>
                        {getBudgetForecast().budgetExhaustionDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Budget Exhaustion:</span>
                            <span className="text-sm font-medium text-red-600">
                              {getBudgetForecast().budgetExhaustionDate} days
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Trend:</span>
                        <span className={`text-sm font-medium ${getTrendColor(getBudgetForecast().trend)}`}>
                          {getBudgetForecast().trend || 'stable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Forecast */}
              {getCompletionForecast() && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Forecast Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current Progress:</span>
                          <span className="text-sm font-medium">{(getCompletionForecast().currentProgress || 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Remaining Work:</span>
                          <span className="text-sm font-medium">{(getCompletionForecast().remainingWork || 0).toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Daily Progress:</span>
                          <span className="text-sm font-medium">{(getCompletionForecast().predictedDailyProgress || 0).toFixed(2)}h</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                      <div className="space-y-2">
                        {getCompletionForecast().daysToCompletion ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Days to Completion:</span>
                              <span className="text-sm font-medium">{getCompletionForecast().daysToCompletion}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Expected Completion:</span>
                              <span className="text-sm font-medium">
                                {new Date(getCompletionForecast().completionDate).toLocaleDateString()}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">Insufficient data for completion prediction</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Trend:</span>
                        <span className={`text-sm font-medium ${getTrendColor(getCompletionForecast().trend)}`}>
                          {getCompletionForecast().trend || 'steady'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resource Demand Tab */}
      {activeTab === 'resource' && resourceDemand && (
        <div className="space-y-6">
          {/* Charts Section */}
          {showCharts && (
            <ForecastingCharts
              resourceDemand={resourceDemand}
            />
          )}

          {/* Resource Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Predicted Hours</p>
                  <p className="text-2xl font-semibold text-gray-900">{(resourceDemand.totalPredictedHours || 0).toFixed(1)}h</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Critical Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">{resourceDemand.criticalProjects}</p>
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
                  <p className="text-sm font-medium text-gray-500">High Priority</p>
                  <p className="text-2xl font-semibold text-gray-900">{resourceDemand.highPriorityProjects}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Utilisation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilisation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Budget</p>
                <span className="text-sm font-medium">{(resourceDemand.resourceUtilisation.totalBudget || 0).toFixed(1)}h</span>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Predicted Usage</p>
                <span className="text-sm font-medium">{(resourceDemand.resourceUtilisation.totalPredicted || 0).toFixed(1)}h</span>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Utilisation Rate:</p>
                <span className={`text-sm font-medium ${(resourceDemand.resourceUtilisation.utilisationRate || 0) > 100 ? 'text-red-600' : 'text-green-600'}`}>
                  {(resourceDemand.resourceUtilisation.utilisationRate || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Project Priorities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Priorities Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resourceDemand.projectForecasts.map((forecast) => (
                    <tr key={forecast.projectCode}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{forecast.projectCode}</div>
                          <div className="text-sm text-gray-500">{forecast.projectName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{forecast.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(forecast.priority)}`}>
                          {forecast.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {forecast.budgetForecast ? (
                          <div>
                            <div className="font-medium">{(forecast.budgetForecast.currentUsage || 0).toFixed(1)}h / {forecast.budgetForecast.currentBudget || 0}h</div>
                            <div className={`text-xs ${(forecast.budgetForecast.budgetVariance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {(forecast.budgetForecast.budgetVariancePercentage || 0).toFixed(1)}% variance
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No budget</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {forecast.completionForecast ? (
                          <div>
                            <div className="font-medium">{(forecast.completionForecast.currentProgress || 0).toFixed(1)}%</div>
                            <div className={`text-xs ${getTrendColor(forecast.completionForecast.trend)}`}>
                              {forecast.completionForecast.trend || 'steady'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No data</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          {resourceDemand.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {resourceDemand.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 p-1 rounded-full ${rec.severity === 'high' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Projects: {rec.projects.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Forecasting; 