const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

// unit测试只在测试网上运行，如果network.name包括了"hardhat"或"localhost"，则运行测试，没有包括，则跳过测试
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.parseEther("1"); // 1 * 10**18 wei
          beforeEach(async function () {
              // 部署合约
              // 告诉ethers我们想把哪个账户连接到fundme，这里直接使用deployer来调用合约
              deployer = (await getNamedAccounts()).deployer;
              // 或者使用 const accounts = await ethers.getSigners();如果是hardhat网络，那么会返回10个账户
              // 那么可以 const accountsZero = accounts[0];来获取第一个账户

              // 使用hardhat-deploy获取`deployments`对象来部署合约
              // fixture的作用是运行我们运行整个deploy文件夹，并且可以使用任意数量的标签(tags)
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer); // getContract()方法可以获取部署的合约
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer,
              );
          });

          describe("constructor", async () => {
              it("sets the aggregator addresses correctly ", async function () {
                  // 确保`getPriceFeed`就是`MockV3Aggregator`
                  const response = await fundMe.getPriceFeed();
                  // console.log("Price Feed from Contract:", response);
                  // console.log("Mock V3 Aggregator Address:", mockV3Aggregator.target);
                  assert.equal(response, mockV3Aggregator.target);
              });
          });

          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "didn't send enough",
                  );
              });

              it("updated the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue });

                  const response =
                      await fundMe.getAddressToAmountFunded(deployer);
                  assert.equal(response.toString(), sendValue.toString());
              });

              it("Adds funder to array of getFunder", async () => {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraw ETH from a single founder", async () => {
                  // arrange
                  // 首先获取合约余额 和 deployer 余额
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      (
                          startingFundMeBalance + startingDeployerBalance
                      ).toString(),
                      (
                          endingDeployerBalance +
                          transactionReceipt.gasUsed *
                              transactionReceipt.gasPrice
                      ).toString(),
                  );
              });

              it("allows us to withdraw with multiple getFunder", async () => {
                  // arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 2; i < 7; i++) {
                      // 创建新的对象来连接不同的账户
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  // 获得初始值
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // act
                  // 提款
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  // 获得最终值
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      (
                          startingFundMeBalance + startingDeployerBalance
                      ).toString(),
                      (
                          endingDeployerBalance +
                          transactionReceipt.gasUsed *
                              transactionReceipt.gasPrice
                      ).toString(),
                  );
                  // 确定getFunder数组为空，即检查数组0的位置是否报错
                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  // 确保getAddressToAmountFunded映射为0
                  for (i = 2; i < 7; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[3];
                  const attackerConnectedContract =
                      await fundMe.connect(attacker);
                  try {
                      await attackerConnectedContract.withdraw();
                  } catch (error) {
                      console.log(error.message);
                  }

                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });

              it("cheaperWithdraw ETH from a single founder", async () => {
                  // arrange
                  // 首先获取合约余额 和 deployer 余额
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      (
                          startingFundMeBalance + startingDeployerBalance
                      ).toString(),
                      (
                          endingDeployerBalance +
                          transactionReceipt.gasUsed *
                              transactionReceipt.gasPrice
                      ).toString(),
                  );
              });

              it("allows us to cheaperWithdraw with multiple getFunder", async () => {
                  // arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 2; i < 7; i++) {
                      // 创建新的对象来连接不同的账户
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  // 获得初始值
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // act
                  // 提款
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  // 获得最终值
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  // assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      (
                          startingFundMeBalance + startingDeployerBalance
                      ).toString(),
                      (
                          endingDeployerBalance +
                          transactionReceipt.gasUsed *
                              transactionReceipt.gasPrice
                      ).toString(),
                  );
                  // 确定getFunder数组为空，即检查数组0的位置是否报错
                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  // 确保getAddressToAmountFunded映射为0
                  for (i = 2; i < 7; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });
          });
      });
