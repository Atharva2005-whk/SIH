const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * Blockchain Service for Smart Tourist Safety Monitoring System
 * Handles all blockchain interactions including tourist registration,
 * incident reporting, geo-fencing, and safety alerts
 */
class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.touristDigitalID = null;
    this.geoFencingSafety = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the blockchain service
   * @param {string} rpcUrl - RPC URL for the blockchain network
   * @param {string} privateKey - Private key for the wallet
   * @param {string} contractAddresses - Object containing contract addresses
   */
  async initialize(rpcUrl, privateKey, contractAddresses) {
    try {
      // Initialize provider and wallet
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Load contract ABIs
      const touristDigitalIDABI = this.loadContractABI('TouristDigitalID');
      const geoFencingSafetyABI = this.loadContractABI('GeoFencingSafety');
      
      // Initialize contract instances
      this.touristDigitalID = new ethers.Contract(
        contractAddresses.TouristDigitalID,
        touristDigitalIDABI,
        this.wallet
      );
      
      this.geoFencingSafety = new ethers.Contract(
        contractAddresses.GeoFencingSafety,
        geoFencingSafetyABI,
        this.wallet
      );
      
      this.isInitialized = true;
      console.log('Blockchain service initialized successfully');
      
      // Verify contracts are accessible
      await this.verifyContracts();
      
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  /**
   * Load contract ABI from artifacts
   * @param {string} contractName - Name of the contract
   */
  loadContractABI(contractName) {
    try {
      const artifactPath = path.join(__dirname, '../artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return artifact.abi;
    } catch (error) {
      console.error(`Failed to load ABI for ${contractName}:`, error);
      throw error;
    }
  }

  /**
   * Verify that contracts are accessible
   */
  async verifyContracts() {
    try {
      const totalTourists = await this.touristDigitalID.getTotalTourists();
      const totalZones = await this.geoFencingSafety.getTotalZones();
      
      console.log(`Contract verification successful - Tourists: ${totalTourists}, Zones: ${totalZones}`);
    } catch (error) {
      console.error('Contract verification failed:', error);
      throw error;
    }
  }

  // ==================== TOURIST MANAGEMENT ====================

  /**
   * Register a new tourist
   * @param {Object} touristData - Tourist information
   */
  async registerTourist(touristData) {
    this.ensureInitialized();
    
    try {
      const tx = await this.touristDigitalID.registerTourist(
        touristData.name,
        touristData.passportNumber,
        touristData.nationality,
        touristData.emergencyContact,
        touristData.medicalInfo
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.touristDigitalID.interface.parseLog(log);
          return parsed.name === 'TouristRegistered';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.touristDigitalID.interface.parseLog(event);
        return {
          success: true,
          touristId: parsed.args.touristId.toString(),
          transactionHash: receipt.hash
        };
      }
      
      throw new Error('Tourist registration event not found');
    } catch (error) {
      console.error('Failed to register tourist:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify a tourist's identity
   * @param {number} touristId - ID of the tourist
   * @param {boolean} isVerified - Verification status
   */
  async verifyTourist(touristId, isVerified) {
    this.ensureInitialized();
    
    try {
      const tx = await this.touristDigitalID.verifyTourist(touristId, isVerified);
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Failed to verify tourist:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get tourist profile
   * @param {number} touristId - ID of the tourist
   */
  async getTouristProfile(touristId) {
    this.ensureInitialized();
    
    try {
      const profile = await this.touristDigitalID.getTouristProfile(touristId);
      
      return {
        success: true,
        profile: {
          id: profile.id.toString(),
          name: profile.name,
          passportNumber: profile.passportNumber,
          nationality: profile.nationality,
          emergencyContact: profile.emergencyContact,
          medicalInfo: profile.medicalInfo,
          registrationDate: new Date(Number(profile.registrationDate) * 1000),
          isActive: profile.isActive,
          isVerified: profile.isVerified,
          registeredBy: profile.registeredBy
        }
      };
    } catch (error) {
      console.error('Failed to get tourist profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== INCIDENT REPORTING ====================

  /**
   * Report an incident
   * @param {Object} incidentData - Incident information
   */
  async reportIncident(incidentData) {
    this.ensureInitialized();
    
    try {
      const tx = await this.touristDigitalID.reportIncident(
        incidentData.touristId,
        incidentData.incidentType,
        incidentData.description,
        incidentData.location,
        incidentData.severity,
        incidentData.evidenceHashes || []
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.touristDigitalID.interface.parseLog(log);
          return parsed.name === 'IncidentReported';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.touristDigitalID.interface.parseLog(event);
        return {
          success: true,
          incidentId: parsed.args.incidentId.toString(),
          transactionHash: receipt.hash
        };
      }
      
      throw new Error('Incident reporting event not found');
    } catch (error) {
      console.error('Failed to report incident:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Resolve an incident
   * @param {number} incidentId - ID of the incident
   */
  async resolveIncident(incidentId) {
    this.ensureInitialized();
    
    try {
      const tx = await this.touristDigitalID.resolveIncident(incidentId);
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Failed to resolve incident:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== GEO-FENCING ====================

  /**
   * Create a geo-fence zone
   * @param {Object} zoneData - Zone information
   */
  async createGeoFenceZone(zoneData) {
    this.ensureInitialized();
    
    try {
      const tx = await this.geoFencingSafety.createGeoFenceZone(
        zoneData.name,
        zoneData.description,
        Math.round(zoneData.centerLatitude * 1e6), // Scale for precision
        Math.round(zoneData.centerLongitude * 1e6),
        zoneData.radius,
        zoneData.zoneType
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.geoFencingSafety.interface.parseLog(log);
          return parsed.name === 'GeoFenceZoneCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.geoFencingSafety.interface.parseLog(event);
        return {
          success: true,
          zoneId: parsed.args.zoneId.toString(),
          transactionHash: receipt.hash
        };
      }
      
      throw new Error('Geo-fence zone creation event not found');
    } catch (error) {
      console.error('Failed to create geo-fence zone:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update tourist location
   * @param {number} touristId - ID of the tourist
   * @param {number} latitude - Current latitude
   * @param {number} longitude - Current longitude
   */
  async updateTouristLocation(touristId, latitude, longitude) {
    this.ensureInitialized();
    
    try {
      const tx = await this.geoFencingSafety.updateTouristLocation(
        touristId,
        Math.round(latitude * 1e6), // Scale for precision
        Math.round(longitude * 1e6)
      );
      
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Failed to update tourist location:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== SAFETY ALERTS ====================

  /**
   * Trigger a safety alert
   * @param {Object} alertData - Alert information
   */
  async triggerSafetyAlert(alertData) {
    this.ensureInitialized();
    
    try {
      const tx = await this.geoFencingSafety.triggerSafetyAlert(
        alertData.touristId,
        alertData.alertType,
        alertData.message,
        alertData.location,
        alertData.severity
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.geoFencingSafety.interface.parseLog(log);
          return parsed.name === 'SafetyAlertTriggered';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.geoFencingSafety.interface.parseLog(event);
        return {
          success: true,
          alertId: parsed.args.alertId.toString(),
          transactionHash: receipt.hash
        };
      }
      
      throw new Error('Safety alert event not found');
    } catch (error) {
      console.error('Failed to trigger safety alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Dispatch emergency response
   * @param {Object} responseData - Response information
   */
  async dispatchEmergencyResponse(responseData) {
    this.ensureInitialized();
    
    try {
      const tx = await this.geoFencingSafety.dispatchEmergencyResponse(
        responseData.alertId,
        responseData.responseType,
        responseData.responder,
        responseData.notes || ""
      );
      
      await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash
      };
    } catch (error) {
      console.error('Failed to dispatch emergency response:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Ensure the service is initialized
   */
  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized. Call initialize() first.');
    }
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return {
      TouristDigitalID: this.touristDigitalID?.target,
      GeoFencingSafety: this.geoFencingSafety?.target
    };
  }

  /**
   * Get wallet address
   */
  getWalletAddress() {
    return this.wallet?.address;
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    
    return {
      name: network.name,
      chainId: network.chainId.toString(),
      blockNumber: blockNumber
    };
  }
}

module.exports = BlockchainService;

