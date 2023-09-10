// 获取当前区块编号（无论是在使用哪个区块链）
const { task } = require("hardhat/config");

// 给出名称和描述，.setAction()定义了这个任务实际应该执行什么
task("block-number", "Prints the current block number").setAction(
    // const blockTask = async function() => {}
    // async function blockTask() {}
    // 上面两个写法都可以，但是下面这个写法更简洁，是匿名函数
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`Current block number: ${blockNumber}`);
    },
);

module.exports = {};
