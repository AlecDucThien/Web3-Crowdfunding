const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding", function () {
  let contract, owner, donor;

  beforeEach(async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    contract = await CrowdFunding.deploy();
    await contract.deployed();
    [owner, donor] = await ethers.getSigners();
  });

  it("should create a campaign", async function () {
    const deadline = Math.floor(Date.now() / 1000) + 86400;
    await contract.createCampaign(
      owner.address,
      "Test Campaign",
      "Description",
      ethers.utils.parseEther("1"),
      deadline,
      "image_url"
    );
    expect(await contract.numberOfCampaigns()).to.equal(1);
  });

  it("should allow donations", async function () {
    const deadline = Math.floor(Date.now() / 1000) + 86400;
    await contract.createCampaign(
      owner.address,
      "Test Campaign",
      "Description",
      ethers.utils.parseEther("1"),
      deadline,
      "image_url"
    );
    await contract.connect(donor).donateToCampaign(0, { value: ethers.utils.parseEther("0.1") });
    const campaign = await contract.campaigns(0);
    expect(campaign.amountCollected).to.equal(ethers.utils.parseEther("0.1"));
  });
});