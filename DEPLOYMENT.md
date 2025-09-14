# Deployment Guide - Smart Tourist Safety Monitoring System

This guide provides step-by-step instructions for deploying the Smart Tourist Safety Monitoring & Incident Response System.

## 🚀 Quick Deployment

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- A blockchain network (local, testnet, or mainnet)

### 1. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd smart-tourist-safety-blockchain

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration
```

### 2. Local Development Deployment

```bash
# Compile smart contracts
npm run compile

# Start local blockchain (in terminal 1)
npm run node

# Deploy contracts (in terminal 2)
npm run deploy:local

# Install backend dependencies
cd backend
npm install

# Start API server (in terminal 3)
npm start
```

### 3. Testnet Deployment (Sepolia)

```bash
# Set up .env file with testnet configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key

# Deploy to Sepolia testnet
npm run deploy -- --network sepolia

# Verify contracts (optional)
npm run verify -- --network sepolia
```

### 4. Mainnet Deployment (Polygon)

```bash
# Set up .env file with mainnet configuration
PRIVATE_KEY=your_private_key_here
POLYGON_URL=https://polygon-mainnet.infura.io/v3/your_project_id
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Deploy to Polygon mainnet
npm run deploy -- --network polygon

# Verify contracts (optional)
npm run verify -- --network polygon
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_project_id
POLYGON_URL=https://polygon-mainnet.infura.io/v3/your_project_id

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Server Configuration
PORT=3000
RPC_URL=http://127.0.0.1:8545

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

### Network Configuration

The system supports multiple networks:

- **Local Development**: `http://127.0.0.1:8545`
- **Sepolia Testnet**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- **Polygon Mainnet**: `https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID`

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Smart contracts compiled successfully
- [ ] Tests passing
- [ ] Network connectivity verified
- [ ] Wallet has sufficient funds for deployment

### Deployment Steps

- [ ] Deploy TouristDigitalID contract
- [ ] Deploy GeoFencingSafety contract
- [ ] Set up initial authorities and responders
- [ ] Create initial safety zones
- [ ] Start API server
- [ ] Verify system functionality

### Post-Deployment

- [ ] Test all API endpoints
- [ ] Verify contract interactions
- [ ] Monitor system logs
- [ ] Set up monitoring and alerts
- [ ] Document contract addresses

## 🛠️ Advanced Configuration

### Custom Network Configuration

To add a custom network, update `hardhat.config.js`:

```javascript
networks: {
  custom: {
    url: "https://your-custom-rpc-url",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 12345
  }
}
```

### Gas Optimization

For production deployments, optimize gas usage:

```javascript
solidity: {
  version: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

### Security Configuration

1. **Private Key Management**: Use hardware wallets or secure key management services
2. **Access Control**: Implement proper role-based access control
3. **Rate Limiting**: Add rate limiting to API endpoints
4. **Monitoring**: Set up comprehensive monitoring and alerting

## 🔍 Verification

### Contract Verification

After deployment, verify contracts on block explorers:

```bash
# Verify on Etherscan/Polygonscan
npm run verify -- --network sepolia
```

### System Testing

Test the deployed system:

```bash
# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/status

# Test tourist registration
curl -X POST http://localhost:3000/api/tourists \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","passportNumber":"P123456789","nationality":"USA","emergencyContact":"+1-555-0123","medicalInfo":"None"}'
```

## 📊 Monitoring

### System Monitoring

Set up monitoring for:

- API server health
- Blockchain network connectivity
- Contract interactions
- Error rates and response times
- Gas usage and transaction costs

### Log Management

Configure logging for:

- API requests and responses
- Blockchain transactions
- Error tracking
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check network connectivity
   - Verify private key and wallet balance
   - Ensure all dependencies are installed

2. **API Server Won't Start**
   - Check port availability
   - Verify environment variables
   - Check blockchain service initialization

3. **Contract Interactions Fail**
   - Verify contract addresses
   - Check network configuration
   - Ensure proper authorization

### Debug Commands

```bash
# Check network status
npx hardhat console --network localhost

# View deployment info
cat deployment-info.json

# Check API server logs
tail -f logs/api.log
```

## 🔄 Updates and Maintenance

### Contract Upgrades

For contract upgrades:

1. Deploy new contract version
2. Migrate data if necessary
3. Update API configuration
4. Test thoroughly before switching

### System Updates

For system updates:

1. Backup current configuration
2. Update dependencies
3. Test in staging environment
4. Deploy to production
5. Monitor for issues

## 📞 Support

For deployment support:

- Check the troubleshooting section
- Review system logs
- Contact the development team
- Create an issue in the repository

---

**Happy Deploying! 🚀**

