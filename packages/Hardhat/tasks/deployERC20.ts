import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:deployERC20").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const erc20Factory = await ethers.getContractFactory("MyERC20");
  const confidentialERC20 = await erc20Factory.connect(signers[0]).deploy();
  await confidentialERC20.waitForDeployment();
  console.log("ConfidentialERC20 deployed to: ", await confidentialERC20.getAddress());
});
