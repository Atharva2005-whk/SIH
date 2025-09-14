import type { 
  Tourist, 
  DocumentUploadRequest, 
  ApiResponse, 
  TouristLogin, 
  AuthorityLogin,
  AuthUser,
  Session
} from '@sih/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  sessionId?: string;
}

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client for SafeGuard Tourist System
 */
export class ApiClient {
  private sessionId: string | null = null;
  private isOfflineMode = false;

  constructor() {
    // Restore session from localStorage if available
    this.sessionId = localStorage.getItem('sessionId');
  }

  /**
   * Set session ID for authenticated requests
   */
  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    localStorage.setItem('sessionId', sessionId);
  }

  /**
   * Clear session
   */
  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('sessionId');
  }

  /**
   * Create mock success response for offline mode
   */
  private createMockResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date()
    };
  }

  /**
   * Check if we should use offline mode
   */
  private shouldUseOfflineMode(): boolean {
    // Force offline mode for demo since we don't have a backend
    return true; // Always use offline mode for demo
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, sessionId } = options;
    
    const url = `${API_BASE_URL}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add session ID if available
    const requestSessionId = sessionId || this.sessionId;
    if (requestSessionId) {
      requestHeaders['x-session-id'] = requestSessionId;
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      ...(body && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'Request failed',
          response.status,
          data.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error('API request failed, switching to offline mode:', error);
      this.isOfflineMode = true;
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error - Backend unavailable',
        0
      );
    }
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================

  /**
   * Tourist login
   */
  async touristLogin(credentials: TouristLogin): Promise<ApiResponse<{ user: AuthUser; session: Session }>> {
    console.log('🔓 Tourist Login - Credentials:', credentials);
    
    if (this.shouldUseOfflineMode()) {
      // Mock tourist login for offline mode
      const mockUser = {
        id: 1,
        name: credentials.identifier.includes('@') ? credentials.identifier.split('@')[0] : 'Demo Tourist',
        email: credentials.identifier.includes('@') ? credentials.identifier : 'demo@tourist.com',
        role: 'tourist' as const,
        isVerified: true
      };
      
      const mockSession = {
        id: 'mock-session-' + Date.now(),
        userId: 1,
        userRole: 'tourist' as const,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        lastActivityAt: new Date()
      };
      
      console.log('✅ Mock Tourist User Created:', mockUser);
      console.log('✅ Mock Session Created:', mockSession);
      
      this.setSessionId(mockSession.id);
      
      return this.createMockResponse({
        user: mockUser,
        session: mockSession
      }, 'Login successful (offline mode)');
    }
    
    try {
      return await this.request<{ user: AuthUser; session: Session }>('/api/auth/tourist/login', {
        method: 'POST',
        body: credentials,
      });
    } catch (error) {
      // Fallback to offline mode on error
      this.isOfflineMode = true;
      return this.touristLogin(credentials);
    }
  }

  /**
   * Authority login
   */
  async authorityLogin(credentials: AuthorityLogin): Promise<ApiResponse<{ user: AuthUser; session: Session }>> {
    console.log('🔓 Authority Login - Credentials:', credentials);
    
    if (this.shouldUseOfflineMode()) {
      // Mock authority login for offline mode
      const mockUser = {
        id: 2,
        name: credentials.email.split('@')[0] || 'Demo Admin',
        email: credentials.email,
        role: 'authority' as const,
        department: credentials.department,
        badge: credentials.badge || 'DEMO001',
        isVerified: true,
        permissions: ['manage_tourists', 'verify_documents', 'handle_incidents']
      };
      
      const mockSession = {
        id: 'mock-admin-session-' + Date.now(),
        userId: 2,
        userRole: 'authority' as const,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        lastActivityAt: new Date()
      };
      
      console.log('✅ Mock Admin User Created:', mockUser);
      console.log('✅ Mock Admin Session Created:', mockSession);
      
      this.setSessionId(mockSession.id);
      
      return this.createMockResponse({
        user: mockUser,
        session: mockSession
      }, 'Authority login successful (offline mode)');
    }
    
    try {
      return await this.request<{ user: AuthUser; session: Session }>('/api/auth/authority/login', {
        method: 'POST',
        body: credentials,
      });
    } catch (error) {
      // Fallback to offline mode on error
      this.isOfflineMode = true;
      return this.authorityLogin(credentials);
    }
  }

  /**
   * Verify current session
   */
  async verifySession(): Promise<ApiResponse<{ user: AuthUser; session: Session }>> {
    return this.request<{ user: AuthUser; session: Session }>('/api/auth/verify');
  }

  /**
   * Logout
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/api/auth/logout', {
      method: 'POST',
    });
    this.clearSession();
    return response;
  }

  // ==================== TOURIST MANAGEMENT ====================

  /**
   * Register a new tourist
   */
  async registerTourist(
    tourist: Omit<Tourist, 'id' | 'isVerified'>,
    documents: DocumentUploadRequest[]
  ): Promise<ApiResponse<{ tourist: Tourist; touristId: number }>> {
    if (this.shouldUseOfflineMode()) {
      // Mock tourist registration for offline mode
      const mockTourist = {
        id: Date.now(),
        name: tourist.name,
        nationality: tourist.nationality,
        passportNumber: tourist.passportNumber || `P${Date.now()}`,
        emergencyContact: tourist.emergencyContact || '',
        medicalInfo: tourist.medicalInfo || '',
        isVerified: false,
        registrationDate: new Date(),
        verificationLevel: 'none' as const,
        lastLocationUpdate: undefined
      };
      
      console.log('Tourist registered in offline mode:', mockTourist);
      
      return this.createMockResponse({
        tourist: mockTourist,
        touristId: mockTourist.id
      }, 'Registration successful (offline mode)');
    }
    
    try {
      const formData = new FormData();
      
      // Add tourist data
      formData.append('tourist', JSON.stringify(tourist));
      
      // Add documents
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][type]`, doc.type);
        formData.append(`documents[${index}][file]`, doc.file);
        if (doc.expiryDate) {
          formData.append(`documents[${index}][expiryDate]`, doc.expiryDate.toISOString());
        }
        if (doc.nationality) {
          formData.append(`documents[${index}][nationality]`, doc.nationality);
        }
      });

      return await this.request<{ tourist: Tourist; touristId: number }>('/api/tourists/register', {
        method: 'POST',
        headers: {}, // Remove Content-Type to let browser set it for FormData
        body: formData,
      });
    } catch (error) {
      // Fallback to offline mode on error
      this.isOfflineMode = true;
      return this.registerTourist(tourist, documents);
    }
  }

  /**
   * Get tourist profile
   */
  async getTouristProfile(touristId: number): Promise<ApiResponse<Tourist>> {
    return this.request<Tourist>(`/api/tourists/${touristId}/profile`);
  }

  /**
   * Update tourist profile
   */
  async updateTouristProfile(
    touristId: number,
    updates: Partial<Tourist>
  ): Promise<ApiResponse<Tourist>> {
    return this.request<Tourist>(`/api/tourists/${touristId}/profile`, {
      method: 'PUT',
      body: updates,
    });
  }

  /**
   * Get tourist's current location
   */
  async getTouristLocation(touristId: number): Promise<ApiResponse<{ latitude: number; longitude: number; timestamp: Date }>> {
    return this.request<{ latitude: number; longitude: number; timestamp: Date }>(`/api/tourists/${touristId}/location`);
  }

  /**
   * Update tourist location
   */
  async updateTouristLocation(
    touristId: number,
    location: { latitude: number; longitude: number }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/tourists/${touristId}/location`, {
      method: 'PUT',
      body: location,
    });
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  /**
   * Upload a document
   */
  async uploadDocument(document: DocumentUploadRequest): Promise<ApiResponse<{ documentId: string; ipfsHash: string }>> {
    const formData = new FormData();
    formData.append('type', document.type);
    formData.append('file', document.file);
    if (document.expiryDate) {
      formData.append('expiryDate', document.expiryDate.toISOString());
    }
    if (document.nationality) {
      formData.append('nationality', document.nationality);
    }

    return this.request<{ documentId: string; ipfsHash: string }>('/api/documents/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  /**
   * Get document verification status
   */
  async getDocumentStatus(documentId: string): Promise<ApiResponse<{ 
    id: string; 
    type: string; 
    status: string; 
    verifiedAt?: Date; 
    rejectionReason?: string; 
  }>> {
    return this.request<{ 
      id: string; 
      type: string; 
      status: string; 
      verifiedAt?: Date; 
      rejectionReason?: string; 
    }>(`/api/documents/${documentId}/status`);
  }

  // ==================== INCIDENT REPORTING ====================

  /**
   * Report an incident
   */
  async reportIncident(incident: {
    type: string;
    description: string;
    location: { latitude: number; longitude: number };
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence?: File[];
  }): Promise<ApiResponse<{ incidentId: string }>> {
    const formData = new FormData();
    formData.append('type', incident.type);
    formData.append('description', incident.description);
    formData.append('location', JSON.stringify(incident.location));
    formData.append('severity', incident.severity);
    
    incident.evidence?.forEach((file, index) => {
      formData.append(`evidence[${index}]`, file);
    });

    return this.request<{ incidentId: string }>('/api/incidents/report', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  /**
   * Get incidents near location
   */
  async getNearbyIncidents(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    description: string;
    location: { latitude: number; longitude: number };
    severity: string;
    reportedAt: Date;
    status: string;
  }>>> {
    return this.request<Array<{
      id: string;
      type: string;
      description: string;
      location: { latitude: number; longitude: number };
      severity: string;
      reportedAt: Date;
      status: string;
    }>>(`/api/incidents/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`);
  }

  // ==================== GEOFENCING & SAFETY ====================

  /**
   * Get safety zones
   */
  async getSafetyZones(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    center: { latitude: number; longitude: number };
    radius: number;
    type: 'safe' | 'warning' | 'danger';
    description: string;
  }>>> {
    return this.request<Array<{
      id: string;
      name: string;
      center: { latitude: number; longitude: number };
      radius: number;
      type: 'safe' | 'warning' | 'danger';
      description: string;
    }>>('/api/geofencing/zones');
  }

  /**
   * Check if location is in any safety zone
   */
  async checkLocationSafety(
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<{
    inZone: boolean;
    zone?: {
      id: string;
      name: string;
      type: 'safe' | 'warning' | 'danger';
      description: string;
    };
    alerts: Array<{
      type: string;
      message: string;
      severity: 'info' | 'warning' | 'danger';
    }>;
  }>> {
    return this.request<{
      inZone: boolean;
      zone?: {
        id: string;
        name: string;
        type: 'safe' | 'warning' | 'danger';
        description: string;
      };
      alerts: Array<{
        type: string;
        message: string;
        severity: 'info' | 'warning' | 'danger';
      }>;
    }>(`/api/geofencing/check?lat=${latitude}&lng=${longitude}`);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
