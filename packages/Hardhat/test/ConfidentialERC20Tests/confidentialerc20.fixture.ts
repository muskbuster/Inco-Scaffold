import { ethers } from "hardhat";

import type { ConfidentialERC20 } from "../../types";
import { getSigners } from "../signers";

export async function deployConfidentialERC20Fixture(): Promise<ConfidentialERC20> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("ConfidentialERC20");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();
  console.log("Confidential ERC20 Contract Address is:", await contract.getAddress());

  return contract;
}
