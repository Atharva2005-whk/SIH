// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./TouristDigitalID.sol";

/**
 * @title GeoFencingSafety
 * @dev Smart contract for geo-fencing and safety monitoring of tourists
 */
contract GeoFencingSafety is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _zoneIdCounter;
    Counters.Counter private _alertIdCounter;
    
    TouristDigitalID public touristDigitalID;
    
    // Geo-fence zone structure
    struct GeoFenceZone {
        uint256 id;
        string name;
        string description;
        int256 centerLatitude; // Scaled by 1e6 for precision
        int256 centerLongitude; // Scaled by 1e6 for precision
        uint256 radius; // Radius in meters
        string zoneType; // "safe", "warning", "danger", "restricted"
        bool isActive;
        address createdBy;
        uint256 createdAt;
    }
    
    // Tourist location tracking
    struct LocationUpdate {
        uint256 touristId;
        int256 latitude;
        int256 longitude;
        uint256 timestamp;
        string status; // "safe", "warning", "danger", "unknown"
        uint256 zoneId;
    }
    
    // Safety alert structure
    struct SafetyAlert {
        uint256 id;
        uint256 touristId;
        string alertType; // "zone_breach", "emergency", "safety_check", "medical"
        string message;
        string location;
        uint256 timestamp;
        string severity; // "low", "medium", "high", "critical"
        bool isAcknowledged;
        bool isResolved;
        address triggeredBy;
    }
    
    // Emergency response structure
    struct EmergencyResponse {
        uint256 alertId;
        uint256 touristId;
        string responseType; // "police", "medical", "fire", "rescue"
        string status; // "dispatched", "en_route", "on_site", "completed"
        uint256 timestamp;
        address responder;
        string notes;
    }
    
    // Mappings
    mapping(uint256 => GeoFenceZone) public geoFenceZones;
    mapping(uint256 => LocationUpdate[]) public touristLocations;
    mapping(uint256 => SafetyAlert) public safetyAlerts;
    mapping(uint256 => EmergencyResponse[]) public emergencyResponses;
    mapping(address => bool) public authorizedResponders;
    mapping(uint256 => uint256[]) public zoneAlerts;
    mapping(uint256 => uint256[]) public touristAlerts;
    
    // Events
    event GeoFenceZoneCreated(uint256 indexed zoneId, string name, string zoneType);
    event LocationUpdated(uint256 indexed touristId, int256 latitude, int256 longitude, string status);
    event SafetyAlertTriggered(uint256 indexed alertId, uint256 indexed touristId, string alertType);
    event EmergencyResponseDispatched(uint256 indexed alertId, uint256 indexed touristId, string responseType);
    event AlertAcknowledged(uint256 indexed alertId, uint256 indexed touristId);
    event AlertResolved(uint256 indexed alertId, uint256 indexed touristId);
    event ResponderAuthorized(address indexed responder, bool isAuthorized);
    
    // Modifiers
    modifier onlyAuthorizedResponder() {
        require(authorizedResponders[msg.sender] || msg.sender == owner(), "Not authorized responder");
        _;
    }
    
    modifier zoneExists(uint256 zoneId) {
        require(geoFenceZones[zoneId].id != 0, "Zone does not exist");
        _;
    }
    
    modifier alertExists(uint256 alertId) {
        require(safetyAlerts[alertId].id != 0, "Alert does not exist");
        _;
    }
    
    constructor(address _touristDigitalIDAddress) {
        touristDigitalID = TouristDigitalID(_touristDigitalIDAddress);
        _zoneIdCounter.increment();
        _alertIdCounter.increment();
    }
    
    /**
     * @dev Create a new geo-fence zone
     * @param name Name of the zone
     * @param description Description of the zone
     * @param centerLatitude Center latitude (scaled by 1e6)
     * @param centerLongitude Center longitude (scaled by 1e6)
     * @param radius Radius in meters
     * @param zoneType Type of zone
     */
    function createGeoFenceZone(
        string memory name,
        string memory description,
        int256 centerLatitude,
        int256 centerLongitude,
        uint256 radius,
        string memory zoneType
    ) external onlyOwner nonReentrant returns (uint256) {
        uint256 zoneId = _zoneIdCounter.current();
        _zoneIdCounter.increment();
        
        geoFenceZones[zoneId] = GeoFenceZone({
            id: zoneId,
            name: name,
            description: description,
            centerLatitude: centerLatitude,
            centerLongitude: centerLongitude,
            radius: radius,
            zoneType: zoneType,
            isActive: true,
            createdBy: msg.sender,
            createdAt: block.timestamp
        });
        
        emit GeoFenceZoneCreated(zoneId, name, zoneType);
        return zoneId;
    }
    
    /**
     * @dev Update tourist location and check geo-fencing
     * @param touristId ID of the tourist
     * @param latitude Current latitude (scaled by 1e6)
     * @param longitude Current longitude (scaled by 1e6)
     */
    function updateTouristLocation(
        uint256 touristId,
        int256 latitude,
        int256 longitude
    ) external onlyOwner nonReentrant {
        // Verify tourist exists
        require(touristDigitalID.getTouristProfile(touristId).id != 0, "Tourist does not exist");
        
        string memory status = "safe";
        uint256 currentZoneId = 0;
        
        // Check against all active geo-fence zones
        for (uint256 i = 1; i < _zoneIdCounter.current(); i++) {
            if (geoFenceZones[i].isActive) {
                if (isWithinZone(latitude, longitude, i)) {
                    currentZoneId = i;
                    status = geoFenceZones[i].zoneType;
                    
                    // Trigger alert if entering dangerous zone
                    if (keccak256(bytes(geoFenceZones[i].zoneType)) == keccak256(bytes("danger")) ||
                        keccak256(bytes(geoFenceZones[i].zoneType)) == keccak256(bytes("restricted"))) {
                        _triggerZoneBreachAlert(touristId, i);
                    }
                    break;
                }
            }
        }
        
        // Store location update
        touristLocations[touristId].push(LocationUpdate({
            touristId: touristId,
            latitude: latitude,
            longitude: longitude,
            timestamp: block.timestamp,
            status: status,
            zoneId: currentZoneId
        }));
        
        emit LocationUpdated(touristId, latitude, longitude, status);
    }
    
    /**
     * @dev Trigger a safety alert
     * @param touristId ID of the tourist
     * @param alertType Type of alert
     * @param message Alert message
     * @param location Location of the alert
     * @param severity Severity level
     */
    function triggerSafetyAlert(
        uint256 touristId,
        string memory alertType,
        string memory message,
        string memory location,
        string memory severity
    ) external onlyOwner nonReentrant returns (uint256) {
        uint256 alertId = _alertIdCounter.current();
        _alertIdCounter.increment();
        
        safetyAlerts[alertId] = SafetyAlert({
            id: alertId,
            touristId: touristId,
            alertType: alertType,
            message: message,
            location: location,
            timestamp: block.timestamp,
            severity: severity,
            isAcknowledged: false,
            isResolved: false,
            triggeredBy: msg.sender
        });
        
        touristAlerts[touristId].push(alertId);
        
        emit SafetyAlertTriggered(alertId, touristId, alertType);
        return alertId;
    }
    
    /**
     * @dev Dispatch emergency response
     * @param alertId ID of the alert
     * @param responseType Type of response
     * @param responder Address of the responder
     * @param notes Additional notes
     */
    function dispatchEmergencyResponse(
        uint256 alertId,
        string memory responseType,
        address responder,
        string memory notes
    ) external onlyAuthorizedResponder alertExists(alertId) nonReentrant {
        SafetyAlert storage alert = safetyAlerts[alertId];
        require(!alert.isResolved, "Alert already resolved");
        
        emergencyResponses[alertId].push(EmergencyResponse({
            alertId: alertId,
            touristId: alert.touristId,
            responseType: responseType,
            status: "dispatched",
            timestamp: block.timestamp,
            responder: responder,
            notes: notes
        }));
        
        emit EmergencyResponseDispatched(alertId, alert.touristId, responseType);
    }
    
    /**
     * @dev Update emergency response status
     * @param alertId ID of the alert
     * @param responseIndex Index of the response
     * @param status New status
     * @param notes Additional notes
     */
    function updateEmergencyResponseStatus(
        uint256 alertId,
        uint256 responseIndex,
        string memory status,
        string memory notes
    ) external onlyAuthorizedResponder alertExists(alertId) {
        require(responseIndex < emergencyResponses[alertId].length, "Invalid response index");
        
        EmergencyResponse storage response = emergencyResponses[alertId][responseIndex];
        require(response.responder == msg.sender, "Not authorized to update this response");
        
        response.status = status;
        response.notes = notes;
    }
    
    /**
     * @dev Acknowledge a safety alert
     * @param alertId ID of the alert
     */
    function acknowledgeAlert(uint256 alertId) 
        external 
        onlyAuthorizedResponder 
        alertExists(alertId) 
    {
        safetyAlerts[alertId].isAcknowledged = true;
        emit AlertAcknowledged(alertId, safetyAlerts[alertId].touristId);
    }
    
    /**
     * @dev Resolve a safety alert
     * @param alertId ID of the alert
     */
    function resolveAlert(uint256 alertId) 
        external 
        onlyAuthorizedResponder 
        alertExists(alertId) 
    {
        safetyAlerts[alertId].isResolved = true;
        emit AlertResolved(alertId, safetyAlerts[alertId].touristId);
    }
    
    /**
     * @dev Authorize or deauthorize a responder
     * @param responder Address of the responder
     * @param isAuthorized Authorization status
     */
    function setResponderAuthorization(address responder, bool isAuthorized) 
        external 
        onlyOwner 
    {
        authorizedResponders[responder] = isAuthorized;
        emit ResponderAuthorized(responder, isAuthorized);
    }
    
    /**
     * @dev Check if coordinates are within a zone
     * @param latitude Latitude to check (scaled by 1e6)
     * @param longitude Longitude to check (scaled by 1e6)
     * @param zoneId ID of the zone
     */
    function isWithinZone(int256 latitude, int256 longitude, uint256 zoneId) 
        public 
        view 
        zoneExists(zoneId) 
        returns (bool) 
    {
        GeoFenceZone memory zone = geoFenceZones[zoneId];
        
        // Calculate distance using Haversine formula (simplified for small distances)
        int256 latDiff = latitude - zone.centerLatitude;
        int256 lonDiff = longitude - zone.centerLongitude;
        
        // Convert to meters (approximate)
        int256 distance = (latDiff * latDiff + lonDiff * lonDiff) / 1e12; // Rough conversion
        
        return uint256(distance) <= (zone.radius * zone.radius);
    }
    
    /**
     * @dev Get tourist's latest location
     * @param touristId ID of the tourist
     */
    function getLatestLocation(uint256 touristId) 
        external 
        view 
        returns (LocationUpdate memory) 
    {
        require(touristLocations[touristId].length > 0, "No location data");
        return touristLocations[touristId][touristLocations[touristId].length - 1];
    }
    
    /**
     * @dev Get all alerts for a tourist
     * @param touristId ID of the tourist
     */
    function getTouristAlerts(uint256 touristId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return touristAlerts[touristId];
    }
    
    /**
     * @dev Get emergency responses for an alert
     * @param alertId ID of the alert
     */
    function getEmergencyResponses(uint256 alertId) 
        external 
        view 
        alertExists(alertId) 
        returns (EmergencyResponse[] memory) 
    {
        return emergencyResponses[alertId];
    }
    
    /**
     * @dev Get total number of geo-fence zones
     */
    function getTotalZones() external view returns (uint256) {
        return _zoneIdCounter.current() - 1;
    }
    
    /**
     * @dev Get total number of alerts
     */
    function getTotalAlerts() external view returns (uint256) {
        return _alertIdCounter.current() - 1;
    }
}

