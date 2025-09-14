import React, { useState, useEffect } from 'react';
import {
  Shield,
  QrCode,
  Calendar,
  MapPin,
  Phone,
  User,
  CreditCard,
  Download,
  Share2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Heart
} from 'lucide-react';

interface DigitalTouristIDProps {
  user: {
    id: number;
    name: string;
    email: string;
    nationality: string;
    passportNumber: string;
    phoneNumber: string;
    emergencyContact: string;
  };
  itinerary?: {
    startDate: string;
    endDate: string;
    locations: string[];
    purpose: string;
  };
}

export function DigitalTouristID({ user, itinerary }: DigitalTouristIDProps) {
  const [digitalId, setDigitalId] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [safetyScore, setSafetyScore] = useState<number>(85);
  const [validityStatus, setValidityStatus] = useState<'active' | 'expired' | 'suspended'>('active');
  const [loading, setLoading] = useState(false);

  // Generate blockchain-based digital ID
  const generateDigitalID = async () => {
    setLoading(true);
    
    try {
      // Simulate blockchain ID generation
      const blockchainId = `DID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const currentTime = new Date().toISOString();
      
      const newDigitalId = {
        id: blockchainId,
        touristId: user.id,
        generatedAt: currentTime,
        validFrom: currentTime,
        validUntil: itinerary?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: 'active',
        version: '1.0',
        issuer: 'SafeGuard Tourism Authority',
        smartContractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`
      };
      
      setDigitalId(newDigitalId);
      
      // Generate QR code data (in real implementation, this would be actual QR generation)
      const qrData = {
        did: blockchainId,
        tourist: user.name,
        nationality: user.nationality,
        validity: newDigitalId.validUntil,
        emergency: user.emergencyContact,
        verified: true
      };
      
      setQrCodeUrl(`data:image/svg+xml,${encodeURIComponent(generateQRSVG(JSON.stringify(qrData)))}`);
      
    } catch (error) {
      console.error('Error generating digital ID:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple QR code SVG generator (placeholder)
  const generateQRSVG = (data: string) => {
    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="none" stroke="black" stroke-width="2"/>
        <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">QR CODE</text>
        <text x="100" y="120" text-anchor="middle" font-size="10" fill="gray">Digital ID</text>
        <rect x="20" y="20" width="20" height="20" fill="black"/>
        <rect x="160" y="20" width="20" height="20" fill="black"/>
        <rect x="20" y="160" width="20" height="20" fill="black"/>
        <rect x="80" y="80" width="40" height="40" fill="black"/>
      </svg>
    `;
  };

  // Calculate safety score based on various factors
  const calculateSafetyScore = () => {
    let score = 100;
    
    // Document verification status
    if (!user.passportNumber) score -= 15;
    if (!user.emergencyContact) score -= 10;
    
    // Travel history (simulated)
    const riskFactors = Math.floor(Math.random() * 20);
    score -= riskFactors;
    
    // Current location risk (simulated)
    const locationRisk = Math.floor(Math.random() * 15);
    score -= locationRisk;
    
    setSafetyScore(Math.max(score, 0));
  };

  useEffect(() => {
    generateDigitalID();
    calculateSafetyScore();
    
    // Refresh safety score every 5 minutes
    const interval = setInterval(calculateSafetyScore, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const getValidityColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'suspended': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const downloadDigitalID = () => {
    // In real implementation, this would generate a downloadable digital wallet card
    const idData = {
      ...digitalId,
      user: user,
      qrCode: qrCodeUrl,
      safetyScore: safetyScore
    };
    
    const blob = new Blob([JSON.stringify(idData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-tourist-id-${user.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareDigitalID = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Digital Tourist ID',
          text: `Digital Tourist ID for ${user.name} - Valid until ${digitalId?.validUntil}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Digital Tourist ID: ${digitalId?.id}\nName: ${user.name}\nValidity: ${digitalId?.validUntil}`;
      navigator.clipboard.writeText(shareText);
      alert('Digital ID details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-4 shadow-2xl">
            <CreditCard className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Tourist ID</h1>
          <p className="text-gray-600">Blockchain-verified identity for safe travel</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mr-4"></div>
            <span className="text-gray-600 text-lg">Generating your Digital ID...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Digital ID Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 mr-3" />
                  <span className="text-xl font-bold">DIGITAL TOURIST ID</span>
                </div>
                <div className={`px-3 py-1 rounded-2xl text-xs font-medium border ${getValidityColor(validityStatus)}`}>
                  {validityStatus.toUpperCase()}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-sm opacity-75">Full Name</p>
                  <p className="text-xl font-semibold">{user.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-75">Nationality</p>
                    <p className="font-medium">{user.nationality}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">ID Number</p>
                    <p className="font-mono text-sm">{digitalId?.id.slice(-8)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm opacity-75">Valid Until</p>
                  <p className="font-medium">{digitalId && new Date(digitalId.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-75">Blockchain Verified</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Authentic</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">Safety Score</p>
                  <div className="flex items-center mt-1">
                    {getScoreIcon(safetyScore)}
                    <span className="ml-1 text-lg font-bold">{safetyScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code & Details */}
            <div className="space-y-6">
              {/* QR Code Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <QrCode className="h-6 w-6 text-blue-600 mr-2" />
                  Quick Verification
                </h3>
                
                <div className="text-center">
                  {qrCodeUrl && (
                    <div className="inline-block p-4 bg-gray-50 rounded-2xl mb-4">
                      <img src={qrCodeUrl} alt="Digital ID QR Code" className="w-48 h-48 mx-auto" />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code for instant ID verification
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={downloadDigitalID}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={shareDigitalID}
                      className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-gray-700 transition-all duration-200 flex items-center justify-center"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Blockchain Details */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-green-600 mr-2" />
                  Blockchain Verification
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <span className="text-sm text-gray-600">Transaction Hash:</span>
                    <span className="text-sm font-mono text-gray-900">{digitalId?.blockchainHash.slice(0, 16)}...</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <span className="text-sm text-gray-600">Smart Contract:</span>
                    <span className="text-sm font-mono text-gray-900">{digitalId?.smartContractAddress.slice(0, 16)}...</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                    <span className="text-sm text-gray-600">IPFS Storage:</span>
                    <span className="text-sm font-mono text-gray-900">{digitalId?.ipfsHash.slice(0, 16)}...</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl border border-green-200">
                    <span className="text-sm text-green-700">Status:</span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-700">Verified & Active</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={generateDigitalID}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-2xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate ID
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Travel Information */}
        {itinerary && (
          <div className="mt-8 bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-6 w-6 text-purple-600 mr-2" />
              Travel Itinerary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm text-purple-700 font-medium">Travel Period</p>
                <p className="text-purple-900 font-semibold">
                  {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <MapPin className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-sm text-blue-700 font-medium">Destinations</p>
                <p className="text-blue-900 font-semibold">{itinerary.locations.join(', ')}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                <Globe className="h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm text-green-700 font-medium">Purpose</p>
                <p className="text-green-900 font-semibold capitalize">{itinerary.purpose}</p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                <Phone className="h-6 w-6 text-red-600 mb-2" />
                <p className="text-sm text-red-700 font-medium">Emergency Contact</p>
                <p className="text-red-900 font-semibold">{user.emergencyContact}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
