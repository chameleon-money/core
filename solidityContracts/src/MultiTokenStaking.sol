// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.27;

import "@oz/token/ERC20/IERC20.sol";

/**
 * @title MultiTokenStaking
 * @dev Example of a simple staking contract deployed to L1 which can be used to stake privately using Noir contracts on Aztec
 */
contract MultiTokenStaking {
    // ============ Storage ============

    address public owner;
    uint256 public rewardRate = 10; // 10% APY
    uint256 public constant SECONDS_IN_YEAR = 31536000;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
    }

    mapping(address => mapping(address => StakeInfo)) public stakes;
    mapping(address => bool) public supportedTokens;

    // ============ Events ============

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event Staked(address indexed user, address indexed token, uint256 amount);
    event Unstaked(address indexed user, address indexed token, uint256 amount, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
    }

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier tokenSupported(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    // ============ Owner Functions ============

    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!supportedTokens[token], "Token already supported");

        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");

        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function updateRewardRate(uint256 newRate) external onlyOwner {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    function recoverERC20(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }

    // ============ Public Functions ============

    function stake(address token, uint256 amount) external tokenSupported(token) {
        require(amount > 0, "Cannot stake 0");

        StakeInfo storage userStake = stakes[token][msg.sender];

        if (userStake.amount > 0) {
            uint256 reward = calculateReward(token, msg.sender);
            userStake.amount += reward;
        }

        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        userStake.amount += amount;
        userStake.startTime = block.timestamp;

        emit Staked(msg.sender, token, amount);
    }

    function unstake(address token, uint256 amount) external tokenSupported(token) {
        StakeInfo storage userStake = stakes[token][msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");

        uint256 reward = calculateReward(token, msg.sender);

        userStake.amount -= amount;
        uint256 totalToTransfer = amount + reward;

        if (userStake.amount > 0) {
            userStake.startTime = block.timestamp;
        } else {
            userStake.startTime = 0;
        }

        require(IERC20(token).transfer(msg.sender, totalToTransfer), "Transfer failed");

        emit Unstaked(msg.sender, token, amount, reward);
    }

    function unstakeAll(address token) external tokenSupported(token) {
        StakeInfo storage userStake = stakes[token][msg.sender];
        uint256 amount = userStake.amount;
        require(amount > 0, "No staked amount");

        uint256 reward = calculateReward(token, msg.sender);
        uint256 totalToTransfer = amount + reward;

        userStake.amount = 0;
        userStake.startTime = 0;

        require(IERC20(token).transfer(msg.sender, totalToTransfer), "Transfer failed");

        emit Unstaked(msg.sender, token, amount, reward);
    }

    // ============ View Functions ============

    function getStakeInfo(address token, address user)
        external
        view
        returns (uint256 stakedAmount, uint256 reward, uint256 startTime)
    {
        StakeInfo memory userStake = stakes[token][user];
        stakedAmount = userStake.amount;
        reward = calculateReward(token, user);
        startTime = userStake.startTime;
    }

    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }

    // ============ Internal Functions ============

    function calculateReward(address token, address user) internal view returns (uint256) {
        StakeInfo memory userStake = stakes[token][user];

        if (userStake.amount == 0 || userStake.startTime == 0) {
            return 0;
        }

        uint256 stakingDuration = block.timestamp - userStake.startTime;
        return (userStake.amount * rewardRate * stakingDuration) / (SECONDS_IN_YEAR * 100);
    }
}
