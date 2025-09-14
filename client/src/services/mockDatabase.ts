// Mock Database Service for SafeSphere
// This simulates a database with demo data for testing

interface User {
  id: number;
  name: string;
  email: string;
  nationality: string;
  role: 'tourist' | 'authority';
  isVerified: boolean;
  createdAt: Date;
  rewardPoints: number;
  documents: Document[];
}

interface Document {
  id: number;
  type: 'aadhar' | 'voter_id' | 'passport' | 'visa' | 'driving_license';
  status: 'verified' | 'pending' | 'rejected';
  uploadedAt: Date;
  fileName: string;
}

interface SafetyIncident {
  id: number;
  userId: number;
  type: 'medical' | 'security' | 'lost' | 'emergency';
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  status: 'open' | 'resolved' | 'investigating';
  reportedAt: Date;
}

interface Reward {
  id: number;
  userId: number;
  points: number;
  reason: string;
  earnedAt: Date;
  category: 'safety_compliance' | 'document_verification' | 'location_update' | 'emergency_drill';
}

class MockDatabase {
  private users: User[] = [
    {
      id: 1,
      name: 'Raj Patel',
      email: 'raj.patel@email.com',
      nationality: 'Indian',
      role: 'tourist',
      isVerified: true,
      createdAt: new Date('2024-01-15'),
      rewardPoints: 350,
      documents: [
        { id: 1, type: 'aadhar', status: 'verified', uploadedAt: new Date('2024-01-16'), fileName: 'aadhar_raj.jpg' },
        { id: 2, type: 'voter_id', status: 'verified', uploadedAt: new Date('2024-01-17'), fileName: 'voter_raj.pdf' }
      ]
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john.smith@email.com',
      nationality: 'American',
      role: 'tourist',
      isVerified: true,
      createdAt: new Date('2024-01-20'),
      rewardPoints: 200,
      documents: [
        { id: 3, type: 'passport', status: 'verified', uploadedAt: new Date('2024-01-21'), fileName: 'passport_john.pdf' },
        { id: 4, type: 'visa', status: 'pending', uploadedAt: new Date('2024-01-22'), fileName: 'visa_john.jpg' }
      ]
    },
    {
      id: 3,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      nationality: 'Indian',
      role: 'tourist',
      isVerified: false,
      createdAt: new Date('2024-02-01'),
      rewardPoints: 150,
      documents: [
        { id: 5, type: 'aadhar', status: 'pending', uploadedAt: new Date('2024-02-02'), fileName: 'aadhar_priya.jpg' },
        { id: 6, type: 'voter_id', status: 'verified', uploadedAt: new Date('2024-02-03'), fileName: 'voter_priya.pdf' }
      ]
    },
    {
      id: 4,
      name: 'Admin Officer',
      email: 'admin@safesphere.com',
      nationality: 'Indian',
      role: 'authority',
      isVerified: true,
      createdAt: new Date('2024-01-01'),
      rewardPoints: 0,
      documents: []
    }
  ];

  private safetyIncidents: SafetyIncident[] = [
    {
      id: 1,
      userId: 1,
      type: 'medical',
      location: 'Rishikesh - Laxman Jhula',
      coordinates: { lat: 30.1089, lng: 78.2932 },
      description: 'Tourist fell during trekking, minor injuries',
      status: 'resolved',
      reportedAt: new Date('2024-01-25')
    },
    {
      id: 2,
      userId: 2,
      type: 'lost',
      location: 'Mussoorie - Mall Road',
      coordinates: { lat: 30.4598, lng: 78.0664 },
      description: 'Tourist lost in crowded market area',
      status: 'resolved',
      reportedAt: new Date('2024-02-01')
    },
    {
      id: 3,
      userId: 3,
      type: 'security',
      location: 'Haridwar - Har Ki Pauri',
      coordinates: { lat: 29.9457, lng: 78.1642 },
      description: 'Suspicious activity reported near tourist area',
      status: 'investigating',
      reportedAt: new Date('2024-02-10')
    }
  ];

  private rewards: Reward[] = [
    {
      id: 1,
      userId: 1,
      points: 100,
      reason: 'Document verification completed',
      earnedAt: new Date('2024-01-16'),
      category: 'document_verification'
    },
    {
      id: 2,
      userId: 1,
      points: 50,
      reason: 'Regular location updates',
      earnedAt: new Date('2024-01-20'),
      category: 'location_update'
    },
    {
      id: 3,
      userId: 1,
      points: 200,
      reason: 'Participated in safety drill',
      earnedAt: new Date('2024-02-01'),
      category: 'emergency_drill'
    },
    {
      id: 4,
      userId: 2,
      points: 100,
      reason: 'Document verification completed',
      earnedAt: new Date('2024-01-21'),
      category: 'document_verification'
    },
    {
      id: 5,
      userId: 2,
      points: 100,
      reason: 'Safety compliance followed',
      earnedAt: new Date('2024-01-25'),
      category: 'safety_compliance'
    },
    {
      id: 6,
      userId: 3,
      points: 150,
      reason: 'Helped another tourist in need',
      earnedAt: new Date('2024-02-05'),
      category: 'safety_compliance'
    }
  ];

  // User methods
  async getUsers(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return Promise.resolve(this.users.find(user => user.id === id));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Promise.resolve(this.users.find(user => user.email === email));
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'rewardPoints' | 'documents'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Math.max(...this.users.map(u => u.id)) + 1,
      createdAt: new Date(),
      rewardPoints: 0,
      documents: []
    };
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return Promise.resolve(undefined);
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return Promise.resolve(this.users[userIndex]);
  }

  // Document methods
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    const user = this.users.find(u => u.id === userId);
    return Promise.resolve(user?.documents || []);
  }

  async addDocument(userId: number, document: Omit<Document, 'id'>): Promise<Document> {
    const newDoc: Document = {
      ...document,
      id: Math.max(0, ...this.users.flatMap(u => u.documents).map(d => d.id)) + 1
    };
    
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.documents.push(newDoc);
    }
    return Promise.resolve(newDoc);
  }

  // Safety Incident methods
  async getIncidents(): Promise<SafetyIncident[]> {
    return Promise.resolve([...this.safetyIncidents]);
  }

  async getIncidentsByUserId(userId: number): Promise<SafetyIncident[]> {
    return Promise.resolve(this.safetyIncidents.filter(incident => incident.userId === userId));
  }

  async createIncident(incidentData: Omit<SafetyIncident, 'id' | 'reportedAt'>): Promise<SafetyIncident> {
    const newIncident: SafetyIncident = {
      ...incidentData,
      id: Math.max(...this.safetyIncidents.map(i => i.id)) + 1,
      reportedAt: new Date()
    };
    this.safetyIncidents.push(newIncident);
    return Promise.resolve(newIncident);
  }

  // Reward methods
  async getRewardsByUserId(userId: number): Promise<Reward[]> {
    return Promise.resolve(this.rewards.filter(reward => reward.userId === userId));
  }

  async addReward(rewardData: Omit<Reward, 'id' | 'earnedAt'>): Promise<Reward> {
    const newReward: Reward = {
      ...rewardData,
      id: Math.max(...this.rewards.map(r => r.id)) + 1,
      earnedAt: new Date()
    };
    this.rewards.push(newReward);
    
    // Update user's reward points
    const user = this.users.find(u => u.id === rewardData.userId);
    if (user) {
      user.rewardPoints += rewardData.points;
    }
    
    return Promise.resolve(newReward);
  }

  async getTotalRewardPoints(userId: number): Promise<number> {
    const user = this.users.find(u => u.id === userId);
    return Promise.resolve(user?.rewardPoints || 0);
  }

  // Authentication simulation
  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Simple demo authentication - in real app, you'd verify password hash
    const user = this.users.find(u => u.email === email);
    if (user && password === 'demo123') {
      return Promise.resolve(user);
    }
    return Promise.resolve(null);
  }

  // Demo data seeding
  async seedDemoData(): Promise<void> {
    console.log('🌱 Demo database seeded successfully!');
    console.log(`📊 Users: ${this.users.length}`);
    console.log(`📋 Safety Incidents: ${this.safetyIncidents.length}`);
    console.log(`🎁 Rewards: ${this.rewards.length}`);
  }

  // Reset database (useful for testing)
  async resetDatabase(): Promise<void> {
    console.log('🔄 Resetting demo database...');
    // Reset to original demo data
    this.users.forEach(user => {
      user.rewardPoints = this.rewards
        .filter(r => r.userId === user.id)
        .reduce((total, reward) => total + reward.points, 0);
    });
    console.log('✅ Database reset complete!');
  }
}

// Export singleton instance
export const mockDB = new MockDatabase();

// Initialize demo data
mockDB.seedDemoData();

export type { User, Document, SafetyIncident, Reward };
