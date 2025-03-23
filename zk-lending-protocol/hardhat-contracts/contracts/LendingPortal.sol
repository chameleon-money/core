// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IRegistry} from "./aztec/governance/interfaces/IRegistry.sol";
import {IOutbox} from "./aztec/core/interfaces/messagebridge/IOutbox.sol";
import {IRollup} from "./aztec/core/interfaces/IRollup.sol";
import {DataStructures} from "./aztec/core/libraries/DataStructures.sol";
import {Hash} from "./aztec/core/libraries/crypto/Hash.sol";

import {TokenPortal} from "./TokenPortal.sol";
import {LendingProtocol} from "./LendingProtocol.sol";

library PortalDataStructures {
    struct OutboxMessageMetadata {
        uint256 _l2BlockNumber;
        uint256 _leafIndex;
        bytes32[] _path;
    }
}

/**
 * @title UniswapPortal
 * @author Aztec Labs
 * @notice A minimal portal that allow an user inside L2, to withdraw asset A from the Rollup
 * swap asset A to asset B, and deposit asset B into the rollup again.
 * Relies on Uniswap for doing the swap, TokenPortals for A and B to get and send tokens
 * and the message boxes (inbox & outbox).
 */
contract LendingPortal {
    LendingProtocol public immutable lendingProtocol;
    IRegistry public registry;
    bytes32 public l2LendingAddress;
    address public owner;
    mapping(address => address) public portals;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _lendingProtocol) {
        lendingProtocol = LendingProtocol(_lendingProtocol);
        owner = msg.sender;
    }

    function initialize(address _registry, bytes32 _l2LendingAddress) external {
        registry = IRegistry(_registry);
        l2LendingAddress = _l2LendingAddress;
    }

    // Using a struct here to avoid stack too deep errors
    struct LocalSwapVars {
        IERC20 inputAsset;
        IERC20 outputAsset;
        bytes32 contentHash;
    }

    function addPortal(address _token, address _portal) external onlyOwner {
        portals[_token] = _portal;
    }

    function lendPublic(
        address _inputTokenPortal,
        uint256 _inAmount,
        bytes32 _aztecRecipient,
        bytes32 _secretHashForL1ToL2Message,
        bool _withCaller,
        // Avoiding stack too deep
        PortalDataStructures.OutboxMessageMetadata[2]
            calldata _outboxMessageMetadata
    ) public returns (bytes32, uint256) {
        LocalSwapVars memory vars;

        vars.inputAsset = TokenPortal(_inputTokenPortal).underlying();
        (
            address assetAddress,
            address shareTokenAddress,
            string memory name,
            string memory symbol,
            uint256 totalDeposited,
            bool isActive
        ) = lendingProtocol.assets(address(vars.inputAsset));

        address outputTokenPortal = portals[shareTokenAddress];

        if (!isActive || outputTokenPortal == address(0)) {
            revert("Asset is not active");
        }

        vars.outputAsset = IERC20(shareTokenAddress);

        // Withdraw the input asset from the portal
        {
            TokenPortal(_inputTokenPortal).withdraw(
                address(this),
                _inAmount,
                true,
                _outboxMessageMetadata[0]._l2BlockNumber,
                _outboxMessageMetadata[0]._leafIndex,
                _outboxMessageMetadata[0]._path
            );
        }

        {
            // prevent stack too deep errors
            // The purpose of including the function selector is to make the message unique to that specific call. Note that
            // it has nothing to do with calling the function.
            vars.contentHash = Hash.sha256ToField(
                abi.encodeWithSignature(
                    "swap_lend(address,uint256,bytes32,bytes32,address)",
                    _inputTokenPortal,
                    _inAmount,
                    _aztecRecipient,
                    _secretHashForL1ToL2Message,
                    _withCaller ? msg.sender : address(0)
                )
            );
        }

        // Consume the message from the outbox
        {
            IOutbox outbox = IRollup(registry.getRollup()).getOutbox();

            outbox.consume(
                DataStructures.L2ToL1Msg({
                    sender: DataStructures.L2Actor(l2LendingAddress, 1),
                    recipient: DataStructures.L1Actor(
                        address(this),
                        block.chainid
                    ),
                    content: vars.contentHash
                }),
                _outboxMessageMetadata[1]._l2BlockNumber,
                _outboxMessageMetadata[1]._leafIndex,
                _outboxMessageMetadata[1]._path
            );
        }

        vars.inputAsset.approve(address(lendingProtocol), _inAmount);

        uint256 sharesToMint = lendingProtocol.deposit(assetAddress, _inAmount);

        // approve the output token portal to take funds from this contract
        vars.outputAsset.approve(outputTokenPortal, sharesToMint);

        // Deposit the output asset to the L2 via its portal
        return
            TokenPortal(outputTokenPortal).depositToAztecPublic(
                _aztecRecipient,
                sharesToMint,
                _secretHashForL1ToL2Message
            );
    }

    function lendPrivate(
        address _inputTokenPortal,
        uint256 _inAmount,
        bytes32 _secretHashForL1ToL2Message,
        bool _withCaller,
        // Avoiding stack too deep
        PortalDataStructures.OutboxMessageMetadata[2]
            calldata _outboxMessageMetadata
    ) public returns (bytes32, uint256) {
        LocalSwapVars memory vars;

        vars.inputAsset = TokenPortal(_inputTokenPortal).underlying();
        (
            address assetAddress,
            address shareTokenAddress,
            string memory name,
            string memory symbol,
            uint256 totalDeposited,
            bool isActive
        ) = lendingProtocol.assets(address(vars.inputAsset));

        address outputTokenPortal = portals[shareTokenAddress];

        if (!isActive || outputTokenPortal == address(0)) {
            revert("Asset is not active");
        }

        vars.outputAsset = IERC20(shareTokenAddress);

        {
            TokenPortal(_inputTokenPortal).withdraw(
                address(this),
                _inAmount,
                true,
                _outboxMessageMetadata[0]._l2BlockNumber,
                _outboxMessageMetadata[0]._leafIndex,
                _outboxMessageMetadata[0]._path
            );
        }

        {
            // prevent stack too deep errors
            // The purpose of including the function selector is to make the message unique to that specific call. Note that
            // it has nothing to do with calling the function.
            vars.contentHash = Hash.sha256ToField(
                abi.encodeWithSignature(
                    "lend_private(address,uint256,bytes32,address)",
                    _inputTokenPortal,
                    _inAmount,
                    _secretHashForL1ToL2Message,
                    _withCaller ? msg.sender : address(0)
                )
            );
        }

        // Consume the message from the outbox
        {
            IOutbox outbox = IRollup(registry.getRollup()).getOutbox();

            outbox.consume(
                DataStructures.L2ToL1Msg({
                    sender: DataStructures.L2Actor(l2LendingAddress, 1),
                    recipient: DataStructures.L1Actor(
                        address(this),
                        block.chainid
                    ),
                    content: vars.contentHash
                }),
                _outboxMessageMetadata[1]._l2BlockNumber,
                _outboxMessageMetadata[1]._leafIndex,
                _outboxMessageMetadata[1]._path
            );
        }

        vars.inputAsset.approve(address(lendingProtocol), _inAmount);

        uint256 sharesToMint = lendingProtocol.deposit(assetAddress, _inAmount);

        // approve the output token portal to take funds from this contract
        vars.outputAsset.approve(outputTokenPortal, sharesToMint);

        // Deposit the output asset to the L2 via its portal
        return
            TokenPortal(outputTokenPortal).depositToAztecPrivate(
                sharesToMint,
                _secretHashForL1ToL2Message
            );
    }
}
