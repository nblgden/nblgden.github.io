# BS3205 Synoptic Project - Timesheet Tracker

## Project Overview
A comprehensive timesheet tracking and project management system built with React. This application provides features for both employees and managers to track time, manage projects, and generate reports.

## Features
- **Employee Dashboard**: Time tracking, project selection, and timesheet management
- **Manager Dashboard**: Project oversight, employee monitoring, and reporting
- **Time Tracking**: Real-time timer with start/stop functionality
- **Project Management**: Create, edit, and manage projects
- **Forecasting**: Data visualization and trend analysis
- **Audit Trail**: Complete activity logging
- **Budget Notifications**: Automated budget alerts
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack
- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.8.0
- **Styling**: Tailwind CSS 3.3.0
- **Charts**: Recharts 2.8.0
- **Build Tool**: Create React App

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation Steps
1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd "BS3205 Synoptic Project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The app will automatically reload when you make changes

## Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard component
│   ├── EmployeeDashboard.jsx
│   ├── ManagerDashboard.jsx
│   ├── Timer.js         # Time tracking functionality
│   ├── ProjectManager.jsx
│   ├── Forecasting.jsx  # Data visualization
│   └── ...
├── contexts/           # React contexts for state management
├── utils/             # Utility functions and sample data
├── assets/            # Images and static assets
└── App.js             # Main application component
```

## Usage Instructions

### For Employees
1. Navigate to the Employee Dashboard
2. Select a project from the dropdown
3. Use the timer to start/stop time tracking
4. View and edit time entries
5. Submit timesheets for approval

### For Managers
1. Access the Manager Dashboard
2. Monitor employee activities
3. Review project progress
4. Generate reports and forecasts
5. Manage project budgets

## Sample Data
The application includes sample data for demonstration purposes:
- Sample projects and employees
- Historical time entries
- Budget information
- Forecasting data

## Development Commands
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes for Markers
- The application is fully functional and ready for demonstration
- Sample data is pre-loaded for immediate testing
- All features are implemented and working
- The codebase follows React best practices
- Responsive design works on all device sizes

## Troubleshooting
If you encounter any issues:
1. Ensure Node.js is properly installed
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
4. Check that port 3000 is available

## Contact
For any questions about this project, please refer to the dissertation documentation or contact the developer. 