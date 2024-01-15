import { ethers } from "hardhat";

async function main() {
  const Flash = await ethers.getContractFactory("Flash");
  const flash = await Flash.deploy();

  await flash.deployed();

  console.log(
    `Flash deployed to ${flash.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
