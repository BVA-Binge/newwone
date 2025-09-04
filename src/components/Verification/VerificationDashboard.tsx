import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../utils/supabase';
import { blockchainService } from '../../utils/blockchain';
import { detectAnomalies } from '../../utils/carbonCalculator';
import { Project } from '../../types';
import toast from 'react-hot-toast';

export function VerificationDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationComments, setVerificationComments] = useState('');

  useEffect(() => {
    loadPendingProjects();
  }, []);

  const loadPendingProjects = async () => {
    try {
      const { data } = await db.getProjects({ status: 'pending' });
      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (projectId: string, action: 'approve' | 'reject') => {
    if (!user) return;

    setActionLoading(true);
    try {
      // Update project status
      const updates: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        verification_details: {
          verifier_id: user.id,
          verified_at: new Date().toISOString(),
          comments: verificationComments,
        },
      };

      // If approving, mint NFT
      let nftData = {};
      if (action === 'approve' && selectedProject) {
        const { nft_token_id, transaction_hash: nftTxHash } = await blockchainService.mintNFT(selectedProject);
        updates.verification_details.nft_token_id = nft_token_id;
        nftData = { nft_token_id, nft_transaction_hash: nftTxHash };
      }

      const { error } = await db.updateProject(projectId, updates);
      if (error) throw error;

      // Log verification on blockchain
      const { transaction_hash } = await blockchainService.logEvent({
        event_type: 'verification',
        project_id: projectId,
        data: {
          action,
          verifier_id: user.id,
          comments: verificationComments,
          ...nftData,
        },
        user_id: user.id,
      });

      toast.success(`Project ${action}d and logged on blockchain!`);
      setSelectedProject(null);
      setVerificationComments('');
      loadPendingProjects();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} project`);
    } finally {
      setActionLoading(false);
    }
  };

  if (user?.role !== 'verifier') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">Access denied. Verifier role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Verification</h1>
        <p className="text-gray-600">
          Review pending Blue Carbon projects and ensure data integrity before blockchain certification.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Projects ({projects.length})</h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  No pending projects
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {projects.map((project) => {
                    const anomalies = detectAnomalies(project, []);
                    return (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 ${
                          selectedProject?.id === project.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{project.location.address}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="capitalize">{project.ecosystem_type.replace('_', ' ')}</span>
                              <span>{(project.area_m2 / 10000).toFixed(1)} ha</span>
                              {anomalies.is_suspicious && (
                                <span className="text-red-500 flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Flagged
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Project Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.name}</h2>
                    <p className="text-gray-600">{selectedProject.description}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProject.credibility_score >= 80 ? 'bg-green-100 text-green-800' :
                      selectedProject.credibility_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Credibility: {selectedProject.credibility_score}%
                    </div>
                  </div>
                </div>

                {/* Anomaly Detection */}
                {(() => {
                  const anomalies = detectAnomalies(selectedProject, []);
                  return anomalies.is_suspicious && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="font-medium text-red-800">Potential Issues Detected</span>
                      </div>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {anomalies.flags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}

                {/* Project Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Address:</span> {selectedProject.location.address}</p>
                      <p><span className="text-gray-600">State:</span> {selectedProject.location.state}</p>
                      <p><span className="text-gray-600">District:</span> {selectedProject.location.district}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Project Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Ecosystem:</span> {selectedProject.ecosystem_type.replace('_', ' ')}</p>
                      <p><span className="text-gray-600">Area:</span> {(selectedProject.area_m2 / 10000).toFixed(2)} hectares</p>
                      <p><span className="text-gray-600">Organization:</span> {selectedProject.project_owner.organization}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carbon Calculations */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Sequestration Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedProject.carbon_calculations?.annual_co2_absorption?.toFixed(1) || 0}
                    </p>
                    <p className="text-sm text-gray-600">tons CO₂/year</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">
                      {selectedProject.carbon_calculations?.cumulative_co2_absorption?.toFixed(1) || 0}
                    </p>
                    <p className="text-sm text-gray-600">total tons CO₂</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {(selectedProject.carbon_calculations?.sequestration_factor || 0).toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">tons/ha/year factor</p>
                  </div>
                </div>
              </div>

              {/* Verification Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Decision</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Comments
                  </label>
                  <textarea
                    rows={3}
                    value={verificationComments}
                    onChange={(e) => setVerificationComments(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add verification notes or feedback..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleVerification(selectedProject.id, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    {actionLoading ? 'Processing...' : 'Approve & Mint NFT'}
                  </button>
                  
                  <button
                    onClick={() => handleVerification(selectedProject.id, 'reject')}
                    disabled={actionLoading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <XCircle className="h-5 w-5 inline mr-2" />
                    {actionLoading ? 'Processing...' : 'Reject Project'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                  All verification decisions are recorded on Polygon blockchain for transparency
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100">
              <div className="text-center">
                <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Project</h3>
                <p className="text-gray-600">Choose a project from the left panel to begin verification</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}