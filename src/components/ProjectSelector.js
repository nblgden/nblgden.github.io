import React, { useState, useEffect } from 'react';
import { getActiveProjects } from '../utils/projectUtils';

const ProjectSelector = ({ currentProject, onProjectChange }) => {
  const [projectCodes, setProjectCodes] = useState([]);

  useEffect(() => {
    loadProjects();
    
    // Listen for project updates
    const handleStorageChange = (e) => {
      if (e.key === 'timesheetProjects') {
        loadProjects();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadProjects = () => {
    const projects = getActiveProjects();
    setProjectCodes(projects);
  };

  return (
    <div>
      <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Project/Task
      </label>
      <select
        id="project-select"
        value={currentProject}
        onChange={(e) => onProjectChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Choose a project or task...</option>
        {projectCodes.map((project) => (
          <option key={project.code} value={project.code}>
            {project.code} - {project.name}
          </option>
        ))}
      </select>
      
      {currentProject && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            <strong>Selected:</strong> {currentProject}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {projectCodes.find(p => p.code === currentProject)?.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector; 