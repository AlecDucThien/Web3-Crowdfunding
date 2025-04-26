//require("@nomicfoundation/hardhat-toolbox");
//require("@thirdweb-dev/hardhat");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY
  ? process.env.PRIVATE_KEY.startsWith("0x")
    ? process.env.PRIVATE_KEY
    : `0x${process.env.PRIVATE_KEY}`
  : "";

module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {}, // Mạng cục bộ cho test
    sepolia: {
      url: process.env.INFURA_URL || "https://rpc.sepolia.org",
      accounts: privateKey ? [privateKey] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts",
    cache: "./cache",
  },
  solidity: {
    version: "0.8.20", // Phù hợp với @openzeppelin/contracts 5.x
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};