import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, Pause, RotateCcw, TrendingDown, Zap, Car, Home, Trees } from 'lucide-react';

export function ImpactVisualization() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYear, setCurrentYear] = useState(2024);
  const [sliderValue, setSliderValue] = useState(50);

  // Mock data for India's emissions with/without Blue Carbon projects
  const emissionsData = [
    { year: 2024, withoutBlueCarbon: 2800, withBlueCarbon: 2800 },
    { year: 2025, withoutBlueCarbon: 2920, withBlueCarbon: 2900 },
    { year: 2026, withoutBlueCarbon: 3040, withBlueCarbon: 2980 },
    { year: 2027, withoutBlueCarbon: 3160, withBlueCarbon: 3030 },
    { year: 2028, withoutBlueCarbon: 3280, withBlueCarbon: 3050 },
    { year: 2029, withoutBlueCarbon: 3400, withBlueCarbon: 3040 },
    { year: 2030, withoutBlueCarbon: 3520, withBlueCarbon: 3000 },
  ];

  // Animated breathing effect for CO2 absorption
  const [breathingScale, setBreathingScale] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYear(prev => prev >= 2030 ? 2024 : prev + 1);
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    // Breathing animation for CO2 meters
    const breathingInterval = setInterval(() => {
      setBreathingScale(prev => prev === 1 ? 1.05 : 1);
    }, 1500);

    return () => clearInterval(breathingInterval);
  }, []);

  const currentData = emissionsData.find(d => d.year === currentYear);
  const reductionPercentage = currentData 
    ? ((currentData.withoutBlueCarbon - currentData.withBlueCarbon) / currentData.withoutBlueCarbon * 100).toFixed(1)
    : '0';

  // Calculate impact based on slider
  const totalProjects = Math.round(sliderValue * 2); // 0-100 projects
  const totalCO2Absorbed = Math.round(sliderValue * 500); // 0-25,000 tons
  const carsRemoved = Math.round(totalCO2Absorbed * 0.45);
  const homesPowered = Math.round(totalCO2Absorbed * 0.12);
  const treesEquivalent = Math.round(totalCO2Absorbed * 16);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Climate Impact Storytelling</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Visualize the real-world impact of Blue Carbon projects through interactive stories 
          and comparative scenarios of India's emission reduction journey.
        </p>
      </motion.div>

      {/* Breathing CO2 Meters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <motion.div
              animate={{ scale: breathingScale }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center"
            >
              <Zap className="h-10 w-10 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Earth Breathing</h3>
            <p className="text-3xl font-bold text-blue-600 mb-1">{totalCO2Absorbed.toLocaleString()}</p>
            <p className="text-sm text-gray-600">tons CO₂ absorbed annually</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <motion.div
              animate={{ scale: breathingScale }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center"
            >
              <Trees className="h-10 w-10 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ocean Forests</h3>
            <p className="text-3xl font-bold text-emerald-600 mb-1">{totalProjects}</p>
            <p className="text-sm text-gray-600">active projects</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center">
            <motion.div
              animate={{ scale: breathingScale }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <TrendingDown className="h-10 w-10 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Emission Reduction</h3>
            <p className="text-3xl font-bold text-purple-600 mb-1">{reductionPercentage}%</p>
            <p className="text-sm text-gray-600">vs business as usual</p>
          </div>
        </div>
      </motion.div>

      {/* Interactive Scenario Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            India's Climate Future: With vs Without Blue Carbon
          </h2>
          <p className="text-gray-600">
            Explore how different levels of Blue Carbon project implementation impact India's emission trajectory
          </p>
        </div>

        {/* Scenario Slider */}
        <div className="mb-8">
          <label className="block text-center text-lg font-semibold text-gray-900 mb-4">
            Blue Carbon Project Scale
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>No Projects</span>
              <span className="font-medium text-blue-600">{sliderValue}% Implementation</span>
              <span>Full Scale</span>
            </div>
          </div>
        </div>

        {/* Emissions Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emissionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                `${value} Mt CO₂`,
                name === 'withoutBlueCarbon' ? 'Without Blue Carbon' : 'With Blue Carbon'
              ]} />
              <Line 
                type="monotone" 
                dataKey="withoutBlueCarbon" 
                stroke="#ef4444" 
                strokeWidth={3}
                strokeDasharray="5 5"
                name="withoutBlueCarbon"
              />
              <Line 
                type="monotone" 
                dataKey="withBlueCarbon" 
                stroke="#059669" 
                strokeWidth={3}
                name="withBlueCarbon"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Play'} Animation
          </button>
          
          <button
            onClick={() => setCurrentYear(2024)}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
          
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">Current Year: {currentYear}</p>
            <p className="text-sm text-green-600">Reduction: {reductionPercentage}% from baseline</p>
          </div>
        </div>
      </motion.div>

      {/* Impact Equivalences with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Real-World Impact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cars Fading Animation */}
          <motion.div className="text-center">
            <div className="relative mb-6">
              <motion.div
                className="flex justify-center space-x-1 mb-2"
                initial={{ opacity: 1 }}
                animate={{ opacity: sliderValue > 0 ? 0.3 : 1 }}
                transition={{ duration: 2 }}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0 }}
                    animate={{ y: sliderValue > (i + 1) * 20 ? -10 : 0, opacity: sliderValue > (i + 1) * 20 ? 0.3 : 1 }}
                    transition={{ delay: i * 0.2, duration: 1 }}
                  >
                    <Car className="h-8 w-8 text-red-500" />
                  </motion.div>
                ))}
              </motion.div>
              <motion.p 
                className="text-2xl font-bold text-red-600"
                key={carsRemoved}
                initial={{ scale: 1.2, color: '#ef4444' }}
                animate={{ scale: 1, color: '#dc2626' }}
                transition={{ duration: 0.5 }}
              >
                {carsRemoved.toLocaleString()}
              </motion.p>
              <p className="text-gray-600">cars removed from roads annually</p>
            </div>
          </motion.div>

          {/* Homes Lighting Up */}
          <motion.div className="text-center">
            <div className="relative mb-6">
              <motion.div className="flex justify-center space-x-1 mb-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: sliderValue > (i + 1) * 25 ? 1 : 0.3,
                      scale: sliderValue > (i + 1) * 25 ? 1.1 : 1,
                    }}
                    transition={{ delay: i * 0.3, duration: 1 }}
                  >
                    <Home className={`h-8 w-8 ${sliderValue > (i + 1) * 25 ? 'text-yellow-500' : 'text-gray-300'}`} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.p 
                className="text-2xl font-bold text-yellow-600"
                key={homesPowered}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {homesPowered.toLocaleString()}
              </motion.p>
              <p className="text-gray-600">homes powered annually</p>
            </div>
          </motion.div>

          {/* Trees Growing */}
          <motion.div className="text-center">
            <div className="relative mb-6">
              <motion.div className="flex justify-center space-x-1 mb-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0.3 }}
                    animate={{ 
                      scale: sliderValue > (i + 1) * 16.67 ? 1.2 : 0.5,
                      opacity: sliderValue > (i + 1) * 16.67 ? 1 : 0.3,
                    }}
                    transition={{ delay: i * 0.2, duration: 1, type: "spring" }}
                  >
                    <Trees className={`h-8 w-8 ${sliderValue > (i + 1) * 16.67 ? 'text-green-600' : 'text-gray-300'}`} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.p 
                className="text-2xl font-bold text-green-600"
                key={treesEquivalent}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {treesEquivalent.toLocaleString()}
              </motion.p>
              <p className="text-gray-600">equivalent tree seedlings over 10 years</p>
            </div>
          </motion.div>
        </div>

        {/* Impact Summary */}
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-200"
          key={sliderValue}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              India's Blue Carbon Impact at {sliderValue}% Scale
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalProjects}</p>
                <p className="text-sm text-gray-600">Active Projects</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{totalCO2Absorbed.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Tons CO₂/Year</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{reductionPercentage}%</p>
                <p className="text-sm text-gray-600">Emission Reduction</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">₹{(totalCO2Absorbed * 3000).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Carbon Value</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            India's Emission Trajectory: Blue Carbon Impact
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Without Blue Carbon</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-green-600 rounded"></div>
              <span className="text-sm text-gray-600">With Blue Carbon</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emissionsData.map(d => ({
              ...d,
              withBlueCarbon: d.withBlueCarbon - (sliderValue / 100 * (d.year - 2023) * 15)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} Mt CO₂`,
                  name === 'withoutBlueCarbon' ? 'Without Blue Carbon' : 'With Blue Carbon Projects'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="withoutBlueCarbon" 
                stroke="#ef4444" 
                strokeWidth={3}
                strokeDasharray="8 8"
                name="withoutBlueCarbon"
              />
              <Line 
                type="monotone" 
                dataKey="withBlueCarbon" 
                stroke="#059669" 
                strokeWidth={4}
                name="withBlueCarbon"
              />
              {/* Current year marker */}
              <Line 
                type="monotone" 
                dataKey="year"
                stroke="transparent"
                dot={(props) => {
                  if (props.payload.year === currentYear) {
                    return (
                      <motion.circle
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        fill="#f97316"
                        stroke="#fff"
                        strokeWidth={3}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}