const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    1: {
        name: "mainnet",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    },
};

const developmentChains = ["hardhat", "localhost"];

// _decimals是指喂价合约的精度
const DECIMALS = 8;
// _initialAnswer是指喂价合约的初始价格
const INITIAL_ANSWER = 20000000000;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
