// Ecosystem sequestration factors (tons CO2/hectare/year)
export const SEQUESTRATION_FACTORS = {
  mangrove: 10.15,
  seagrass: 8.7,
  salt_marsh: 6.8,
  kelp_forest: 12.3,
} as const;

// Default buffer percentages
export const DEFAULT_BUFFERS = {
  uncertainty: 10,
  mortality: 15,
  verification: 5,
} as const;

// Impact equivalences (per ton CO2)
export const IMPACT_EQUIVALENCES = {
  cars_removed_per_year: 0.45, // cars removed from road per year
  homes_powered_per_year: 0.12, // homes powered for a year
  trees_planted: 16, // tree seedlings grown for 10 years
} as const;

// Demo hotspots for the map
export const DEMO_HOTSPOTS = [
  {
    id: 'mumbai',
    name: 'Mumbai Mangrove Belt',
    coordinates: [72.8777, 19.0760] as [number, number],
    ecosystem: 'mangrove',
    description: 'Critical mangrove ecosystem protecting Mumbai coastline',
    area_m2: 45600000,
  },
  {
    id: 'chennai',
    name: 'Chennai Seagrass Meadows',
    coordinates: [80.2707, 13.0827] as [number, number],
    ecosystem: 'seagrass',
    description: 'Vital seagrass habitats in Tamil Nadu coastal waters',
    area_m2: 23400000,
  },
  {
    id: 'sundarbans',
    name: 'Sundarbans Delta',
    coordinates: [89.0000, 22.0000] as [number, number],
    ecosystem: 'mangrove',
    description: 'Worlds largest mangrove forest system',
    area_m2: 267000000,
  },
  {
    id: 'goa',
    name: 'Goa Salt Marshes',
    coordinates: [74.1240, 15.2993] as [number, number],
    ecosystem: 'salt_marsh',
    description: 'Protected salt marsh ecosystems along Goa coast',
    area_m2: 12800000,
  },
] as const;

// Polygon testnet configuration
export const BLOCKCHAIN_CONFIG = {
  chainId: 80001, // Mumbai testnet
  rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
  explorerUrl: 'https://mumbai.polygonscan.com/',
} as const;