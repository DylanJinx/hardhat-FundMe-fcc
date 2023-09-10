// require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("./tasks/block-number");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:10809"); // 使用v2rayN提供的HTTP代理IP和端口
setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },

    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            // 告诉它我们想等待多少区块
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts:thanks hardhat! 是本地主机的账户，hardhat默认会给你20个账户，每个账户里面有10000个以太币
            chainId: 31337,
        },
    },

    // 为了使用verify功能，需要设置etherscan的API key
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    gasReporter: {
        enabled: false,
        outputFile: "gas-reporter.txt",
        noColors: true,
        // currency: "USD",
        // // 为了获得currency的价格，需要设置coinmarketcap的API key
        // coinmarketcap: COINMARKETCAP_API_KEY,
        // token: "MATIC",
    },

    namedAccounts: {
        deployer: {
            // accounts中的第一个账户默认是deployer
            default: 0,
            // 可以指定不同链的第几个账户是deployer
            11155111: 0,
            31337: 1,
        },
        // 为了测试或其他目的而使用的账户
        user: {
            default: 1,
        },
    },
};
