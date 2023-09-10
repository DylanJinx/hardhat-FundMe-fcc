const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

// staging测试只在测试网上运行，如果network.name包括了"hardhat"或"localhost"，则跳过测试，没有包括，则运行
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let deployer;
          const sendValue = ethers.parseEther("1");
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              // 不会像单元测试一样部署合约await deployments.fixture(["all"]);，而是直接使用已经部署好的合约
              // 我们正假设它已经被部署在了这里
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target,
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
