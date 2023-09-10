const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer); // getContract()获取部署的合约

    const startingBalance = await ethers.provider.getBalance(fundMe.target);
    console.log("startingBalance: ", startingBalance);

    console.log("withdraw Contract...");
    const transactionResponse = await fundMe.cheaperWithdraw();
    await transactionResponse.wait(1); // 等待1个区块
    console.log("withdrew");

    const endingBalance = await ethers.provider.getBalance(fundMe.target);
    console.log("endingBalance: ", endingBalance);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
