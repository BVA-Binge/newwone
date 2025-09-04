export interface Project {
  id: string;
  name: string;
  description: string;
  location: {
    coordinates: [number, number];
    address: string;
    state: string;
    district: string;
  };
  area_m2: number;
  ecosystem_type: 'mangrove' | 'seagrass' | 'salt_marsh' | 'kelp_forest';
  project_owner: {
    organization: string;
    contact_name: string;
    email: string;
    phone: string;
  };
  stakeholders: Array<{
    name: string;
    role: string;
    organization: string;
  }>;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  verification_details?: {
    verifier_id: string;
    verified_at: string;
    comments: string;
    nft_token_id?: string;
  };
  credibility_score: number;
  carbon_calculations: {
    annual_co2_absorption: number;
    cumulative_co2_absorption: number;
    sequestration_factor: number;
    buffer_percentage: number;
  };
  blockchain_events: Array<{
    event_type: string;
    transaction_hash: string;
    timestamp: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'project_owner' | 'verifier' | 'admin';
  profile: {
    name: string;
    organization?: string;
    phone?: string;
  };
  created_at: string;
}

export interface CalculationResult {
  annual_absorption: number;
  cumulative_absorption: number;
  equivalences: {
    cars_removed: number;
    homes_powered: number;
    trees_planted: number;
  };
  policy_area_needed?: number;
}

export interface BlockchainEvent {
  id: string;
  project_id: string;
  event_type: 'registration' | 'verification' | 'calculation' | 'nft_mint';
  transaction_hash: string;
  data: Record<string, any>;
  created_at: string;
}