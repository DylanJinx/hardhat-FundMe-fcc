const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            // toLowerCase() 方法用于把字符串转换为小写, includes() 方法用于判断字符串是否包含指定的子字符串
            console.log("Contract already verified");
        } else {
            console.log("Error verifying contract:", error);
        }
    }
};

module.exports = { verify };
