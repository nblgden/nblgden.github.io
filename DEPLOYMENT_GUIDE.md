# Deployment Guide for Dissertation Markers

## Quick Start (5 minutes)

### Option 1: Local Development (Recommended)
1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose LTS version (18.x or higher)

2. **Clone and Run**
   ```bash
   # Clone the repository
   git clone [REPOSITORY_URL]
   cd "BS3205 Synoptic Project"
   
   # Install dependencies
   npm install
   
   # Start the application
   npm start
   ```

3. **Access the Application**
   - Open browser to: http://localhost:3000
   - The app will automatically open in your default browser

### Option 2: Production Build
```bash
# Create production build
npm run build

# Serve the build (requires a simple HTTP server)
npx serve -s build
```

## What to Expect

### Application Features
- **Login Screen**: Choose between Employee and Manager roles
- **Employee Dashboard**: Time tracking, project selection, timesheet management
- **Manager Dashboard**: Team monitoring, analytics, forecasting
- **Real-time Timer**: Start/stop functionality with project tracking
- **Data Visualization**: Charts and graphs for time analysis
- **Responsive Design**: Works on desktop, tablet, and mobile

### Sample Data
The application comes pre-loaded with:
- Sample projects (Development, Testing, Design, etc.)
- Historical time entries
- User activity logs
- Budget and forecasting data

## Testing Checklist for Markers

### Core Functionality
- [ ] Application loads without errors
- [ ] Login screen allows role selection
- [ ] Timer starts and stops correctly
- [ ] Project selection works
- [ ] Time entries are saved and displayed
- [ ] Dashboard navigation works

### Employee Features
- [ ] Can select projects from dropdown
- [ ] Timer tracks time accurately
- [ ] Can view and edit time entries
- [ ] Timesheet submission works
- [ ] Analytics charts display correctly

### Manager Features
- [ ] Can view team statistics
- [ ] Audit trail shows activity logs
- [ ] Forecasting analytics work
- [ ] Can manage projects
- [ ] Budget notifications appear

### Technical Assessment
- [ ] Code is well-structured and readable
- [ ] Components are properly organized
- [ ] State management is implemented correctly
- [ ] UI is responsive and accessible
- [ ] Error handling is in place

## Troubleshooting

### Common Issues
1. **Port 3000 already in use**
   - The app will automatically suggest an alternative port
   - Or manually kill the process using the port

2. **Node modules not found**
   - Run `npm install` again
   - Clear cache: `npm cache clean --force`

3. **Build errors**
   - Ensure Node.js version is 14 or higher
   - Check for syntax errors in console

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 14 or higher
- **Browser**: Chrome, Firefox, Safari, or Edge
- **Memory**: 4GB RAM minimum
- **Storage**: 500MB free space

## Evaluation Notes

### Code Quality
- React functional components with hooks
- Tailwind CSS for styling
- Recharts for data visualization
- Local storage for data persistence
- Responsive design principles

### Architecture
- Component-based architecture
- Separation of concerns
- Utility functions for data processing
- Context API for state management

### User Experience
- Intuitive navigation
- Real-time feedback
- Accessible design
- Mobile-responsive layout

## Contact Information
For technical questions about this project, please refer to the dissertation documentation or contact the student directly.

---
**Project**: BS3205 Synoptic Project - Timesheet Tracker  
**Technology Stack**: React, Tailwind CSS, Recharts  
**Last Updated**: [Current Date] 