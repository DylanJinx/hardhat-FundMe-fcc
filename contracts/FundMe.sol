// SPDX-License-Identifier: MIT
// pragma
pragma solidity ^0.8.0;

// imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// error code
error FundMe__NotOwner();

/**
 * @title   用于众筹的合约
 * @author  dylan
 * @notice  该合约是一个众筹合约的示例
 * @dev     该合约使用了喂价的库实现
 */
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 50 * 1e18; // 单位：美元*1e18
    // 存储投资者们的地址
    address[] private s_funders;
    // 对应投资者 发送了 多少钱
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    // Modifiers
    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // functions
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice  用于向合约发送资金
     * @dev     使用了库将ETH转换为USD
     */
    function fund() public payable {
        // 希望设置一个以usd计算的最小金额
        // 1. 如何向这个合约转ETH
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "didn't send enough"
        ); // msg.value:某人想要转账的金额, 1e18 = 1 * 10**18
        // revert 是将之前的操作回滚，并将剩余的gas费返回

        // 如果发送资金成功，存储投资者地址
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    // 合约owner 可以提取funder发送的资金
    function withdraw() public onlyOwner {
        // 要提取所有的资金，那么s_addressToAmountFunded要重置为0
        // 遍历s_funders数组，并更新s_addressToAmountFunded
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // 重置数组
        s_funders = new address[](0);

        // 取款

        // transfer
        // msg.sender = address
        // payable(msg.sender) = payable address
        //payable(msg.sender).transfer(address(this).balance); // this指整个合约本身

        // send
        // payable(msg.sender).send(address(this).balance);
        // 但是这样还不够，因为如果运行失败，只会返回一个bool ，合约不会回滚
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");

        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Send failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        // 不希望每次从funders.length读取长度，也不希望每次读取数据address funder = s_funders[funderIndex];
        // 将s_funders数组一次性读入 memory内存中
        address[] memory funders = s_funders;
        // 但是mapping不能存储在memory中
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "Send failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
