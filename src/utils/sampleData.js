// Sample data for testing forecasting analytics
import { saveProjects } from './projectUtils';

export const addSampleData = () => {
  // Sample projects with budgets
  const sampleProjects = [
    {
      code: 'WEB001',
      name: 'Website Redesign',
      category: 'Development',
      status: 'active',
      budget: 120,
      description: 'Complete website redesign project'
    },
    {
      code: 'MOB002',
      name: 'Mobile App Development',
      category: 'Development',
      status: 'active',
      budget: 200,
      description: 'iOS and Android mobile application'
    },
    {
      code: 'MKT003',
      name: 'Marketing Campaign',
      category: 'Marketing',
      status: 'active',
      budget: 80,
      description: 'Q4 marketing campaign'
    },
    {
      code: 'RES004',
      name: 'Research Project',
      category: 'Research',
      status: 'active',
      budget: 150,
      description: 'Market research and analysis'
    },
    {
      code: 'SUP005',
      name: 'Support System',
      category: 'Support',
      status: 'active',
      budget: 60,
      description: 'Customer support system implementation'
    }
  ];

  // Sample time logs for the last 30 days
  const sampleTimeLogs = [];
  const now = new Date();
  
  // Generate time logs for each project over the last 30 days
  sampleProjects.forEach(project => {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Random hours between 2-8 hours per day
      const hours = Math.random() * 6 + 2;
      const timeSpent = hours * 3600; // Convert to seconds
      
      // Add some variation - some days no work, some days more work
      if (Math.random() > 0.3) { // 70% chance of having work on a given day
        sampleTimeLogs.push({
          id: `log_${project.code}_${i}`,
          username: 'manager',
          projectCode: project.code,
          timeSpent: timeSpent,
          minutes: Math.round(timeSpent / 60),
          formattedTime: formatTime(timeSpent),
          notes: `Work on ${project.name}`,
          timestamp: date.toISOString()
        });
      }
    }
  });

  // Save projects
  saveProjects(sampleProjects);
  
  // Save time logs
  const existingLogs = JSON.parse(localStorage.getItem('timesheetLogs') || '[]');
  const allLogs = [...existingLogs, ...sampleTimeLogs];
  localStorage.setItem('timesheetLogs', JSON.stringify(allLogs));
  
  console.log('Sample data added successfully!');
  console.log(`Added ${sampleProjects.length} projects and ${sampleTimeLogs.length} time logs`);
};

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Function to clear sample data
export const clearSampleData = () => {
  localStorage.removeItem('timesheetProjects');
  localStorage.removeItem('timesheetLogs');
  console.log('Sample data cleared successfully!');
}; 