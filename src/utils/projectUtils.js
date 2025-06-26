// Project Management Utilities
export const DEFAULT_PROJECTS = [
  { code: 'DEV-001', name: 'Frontend Development', category: 'Development', status: 'active', budget: 80, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'DEV-002', name: 'Backend Development', category: 'Development', status: 'active', budget: 120, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'DEV-003', name: 'Database Design', category: 'Development', status: 'active', budget: 40, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'TEST-001', name: 'Unit Testing', category: 'Testing', status: 'active', budget: 60, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'TEST-002', name: 'Integration Testing', category: 'Testing', status: 'active', budget: 80, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'TEST-003', name: 'User Acceptance Testing', category: 'Testing', status: 'active', budget: 100, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'DESIGN-001', name: 'UI/UX Design', category: 'Design', status: 'active', budget: 60, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'DESIGN-002', name: 'Graphic Design', category: 'Design', status: 'active', budget: 40, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'DOCS-001', name: 'Technical Documentation', category: 'Documentation', status: 'active', budget: 30, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'DOCS-002', name: 'User Documentation', category: 'Documentation', status: 'active', budget: 25, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'MEET-001', name: 'Team Meetings', category: 'Meeting', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'MEET-002', name: 'Client Meetings', category: 'Meeting', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'ADMIN-001', name: 'Administrative Tasks', category: 'Other', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'ADMIN-002', name: 'Project Planning', category: 'Other', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'SUPPORT-001', name: 'Technical Support', category: 'Other', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'SUPPORT-002', name: 'Bug Fixes', category: 'Other', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'RESEARCH-001', name: 'Technology Research', category: 'Research', status: 'active', budget: 50, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'RESEARCH-002', name: 'Market Research', category: 'Research', status: 'active', budget: 40, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'TRAINING-001', name: 'Employee Training', category: 'Other', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() },
  { code: 'TRAINING-002', name: 'Skill Development', category: 'Other', status: 'active', budget: 0, createdBy: 'system', createdAt: new Date().toISOString() }
];

export const PROJECT_CATEGORIES = [
  'Development',
  'Design',
  'Testing',
  'Documentation',
  'Meeting',
  'Research',
  'Maintenance',
  'Other'
];

export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Load projects from localStorage
export const loadProjects = () => {
  try {
    const savedProjects = localStorage.getItem('timesheetProjects');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
    // Initialize with default projects if none exist
    saveProjects(DEFAULT_PROJECTS);
    return DEFAULT_PROJECTS;
  } catch (error) {
    console.error('Error loading projects:', error);
    return DEFAULT_PROJECTS;
  }
};

// Save projects to localStorage
export const saveProjects = (projects) => {
  try {
    localStorage.setItem('timesheetProjects', JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error('Error saving projects:', error);
    return false;
  }
};

// Add a new project
export const addProject = (projectData, createdBy) => {
  const projects = loadProjects();
  
  // Validate project code uniqueness
  if (projects.find(p => p.code === projectData.code)) {
    throw new Error('Project code already exists');
  }
  
  const newProject = {
    ...projectData,
    status: projectData.status || 'active',
    createdBy: createdBy || 'unknown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedProjects = [...projects, newProject];
  saveProjects(updatedProjects);
  return newProject;
};

// Update an existing project
export const updateProject = (projectCode, updateData, updatedBy) => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.code === projectCode);
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  const updatedProject = {
    ...projects[projectIndex],
    ...updateData,
    updatedBy: updatedBy || 'unknown',
    updatedAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  saveProjects(projects);
  return updatedProject;
};

// Remove a project
export const removeProject = (projectCode, removedBy) => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.code === projectCode);
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  // Check if project is being used in time logs
  const timeLogs = JSON.parse(localStorage.getItem('timesheetLogs') || '[]');
  const isProjectInUse = timeLogs.some(log => log.projectCode === projectCode);
  
  if (isProjectInUse) {
    // Instead of deleting, mark as archived
    return updateProject(projectCode, { status: 'archived' }, removedBy);
  }
  
  const removedProject = projects[projectIndex];
  projects.splice(projectIndex, 1);
  saveProjects(projects);
  
  // Log the removal
  const eventLogs = JSON.parse(localStorage.getItem('timesheetEventLogs') || '[]');
  eventLogs.push({
    type: 'PROJECT_DELETED',
    timestamp: new Date().toISOString(),
    message: `Project ${removedProject.name} was deleted`,
    username: removedBy || 'unknown',
    projectCode: projectCode,
    projectName: removedProject.name
  });
  localStorage.setItem('timesheetEventLogs', JSON.stringify(eventLogs));
  
  return removedProject;
};

// Get active projects only
export const getActiveProjects = () => {
  const projects = loadProjects();
  return projects.filter(p => p.status === 'active');
};

// Get projects by category
export const getProjectsByCategory = (category) => {
  const projects = loadProjects();
  return projects.filter(p => p.category === category);
};

// Validate project code format
export const validateProjectCode = (code) => {
  const codeRegex = /^[A-Z]{2,}-\d{3}$/;
  return codeRegex.test(code);
};

// Generate next project code for a category
export const generateProjectCode = (category) => {
  const projects = loadProjects();
  const categoryPrefix = category.substring(0, 3).toUpperCase();
  const categoryProjects = projects.filter(p => p.code.startsWith(categoryPrefix));
  
  if (categoryProjects.length === 0) {
    return `${categoryPrefix}-001`;
  }
  
  const numbers = categoryProjects.map(p => {
    const match = p.code.match(/\d+$/);
    return match ? parseInt(match[0]) : 0;
  });
  
  const nextNumber = Math.max(...numbers) + 1;
  return `${categoryPrefix}-${nextNumber.toString().padStart(3, '0')}`;
};

// Search projects
export const searchProjects = (searchTerm, projects = null) => {
  const allProjects = projects || loadProjects();
  const term = searchTerm.toLowerCase();
  
  return allProjects.filter(project =>
    project.code.toLowerCase().includes(term) ||
    project.name.toLowerCase().includes(term) ||
    project.category.toLowerCase().includes(term)
  );
};

// Get project usage statistics
export const getProjectUsageStats = (projectCode) => {
  const timeLogs = JSON.parse(localStorage.getItem('timesheetLogs') || '[]');
  const projectLogs = timeLogs.filter(log => log.projectCode === projectCode);
  
  const totalHours = projectLogs.reduce((sum, log) => sum + (log.timeSpent / 3600), 0);
  const totalEntries = projectLogs.length;
  const uniqueUsers = [...new Set(projectLogs.map(log => log.username))];
  
  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalEntries,
    uniqueUsers: uniqueUsers.length,
    lastActivity: projectLogs.length > 0 ? Math.max(...projectLogs.map(log => new Date(log.timestamp).getTime())) : null
  };
};

// Budget Management Functions

// Get project budget information
export const getProjectBudget = (projectCode) => {
  const projects = loadProjects();
  const project = projects.find(p => p.code === projectCode);
  return project ? project.budget || 0 : 0;
};

// Set project budget
export const setProjectBudget = (projectCode, budget, setBy) => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.code === projectCode);
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  const updatedProject = {
    ...projects[projectIndex],
    budget: budget,
    budgetSetBy: setBy || 'unknown',
    budgetSetAt: new Date().toISOString()
  };
  
  projects[projectIndex] = updatedProject;
  saveProjects(projects);
  
  // Log budget change
  const eventLogs = JSON.parse(localStorage.getItem('timesheetEventLogs') || '[]');
  eventLogs.push({
    type: 'BUDGET_UPDATED',
    timestamp: new Date().toISOString(),
    message: `Budget for ${updatedProject.name} set to ${budget} hours`,
    username: setBy || 'unknown',
    projectCode: projectCode,
    projectName: updatedProject.name,
    budget: budget
  });
  localStorage.setItem('timesheetEventLogs', JSON.stringify(eventLogs));
  
  return updatedProject;
};

// Get project budget status
export const getProjectBudgetStatus = (projectCode) => {
  const budget = getProjectBudget(projectCode);
  if (budget === 0) return { status: 'no-budget', percentage: 0, remaining: 0 };
  
  const stats = getProjectUsageStats(projectCode);
  const used = stats.totalHours;
  const percentage = (used / budget) * 100;
  const remaining = budget - used;
  
  let status = 'under-budget';
  if (percentage >= 100) {
    status = 'over-budget';
  } else if (percentage >= 80) {
    status = 'near-limit';
  }
  
  return {
    status,
    percentage: Math.round(percentage * 100) / 100,
    used: Math.round(used * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    budget
  };
};

// Check for budget alerts
export const checkBudgetAlerts = () => {
  const projects = loadProjects();
  const alerts = [];
  
  projects.forEach(project => {
    if (project.budget > 0) {
      const budgetStatus = getProjectBudgetStatus(project.code);
      
      if (budgetStatus.status === 'over-budget') {
        alerts.push({
          type: 'BUDGET_EXCEEDED',
          severity: 'high',
          projectCode: project.code,
          projectName: project.name,
          message: `${project.name} has exceeded its budget of ${project.budget} hours (${budgetStatus.used} hours used)`,
          timestamp: new Date().toISOString(),
          budgetStatus
        });
      } else if (budgetStatus.status === 'near-limit') {
        alerts.push({
          type: 'BUDGET_WARNING',
          severity: 'medium',
          projectCode: project.code,
          projectName: project.name,
          message: `${project.name} is approaching its budget limit (${budgetStatus.percentage}% used)`,
          timestamp: new Date().toISOString(),
          budgetStatus
        });
      }
    }
  });
  
  return alerts;
};

// Get all budget alerts
export const getBudgetAlerts = () => {
  try {
    const savedAlerts = localStorage.getItem('timesheetBudgetAlerts');
    return savedAlerts ? JSON.parse(savedAlerts) : [];
  } catch (error) {
    console.error('Error loading budget alerts:', error);
    return [];
  }
};

// Save budget alerts
export const saveBudgetAlerts = (alerts) => {
  try {
    localStorage.setItem('timesheetBudgetAlerts', JSON.stringify(alerts));
    return true;
  } catch (error) {
    console.error('Error saving budget alerts:', error);
    return false;
  }
};

// Add budget alert
export const addBudgetAlert = (alert) => {
  const alerts = getBudgetAlerts();
  const newAlert = {
    ...alert,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  alerts.unshift(newAlert);
  saveBudgetAlerts(alerts);
  return newAlert;
};

// Mark alert as read
export const markAlertAsRead = (alertId) => {
  const alerts = getBudgetAlerts();
  const alertIndex = alerts.findIndex(alert => alert.id === alertId);
  
  if (alertIndex !== -1) {
    alerts[alertIndex].read = true;
    alerts[alertIndex].readAt = new Date().toISOString();
    saveBudgetAlerts(alerts);
  }
  
  return alerts[alertIndex];
};

// Clear all alerts
export const clearAllAlerts = () => {
  saveBudgetAlerts([]);
};

// Get unread alerts count
export const getUnreadAlertsCount = () => {
  const alerts = getBudgetAlerts();
  return alerts.filter(alert => !alert.read).length;
};
