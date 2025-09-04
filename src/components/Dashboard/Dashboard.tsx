import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../utils/supabase';
import { Project } from '../../types';
import { Plus, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_projects: 0,
    approved_projects: 0,
    pending_projects: 0,
    total_co2_absorbed: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const filters = user.role === 'project_owner' ? { owner_id: user.id } : {};
      const { data: projectsData } = await db.getProjects(filters);
      
      if (projectsData) {
        setProjects(projectsData);
        
        // Calculate stats
        const total = projectsData.length;
        const approved = projectsData.filter(p => p.status === 'approved').length;
        const pending = projectsData.filter(p => p.status === 'pending').length;
        const totalCO2 = projectsData
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + (p.carbon_calculations?.cumulative_co2_absorption || 0), 0);

        setStats({
          total_projects: total,
          approved_projects: approved,
          pending_projects: pending,
          total_co2_absorbed: totalCO2,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'under_review': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'rejected': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.profile.name}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'verifier' 
            ? 'Review and verify Blue Carbon projects to maintain registry integrity.'
            : 'Manage your Blue Carbon projects and track their environmental impact.'
          }
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_projects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved_projects}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending_projects}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CO₂ Absorbed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_co2_absorbed.toLocaleString()}</p>
              <p className="text-xs text-gray-500">tons annually</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-lg">
              <Waves className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/projects/new"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg hover:from-blue-100 hover:to-emerald-100 transition-all duration-200 group"
          >
            <Plus className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <p className="font-medium text-gray-900">Register New Project</p>
              <p className="text-sm text-gray-600">Start a new Blue Carbon initiative</p>
            </div>
          </Link>

          <Link
            to="/calculator"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg hover:from-emerald-100 hover:to-blue-100 transition-all duration-200 group"
          >
            <TrendingUp className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <p className="font-medium text-gray-900">Carbon Calculator</p>
              <p className="text-sm text-gray-600">Calculate sequestration potential</p>
            </div>
          </Link>

          <Link
            to="/impact"
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group"
          >
            <Waves className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <p className="font-medium text-gray-900">View Impact</p>
              <p className="text-sm text-gray-600">Explore climate impact stories</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.role === 'verifier' ? 'Projects for Review' : 'Your Projects'}
            </h2>
            <Link
              to="/projects"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Waves className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {user?.role === 'verifier' 
                  ? 'No projects pending verification' 
                  : 'No projects registered yet'
                }
              </p>
              {user?.role === 'project_owner' && (
                <Link
                  to="/projects/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Register Your First Project
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {project.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{project.location.address}</span>
                      <span>•</span>
                      <span className="capitalize">{project.ecosystem_type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{(project.area_m2 / 10000).toFixed(1)} hectares</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(project.status)}
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {project.carbon_calculations?.annual_co2_absorption?.toFixed(1) || 0} tons/year
                      </p>
                      <p className="text-xs text-gray-500">CO₂ absorption</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}