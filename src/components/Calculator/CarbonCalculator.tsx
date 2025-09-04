import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Zap, Car, Home, Trees, Shield, TrendingUp, Target } from 'lucide-react';
import { calculateCarbonSequestration, calculateRequiredArea } from '../../utils/carbonCalculator';
import { SEQUESTRATION_FACTORS, DEFAULT_BUFFERS } from '../../config/constants';
import { blockchainService } from '../../utils/blockchain';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../utils/supabase';
import toast from 'react-hot-toast';

type CalculatorMode = 'standard' | 'policy';

export function CarbonCalculator() {
  const { user } = useAuth();
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [loading, setLoading] = useState(false);

  // Standard mode inputs
  const [area, setArea] = useState(100000); // m²
  const [areaUnit, setAreaUnit] = useState<'m2' | 'ft2'>('m2');
  const [ecosystemType, setEcosystemType] = useState<keyof typeof SEQUESTRATION_FACTORS>('mangrove');
  const [years, setYears] = useState(20);
  
  // Policy mode inputs
  const [targetReduction, setTargetReduction] = useState(10000);
  
  // Buffer settings
  const [buffers, setBuffers] = useState(DEFAULT_BUFFERS);
  
  // Results
  const [results, setResults] = useState<any>(null);

  // Real-time calculation
  useEffect(() => {
    const areaInM2 = areaUnit === 'ft2' ? area * 0.092903 : area;
    
    if (mode === 'standard') {
      if (areaInM2 > 0) {
        const calculation = calculateCarbonSequestration({
          area_m2: areaInM2,
          ecosystem_type: ecosystemType,
          years,
          buffers,
        });
        setResults(calculation);
      }
    } else {
      if (targetReduction > 0) {
        const calculation = calculateRequiredArea({
          target_co2_reduction: targetReduction,
          ecosystem_type: ecosystemType,
          years,
          buffers,
        });
        setResults(calculation);
      }
    }
  }, [area, areaUnit, ecosystemType, years, buffers, mode, targetReduction]);

  const handleProveIt = async () => {
    if (!user || !results) return;

    setLoading(true);
    try {
      // Log calculation to blockchain
      const eventData = {
        calculator_mode: mode,
        inputs: mode === 'standard' 
          ? { area, areaUnit, ecosystemType, years, buffers }
          : { targetReduction, ecosystemType, years, buffers },
        results,
        assumptions: {
          sequestration_factor: SEQUESTRATION_FACTORS[ecosystemType],
          total_buffer_percentage: Object.values(buffers).reduce((sum, b) => sum + b, 0),
        },
      };

      const { transaction_hash } = await blockchainService.logEvent({
        event_type: 'calculation',
        project_id: 'calculator',
        data: eventData,
        user_id: user.id,
      });

      // Also log to database for transparency
      await db.logBlockchainEvent({
        project_id: 'calculator',
        event_type: 'calculation',
        transaction_hash,
        data: eventData,
      });

      toast.success(`Calculation verified on blockchain! TX: ${transaction_hash.slice(0, 10)}...`);
    } catch (error) {
      toast.error('Failed to log calculation to blockchain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Carbon Sequestration Calculator</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Calculate the carbon absorption potential of Blue Carbon ecosystems with real-time modeling 
          and policy-grade accuracy. All calculations can be blockchain-verified for transparency.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          {/* Mode Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Calculator Mode</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setMode('standard')}
                className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === 'standard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calculator className="h-4 w-4 inline mr-2" />
                Standard Mode
              </button>
              <button
                onClick={() => setMode('policy')}
                className={`py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  mode === 'policy'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Target className="h-4 w-4 inline mr-2" />
                Policy Mode
              </button>
            </div>
          </div>

          {mode === 'standard' ? (
            <>
              {/* Area Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Area
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter area"
                    min="0"
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as 'm2' | 'ft2')}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="m2">m²</option>
                    <option value="ft2">ft²</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {areaUnit === 'm2' 
                    ? `${(area / 10000).toFixed(2)} hectares`
                    : `${(area * 0.092903 / 10000).toFixed(2)} hectares`
                  }
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Target Reduction Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target CO₂ Reduction
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={targetReduction}
                    onChange={(e) => setTargetReduction(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter target tons CO₂"
                    min="0"
                  />
                  <span className="text-gray-600 font-medium">tons CO₂</span>
                </div>
              </div>
            </>
          )}

          {/* Ecosystem Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ecosystem Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SEQUESTRATION_FACTORS).map(([type, factor]) => (
                <button
                  key={type}
                  onClick={() => setEcosystemType(type as keyof typeof SEQUESTRATION_FACTORS)}
                  className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                    ecosystemType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium capitalize">{type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-600">{factor} tons CO₂/ha/year</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period (years)
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 year</span>
              <span className="font-medium">{years} years</span>
              <span>50 years</span>
            </div>
          </div>

          {/* Buffer Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Buffer Settings</h3>
            
            {Object.entries(buffers).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-600 capitalize">
                    {key.replace('_', ' ')} Buffer
                  </label>
                  <span className="text-sm font-medium text-gray-900">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={value}
                  onChange={(e) => setBuffers(prev => ({
                    ...prev,
                    [key]: Number(e.target.value)
                  }))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
            
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Total buffer: <span className="font-medium">
                  {Object.values(buffers).reduce((sum, b) => sum + b, 0)}%
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Main Results */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {mode === 'standard' ? 'Carbon Absorption Results' : 'Required Area Analysis'}
            </h2>
            
            {results && (
              <div className="space-y-6">
                {/* Primary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {results.annual_absorption.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">tons CO₂/year</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
                    <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {results.cumulative_absorption.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">total tons CO₂</p>
                  </div>
                </div>

                {/* Policy Area Result */}
                {mode === 'policy' && results.policy_area_needed && (
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-purple-900 mb-1">
                      {(results.policy_area_needed / 10000).toFixed(1)} hectares
                    </p>
                    <p className="text-sm text-purple-700">required to meet target</p>
                    <p className="text-xs text-purple-600 mt-2">
                      {results.policy_area_needed.toLocaleString()} m²
                    </p>
                  </div>
                )}

                {/* Impact Equivalences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Climate Impact Equivalence</h3>
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Car className="h-6 w-6 text-red-500" />
                        <span className="font-medium text-gray-900">Cars Removed</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">
                        {results.equivalences.cars_removed.toLocaleString()}
                      </span>
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Home className="h-6 w-6 text-yellow-600" />
                        <span className="font-medium text-gray-900">Homes Powered</span>
                      </div>
                      <span className="text-xl font-bold text-yellow-600">
                        {results.equivalences.homes_powered.toLocaleString()}
                      </span>
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Trees className="h-6 w-6 text-green-600" />
                        <span className="font-medium text-gray-900">Tree Equivalent</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        {results.equivalences.trees_planted.toLocaleString()}
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Blockchain Verification */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <button
                      onClick={handleProveIt}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying on Blockchain...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Zap className="h-5 w-5 mr-2" />
                          Prove It (Blockchain Verify)
                        </div>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Log calculation assumptions and results to Polygon blockchain for transparency
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Calculation Details */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ecosystem Factor:</span>
                  <span className="font-medium">{SEQUESTRATION_FACTORS[ecosystemType]} tons CO₂/ha/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Buffer Applied:</span>
                  <span className="font-medium">{Object.values(buffers).reduce((sum, b) => sum + b, 0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Period:</span>
                  <span className="font-medium">{years} years</span>
                </div>
                {mode === 'standard' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Area:</span>
                    <span className="font-medium">
                      {areaUnit === 'm2' 
                        ? `${(area / 10000).toFixed(2)} hectares`
                        : `${(area * 0.092903 / 10000).toFixed(2)} hectares`
                      }
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}