const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    // 不希望将这个mock合约部署到测试网或者已经有喂价合约的网络上
    if (developmentChains.includes(network.name)) {
        log("检测到本地网络，部署mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("mocks部署成功！");
        log("------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
