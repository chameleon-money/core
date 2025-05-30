// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Aztec Labs.
pragma solidity >=0.8.27;

import {IFeeJuicePortal} from "./IFeeJuicePortal.sol";
import {IVerifier} from "./IVerifier.sol";
import {IInbox} from "./messagebridge/IInbox.sol";
import {IOutbox} from "./messagebridge/IOutbox.sol";
import {Signature} from "../libraries/crypto/SignatureLib.sol";
import {FeeHeader, L1FeeData, ManaBaseFeeComponents} from "../libraries/rollup/FeeLib.sol";
import {FeeAssetPerEthE9, EthValue, FeeAssetValue} from "../libraries/rollup/FeeLib.sol";
import {ProposeArgs} from "../libraries/rollup/ProposeLib.sol";
import {Timestamp, Slot, Epoch} from "../libraries/TimeLib.sol";
import {IRewardDistributor} from "../../governance/interfaces/IRewardDistributor.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

struct PublicInputArgs {
    bytes32 previousArchive;
    bytes32 endArchive;
    bytes32 previousBlockHash; // @todo #8829 Not needed as public input, unconstrained on L1
    bytes32 endBlockHash; // @todo #8829 Not needed as public input, unconstrained on L1
    Timestamp endTimestamp;
    bytes32 outHash;
    address proverId;
}

struct SubmitEpochRootProofArgs {
    uint256 start; // inclusive
    uint256 end; // inclusive
    PublicInputArgs args;
    bytes32[] fees;
    bytes blobPublicInputs;
    bytes aggregationObject;
    bytes proof;
}

struct BlockLog {
    bytes32 archive;
    bytes32 blockHash;
    Slot slotNumber;
}

struct ChainTips {
    uint256 pendingBlockNumber;
    uint256 provenBlockNumber;
}

struct SubEpochRewards {
    uint256 summedCount;
    mapping(address prover => bool proofSubmitted) hasSubmitted;
}

struct EpochRewards {
    uint256 longestProvenLength;
    uint256 rewards;
    mapping(uint256 length => SubEpochRewards) subEpoch;
}

/**
 * @notice Struct for storing flags for block header validation
 * @param ignoreDA - True will ignore DA check, otherwise checks
 * @param ignoreSignature - True will ignore the signatures, otherwise checks
 */
struct BlockHeaderValidationFlags {
    bool ignoreDA;
    bool ignoreSignatures;
}

struct GenesisState {
    bytes32 vkTreeRoot;
    bytes32 protocolContractTreeRoot;
    bytes32 genesisArchiveRoot;
    bytes32 genesisBlockHash;
}

struct RollupConfigInput {
    uint256 aztecSlotDuration;
    uint256 aztecEpochDuration;
    uint256 targetCommitteeSize;
    uint256 aztecProofSubmissionWindow;
    uint256 minimumStake;
    uint256 slashingQuorum;
    uint256 slashingRoundSize;
    uint256 manaTarget;
    EthValue provingCostPerMana;
}

struct RollupConfig {
    uint256 proofSubmissionWindow;
    IERC20 feeAsset;
    IFeeJuicePortal feeAssetPortal;
    IRewardDistributor rewardDistributor;
    bytes32 vkTreeRoot;
    bytes32 protocolContractTreeRoot;
    IVerifier epochProofVerifier;
    IInbox inbox;
    IOutbox outbox;
    uint256 version;
}

// The below blobPublicInputsHashes are filled when proposing a block, then used to verify an epoch proof.
// TODO(#8955): When implementing batched kzg proofs, store one instance per epoch rather than block
struct RollupStore {
    ChainTips tips; // put first such that the struct slot structure is easy to follow for cheatcodes
    mapping(uint256 blockNumber => BlockLog log) blocks;
    mapping(uint256 blockNumber => bytes32) blobPublicInputsHashes;
    mapping(address => uint256) sequencerRewards;
    mapping(Epoch => EpochRewards) epochRewards;
    // @todo Below can be optimised with a bitmap as we can benefit from provers likely proving for epochs close
    // to one another.
    mapping(address prover => mapping(Epoch epoch => bool claimed)) proverClaimed;
    RollupConfig config;
}

struct CheatDepositArgs {
    address attester;
    address proposer;
    address withdrawer;
    uint256 amount;
}

interface ITestRollup {
    function setEpochVerifier(address _verifier) external;
    function setVkTreeRoot(bytes32 _vkTreeRoot) external;
    function setProtocolContractTreeRoot(
        bytes32 _protocolContractTreeRoot
    ) external;
    function cheat__InitialiseValidatorSet(
        CheatDepositArgs[] memory _args
    ) external;
}

interface IRollupCore {
    event L2BlockProposed(
        uint256 indexed blockNumber,
        bytes32 indexed archive,
        bytes32[] versionedBlobHashes
    );
    event L2ProofVerified(
        uint256 indexed blockNumber,
        address indexed proverId
    );
    event PrunedPending(uint256 provenBlockNumber, uint256 pendingBlockNumber);

    function claimSequencerRewards(
        address _recipient
    ) external returns (uint256);
    function claimProverRewards(
        address _recipient,
        Epoch[] memory _epochs
    ) external returns (uint256);

    function prune() external;
    function updateL1GasFeeOracle() external;

    function setProvingCostPerMana(EthValue _provingCostPerMana) external;

    function propose(
        ProposeArgs calldata _args,
        Signature[] memory _signatures,
        bytes calldata _blobInput
    ) external;

    function submitEpochRootProof(
        SubmitEpochRootProofArgs calldata _args
    ) external;

    // solhint-disable-next-line func-name-mixedcase
    function L1_BLOCK_AT_GENESIS() external view returns (uint256);
}

interface IRollup is IRollupCore {
    function validateHeader(
        bytes calldata _header,
        Signature[] memory _signatures,
        bytes32 _digest,
        Timestamp _currentTime,
        bytes32 _blobsHash,
        BlockHeaderValidationFlags memory _flags
    ) external;

    function canProposeAtTime(
        Timestamp _ts,
        bytes32 _archive
    ) external returns (Slot, uint256);

    function getTips() external view returns (ChainTips memory);

    function status(
        uint256 _myHeaderBlockNumber
    )
        external
        view
        returns (
            uint256 provenBlockNumber,
            bytes32 provenArchive,
            uint256 pendingBlockNumber,
            bytes32 pendingArchive,
            bytes32 archiveOfMyBlock,
            Epoch provenEpochNumber
        );

    function getEpochProofPublicInputs(
        uint256 _start,
        uint256 _end,
        PublicInputArgs calldata _args,
        bytes32[] calldata _fees,
        bytes calldata _blobPublicInputs,
        bytes calldata _aggregationObject
    ) external view returns (bytes32[] memory);

    function validateBlobs(
        bytes calldata _blobsInputs
    ) external view returns (bytes32[] memory, bytes32, bytes32);

    function getManaBaseFeeComponentsAt(
        Timestamp _timestamp,
        bool _inFeeAsset
    ) external view returns (ManaBaseFeeComponents memory);
    function getManaBaseFeeAt(
        Timestamp _timestamp,
        bool _inFeeAsset
    ) external view returns (uint256);
    function getL1FeesAt(
        Timestamp _timestamp
    ) external view returns (L1FeeData memory);
    function getFeeAssetPerEth() external view returns (FeeAssetPerEthE9);

    function getEpochForBlock(
        uint256 _blockNumber
    ) external view returns (Epoch);
    function canPruneAtTime(Timestamp _ts) external view returns (bool);

    function archive() external view returns (bytes32);
    function archiveAt(uint256 _blockNumber) external view returns (bytes32);
    function getProvenBlockNumber() external view returns (uint256);
    function getPendingBlockNumber() external view returns (uint256);
    function getBlock(
        uint256 _blockNumber
    ) external view returns (BlockLog memory);
    function getFeeHeader(
        uint256 _blockNumber
    ) external view returns (FeeHeader memory);
    function getBlobPublicInputsHash(
        uint256 _blockNumber
    ) external view returns (bytes32);

    function getSequencerRewards(
        address _sequencer
    ) external view returns (uint256);
    function getCollectiveProverRewardsForEpoch(
        Epoch _epoch
    ) external view returns (uint256);
    function getSpecificProverRewardsForEpoch(
        Epoch _epoch,
        address _prover
    ) external view returns (uint256);
    function getHasSubmitted(
        Epoch _epoch,
        uint256 _length,
        address _prover
    ) external view returns (bool);

    function getProofSubmissionWindow() external view returns (uint256);
    function getManaTarget() external view returns (uint256);
    function getManaLimit() external view returns (uint256);
    function getProvingCostPerManaInEth() external view returns (EthValue);

    function getProvingCostPerManaInFeeAsset()
        external
        view
        returns (FeeAssetValue);

    function getFeeAsset() external view returns (IERC20);
    function getFeeAssetPortal() external view returns (IFeeJuicePortal);
    function getRewardDistributor() external view returns (IRewardDistributor);
    function getBurnAddress() external view returns (address);

    function getInbox() external view returns (IInbox);
    function getOutbox() external view returns (IOutbox);
    function getVersion() external view returns (uint256);
}
