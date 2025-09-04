import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, MapPin, Building2, Phone, Mail, Users, Leaf } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../utils/supabase';
import { blockchainService } from '../../utils/blockchain';
import { calculateCarbonSequestration } from '../../utils/carbonCalculator';
import { SEQUESTRATION_FACTORS } from '../../config/constants';
import toast from 'react-hot-toast';

export function ProjectForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      coordinates: [0, 0] as [number, number],
      address: '',
      state: '',
      district: '',
    },
    area_m2: 0,
    ecosystem_type: 'mangrove' as keyof typeof SEQUESTRATION_FACTORS,
    project_owner: {
      organization: user?.profile.organization || '',
      contact_name: user?.profile.name || '',
      email: user?.email || '',
      phone: user?.profile.phone || '',
    },
    stakeholders: [
      { name: '', role: '', organization: '' }
    ],
  });

  const addStakeholder = () => {
    setFormData(prev => ({
      ...prev,
      stakeholders: [...prev.stakeholders, { name: '', role: '', organization: '' }]
    }));
  };

  const updateStakeholder = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.map((stakeholder, i) => 
        i === index ? { ...stakeholder, [field]: value } : stakeholder
      )
    }));
  };

  const removeStakeholder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Calculate carbon sequestration
      const carbonCalcs = calculateCarbonSequestration({
        area_m2: formData.area_m2,
        ecosystem_type: formData.ecosystem_type,
        years: 20,
      });

      // Create project in database
      const { data: project, error } = await db.createProject({
        ...formData,
        owner_id: user.id,
        status: 'pending',
        credibility_score: 100, // Start with full credibility
        carbon_calculations: carbonCalcs,
        blockchain_events: [],
      });

      if (error) throw error;

      // Log registration on blockchain
      const { transaction_hash } = await blockchainService.logEvent({
        event_type: 'registration',
        project_id: project.id,
        data: {
          project_name: formData.name,
          ecosystem_type: formData.ecosystem_type,
          area_m2: formData.area_m2,
          calculated_absorption: carbonCalcs.annual_absorption,
        },
        user_id: user.id,
      });

      // Update project with blockchain event
      await db.updateProject(project.id, {
        blockchain_events: [{
          event_type: 'registration',
          transaction_hash,
          timestamp: new Date().toISOString(),
        }]
      });

      toast.success('Project registered successfully on blockchain!');
      navigate('/projects');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Blue Carbon Project</h1>
        <p className="text-gray-600">
          Submit your coastal ecosystem conservation project for verification and blockchain registration.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
      >
        {/* Project Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Leaf className="h-6 w-6 text-emerald-600 mr-2" />
            Project Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mumbai Mangrove Restoration Initiative"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your Blue Carbon project, its objectives, and expected environmental impact..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ecosystem Type *
              </label>
              <select
                required
                value={formData.ecosystem_type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  ecosystem_type: e.target.value as keyof typeof SEQUESTRATION_FACTORS 
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(SEQUESTRATION_FACTORS).map(([type, factor]) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()} ({factor} tons CO₂/ha/year)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Area (m²) *
              </label>
              <input
                type="number"
                required
                min="1000"
                value={formData.area_m2}
                onChange={(e) => setFormData(prev => ({ ...prev, area_m2: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter area in square meters"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.area_m2 > 0 && `${(formData.area_m2 / 10000).toFixed(2)} hectares`}
              </p>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-6 w-6 text-blue-600 mr-2" />
            Location Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, address: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Complete address of the project site"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.location.state}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, state: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <input
                type="text"
                required
                value={formData.location.district}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, district: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mumbai"
              />
            </div>
          </div>
        </div>

        {/* Stakeholders */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 text-purple-600 mr-2" />
            Project Stakeholders
          </h2>
          
          {formData.stakeholders.map((stakeholder, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={stakeholder.name}
                  onChange={(e) => updateStakeholder(index, 'name', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Stakeholder name"
                />
                <input
                  type="text"
                  value={stakeholder.role}
                  onChange={(e) => updateStakeholder(index, 'role', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Role (e.g., Local Community Leader)"
                />
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={stakeholder.organization}
                    onChange={(e) => updateStakeholder(index, 'organization', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Organization"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeStakeholder(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addStakeholder}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            + Add Another Stakeholder
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registering on Blockchain...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Register Project
              </div>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}