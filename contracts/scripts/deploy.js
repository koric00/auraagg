// Deployment script for AuraAgg contracts
const hre = require("hardhat");

async function main() {
  console.log("Deploying AuraAgg contracts...");

  // Get the contract factories
  const RouterFacet = await hre.ethers.getContractFactory("RouterFacet");
  const CrossChainSwap = await hre.ethers.getContractFactory("CrossChainSwap");

  // Deploy the contracts
  console.log("Deploying RouterFacet...");
  const routerFacet = await RouterFacet.deploy();
  await routerFacet.waitForDeployment();
  const routerFacetAddress = await routerFacet.getAddress();
  console.log(`RouterFacet deployed to: ${routerFacetAddress}`);

  console.log("Deploying CrossChainSwap...");
  const crossChainSwap = await CrossChainSwap.deploy();
  await crossChainSwap.waitForDeployment();
  const crossChainSwapAddress = await crossChainSwap.getAddress();
  console.log(`CrossChainSwap deployed to: ${crossChainSwapAddress}`);

  // Log deployment information
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log(`Network: ${hre.network.name}`);
  console.log(`RouterFacet: ${routerFacetAddress}`);
  console.log(`CrossChainSwap: ${crossChainSwapAddress}`);
  console.log("===================");

  // Verify contracts on Etherscan if not on a local network
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\nVerifying contracts on Etherscan...");
    
    console.log("Waiting for block confirmations...");
    // Wait for 5 block confirmations to ensure the contract is mined
    await routerFacet.deploymentTransaction().wait(5);
    await crossChainSwap.deploymentTransaction().wait(5);
    
    console.log("Verifying RouterFacet...");
    await hre.run("verify:verify", {
      address: routerFacetAddress,
      constructorArguments: [],
    });
    
    console.log("Verifying CrossChainSwap...");
    await hre.run("verify:verify", {
      address: crossChainSwapAddress,
      constructorArguments: [],
    });
    
    console.log("Verification complete!");
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 