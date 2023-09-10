const { network } = require("hardhat");
// 导入网络配置
// const helperConfig = reuqire("../helper-hardhat-config");
// const networkConfig = helperConfig.networkConfig;
// 等价于：
const { networkConfig } = require("../helper-hardhat-config");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    // deploy函数是hardhat-deploy的一个方法，它会自动检测你的合约是否已经部署过，如果没有部署过，就会部署，如果部署过，就不会部署
    // log函数是hardhat-deploy的一个方法，它会打印出你的合约部署的地址
    const { deploy, log } = deployments;
    // deployer是hardhat-deploy的一个方法，它会返回部署合约的账户
    const { deployer } = await getNamedAccounts();
    // 获取chainId
    const chainId = network.config.chainId;

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    // 将参数 参数化
    const args = [ethUsdPriceFeedAddress];

    // 当使用本地主机 或 hardhat network时，要使用mock
    // 部署
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // 放入喂价合约地址
        log: true, // 自定义log
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // 如果部署在其他网络，需要自动验证
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("正在验证合约...");
        // console.log(fundMe);
        // verify
        await verify(fundMe.address, args);
    }
    log("--------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
