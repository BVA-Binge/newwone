import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Info, Calculator } from 'lucide-react';
import { DEMO_HOTSPOTS } from '../../config/constants';
import { calculateCarbonSequestration } from '../../utils/carbonCalculator';

// Mock Mapbox implementation for demo purposes
// In production, replace with actual Mapbox GL JS integration

export function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [drawnArea, setDrawnArea] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([78.9629, 20.5937]); // India center

  // Mock map initialization
  useEffect(() => {
    // In real implementation: Initialize Mapbox GL JS here
    console.log('Map initialized with center:', mapCenter);
  }, []);

  const handleHotspotClick = (hotspot: any) => {
    setSelectedHotspot(hotspot);
    setMapCenter(hotspot.coordinates);
    setDrawnArea(hotspot.area_m2);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    // Mock area calculation based on click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Simulate area calculation (random for demo)
    const mockArea = Math.floor(Math.random() * 500000) + 50000;
    setDrawnArea(mockArea);
    setIsDrawing(false);
  };

  const carbonResults = drawnArea > 0 ? calculateCarbonSequestration({
    area_m2: drawnArea,
    ecosystem_type: selectedHotspot?.ecosystem || 'mangrove',
    years: 20,
  }) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Project Mapping</h1>
        <p className="text-gray-600">
          Explore Blue Carbon hotspots across India and calculate carbon sequestration potential for specific areas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Hotspots Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Demo Hotspots</h2>
              <p className="text-sm text-gray-600 mt-1">Click to explore regions</p>
            </div>
            
            <div className="p-4 space-y-3">
              {DEMO_HOTSPOTS.map((hotspot) => (
                <button
                  key={hotspot.id}
                  onClick={() => handleHotspotClick(hotspot)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedHotspot?.id === hotspot.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <MapPin className={`h-5 w-5 mt-0.5 ${
                      selectedHotspot?.id === hotspot.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{hotspot.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{hotspot.description}</p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                          {hotspot.ecosystem.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500">
                          {(hotspot.area_m2 / 10000).toFixed(0)} ha
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Drawing Tools */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Selection</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isDrawing
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isDrawing ? 'Click Map to Set Area' : 'Draw Project Area'}
                </button>
                
                {drawnArea > 0 && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-900">{drawnArea.toLocaleString()} m²</p>
                    <p className="text-sm text-blue-700">{(drawnArea / 10000).toFixed(2)} hectares</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Map Controls */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Center: {mapCenter[1].toFixed(4)}, {mapCenter[0].toFixed(4)}
                  </span>
                  {selectedHotspot && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {selectedHotspot.name}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {isDrawing ? 'Click anywhere on map to set area' : 'Select hotspot or enable drawing'}
                </div>
              </div>
            </div>

            {/* Mock Map Display */}
            <div 
              ref={mapRef}
              onClick={handleMapClick}
              className={`h-96 bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 relative overflow-hidden ${
                isDrawing ? 'cursor-crosshair' : 'cursor-default'
              }`}
              style={{
                backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)'
              }}
            >
              {/* Hotspot Markers */}
              {DEMO_HOTSPOTS.map((hotspot, index) => {
                const left = 20 + (index * 20) + (index % 2) * 10;
                const top = 30 + (index * 15) + (index % 3) * 20;
                
                return (
                  <motion.div
                    key={hotspot.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedHotspot?.id === hotspot.id ? 'z-20' : 'z-10'
                    }`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHotspotClick(hotspot);
                      }}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 hover:scale-150 ${
                        selectedHotspot?.id === hotspot.id
                          ? 'bg-orange-500 border-white shadow-lg scale-125'
                          : 'bg-blue-600 border-white shadow-md hover:bg-blue-700'
                      }`}
                    />
                    {selectedHotspot?.id === hotspot.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 border border-gray-200 min-w-48"
                      >
                        <p className="font-semibold text-gray-900 text-sm">{hotspot.name}</p>
                        <p className="text-xs text-gray-600 mb-2">{hotspot.description}</p>
                        <div className="text-xs text-gray-500">
                          <span className="capitalize">{hotspot.ecosystem.replace('_', ' ')}</span> • 
                          <span className="ml-1">{(hotspot.area_m2 / 10000).toFixed(0)} ha</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Drawing Indicator */}
              {isDrawing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
                >
                  <Zap className="h-4 w-4 inline mr-2" />
                  Click to define project area
                </motion.div>
              )}

              {/* Drawn Area Visualization */}
              {drawnArea > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-emerald-500 border-dashed rounded-full bg-emerald-100 bg-opacity-50 flex items-center justify-center"
                >
                  <div className="text-center">
                    <p className="text-xs font-bold text-emerald-800">{(drawnArea / 10000).toFixed(1)}</p>
                    <p className="text-xs text-emerald-600">hectares</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Results Display */}
            {carbonResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Carbon Sequestration Potential</h3>
                  <Calculator className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{carbonResults.annual_absorption.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">tons CO₂/year</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-600">{carbonResults.cumulative_absorption.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">total tons CO₂</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-500">{carbonResults.equivalences.cars_removed}</p>
                    <p className="text-sm text-gray-600">cars removed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{carbonResults.equivalences.trees_planted}</p>
                    <p className="text-sm text-gray-600">tree equivalent</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}