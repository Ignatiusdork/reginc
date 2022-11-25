const { ethers } = require("hardhat");

async function main() {

  // the ContractFactory abstraction is used here to deploy instances of new smart contracts

  const registerContract = await ethers.getContractFactory("Register");

  // here we deploy the contract
  const deployedRegisterContract = await registerContract.deploy(5);
  // 5 is the maximum number of wallet allowed to join the register

  // Waiting for it to finish deploying
  await deployedRegisterContract.deployed();

  // print the address of the deployed contract
  console.log("Register Contract Address:", deployedRegisterContract.address);
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });