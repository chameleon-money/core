// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Aztec Labs.
pragma solidity >=0.8.27;

import {IFeeJuicePortal} from "./interfaces/IFeeJuicePortal.sol";
import {IRollupCore, ITestRollup, CheatDepositArgs, RollupStore, SubmitEpochRootProofArgs, RollupConfigInput} from "./interfaces/IRollup.sol";
import {IStakingCore} from "./interfaces/IStaking.sol";
import {IValidatorSelectionCore} from "./interfaces/IValidatorSelection.sol";
import {IInbox} from "./interfaces/messagebridge/IInbox.sol";
import {IOutbox} from "./interfaces/messagebridge/IOutbox.sol";
import {Constants} from "./libraries/ConstantsGen.sol";
import {Signature} from "./libraries/crypto/SignatureLib.sol";
import {Errors} from "./libraries/Errors.sol";
import {CheatLib} from "./libraries/rollup/CheatLib.sol";
import {ExtRollupLib} from "./libraries/rollup/ExtRollupLib.sol";
import {EthValue, FeeLib} from "./libraries/rollup/FeeLib.sol";
import {ProposeArgs, ProposeLib} from "./libraries/rollup/ProposeLib.sol";
import {RewardLib} from "./libraries/rollup/RewardLib.sol";
import {STFLib, GenesisState} from "./libraries/rollup/STFLib.sol";
import {StakingLib} from "./libraries/staking/StakingLib.sol";
import {Timestamp, Slot, Epoch, TimeLib} from "./libraries/TimeLib.sol";
import {Inbox} from "./messagebridge/Inbox.sol";
import {Outbox} from "./messagebridge/Outbox.sol";
import {Slasher} from "./staking/Slasher.sol";
import {IRewardDistributor} from "../governance/interfaces/IRewardDistributor.sol";
import {MockVerifier} from "../mock/MockVerifier.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title Rollup
 * @author Aztec Labs
 * @notice Rollup contract that is concerned about readability and velocity of development
 * not giving a damn about gas costs.
 * @dev WARNING: This contract is VERY close to the size limit
 */
contract RollupCore is
    EIP712("Aztec Rollup", "1"),
    Ownable,
    IStakingCore,
    IValidatorSelectionCore,
    IRollupCore,
    ITestRollup
{
    using ProposeLib for ProposeArgs;

    using TimeLib for Timestamp;
    using TimeLib for Slot;
    using TimeLib for Epoch;

    uint256 public immutable L1_BLOCK_AT_GENESIS;

    // To push checkBlob into its own slot so we don't have the trouble of being in the middle of a slot
    uint256 private gap = 0;

    // @note  Always true, exists to override to false for testing only
    bool public checkBlob = true;

    constructor(
        IFeeJuicePortal _fpcJuicePortal,
        IRewardDistributor _rewardDistributor,
        IERC20 _stakingAsset,
        address _governance,
        GenesisState memory _genesisState,
        RollupConfigInput memory _config
    ) Ownable(_governance) {
        TimeLib.initialize(
            block.timestamp,
            _config.aztecSlotDuration,
            _config.aztecEpochDuration
        );

        Timestamp exitDelay = Timestamp.wrap(60 * 60 * 24);
        Slasher slasher = new Slasher(
            _config.slashingQuorum,
            _config.slashingRoundSize
        );
        StakingLib.initialize(
            _stakingAsset,
            _config.minimumStake,
            exitDelay,
            address(slasher)
        );
        ExtRollupLib.initializeValidatorSelection(_config.targetCommitteeSize);

        L1_BLOCK_AT_GENESIS = block.number;

        STFLib.initialize(_genesisState);
        RollupStore storage rollupStore = STFLib.getStorage();

        rollupStore.config.proofSubmissionWindow = _config
            .aztecProofSubmissionWindow;
        rollupStore.config.feeAsset = _fpcJuicePortal.UNDERLYING();
        rollupStore.config.feeAssetPortal = _fpcJuicePortal;
        rollupStore.config.rewardDistributor = _rewardDistributor;
        rollupStore.config.epochProofVerifier = new MockVerifier();
        rollupStore.config.version = 1;
        rollupStore.config.inbox = IInbox(
            address(
                new Inbox(address(this), Constants.L1_TO_L2_MSG_SUBTREE_HEIGHT)
            )
        );
        rollupStore.config.outbox = IOutbox(address(new Outbox(address(this))));

        FeeLib.initialize(_config.manaTarget, _config.provingCostPerMana);
    }

    /* -------------------------------------------------------------------------- */
    /*                          CHEAT CODES START HERE                            */
    /* -------------------------------------------------------------------------- */

    function cheat__InitialiseValidatorSet(
        CheatDepositArgs[] memory _args
    ) external override(ITestRollup) onlyOwner {
        CheatLib.cheat__InitialiseValidatorSet(_args);
        setupEpoch();
    }

    function setEpochVerifier(
        address _verifier
    ) external override(ITestRollup) onlyOwner {
        CheatLib.setEpochVerifier(_verifier);
    }

    function setVkTreeRoot(
        bytes32 _vkTreeRoot
    ) external override(ITestRollup) onlyOwner {
        CheatLib.setVkTreeRoot(_vkTreeRoot);
    }

    function setProtocolContractTreeRoot(
        bytes32 _protocolContractTreeRoot
    ) external override(ITestRollup) onlyOwner {
        CheatLib.setProtocolContractTreeRoot(_protocolContractTreeRoot);
    }

    /* -------------------------------------------------------------------------- */
    /*                          CHEAT CODES END HERE                              */
    /* -------------------------------------------------------------------------- */

    function setProvingCostPerMana(
        EthValue _provingCostPerMana
    ) external override(IRollupCore) onlyOwner {
        FeeLib.getStorage().provingCostPerMana = _provingCostPerMana;
    }

    function claimSequencerRewards(
        address _recipient
    ) external override(IRollupCore) returns (uint256) {
        return RewardLib.claimSequencerRewards(_recipient);
    }

    function claimProverRewards(
        address _recipient,
        Epoch[] memory _epochs
    ) external override(IRollupCore) returns (uint256) {
        return RewardLib.claimProverRewards(_recipient, _epochs);
    }

    function deposit(
        address _attester,
        address _proposer,
        address _withdrawer,
        uint256 _amount
    ) external override(IStakingCore) {
        setupEpoch();
        StakingLib.deposit(_attester, _proposer, _withdrawer, _amount);
    }

    function initiateWithdraw(
        address _attester,
        address _recipient
    ) external override(IStakingCore) returns (bool) {
        setupEpoch();
        return StakingLib.initiateWithdraw(_attester, _recipient);
    }

    function finaliseWithdraw(
        address _attester
    ) external override(IStakingCore) {
        StakingLib.finaliseWithdraw(_attester);
    }

    function slash(
        address _attester,
        uint256 _amount
    ) external override(IStakingCore) {
        StakingLib.slash(_attester, _amount);
    }

    function prune() external override(IRollupCore) {
        require(
            STFLib.canPruneAtTime(Timestamp.wrap(block.timestamp)),
            Errors.Rollup__NothingToPrune()
        );
        STFLib.prune();
    }

    function submitEpochRootProof(
        SubmitEpochRootProofArgs calldata _args
    ) external override(IRollupCore) {
        ExtRollupLib.submitEpochRootProof(_args);
    }

    function propose(
        ProposeArgs calldata _args,
        Signature[] memory _signatures,
        bytes calldata _blobInput
    ) external override(IRollupCore) {
        ExtRollupLib.propose(_args, _signatures, _blobInput, checkBlob);
    }

    function setupEpoch() public override(IValidatorSelectionCore) {
        ExtRollupLib.setupEpoch();
    }

    /**
     * @notice  Updates the l1 gas fee oracle
     * @dev     This function is called by the `propose` function
     */
    function updateL1GasFeeOracle() public override(IRollupCore) {
        FeeLib.updateL1GasFeeOracle();
    }
}
