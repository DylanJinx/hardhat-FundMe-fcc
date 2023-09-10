const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer); // getContract()获取部署的合约
    console.log("Funding Contract...");
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.5"),
    });
    await transactionResponse.wait(1); // 等待1个区块
    console.log("funded");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
