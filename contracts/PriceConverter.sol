// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // 获取ETH以美元为单位的价格函数
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // 与项目外合约交互需要两个东西：ABI，address
        // address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        // ABI: 复制了接口在上面
        // 将两者结合，获得了AggregatorV3与它的所有代码接口
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x694AA1769357215DE4FAC081bf1f309aDC325306
        // );

        // 调用 latestRoundData
        // (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = priceFeed.latestRoundData();
        // 其实我们只关系价格，其他的可以省略
        (, int256 answer, , , ) = priceFeed.latestRoundData();

        // priceFeed 返回值有8个0在小数点后面，如果不确定，可以调用decimals方法
        // 而msg.sender 是18位小数（ETH）
        // 所以answer需要变成18位小数
        return uint256(answer * 1e10);
    }

    // 获得当前msg.value 中的ETH 是多少 USD
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // ethprice = 1ETH值多少USD
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;

        return ethAmountInUsd;
    }
}
