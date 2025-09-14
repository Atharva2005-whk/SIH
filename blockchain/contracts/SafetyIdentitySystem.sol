// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SafetyIdentitySystem
/// @notice Blockchain layer for a Smart Tourist Safety Monitoring & Incident Response System.
/// @dev All-in-one contract keeping deployment simple (no external dependencies). Designed for EVM chains.
///
/// Modules:
///  - Access control (ADMIN/ISSUER/RESPONDER)
///  - Digital ID registry (self-managed DID-like identity record)
///  - Verifiable credential registry (hash anchoring + revocation)
///  - Geofence registry (centroid + radius metadata)
///  - Incident reporting + responder workflow (acknowledge/resolve/dismiss)

/*
    DESIGN NOTES
    - Digital ID: Minimal DID-like identity bound to msg.sender. Holds idHash (off-chain DID or PII hash),
      metadata URI (off-chain profile), and pubKey for optional off-chain signature verification. Non-transferable.
    - Credentials: Authorities with ISSUER_ROLE anchor a credential by its hash and optional expiry.
      Subject address, issuer, and times are recorded. Revocation supported on-chain.
    - Incidents: Tourists with active Digital ID can report an incident with lat/lon (1e-7 degrees), category, URI.
      Responders can acknowledge and resolve/dismiss. Optional link to a credential (e.g., KYC or ticket credential).
    - Geofences: Admins define geofences (centroid + radius). Distance checks are intended off-chain to conserve gas.
*/

contract AccessManaged {
    address public owner;
    mapping(bytes32 => mapping(address => bool)) private _roles;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant RESPONDER_ROLE = keccak256("RESPONDER_ROLE");

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "Missing role");
        _;
    }

    constructor() {
        owner = msg.sender;
        _roles[ADMIN_ROLE][msg.sender] = true;
        emit RoleGranted(ADMIN_ROLE, msg.sender, msg.sender);
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero addr");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function grantRole(bytes32 role, address account) public onlyRole(ADMIN_ROLE) {
        require(account != address(0), "zero addr");
        if (!_roles[role][account]) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function revokeRole(bytes32 role, address account) public onlyRole(ADMIN_ROLE) {
        if (_roles[role][account]) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }
}

contract SafetyIdentitySystem is AccessManaged {
    // =========================
    // Digital Identity Registry
    // =========================
    struct DigitalID {
        bytes32 idHash;      // Hash of off-chain DID/PII (e.g., keccak256 of passport number salt)
        string uri;          // Off-chain metadata URI (IPFS/HTTPS)
        bytes32 pubKey;      // Optional: compressed pubkey or any 32-byte key reference
        bool active;         // Active flag
        uint64 createdAt;    // Registration timestamp
    }

    mapping(address => DigitalID) private _digitalIDs;

    event DigitalIDRegistered(address indexed holder, bytes32 indexed idHash, string uri, bytes32 pubKey);
    event DigitalIDUpdated(address indexed holder, string uri, bytes32 pubKey);
    event DigitalIDDeactivated(address indexed holder);

    /// @notice Register a self-sovereign digital identity for the caller.
    function registerDigitalID(bytes32 idHash, string calldata uri, bytes32 pubKey) external {
        DigitalID storage did = _digitalIDs[msg.sender];
        require(!did.active, "DID already active");
        _digitalIDs[msg.sender] = DigitalID({
            idHash: idHash,
            uri: uri,
            pubKey: pubKey,
            active: true,
            createdAt: uint64(block.timestamp)
        });
        emit DigitalIDRegistered(msg.sender, idHash, uri, pubKey);
    }

    /// @notice Update metadata of caller's digital identity.
    function updateDigitalID(string calldata uri, bytes32 pubKey) external {
        DigitalID storage did = _digitalIDs[msg.sender];
        require(did.active, "No active DID");
        did.uri = uri;
        did.pubKey = pubKey;
        emit DigitalIDUpdated(msg.sender, uri, pubKey);
    }

    /// @notice Deactivate caller's identity (can be re-registered).
    function deactivateDigitalID() external {
        DigitalID storage did = _digitalIDs[msg.sender];
        require(did.active, "No active DID");
        did.active = false;
        emit DigitalIDDeactivated(msg.sender);
    }

    function getDigitalID(address holder) external view returns (DigitalID memory) {
        return _digitalIDs[holder];
    }

    function hasActiveDID(address holder) public view returns (bool) {
        return _digitalIDs[holder].active;
    }

    // ============================
    // Verifiable Credential Anchors
    // ============================
    struct Credential {
        bytes32 id;          // Unique id derived from subject, hash, issuer, issuedAt
        address subject;     // Holder address
        bytes32 hash;        // Hash of the credential content (e.g., keccak256 of JSON-LD)
        uint64 issuedAt;     // Issuance time
        uint64 expiresAt;    // 0 if non-expiring
        address issuer;      // Issuer address (must have ISSUER_ROLE)
        bool revoked;        // Revocation status
        string ctype;        // Credential type (e.g., "KYC", "TICKET", "MEDICAL_CLEARANCE")
    }

    mapping(bytes32 => Credential) private _credentials;
    mapping(address => bytes32[]) private _subjectCredentials;

    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed subject,
        address indexed issuer,
        bytes32 hash,
        uint64 expiresAt,
        string ctype
    );
    event CredentialRevoked(bytes32 indexed credentialId, address indexed revokedBy);

    /// @notice Issue a credential anchored by its content hash.
    function issueCredential(
        address subject,
        bytes32 hash,
        uint64 expiresAt,
        string calldata ctype
    ) external onlyRole(ISSUER_ROLE) returns (bytes32 credentialId) {
        require(subject != address(0), "subject=0");
        require(hash != bytes32(0), "hash=0");
        uint64 issuedAt = uint64(block.timestamp);
        credentialId = keccak256(abi.encodePacked(subject, hash, msg.sender, issuedAt));
        require(_credentials[credentialId].id == 0, "exists");

        _credentials[credentialId] = Credential({
            id: credentialId,
            subject: subject,
            hash: hash,
            issuedAt: issuedAt,
            expiresAt: expiresAt,
            issuer: msg.sender,
            revoked: false,
            ctype: ctype
        });
        _subjectCredentials[subject].push(credentialId);

        emit CredentialIssued(credentialId, subject, msg.sender, hash, expiresAt, ctype);
    }

    /// @notice Revoke an issued credential (by issuer or admin).
    function revokeCredential(bytes32 credentialId) external {
        Credential storage c = _credentials[credentialId];
        require(c.id != 0, "not found");
        require(msg.sender == c.issuer || hasRole(ADMIN_ROLE, msg.sender), "not issuer/admin");
        require(!c.revoked, "already revoked");
        c.revoked = true;
        emit CredentialRevoked(credentialId, msg.sender);
    }

    /// @notice Get credential status and attributes.
    function credentialStatus(bytes32 credentialId) external view returns (
        bool valid,
        bool revoked,
        uint64 issuedAt,
        uint64 expiresAt,
        address issuer,
        address subject,
        string memory ctype
    ) {
        Credential storage c = _credentials[credentialId];
        if (c.id == 0) {
            return (false, false, 0, 0, address(0), address(0), "");
        }
        bool notExpired = c.expiresAt == 0 || c.expiresAt >= block.timestamp;
        valid = !c.revoked && notExpired;
        return (valid, c.revoked, c.issuedAt, c.expiresAt, c.issuer, c.subject, c.ctype);
    }

    /// @notice Deterministically derive a credential ID used on issuance.
    function findCredentialId(address subject, bytes32 hash, address issuer, uint64 issuedAt)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(subject, hash, issuer, issuedAt));
    }

    /// @notice List credential IDs issued to a subject.
    function subjectCredentials(address subject) external view returns (bytes32[] memory) {
        return _subjectCredentials[subject];
    }

    // =============================
    // Incident Reporting & Workflow
    // =============================
    enum IncidentStatus { Reported, Acknowledged, Resolved, Dismissed }

    struct Incident {
        uint256 id;              // Sequential id
        address reporter;        // Tourist address (must have active DID)
        int32 latE7;             // Latitude * 1e7
        int32 lonE7;             // Longitude * 1e7
        uint64 timestamp;        // Report time
        string category;         // e.g., "SOS", "MEDICAL", "THEFT"
        string detailsURI;       // Off-chain evidence/details
        uint32 geofenceId;       // Optional: link to a defined geofence
        address responder;       // Assigned responder (first acknowledger)
        IncidentStatus status;   // Workflow status
        bytes32 relatedCredential; // Optional: link to a credential id
    }

    uint256 public incidentCount;
    mapping(uint256 => Incident) private _incidents;

    event IncidentReported(
        uint256 indexed id,
        address indexed reporter,
        int32 latE7,
        int32 lonE7,
        uint32 geofenceId,
        string category,
        string detailsURI,
        uint64 timestamp
    );
    event IncidentAcknowledged(uint256 indexed id, address indexed responder);
    event IncidentResolved(uint256 indexed id, address indexed responder, bool dismissed);
    event IncidentCredentialLinked(uint256 indexed id, bytes32 indexed credentialId);

    /// @notice Report an incident. Caller must have an active Digital ID.
    function reportIncident(
        int32 latE7,
        int32 lonE7,
        string calldata category,
        string calldata detailsURI,
        uint32 geofenceId
    ) external returns (uint256 id) {
        require(_digitalIDs[msg.sender].active, "DID required");
        id = ++incidentCount;
        _incidents[id] = Incident({
            id: id,
            reporter: msg.sender,
            latE7: latE7,
            lonE7: lonE7,
            timestamp: uint64(block.timestamp),
            category: category,
            detailsURI: detailsURI,
            geofenceId: geofenceId,
            responder: address(0),
            status: IncidentStatus.Reported,
            relatedCredential: bytes32(0)
        });
        emit IncidentReported(id, msg.sender, latE7, lonE7, geofenceId, category, detailsURI, uint64(block.timestamp));
    }

    /// @notice Acknowledge an incident and self-assign as responder.
    function acknowledgeIncident(uint256 id) external onlyRole(RESPONDER_ROLE) {
        Incident storage inc = _incidents[id];
        require(inc.id != 0, "not found");
        require(inc.status == IncidentStatus.Reported, "bad status");
        inc.status = IncidentStatus.Acknowledged;
        inc.responder = msg.sender;
        emit IncidentAcknowledged(id, msg.sender);
    }

    /// @notice Resolve or dismiss an incident.
    function resolveIncident(uint256 id, bool dismiss) external onlyRole(RESPONDER_ROLE) {
        Incident storage inc = _incidents[id];
        require(inc.id != 0, "not found");
        require(
            inc.status == IncidentStatus.Acknowledged || inc.status == IncidentStatus.Reported,
            "bad status"
        );
        inc.status = dismiss ? IncidentStatus.Dismissed : IncidentStatus.Resolved;
        if (inc.responder == address(0)) {
            inc.responder = msg.sender;
        }
        emit IncidentResolved(id, inc.responder, dismiss);
    }

    /// @notice Link a credential to an incident (e.g., proof of ticket/identity).
    function linkIncidentCredential(uint256 id, bytes32 credentialId) external onlyRole(RESPONDER_ROLE) {
        Incident storage inc = _incidents[id];
        require(inc.id != 0, "not found");
        require(_credentials[credentialId].id != 0, "cred not found");
        inc.relatedCredential = credentialId;
        emit IncidentCredentialLinked(id, credentialId);
    }

    function getIncident(uint256 id) external view returns (Incident memory) {
        return _incidents[id];
    }

    // =====================
    // Geofence Configuration
    // =====================
    struct Geofence {
        uint32 id;             // Sequential id
        string name;           // Human-readable name
        int32 latCenterE7;     // Center latitude * 1e7
        int32 lonCenterE7;     // Center longitude * 1e7
        uint32 radiusMeters;   // Radius in meters
        bool active;           // Active flag
    }

    uint32 public geofenceCount;
    mapping(uint32 => Geofence) private _geofences;

    event GeofenceAdded(
        uint32 indexed id,
        string name,
        int32 latCenterE7,
        int32 lonCenterE7,
        uint32 radiusMeters,
        bool active
    );
    event GeofenceUpdated(
        uint32 indexed id,
        string name,
        int32 latCenterE7,
        int32 lonCenterE7,
        uint32 radiusMeters,
        bool active
    );
    event GeofenceActivation(uint32 indexed id, bool active);

    /// @notice Add a new geofence (ADMIN only).
    function addGeofence(
        string calldata name,
        int32 latCenterE7,
        int32 lonCenterE7,
        uint32 radiusMeters,
        bool active
    ) external onlyRole(ADMIN_ROLE) returns (uint32 id) {
        id = ++geofenceCount;
        _geofences[id] = Geofence({
            id: id,
            name: name,
            latCenterE7: latCenterE7,
            lonCenterE7: lonCenterE7,
            radiusMeters: radiusMeters,
            active: active
        });
        emit GeofenceAdded(id, name, latCenterE7, lonCenterE7, radiusMeters, active);
    }

    /// @notice Update an existing geofence (ADMIN only).
    function updateGeofence(
        uint32 id,
        string calldata name,
        int32 latCenterE7,
        int32 lonCenterE7,
        uint32 radiusMeters,
        bool active
    ) external onlyRole(ADMIN_ROLE) {
        Geofence storage g = _geofences[id];
        require(g.id != 0, "not found");
        g.name = name;
        g.latCenterE7 = latCenterE7;
        g.lonCenterE7 = lonCenterE7;
        g.radiusMeters = radiusMeters;
        g.active = active;
        emit GeofenceUpdated(id, name, latCenterE7, lonCenterE7, radiusMeters, active);
    }

    /// @notice Toggle active state of a geofence (ADMIN only).
    function setGeofenceActive(uint32 id, bool active) external onlyRole(ADMIN_ROLE) {
        Geofence storage g = _geofences[id];
        require(g.id != 0, "not found");
        g.active = active;
        emit GeofenceActivation(id, active);
    }

    function getGeofence(uint32 id) external view returns (Geofence memory) {
        return _geofences[id];
    }
}