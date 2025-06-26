import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  loadProjects, 
  addProject, 
  updateProject, 
  removeProject, 
  PROJECT_CATEGORIES, 
  PROJECT_STATUSES,
  getProjectBudgetStatus
} from '../utils/projectUtils';

// Project Budget Status Component
const ProjectBudgetStatus = ({ projectCode }) => {
  const [budgetStatus, setBudgetStatus] = useState(null);

  useEffect(() => {
    const status = getProjectBudgetStatus(projectCode);
    setBudgetStatus(status);
  }, [projectCode]);

  if (!budgetStatus || budgetStatus.status === 'no-budget') {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'over-budget':
        return 'text-red-600';
      case 'near-limit':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className="text-xs">
      <div className={`${getStatusColor(budgetStatus.status)}`}>
        {budgetStatus.used}h / {budgetStatus.budget}h ({budgetStatus.percentage}%)
      </div>
      {budgetStatus.status === 'over-budget' && (
        <div className="text-red-500 font-medium">Over Budget!</div>
      )}
      {budgetStatus.status === 'near-limit' && (
        <div className="text-yellow-500 font-medium">Near Limit</div>
      )}
    </div>
  );
};

const ProjectManager = ({ user, onProjectsUpdate }) => {
  const [projects, setProjects] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Development',
    status: 'active',
    description: '',
    budget: 0
  });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProjectsData();
  }, []);

  const loadProjectsData = () => {
    const savedProjects = loadProjects();
    setProjects(savedProjects);
  };

  // Calculate filtered projects using useMemo to prevent re-renders
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchTerm, sortBy, sortOrder, filterCategory, filterStatus]);

  // Stable callback functions to prevent re-renders
  const handleCodeChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }));
  }, []);

  const handleNameChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, category: e.target.value }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, status: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleBudgetChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, budget: value }));
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: 'Development',
      status: 'active',
      description: '',
      budget: 0
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.code.trim()) {
      errors.code = 'Project code is required';
    } else if (formData.code.length < 3) {
      errors.code = 'Project code must be at least 3 characters';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (formData.budget < 0) {
      errors.budget = 'Budget cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProject = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEditProject = (project) => {
    setFormData({
      code: project.code,
      name: project.name,
      category: project.category,
      status: project.status,
      description: project.description || '',
      budget: project.budget || 0
    });
    setIsEditing(true);
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        // Update existing project
        updateProject(formData.code, formData, user.username);
        loadProjectsData(); // Reload projects
        
        // Log the update event
        const eventLogs = JSON.parse(localStorage.getItem('timesheetEventLogs') || '[]');
        eventLogs.push({
          type: 'PROJECT_UPDATED',
          timestamp: new Date().toISOString(),
          message: `Updated project: ${formData.name} (${formData.code})`,
          username: user.username,
          projectCode: formData.code
        });
        localStorage.setItem('timesheetEventLogs', JSON.stringify(eventLogs));
        
        setIsEditModalOpen(false);
      } else {
        // Add new project
        addProject(formData, user.username);
        loadProjectsData(); // Reload projects
        
        // Log the add event
        const eventLogs = JSON.parse(localStorage.getItem('timesheetEventLogs') || '[]');
        eventLogs.push({
          type: 'PROJECT_ADDED',
          timestamp: new Date().toISOString(),
          message: `Added new project: ${formData.name} (${formData.code})`,
          username: user.username,
          projectCode: formData.code
        });
        localStorage.setItem('timesheetEventLogs', JSON.stringify(eventLogs));
        
        setIsAddModalOpen(false);
      }
      
      if (onProjectsUpdate) {
        onProjectsUpdate(projects);
      }
      
      resetForm();
    } catch (error) {
      setFormErrors({ submit: error.message || 'Failed to save project. Please try again.' });
    }
  };

  const handleDeleteProject = async (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;
    
    try {
      removeProject(projectToDelete.code, user.username);
      loadProjectsData(); // Reload projects
      
      if (onProjectsUpdate) {
        onProjectsUpdate(projects);
      }
      
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error.message || 'Failed to delete project. Please try again.');
    }
  };

  const handleGenerateCode = () => {
    const category = formData.category || 'DEV';
    const prefix = category.substring(0, 3).toUpperCase();
    const existingCodes = projects.map(p => p.code);
    let counter = 1;
    let newCode = `${prefix}-${counter.toString().padStart(3, '0')}`;
    
    while (existingCodes.includes(newCode)) {
      counter++;
      newCode = `${prefix}-${counter.toString().padStart(3, '0')}`;
    }
    
    setFormData(prev => ({ ...prev, code: newCode }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const ProjectModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">Manage and organise your projects</p>
        </div>
        <button
          onClick={handleAddProject}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {PROJECT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {PROJECT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="code">Code</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
            </select>
          </div>
        </div>

        {/* Sort Order */}
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="asc"
              checked={sortOrder === 'asc'}
              onChange={(e) => setSortOrder(e.target.value)}
              className="mr-2"
            />
            Ascending
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="desc"
              checked={sortOrder === 'desc'}
              onChange={(e) => setSortOrder(e.target.value)}
              className="mr-2"
            />
            Descending
          </label>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.budget > 0 ? (
                      <div>
                        <div className="font-medium">{project.budget}h</div>
                        <ProjectBudgetStatus projectCode={project.code} />
                      </div>
                    ) : (
                      <span className="text-gray-400">No budget</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {PROJECT_STATUSES.find(s => s.value === project.status)?.label || project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(project.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <ProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Code *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={handleCodeChange}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.code ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., DEV-001"
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Generate
                </button>
              </div>
              {formErrors.code && <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter project name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                {PROJECT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PROJECT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (hours)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={handleBudgetChange}
              min="0"
              step="0.5"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.budget ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter budget in hours (0 for no budget)"
            />
            <p className="mt-1 text-sm text-gray-500">Set to 0 for projects without budget limits</p>
            {formErrors.budget && <p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>}
          </div>

          {formErrors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{formErrors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Project
            </button>
          </div>
        </form>
      </ProjectModal>

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={handleCodeChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.code ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., DEV-001"
              />
              {formErrors.code && <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter project name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
              >
                {PROJECT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PROJECT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (hours)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={handleBudgetChange}
              min="0"
              step="0.5"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.budget ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter budget in hours (0 for no budget)"
            />
            <p className="mt-1 text-sm text-gray-500">Set to 0 for projects without budget limits</p>
            {formErrors.budget && <p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>}
          </div>

          {formErrors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{formErrors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Project
            </button>
          </div>
        </form>
      </ProjectModal>

      {/* Delete Confirmation Modal */}
      <ProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Delete Project</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Are you sure you want to delete the project "{projectToDelete?.name}" ({projectToDelete?.code})?
                  </p>
                  <p className="mt-1">
                    This action cannot be undone and will remove all associated data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>
      </ProjectModal>
    </div>
  );
};

export default ProjectManager;
