import React, { useState, useRef, useEffect } from 'react';
import { getActiveProjects } from '../utils/projectUtils';

const ProjectSelector = ({ currentProject, onProjectChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectOptions, setProjectOptions] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load projects on component mount and when projects are updated
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
    setProjectOptions(projects);
  };

  // Group projects by category
  const groupedProjects = projectOptions.reduce((acc, project) => {
    if (!acc[project.category]) {
      acc[project.category] = [];
    }
    acc[project.category].push(project);
    return acc;
  }, {});

  // Filter projects based on search term
  const filteredProjects = Object.entries(groupedProjects).map(([category, projects]) => ({
    category,
    projects: projects.filter(project =>
      project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.projects.length > 0);

  const handleSelect = (projectCode) => {
    onProjectChange(projectCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCurrentProjectName = () => {
    const project = projectOptions.find(p => p.code === currentProject);
    return project ? ${project.code} -  : 'Select a project...';
  };

  const getCurrentProjectStatus = () => {
    const project = projectOptions.find(p => p.code === currentProject);
    return project ? project.status : null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor="project-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Project Code
      </label>
      
      <button
        id="project-selector"
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="project-selector-label"
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 transition-colors duration-200"
        title="Select a project to track time for"
      >
        <span id="project-selector-label" className="block truncate">
          {getCurrentProjectName()}
        </span>
        {getCurrentProjectStatus() && getCurrentProjectStatus() !== 'active' && (
          <span className="text-xs text-orange-600 ml-2">
            ({getCurrentProjectStatus()})
          </span>
        )}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search projects"
            />
          </div>

          {/* Project List */}
          <div role="listbox" aria-label="Project options">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((group) => (
                <div key={group.category}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">
                    {group.category}
                  </div>
                  {group.projects.map((project) => (
                    <button
                      key={project.code}
                      type="button"
                      onClick={() => handleSelect(project.code)}
                      className={w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset }
                      role="option"
                      aria-selected={currentProject === project.code}
                      title={${project.code} - }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{project.code}</div>
                          <div className="text-xs text-gray-500 truncate">{project.name}</div>
                          {project.description && (
                            <div className="text-xs text-gray-400 truncate">{project.description}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {project.status !== 'active' && (
                            <span className={	ext-xs px-2 py-1 rounded-full }>
                              {project.status}
                            </span>
                          )}
                          {currentProject === project.code && (
                            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? (
                  <>No projects found matching "{searchTerm}"</>
                ) : (
                  <>No active projects available</>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500">
        {projectOptions.length === 0 ? (
          <span className="text-orange-600">No projects available. Contact your manager to add projects.</span>
        ) : (
          'Select a project code to start tracking your time'
        )}
      </p>
    </div>
  );
};

export default ProjectSelector;
