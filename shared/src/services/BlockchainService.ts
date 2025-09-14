import { ethers } from 'ethers';
import type {
  Tourist,
  TouristLocation,
  Incident,
  SafetyAlert,
  GeoFenceZone,
} from '../types/index.js';

export interface ContractABIs {
  TouristDigitalID: ethers.InterfaceAbi;
  GeoFencingSafety: ethers.InterfaceAbi;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: any;
}

export interface BlockchainServiceConfig {
  rpcUrl: string;
  privateKey?: string;
  contracts: {
    TouristDigitalID: string;
    GeoFencingSafety: string;
  };
  abis: ContractABIs;
}

/**
 * Optimized Blockchain Service for Smart Tourist Safety Monitoring System
 * Supports both read-only (frontend) and full access (backend) modes
 */
export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private wallet: ethers.Wallet | null = null;
  private signer: ethers.Signer | null = null;
  private touristDigitalID: ethers.Contract | null = null;
  private geoFencingSafety: ethers.Contract | null = null;
  private isInitialized = false;
  private isReadOnly = false;

  constructor(private config?: BlockchainServiceConfig) {}

  /**
   * Initialize the blockchain service
   * @param config - Configuration object or use constructor config
   * @param readOnly - If true, initializes in read-only mode (for frontend)
   */
  async initialize(config?: BlockchainServiceConfig, readOnly = false): Promise<void> {
    const serviceConfig = config || this.config;
    if (!serviceConfig) {
      throw new Error('Configuration required for blockchain service initialization');
    }

    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(serviceConfig.rpcUrl);
      this.isReadOnly = readOnly;

      // Initialize signer
      if (!readOnly && serviceConfig.privateKey) {
        this.wallet = new ethers.Wallet(serviceConfig.privateKey, this.provider);
        this.signer = this.wallet;
      } else {
        this.signer = null; // Read-only mode
      }

      // Initialize contract instances
      const signerOrProvider = this.signer || this.provider;
      
      this.touristDigitalID = new ethers.Contract(
        serviceConfig.contracts.TouristDigitalID,
        serviceConfig.abis.TouristDigitalID,
        signerOrProvider
      );

      this.geoFencingSafety = new ethers.Contract(
        serviceConfig.contracts.GeoFencingSafety,
        serviceConfig.abis.GeoFencingSafety,
        signerOrProvider
      );

      this.isInitialized = true;
      
      // Verify contracts are accessible
      await this.verifyContracts();
      
      console.log(`Blockchain service initialized successfully (${readOnly ? 'read-only' : 'full access'})`);
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Verify that contracts are accessible
   */
  private async verifyContracts(): Promise<void> {
    this.ensureInitialized();
    
    try {
      const [totalTourists, totalZones] = await Promise.all([
        this.touristDigitalID!.getTotalTourists(),
        this.geoFencingSafety!.getTotalZones(),
      ]);
      
      console.log(`Contract verification successful - Tourists: ${totalTourists}, Zones: ${totalZones}`);
    } catch (error) {
      console.error('Contract verification failed:', error);
      throw error;
    }
  }

  // ==================== TOURIST MANAGEMENT ====================

  /**
   * Register a new tourist (write operation - requires signer)
   */
  async registerTourist(touristData: Omit<Tourist, 'id' | 'isVerified'>): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const tx = await this.touristDigitalID!.registerTourist(
        touristData.name,
        touristData.passportNumber,
        touristData.nationality,
        touristData.emergencyContact || '',
        touristData.medicalInfo || ''
      );
      
      const receipt = await tx.wait();
      const event = this.findEvent(receipt, this.touristDigitalID!, 'TouristRegistered');
      
      if (event) {
        return {
          success: true,
          transactionHash: receipt.hash,
          data: { touristId: event.args.touristId.toString() },
        };
      }
      
      throw new Error('Tourist registration event not found');
    } catch (error) {
      return this.handleError('Failed to register tourist', error);
    }
  }

  /**
   * Get tourist profile (read operation)
   */
  async getTouristProfile(touristId: number): Promise<TransactionResult> {
    this.ensureInitialized();
    
    try {
      const profile = await this.touristDigitalID!.getTouristProfile(touristId);
      
      const tourist: Tourist = {
        id: Number(profile.id),
        name: profile.name,
        passportNumber: profile.passportNumber,
        nationality: profile.nationality,
        emergencyContact: profile.emergencyContact,
        medicalInfo: profile.medicalInfo,
        isVerified: profile.isVerified,
        verificationLevel: profile.isVerified ? 'basic' : 'none',
        registrationDate: new Date(Number(profile.registrationDate) * 1000),
        lastLocationUpdate: undefined,
      };
      
      return {
        success: true,
        data: { profile: tourist },
      };
    } catch (error) {
      return this.handleError('Failed to get tourist profile', error);
    }
  }

  /**
   * Verify a tourist's identity (write operation - requires signer)
   */
  async verifyTourist(touristId: number, isVerified: boolean): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const tx = await this.touristDigitalID!.verifyTourist(touristId, isVerified);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      return this.handleError('Failed to verify tourist', error);
    }
  }

  // ==================== INCIDENT REPORTING ====================

  /**
   * Report an incident (write operation - requires signer)
   */
  async reportIncident(incidentData: Omit<Incident, 'id' | 'status' | 'reportedAt'>): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const tx = await this.touristDigitalID!.reportIncident(
        incidentData.touristId,
        incidentData.incidentType,
        incidentData.description,
        `${incidentData.location.latitude},${incidentData.location.longitude}`,
        incidentData.severity,
        incidentData.evidenceHashes || []
      );
      
      const receipt = await tx.wait();
      const event = this.findEvent(receipt, this.touristDigitalID!, 'IncidentReported');
      
      if (event) {
        return {
          success: true,
          transactionHash: receipt.hash,
          data: { incidentId: event.args.incidentId.toString() },
        };
      }
      
      throw new Error('Incident reporting event not found');
    } catch (error) {
      return this.handleError('Failed to report incident', error);
    }
  }

  /**
   * Resolve an incident (write operation - requires signer)
   */
  async resolveIncident(incidentId: number): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const tx = await this.touristDigitalID!.resolveIncident(incidentId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      return this.handleError('Failed to resolve incident', error);
    }
  }

  // ==================== GEO-FENCING ====================

  /**
   * Create a geo-fence zone (write operation - requires signer)
   */
  async createGeoFenceZone(zoneData: Omit<GeoFenceZone, 'id' | 'createdAt'>): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const tx = await this.geoFencingSafety!.createGeoFenceZone(
        zoneData.name,
        zoneData.description || '',
        Math.round(zoneData.centerLocation.latitude * 1e6),
        Math.round(zoneData.centerLocation.longitude * 1e6),
        zoneData.radius,
        zoneData.zoneType
      );
      
      const receipt = await tx.wait();
      const event = this.findEvent(receipt, this.geoFencingSafety!, 'GeoFenceZoneCreated');
      
      if (event) {
        return {
          success: true,
          transactionHash: receipt.hash,
          data: { zoneId: event.args.zoneId.toString() },
        };
      }
      
      throw new Error('Geo-fence zone creation event not found');
    } catch (error) {
      return this.handleError('Failed to create geo-fence zone', error);
    }
  }

  /**
   * Update tourist location (write operation - requires signer)
   */
  async updateTouristLocation(touristLocation: TouristLocation): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const tx = await this.geoFencingSafety!.updateTouristLocation(
        touristLocation.touristId,
        Math.round(touristLocation.location.latitude * 1e6),
        Math.round(touristLocation.location.longitude * 1e6)
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      return this.handleError('Failed to update tourist location', error);
    }
  }

  // ==================== SAFETY ALERTS ====================

  /**
   * Trigger a safety alert (write operation - requires signer)
   */
  async triggerSafetyAlert(alertData: Omit<SafetyAlert, 'id' | 'status' | 'triggeredAt'>): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const locationStr = alertData.location 
        ? `${alertData.location.latitude},${alertData.location.longitude}`
        : '';
        
      const tx = await this.geoFencingSafety!.triggerSafetyAlert(
        alertData.touristId || 0,
        alertData.alertType,
        alertData.message,
        locationStr,
        alertData.severity
      );
      
      const receipt = await tx.wait();
      const event = this.findEvent(receipt, this.geoFencingSafety!, 'SafetyAlertTriggered');
      
      if (event) {
        return {
          success: true,
          transactionHash: receipt.hash,
          data: { alertId: event.args.alertId.toString() },
        };
      }
      
      throw new Error('Safety alert event not found');
    } catch (error) {
      return this.handleError('Failed to trigger safety alert', error);
    }
  }

  /**
   * Dispatch emergency response (write operation - requires signer)
   */
  async dispatchEmergencyResponse(alertId: number, responseType: string, responder: string, notes = ''): Promise<TransactionResult> {
    this.ensureWriteAccess();
    
    try {
      const tx = await this.geoFencingSafety!.dispatchEmergencyResponse(
        alertId,
        responseType,
        responder,
        notes
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      return this.handleError('Failed to dispatch emergency response', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{ name: string; chainId: string; blockNumber: number }> {
    this.ensureInitialized();
    
    const network = await this.provider!.getNetwork();
    const blockNumber = await this.provider!.getBlockNumber();
    
    return {
      name: network.name,
      chainId: network.chainId.toString(),
      blockNumber,
    };
  }

  /**
   * Get contract addresses
   */
  getContractAddresses(): { TouristDigitalID: string; GeoFencingSafety: string } | null {
    if (!this.isInitialized) return null;
    
    return {
      TouristDigitalID: this.touristDigitalID!.target as string,
      GeoFencingSafety: this.geoFencingSafety!.target as string,
    };
  }

  /**
   * Get wallet address (if available)
   */
  getWalletAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Check if service is in read-only mode
   */
  isReadOnlyMode(): boolean {
    return this.isReadOnly;
  }

  // ==================== PRIVATE METHODS ====================

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized. Call initialize() first.');
    }
  }

  private ensureWriteAccess(): void {
    this.ensureInitialized();
    if (this.isReadOnly || !this.signer) {
      throw new Error('Write operations require signer. Initialize with private key or use read-only mode.');
    }
  }

  private findEvent(receipt: ethers.TransactionReceipt, contract: ethers.Contract, eventName: string): ethers.LogDescription | null {
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
        return parsed?.name === eventName;
      } catch {
        return false;
      }
    });
    
    if (event) {
      return contract.interface.parseLog({ topics: event.topics, data: event.data });
    }
    
    return null;
  }

  private handleError(message: string, error: any): TransactionResult {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error(`${message}:`, error);
    return { success: false, error: errorMessage };
  }
}
