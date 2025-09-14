// Export all types from the shared module
export * from './auth.js';
export * from './tourist.js';
export * from './incident.js';
export * from './geofencing.js';
export * from './documents.js';
export * from './settings.js';

// Blockchain specific types
export interface ContractAddress {
  touristDigitalId: string;
  geoFencingSafety: string;
}

export interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  contracts: ContractAddress;
  networkId: number;
}

export interface DeploymentInfo {
  networkName: string;
  chainId: number;
  contracts: ContractAddress;
  blockNumber: number;
  deployedAt: string;
}
