import { SEQUESTRATION_FACTORS, DEFAULT_BUFFERS, IMPACT_EQUIVALENCES } from '../config/constants';
import type { CalculationResult } from '../types';

interface CalculationParams {
  area_m2: number;
  ecosystem_type: keyof typeof SEQUESTRATION_FACTORS;
  years?: number;
  buffers?: {
    uncertainty: number;
    mortality: number;
    verification: number;
  };
}

interface PolicyCalculationParams {
  target_co2_reduction: number;
  ecosystem_type: keyof typeof SEQUESTRATION_FACTORS;
  years?: number;
  buffers?: {
    uncertainty: number;
    mortality: number;
    verification: number;
  };
}

export function calculateCarbonSequestration(params: CalculationParams): CalculationResult {
  const {
    area_m2,
    ecosystem_type,
    years = 20,
    buffers = DEFAULT_BUFFERS,
  } = params;

  // Convert m² to hectares
  const area_hectares = area_m2 / 10000;

  // Get sequestration factor for ecosystem type
  const base_sequestration = SEQUESTRATION_FACTORS[ecosystem_type];

  // Calculate annual absorption before buffers
  const gross_annual_absorption = area_hectares * base_sequestration;

  // Apply buffer percentages (conservative approach)
  const total_buffer_percentage = buffers.uncertainty + buffers.mortality + buffers.verification;
  const buffer_factor = (100 - total_buffer_percentage) / 100;
  
  const annual_absorption = gross_annual_absorption * buffer_factor;
  const cumulative_absorption = annual_absorption * years;

  // Calculate impact equivalences
  const equivalences = {
    cars_removed: Math.round(annual_absorption * IMPACT_EQUIVALENCES.cars_removed_per_year),
    homes_powered: Math.round(annual_absorption * IMPACT_EQUIVALENCES.homes_powered_per_year),
    trees_planted: Math.round(cumulative_absorption * IMPACT_EQUIVALENCES.trees_planted),
  };

  return {
    annual_absorption: Math.round(annual_absorption * 100) / 100,
    cumulative_absorption: Math.round(cumulative_absorption * 100) / 100,
    equivalences,
  };
}

export function calculateRequiredArea(params: PolicyCalculationParams): CalculationResult {
  const {
    target_co2_reduction,
    ecosystem_type,
    years = 20,
    buffers = DEFAULT_BUFFERS,
  } = params;

  // Calculate required area to meet target
  const base_sequestration = SEQUESTRATION_FACTORS[ecosystem_type];
  const total_buffer_percentage = buffers.uncertainty + buffers.mortality + buffers.verification;
  const buffer_factor = (100 - total_buffer_percentage) / 100;
  
  const effective_sequestration = base_sequestration * buffer_factor;
  const required_hectares = target_co2_reduction / (effective_sequestration * years);
  const required_m2 = required_hectares * 10000;

  // Calculate equivalences for the target reduction
  const equivalences = {
    cars_removed: Math.round(target_co2_reduction * IMPACT_EQUIVALENCES.cars_removed_per_year / years),
    homes_powered: Math.round(target_co2_reduction * IMPACT_EQUIVALENCES.homes_powered_per_year / years),
    trees_planted: Math.round(target_co2_reduction * IMPACT_EQUIVALENCES.trees_planted),
  };

  return {
    annual_absorption: Math.round((target_co2_reduction / years) * 100) / 100,
    cumulative_absorption: Math.round(target_co2_reduction * 100) / 100,
    equivalences,
    policy_area_needed: Math.round(required_m2),
  };
}

export function detectAnomalies(project: any, historical_data: any[]): { 
  is_suspicious: boolean; 
  flags: string[]; 
  credibility_impact: number; 
} {
  const flags: string[] = [];
  let credibility_impact = 0;

  // Check for unrealistic growth rates
  if (historical_data.length > 0) {
    const latest = historical_data[historical_data.length - 1];
    const previous = historical_data[historical_data.length - 2];
    
    if (previous) {
      const growth_rate = (latest.area_m2 - previous.area_m2) / previous.area_m2;
      if (growth_rate > 1.0) { // >100% growth
        flags.push('Unrealistic area expansion detected');
        credibility_impact += 25;
      }
    }
  }

  // Check for impossible sequestration rates
  const theoretical_max = SEQUESTRATION_FACTORS[project.ecosystem_type] * 1.5;
  if (project.carbon_calculations.annual_co2_absorption > theoretical_max * (project.area_m2 / 10000)) {
    flags.push('Carbon sequestration estimates exceed theoretical maximum');
    credibility_impact += 30;
  }

  // Check for inconsistent data
  if (project.area_m2 < 1000) { // Less than 0.1 hectare
    flags.push('Project area unusually small for ecosystem restoration');
    credibility_impact += 10;
  }

  return {
    is_suspicious: flags.length > 0,
    flags,
    credibility_impact,
  };
}