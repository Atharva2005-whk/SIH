const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of Smart Tourist Safety Monitoring System...");
  
  // Get the contract factories
  const TouristDigitalID = await ethers.getContractFactory("TouristDigitalID");
  const GeoFencingSafety = await ethers.getContractFactory("GeoFencingSafety");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Deploy TouristDigitalID contract
  console.log("\nDeploying TouristDigitalID contract...");
  const touristDigitalID = await TouristDigitalID.deploy();
  await touristDigitalID.waitForDeployment();
  const touristDigitalIDAddress = await touristDigitalID.getAddress();
  console.log("TouristDigitalID deployed to:", touristDigitalIDAddress);
  
  // Deploy GeoFencingSafety contract
  console.log("\nDeploying GeoFencingSafety contract...");
  const geoFencingSafety = await GeoFencingSafety.deploy(touristDigitalIDAddress);
  await geoFencingSafety.waitForDeployment();
  const geoFencingSafetyAddress = await geoFencingSafety.getAddress();
  console.log("GeoFencingSafety deployed to:", geoFencingSafetyAddress);
  
  // Set up initial authorities and responders
  console.log("\nSetting up initial authorities...");
  
  // Authorize the deployer as an authority for TouristDigitalID
  await touristDigitalID.setAuthorityAuthorization(deployer.address, true);
  console.log("Deployer authorized as authority for TouristDigitalID");
  
  // Authorize the deployer as a responder for GeoFencingSafety
  await geoFencingSafety.setResponderAuthorization(deployer.address, true);
  console.log("Deployer authorized as responder for GeoFencingSafety");
  
  // Create some initial geo-fence zones for demonstration
  console.log("\nCreating initial geo-fence zones...");
  
  // Safe zone (tourist area)
  const safeZoneTx = await geoFencingSafety.createGeoFenceZone(
    "Tourist Safe Zone",
    "Main tourist area with high security",
    12345678, // latitude (scaled by 1e6)
    87654321, // longitude (scaled by 1e6)
    1000, // 1km radius
    "safe"
  );
  await safeZoneTx.wait();
  console.log("Safe zone created");
  
  // Warning zone (construction area)
  const warningZoneTx = await geoFencingSafety.createGeoFenceZone(
    "Construction Zone",
    "Active construction area - proceed with caution",
    12345680,
    87654320,
    500, // 500m radius
    "warning"
  );
  await warningZoneTx.wait();
  console.log("Warning zone created");
  
  // Danger zone (restricted area)
  const dangerZoneTx = await geoFencingSafety.createGeoFenceZone(
    "Restricted Military Zone",
    "Restricted military area - unauthorized access prohibited",
    12345690,
    87654310,
    2000, // 2km radius
    "danger"
  );
  await dangerZoneTx.wait();
  console.log("Danger zone created");
  
  // Create a sample tourist for testing
  console.log("\nCreating sample tourist for testing...");
  const registerTouristTx = await touristDigitalID.registerTourist(
    "John Doe",
    "P123456789",
    "USA",
    "+1-555-0123",
    "No known allergies"
  );
  await registerTouristTx.wait();
  console.log("Sample tourist registered");
  
  // Verify the tourist
  const verifyTouristTx = await touristDigitalID.verifyTourist(1, true);
  await verifyTouristTx.wait();
  console.log("Sample tourist verified");
  
  console.log("\n=== Deployment Summary ===");
  console.log("TouristDigitalID Contract:", touristDigitalIDAddress);
  console.log("GeoFencingSafety Contract:", geoFencingSafetyAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Network:", await deployer.provider.getNetwork());
  
  // Save deployment info to file
  const deploymentInfo = {
    network: (await deployer.provider.getNetwork()).name,
    chainId: (await deployer.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      TouristDigitalID: touristDigitalIDAddress,
      GeoFencingSafety: geoFencingSafetyAddress
    },
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment-info.json");
  
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

