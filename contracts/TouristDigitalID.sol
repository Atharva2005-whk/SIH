// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TouristDigitalID
 * @dev Smart contract for managing tourist digital identities and safety records
 */
contract TouristDigitalID is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _touristIdCounter;
    Counters.Counter private _incidentIdCounter;
    
    // Tourist profile structure
    struct TouristProfile {
        uint256 id;
        string name;
        string passportNumber;
        string nationality;
        string emergencyContact;
        string medicalInfo;
        uint256 registrationDate;
        bool isActive;
        bool isVerified;
        address registeredBy; // Authority that registered the tourist
    }
    
    // Incident report structure
    struct IncidentReport {
        uint256 id;
        uint256 touristId;
        string incidentType;
        string description;
        string location;
        uint256 timestamp;
        string severity; // "low", "medium", "high", "critical"
        bool isResolved;
        address reportedBy;
        string[] evidenceHashes; // IPFS hashes for evidence
    }
    
    // Safety checkpoint structure
    struct SafetyCheckpoint {
        uint256 id;
        string name;
        string location;
        address authority;
        bool isActive;
        uint256 lastCheck;
    }
    
    // Mappings
    mapping(uint256 => TouristProfile) public tourists;
    mapping(string => uint256) public passportToTouristId;
    mapping(address => uint256) public addressToTouristId;
    mapping(uint256 => IncidentReport) public incidents;
    mapping(uint256 => SafetyCheckpoint) public safetyCheckpoints;
    mapping(address => bool) public authorizedAuthorities;
    mapping(uint256 => uint256[]) public touristIncidents;
    
    // Events
    event TouristRegistered(uint256 indexed touristId, string name, string passportNumber);
    event TouristVerified(uint256 indexed touristId, bool isVerified);
    event IncidentReported(uint256 indexed incidentId, uint256 indexed touristId, string incidentType);
    event IncidentResolved(uint256 indexed incidentId, uint256 indexed touristId);
    event SafetyCheckpointAdded(uint256 indexed checkpointId, string name, string location);
    event AuthorityAuthorized(address indexed authority, bool isAuthorized);
    
    // Modifiers
    modifier onlyAuthorizedAuthority() {
        require(authorizedAuthorities[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier touristExists(uint256 touristId) {
        require(tourists[touristId].id != 0, "Tourist does not exist");
        _;
    }
    
    modifier incidentExists(uint256 incidentId) {
        require(incidents[incidentId].id != 0, "Incident does not exist");
        _;
    }
    
    constructor() {
        // Initialize counters
        _touristIdCounter.increment(); // Start from 1
        _incidentIdCounter.increment(); // Start from 1
    }
    
    /**
     * @dev Register a new tourist
     * @param name Tourist's full name
     * @param passportNumber Passport number
     * @param nationality Tourist's nationality
     * @param emergencyContact Emergency contact information
     * @param medicalInfo Medical information
     */
    function registerTourist(
        string memory name,
        string memory passportNumber,
        string memory nationality,
        string memory emergencyContact,
        string memory medicalInfo
    ) external onlyAuthorizedAuthority nonReentrant returns (uint256) {
        require(bytes(passportNumber).length > 0, "Passport number required");
        require(passportToTouristId[passportNumber] == 0, "Passport already registered");
        
        uint256 touristId = _touristIdCounter.current();
        _touristIdCounter.increment();
        
        tourists[touristId] = TouristProfile({
            id: touristId,
            name: name,
            passportNumber: passportNumber,
            nationality: nationality,
            emergencyContact: emergencyContact,
            medicalInfo: medicalInfo,
            registrationDate: block.timestamp,
            isActive: true,
            isVerified: false,
            registeredBy: msg.sender
        });
        
        passportToTouristId[passportNumber] = touristId;
        
        emit TouristRegistered(touristId, name, passportNumber);
        return touristId;
    }
    
    /**
     * @dev Verify a tourist's identity
     * @param touristId ID of the tourist to verify
     * @param isVerified Verification status
     */
    function verifyTourist(uint256 touristId, bool isVerified) 
        external 
        onlyAuthorizedAuthority 
        touristExists(touristId) 
    {
        tourists[touristId].isVerified = isVerified;
        emit TouristVerified(touristId, isVerified);
    }
    
    /**
     * @dev Report an incident involving a tourist
     * @param touristId ID of the tourist involved
     * @param incidentType Type of incident
     * @param description Detailed description
     * @param location Location of the incident
     * @param severity Severity level
     * @param evidenceHashes Array of IPFS hashes for evidence
     */
    function reportIncident(
        uint256 touristId,
        string memory incidentType,
        string memory description,
        string memory location,
        string memory severity,
        string[] memory evidenceHashes
    ) external onlyAuthorizedAuthority touristExists(touristId) nonReentrant returns (uint256) {
        uint256 incidentId = _incidentIdCounter.current();
        _incidentIdCounter.increment();
        
        incidents[incidentId] = IncidentReport({
            id: incidentId,
            touristId: touristId,
            incidentType: incidentType,
            description: description,
            location: location,
            timestamp: block.timestamp,
            severity: severity,
            isResolved: false,
            reportedBy: msg.sender,
            evidenceHashes: evidenceHashes
        });
        
        touristIncidents[touristId].push(incidentId);
        
        emit IncidentReported(incidentId, touristId, incidentType);
        return incidentId;
    }
    
    /**
     * @dev Resolve an incident
     * @param incidentId ID of the incident to resolve
     */
    function resolveIncident(uint256 incidentId) 
        external 
        onlyAuthorizedAuthority 
        incidentExists(incidentId) 
    {
        incidents[incidentId].isResolved = true;
        emit IncidentResolved(incidentId, incidents[incidentId].touristId);
    }
    
    /**
     * @dev Add a safety checkpoint
     * @param name Name of the checkpoint
     * @param location Location of the checkpoint
     */
    function addSafetyCheckpoint(string memory name, string memory location) 
        external 
        onlyAuthorizedAuthority 
        returns (uint256) 
    {
        uint256 checkpointId = _touristIdCounter.current();
        _touristIdCounter.increment();
        
        safetyCheckpoints[checkpointId] = SafetyCheckpoint({
            id: checkpointId,
            name: name,
            location: location,
            authority: msg.sender,
            isActive: true,
            lastCheck: block.timestamp
        });
        
        emit SafetyCheckpointAdded(checkpointId, name, location);
        return checkpointId;
    }
    
    /**
     * @dev Authorize or deauthorize an authority
     * @param authority Address of the authority
     * @param isAuthorized Authorization status
     */
    function setAuthorityAuthorization(address authority, bool isAuthorized) 
        external 
        onlyOwner 
    {
        authorizedAuthorities[authority] = isAuthorized;
        emit AuthorityAuthorized(authority, isAuthorized);
    }
    
    /**
     * @dev Get tourist profile by ID
     * @param touristId ID of the tourist
     */
    function getTouristProfile(uint256 touristId) 
        external 
        view 
        touristExists(touristId) 
        returns (TouristProfile memory) 
    {
        return tourists[touristId];
    }
    
    /**
     * @dev Get incident report by ID
     * @param incidentId ID of the incident
     */
    function getIncidentReport(uint256 incidentId) 
        external 
        view 
        incidentExists(incidentId) 
        returns (IncidentReport memory) 
    {
        return incidents[incidentId];
    }
    
    /**
     * @dev Get all incidents for a tourist
     * @param touristId ID of the tourist
     */
    function getTouristIncidents(uint256 touristId) 
        external 
        view 
        touristExists(touristId) 
        returns (uint256[] memory) 
    {
        return touristIncidents[touristId];
    }
    
    /**
     * @dev Get tourist ID by passport number
     * @param passportNumber Passport number
     */
    function getTouristIdByPassport(string memory passportNumber) 
        external 
        view 
        returns (uint256) 
    {
        return passportToTouristId[passportNumber];
    }
    
    /**
     * @dev Get total number of registered tourists
     */
    function getTotalTourists() external view returns (uint256) {
        return _touristIdCounter.current() - 1;
    }
    
    /**
     * @dev Get total number of incidents
     */
    function getTotalIncidents() external view returns (uint256) {
        return _incidentIdCounter.current() - 1;
    }
    
    /**
     * @dev Check if an address is an authorized authority
     * @param authority Address to check
     */
    function isAuthorizedAuthority(address authority) external view returns (bool) {
        return authorizedAuthorities[authority] || authority == owner();
    }
}

