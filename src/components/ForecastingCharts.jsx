import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { calculateLinearRegression } from '../utils/forecastingUtils';

const ForecastingCharts = ({ 
  budgetForecast, 
  completionForecast, 
  resourceDemand, 
  historicalData 
}) => {
  const [showRegressionLine, setShowRegressionLine] = React.useState(false);

  // Colour scheme for charts
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    orange: '#F97316',
    gray: '#6B7280'
  };

  // Prepare historical data for charts
  const prepareHistoricalChartData = (data) => {
    if (!data || data.length === 0) return [];
    
    const movingAvg = calculateMovingAverage(data, 3);
    let regressionLine = [];
    if (showRegressionLine) {
      const regression = calculateLinearRegression(data);
      if (regression) {
        regressionLine = data.map((_, i) => regression.slope * i + regression.intercept);
      }
    }
    return data.map((value, index) => ({
      day: index + 1,
      hours: value,
      movingAverage: movingAvg[index] || 0,
      regression: regressionLine.length ? regressionLine[index] : undefined
    }));
  };

  // Calculate moving average for trend line
  const calculateMovingAverage = (data, window = 3) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const end = i + 1;
      const values = data.slice(start, end);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      result.push(average);
    }
    return result;
  };

  // Prepare budget forecast data
  const prepareBudgetChartData = () => {
    if (!budgetForecast) return [];
    
    return [
      {
        name: 'Current Usage',
        value: budgetForecast.currentUsage,
        fill: colors.primary
      },
      {
        name: 'Remaining Budget',
        value: budgetForecast.remainingBudget,
        fill: budgetForecast.remainingBudget > 0 ? colors.secondary : colors.danger
      },
      {
        name: 'Predicted Overrun',
        value: Math.max(0, budgetForecast.budgetVariance),
        fill: colors.danger
      }
    ].filter(item => item.value > 0);
  };

  // Prepare completion forecast data
  const prepareCompletionChartData = () => {
    if (!completionForecast) return [];
    
    return [
      {
        name: 'Completed',
        value: completionForecast.currentProgress,
        fill: colors.secondary
      },
      {
        name: 'Remaining',
        value: 100 - completionForecast.currentProgress,
        fill: colors.warning
      }
    ];
  };

  // Prepare resource demand data
  const prepareResourceDemandData = () => {
    if (!resourceDemand) return [];
    
    return resourceDemand.projectForecasts.map(forecast => ({
      name: forecast.projectCode,
      predicted: forecast.budgetForecast?.predictedTotalUsage || 0,
      budget: forecast.budgetForecast?.currentBudget || 0,
      priority: forecast.priority,
      progress: forecast.completionForecast?.currentProgress || 0
    }));
  };

  // Prepare priority distribution data
  const preparePriorityData = () => {
    if (!resourceDemand) return [];
    
    const priorityCounts = resourceDemand.projectForecasts.reduce((acc, forecast) => {
      acc[forecast.priority] = (acc[forecast.priority] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      fill: priority === 'critical' ? colors.danger : 
            priority === 'high' ? colors.warning :
            priority === 'medium' ? colors.primary : colors.secondary
    }));
  };

  // Custom tooltip for budget chart
  const CustomBudgetTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-blue-600">{payload[0].value.toFixed(1)} hours</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for historical data
  const CustomHistoricalTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">Day {label}</p>
          <p className="text-blue-600">Hours: {payload[0].value.toFixed(2)}</p>
          {payload[1] && (
            <p className="text-green-600">Moving Avg: {payload[1].value.toFixed(2)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Historical Data Chart */}
      {historicalData && historicalData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showRegressionLine}
                onChange={e => setShowRegressionLine(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Line of Best Fit</span>
            </label>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareHistoricalChartData(historicalData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomHistoricalTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="hours"
                stroke={colors.primary}
                strokeWidth={2}
                name="Daily Hours"
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="movingAverage"
                stroke={colors.secondary}
                strokeWidth={3}
                name="Moving Average"
                dot={false}
              />
              {showRegressionLine && (
                <Line
                  type="linear"
                  dataKey="regression"
                  stroke="#6366F1"
                  strokeWidth={2}
                  name="Line of Best Fit"
                  dot={false}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Budget Forecast Chart */}
      {budgetForecast && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareBudgetChartData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}h`}
                >
                  {prepareBudgetChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomBudgetTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Predicted</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                {
                  name: 'Current Budget',
                  value: budgetForecast.currentBudget,
                  fill: colors.secondary
                },
                {
                  name: 'Predicted Usage',
                  value: budgetForecast.predictedTotalUsage,
                  fill: budgetForecast.budgetVariance > 0 ? colors.danger : colors.primary
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Completion Forecast Chart */}
      {completionForecast && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareCompletionChartData()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {prepareCompletionChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Resource Demand Charts */}
      {resourceDemand && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Priorities</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={preparePriorityData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {preparePriorityData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilisation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'Total Budget',
                        value: resourceDemand.resourceUtilisation.totalBudget,
                        fill: colors.primary
                      },
                      {
                        name: 'Predicted Usage',
                        value: resourceDemand.resourceUtilisation.totalPredicted,
                        fill: resourceDemand.resourceUtilisation.utilisationRate > 100 ? colors.danger : colors.primary
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}h`}
                  >
                    <Cell fill={colors.primary} />
                    <Cell fill={resourceDemand.resourceUtilisation.utilisationRate > 100 ? colors.danger : colors.secondary} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Resource Demand</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={prepareResourceDemandData()} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="predicted" fill={colors.primary} name="Predicted Hours" />
                <Bar dataKey="budget" fill={colors.secondary} name="Budget Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastingCharts; 