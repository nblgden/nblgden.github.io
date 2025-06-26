// Forecasting Analytics Utilities
import { loadProjects, getProjectUsageStats } from './projectUtils';

// Linear regression for trend analysis
export const calculateLinearRegression = (data) => {
  const n = data.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  data.forEach((point, index) => {
    sumX += index;
    sumY += point;
    sumXY += index * point;
    sumX2 += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// Calculate moving average
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

// Get historical data for a project
const getProjectHistoricalData = (projectCode, days = 30) => {
  const timeLogs = JSON.parse(localStorage.getItem('timesheetLogs') || '[]');
  const projectLogs = timeLogs.filter(log => log.projectCode === projectCode);
  
  // Group by date and calculate daily hours
  const dailyData = {};
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  projectLogs.forEach(log => {
    const logDate = new Date(log.timestamp);
    if (logDate >= cutoffDate) {
      const dateKey = logDate.toISOString().split('T')[0];
      dailyData[dateKey] = (dailyData[dateKey] || 0) + (log.timeSpent / 3600);
    }
  });
  
  // Convert to array and fill missing dates with 0
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dateKey = date.toISOString().split('T')[0];
    result.push(dailyData[dateKey] || 0);
  }
  
  return result;
};

// Calculate realistic daily rate based on work patterns
const calculateRealisticDailyRate = (historicalData) => {
  // Filter out days with no work (likely weekends/holidays)
  const activeDays = historicalData.filter(hours => hours > 0);
  
  if (activeDays.length === 0) {
    return 0;
  }
  
  // Calculate average hours per active work day
  const avgHoursPerWorkDay = activeDays.reduce((sum, hours) => sum + hours, 0) / activeDays.length;
  
  // Calculate work frequency (what percentage of days have work)
  const workFrequency = activeDays.length / historicalData.length;
  
  // Realistic daily rate = average hours per work day × work frequency
  // This accounts for the fact that work doesn't happen every day
  return avgHoursPerWorkDay * workFrequency;
};

// Budget Forecasting
export const forecastBudget = (projectCode, forecastDays = 30) => {
  try {
    const projects = loadProjects();
    const project = projects.find(p => p.code === projectCode);
    
    if (!project || !project.budget || project.budget === 0) {
      return null;
    }
    
    const historicalData = getProjectHistoricalData(projectCode, 30);
    const regression = calculateLinearRegression(historicalData);
    
    if (!regression) {
      return null;
    }
    
    // Calculate current usage
    const currentUsage = getProjectUsageStats(projectCode).totalHours || 0;
    const remainingBudget = project.budget - currentUsage;
    
    // Predict daily usage using realistic rate
    const predictedDailyUsage = calculateRealisticDailyRate(historicalData);
    const predictedTotalUsage = currentUsage + (predictedDailyUsage * forecastDays);
    
    // Calculate forecast metrics
    const budgetExhaustionDate = remainingBudget > 0 && predictedDailyUsage > 0 
      ? Math.floor(remainingBudget / predictedDailyUsage) 
      : null;
    
    const budgetVariance = predictedTotalUsage - project.budget;
    const budgetVariancePercentage = (budgetVariance / project.budget) * 100;
    
    return {
      projectCode,
      projectName: project.name,
      currentBudget: project.budget,
      currentUsage,
      remainingBudget,
      predictedDailyUsage: Math.max(0, predictedDailyUsage),
      predictedTotalUsage: Math.max(currentUsage, predictedTotalUsage),
      budgetExhaustionDate,
      budgetVariance,
      budgetVariancePercentage,
      trend: predictedDailyUsage > 2 ? 'increasing' : predictedDailyUsage > 0.5 ? 'stable' : 'decreasing',
      historicalData,
      movingAverage: calculateMovingAverage(historicalData)
    };
  } catch (error) {
    console.error('Error in forecastBudget:', error);
    return null;
  }
};

// Project Completion Forecasting
export const forecastProjectCompletion = (projectCode) => {
  try {
    const projects = loadProjects();
    const project = projects.find(p => p.code === projectCode);
    
    if (!project || !project.budget || project.budget === 0) {
      return null;
    }
    
    const historicalData = getProjectHistoricalData(projectCode, 30);
    const regression = calculateLinearRegression(historicalData);
    
    if (!regression) {
      return null;
    }
    
    const currentUsage = getProjectUsageStats(projectCode).totalHours || 0;
    const remainingWork = project.budget - currentUsage;
    
    if (remainingWork <= 0) {
      return {
        projectCode,
        projectName: project.name,
        status: 'completed',
        completionDate: new Date().toISOString(),
        actualHours: currentUsage,
        estimatedHours: project.budget,
        variance: currentUsage - project.budget,
        currentProgress: 100,
        remainingWork: 0,
        predictedDailyProgress: 0,
        daysToCompletion: 0,
        trend: 'completed'
      };
    }
    
    // Predict completion based on realistic daily rate
    const predictedDailyProgress = calculateRealisticDailyRate(historicalData);
    const daysToCompletion = predictedDailyProgress > 0 
      ? Math.ceil(remainingWork / predictedDailyProgress)
      : null;
    
    const completionDate = daysToCompletion 
      ? new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000)
      : null;
    
    return {
      projectCode,
      projectName: project.name,
      status: 'in-progress',
      currentProgress: (currentUsage / project.budget) * 100,
      remainingWork,
      predictedDailyProgress: Math.max(0, predictedDailyProgress),
      daysToCompletion,
      completionDate: completionDate?.toISOString(),
      trend: predictedDailyProgress > 2 ? 'accelerating' : predictedDailyProgress > 0.5 ? 'steady' : 'slowing'
    };
  } catch (error) {
    console.error('Error in forecastProjectCompletion:', error);
    return null;
  }
};

// Resource Demand Forecasting
export const forecastResourceDemand = (forecastDays = 30) => {
  try {
    const projects = loadProjects();
    const activeProjects = projects.filter(p => p.status === 'active' && p.budget > 0);
    
    const forecasts = activeProjects.map(project => {
      const budgetForecast = forecastBudget(project.code, forecastDays);
      const completionForecast = forecastProjectCompletion(project.code);
      
      return {
        projectCode: project.code,
        projectName: project.name,
        category: project.category,
        budgetForecast,
        completionForecast,
        priority: calculateProjectPriority(project, budgetForecast, completionForecast)
      };
    });
    
    // Calculate overall resource demand
    const totalPredictedHours = forecasts.reduce((sum, forecast) => {
      return sum + (forecast.budgetForecast?.predictedTotalUsage || 0);
    }, 0);
    
    const criticalProjects = forecasts.filter(f => f.priority === 'critical');
    const highPriorityProjects = forecasts.filter(f => f.priority === 'high');
    
    return {
      totalPredictedHours,
      criticalProjects: criticalProjects.length,
      highPriorityProjects: highPriorityProjects.length,
      projectForecasts: forecasts,
      resourceUtilisation: calculateResourceUtilisation(forecasts),
      recommendations: generateResourceRecommendations(forecasts)
    };
  } catch (error) {
    console.error('Error in forecastResourceDemand:', error);
    return {
      totalPredictedHours: 0,
      criticalProjects: 0,
      highPriorityProjects: 0,
      projectForecasts: [],
      resourceUtilisation: { totalBudget: 0, totalPredicted: 0, utilisationRate: 0, efficiency: 0 },
      recommendations: []
    };
  }
};

// Calculate project priority based on forecasts
const calculateProjectPriority = (project, budgetForecast, completionForecast) => {
  if (!budgetForecast || !completionForecast) return 'medium';
  
  let score = 0;
  
  // Budget urgency
  if (budgetForecast.budgetExhaustionDate && budgetForecast.budgetExhaustionDate <= 7) {
    score += 3;
  } else if (budgetForecast.budgetExhaustionDate && budgetForecast.budgetExhaustionDate <= 14) {
    score += 2;
  } else if (budgetForecast.budgetVariancePercentage > 20) {
    score += 1;
  }
  
  // Completion urgency
  if (completionForecast.daysToCompletion && completionForecast.daysToCompletion <= 7) {
    score += 3;
  } else if (completionForecast.daysToCompletion && completionForecast.daysToCompletion <= 14) {
    score += 2;
  }
  
  // Progress urgency
  if (completionForecast.currentProgress > 80) {
    score += 1;
  }
  
  if (score >= 5) return 'critical';
  if (score >= 3) return 'high';
  if (score >= 1) return 'medium';
  return 'low';
};

// Calculate resource utilisation
const calculateResourceUtilisation = (forecasts) => {
  if (!forecasts || forecasts.length === 0) {
    return {
      totalBudget: 0,
      totalPredicted: 0,
      utilisationRate: 0,
      efficiency: 0
    };
  }

  const totalBudget = forecasts.reduce((sum, forecast) => sum + (forecast.currentBudget || 0), 0);
  const totalPredicted = forecasts.reduce((sum, forecast) => sum + (forecast.predictedBudget || 0), 0);

  return {
    totalBudget,
    totalPredicted,
    utilisationRate: totalBudget > 0 ? (totalPredicted / totalBudget) * 100 : 0,
    efficiency: totalPredicted > 0 ? (totalBudget / totalPredicted) * 100 : 0
  };
};

// Generate resource recommendations
const generateResourceRecommendations = (forecasts) => {
  const recommendations = [];
  
  // Budget overruns
  const overBudgetProjects = forecasts.filter(f => 
    f.budgetForecast && f.budgetForecast.budgetVariancePercentage > 10
  );
  
  if (overBudgetProjects.length > 0) {
    recommendations.push({
      type: 'budget_overrun',
      severity: 'high',
      message: `${overBudgetProjects.length} project(s) are predicted to exceed budget`,
      projects: overBudgetProjects.map(f => f.projectCode)
    });
  }
  
  // Resource conflicts
  const criticalProjects = forecasts.filter(f => f.priority === 'critical');
  if (criticalProjects.length > 3) {
    recommendations.push({
      type: 'resource_conflict',
      severity: 'medium',
      message: 'Multiple critical projects may require resource reallocation',
      projects: criticalProjects.map(f => f.projectCode)
    });
  }
  
  // Completion delays
  const delayedProjects = forecasts.filter(f => 
    f.completionForecast && f.completionForecast.trend === 'slowing'
  );
  
  if (delayedProjects.length > 0) {
    recommendations.push({
      type: 'completion_delay',
      severity: 'medium',
      message: `${delayedProjects.length} project(s) show slowing progress`,
      projects: delayedProjects.map(f => f.projectCode)
    });
  }
  
  return recommendations;
};

// Get forecasting summary for dashboard
export const getForecastingSummary = () => {
  try {
    const projects = loadProjects();
    const activeProjects = projects.filter(p => p.status === 'active' && p.budget > 0);
    
    const forecasts = activeProjects.map(project => ({
      budget: forecastBudget(project.code),
      completion: forecastProjectCompletion(project.code)
    }));
    
    const criticalProjects = forecasts.filter(f => 
      f.budget && (f.budget.budgetExhaustionDate <= 7 || f.budget.budgetVariancePercentage > 20)
    ).length;
    
    const delayedProjects = forecasts.filter(f => 
      f.completion && f.completion.trend === 'slowing'
    ).length;
    
    const totalPredictedHours = forecasts.reduce((sum, f) => {
      return sum + (f.budget?.predictedTotalUsage || 0);
    }, 0);
    
    return {
      totalProjects: activeProjects.length,
      criticalProjects,
      delayedProjects,
      totalPredictedHours: Math.round(totalPredictedHours * 100) / 100
    };
  } catch (error) {
    console.error('Error in getForecastingSummary:', error);
    return {
      totalProjects: 0,
      criticalProjects: 0,
      delayedProjects: 0,
      totalPredictedHours: 0
    };
  }
}; 