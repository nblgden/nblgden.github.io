# Real-Time Timesheet Tracker

A comprehensive React-based timesheet tracking application with role-based access control, real-time timer functionality, and advanced analytics.

## Features

### Core Features (Sprint 1)
- **User Authentication**: Login with username and role selection (Employee/Manager)
- **Real-Time Timer**: Start, pause, reset functionality with elapsed time display
- **Project Selection**: Dropdown with 20+ preset project/task codes
- **Data Persistence**: localStorage-based data storage
- **Clean UI**: Modern, responsive design with Tailwind CSS

### Enhanced Features (Sprint 2)
- **Role-Based Dashboards**: Separate interfaces for employees and managers
- **Advanced Analytics**: Charts using Recharts for time visualization
- **Project Distribution**: Bar charts, line charts, and pie charts
- **Time Tracking**: Per-project and per-day analytics
- **Background Timer**: Continues running even when page is refreshed

### Advanced Features (Sprint 3)
- **Timestamped Logs**: Every action (start, stop, pause, project switch) is logged with exact timestamps
- **Editable Time Entries**: Users can view and edit past logs with full edit tracking
- **Overdue Entry Warnings**: Alerts when time is added >24h after activity (memory decay risk)
- **Idle Time Alerts**: Notifications when timer runs without activity for >30 minutes
- **Audit Trail**: Managers can view detailed activity logs per user with timestamps
- **Undo Functionality**: Users can undo accidental entries or code switches
- **Accessibility Improvements**: Tooltips, focus indicators, improved keyboard navigation
- **Enhanced Project Selector**: Searchable dropdown with categorised projects

### Forecasting Analytics (Sprint 4)
- **Budget Forecasting**: Predict budget exhaustion dates and variance analysis
- **Project Completion Forecasting**: Estimate project completion dates based on current trends
- **Resource Demand Forecasting**: Analyse overall resource utilisation and project priorities
- **Trend Analysis**: Linear regression and moving averages for pattern recognition
- **Priority Scoring**: Automatic project prioritization based on budget and timeline urgency
- **Recommendations Engine**: AI-powered suggestions for resource allocation and risk mitigation
- **Real-time Updates**: Forecasting data updates automatically as new time entries are added

## Technology Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React Hooks
- **Data Storage**: localStorage
- **Build Tool**: Vite

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd timesheet-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Employee Features

#### Timer Interface
- **Select Project**: Choose from categorised project codes (Development, Testing, Design, etc.)
- **Start Timer**: Begin tracking time for the selected project
- **Pause/Resume**: Pause the timer and resume later
- **Save Time**: Save the current time entry to your log
- **Background Running**: Timer continues even when you switch tabs or refresh the page

#### Time Entries Management
- **View Entries**: See all your saved time entries
- **Edit Entries**: Modify project code, time spent, and add notes
- **Edit History**: Track all changes made to each entry
- **Undo Changes**: Revert to previous versions of edited entries
- **Overdue Warnings**: Get alerts for entries created more than 24 hours ago

#### Analytics
- **Project Distribution**: See how your time is distributed across projects
- **Daily Trends**: View your time tracking patterns over time
- **Time Summary**: Get insights into your productivity

### Manager Features

#### Overview Dashboard
- **Team Statistics**: Total hours, entries, active users, and recent activity
- **User Filtering**: Filter data by specific team members
- **Quick Analytics**: Overview charts for team performance
- **Recent Activity Feed**: Real-time activity from all team members

#### Audit Trail
- **Activity Logs**: Detailed logs of all user actions with timestamps
- **Event Filtering**: Filter by user, event type, and date range
- **Search Functionality**: Search through activity logs
- **Event Breakdown**: Statistics on different types of activities
- **Real-time Monitoring**: Track team activity patterns

#### Time Entry Management
- **All Entries**: View and manage time entries from all team members
- **Edit Capabilities**: Modify any team member's entries
- **Delete Entries**: Remove incorrect or duplicate entries
- **Edit Tracking**: Full audit trail of all changes made

#### Advanced Analytics
- **Team Performance**: Comprehensive analytics for the entire team
- **User Comparisons**: Compare productivity across team members
- **Project Insights**: Understand project time allocation
- **Trend Analysis**: Identify patterns and improvements

#### Forecasting Analytics
- **Budget Forecasting**: Predict when projects will exceed their budgets
- **Completion Forecasting**: Estimate project completion dates based on current progress
- **Resource Demand**: Analyse overall resource utilisation and identify bottlenecks
- **Project Priorities**: Automatic prioritization of projects based on urgency
- **Trend Analysis**: Linear regression analysis of time tracking patterns
- **Recommendations**: AI-powered suggestions for resource allocation
- **Real-time Updates**: Forecasting data updates as new time entries are added

## Key Components

### Timer Component
- Real-time countdown with background persistence
- Idle time detection and alerts
- Project switching with automatic logging
- Overdue entry warnings
- Enhanced accessibility with keyboard navigation

### EditableTimeEntries Component
- Inline editing of time entries
- Edit history tracking
- Undo functionality
- Overdue entry warnings
- Role-based permissions

### AuditTrail Component
- Comprehensive activity logging
- Advanced filtering and search
- Event categorization
- Real-time activity monitoring
- Export-ready data

### ProjectSelector Component
- Categorised project codes
- Search functionality
- Keyboard navigation
- Accessibility improvements
- Tooltips and focus indicators

### Forecasting Component
- Advanced analytics dashboard with multiple views
- Budget and completion forecasting
- Resource demand analysis
- Project priority scoring
- Trend analysis
- Real-time recommendations engine
- Interactive project selection for detailed forecasts

## UI/UX Features

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Indicators**: Clear visual focus states
- **ARIA Labels**: Proper accessibility markup
- **Screen Reader Support**: Semantic HTML structure
- **High Contrast**: Accessible color schemes

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Instant feedback for all actions
- **Intuitive Navigation**: Clear tab-based interface
- **Visual Feedback**: Status indicators and progress displays
- **Error Prevention**: Confirmation dialogs for critical actions

## Data Structure

### Time Log Entry
```javascript
{
  id: number,
  projectCode: string,
  timeSpent: number, // seconds
  minutes: number,
  date: string, // YYYY-MM-DD
  timestamp: string, // ISO string
  formattedTime: string, // HH:MM:SS
  username: string,
  notes?: string,
  lastEdited?: string,
  editHistory?: Array
}
```

### Event Log Entry
```javascript
{
  type: string, // TIMER_START, TIMER_PAUSE, etc.
  timestamp: string, // ISO string
  message: string,
  username: string,
  projectCode?: string,
  previousProject?: string,
  timeSpent?: number
}
```

## Security & Data

- **Local Storage**: All data is stored locally in the browser
- **Role-Based Access**: Different permissions for employees and managers
- **Audit Trail**: Complete history of all changes and actions
- **Data Validation**: Input validation and error handling

## Future Enhancements

### Potential Sprint 4 Features
- **Cloud Storage**: Backend integration for data persistence
- **Team Collaboration**: Real-time team updates
- **Export Functionality**: PDF/Excel report generation
- **Mobile App**: Native mobile application
- **API Integration**: Connect with project management tools
- **Advanced Reporting**: Custom report builder
- **Time Off Tracking**: Vacation and sick leave management
- **Invoice Generation**: Automatic invoice creation from time logs

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation above
- Review the code comments
- Open an issue in the repository

---

**Built with love using React and Tailwind CSS** 