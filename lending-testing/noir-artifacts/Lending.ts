/* Autogenerated file, do not edit! */

/* eslint-disable */
import {
  type AbiType,
  AztecAddress,
  type AztecAddressLike,
  CompleteAddress,
  Contract,
  type ContractArtifact,
  ContractBase,
  ContractFunctionInteraction,
  type ContractInstanceWithAddress,
  type ContractMethod,
  type ContractStorageLayout,
  type ContractNotes,
  decodeFromAbi,
  DeployMethod,
  EthAddress,
  type EthAddressLike,
  EventSelector,
  type FieldLike,
  Fr,
  type FunctionSelectorLike,
  L1EventPayload,
  loadContractArtifact,
  loadContractArtifactForPublic,
  type NoirCompiledContract,
  NoteSelector,
  Point,
  type PublicKey,
  PublicKeys,
  type Wallet,
  type U128Like,
  type WrappedFieldLike,
} from "@aztec/aztec.js";
import LendingContractArtifactJson from "../../zk-lending-protocol/lending/target/lending-Lending.json" assert { type: "json" };
export const LendingContractArtifact = loadContractArtifact(
  LendingContractArtifactJson as NoirCompiledContract
);

/**
 * Type-safe interface for contract Lending;
 */
export class LendingContract extends ContractBase {
  private constructor(instance: ContractInstanceWithAddress, wallet: Wallet) {
    super(instance, LendingContractArtifact, wallet);
  }

  /**
   * Creates a contract instance.
   * @param address - The deployed contract's address.
   * @param wallet - The wallet to use when interacting with the contract.
   * @returns A promise that resolves to a new Contract instance.
   */
  public static async at(address: AztecAddress, wallet: Wallet) {
    return Contract.at(
      address,
      LendingContract.artifact,
      wallet
    ) as Promise<LendingContract>;
  }

  /**
   * Creates a tx to deploy a new instance of this contract.
   */
  public static deploy(wallet: Wallet, portal_address: EthAddressLike) {
    return new DeployMethod<LendingContract>(
      PublicKeys.default(),
      wallet,
      LendingContractArtifact,
      LendingContract.at,
      Array.from(arguments).slice(1)
    );
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified public keys hash to derive the address.
   */
  public static deployWithPublicKeys(
    publicKeys: PublicKeys,
    wallet: Wallet,
    portal_address: EthAddressLike
  ) {
    return new DeployMethod<LendingContract>(
      publicKeys,
      wallet,
      LendingContractArtifact,
      LendingContract.at,
      Array.from(arguments).slice(2)
    );
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified constructor method.
   */
  public static deployWithOpts<M extends keyof LendingContract["methods"]>(
    opts: { publicKeys?: PublicKeys; method?: M; wallet: Wallet },
    ...args: Parameters<LendingContract["methods"][M]>
  ) {
    return new DeployMethod<LendingContract>(
      opts.publicKeys ?? PublicKeys.default(),
      opts.wallet,
      LendingContractArtifact,
      LendingContract.at,
      Array.from(arguments).slice(1),
      opts.method ?? "constructor"
    );
  }

  /**
   * Returns this contract's artifact.
   */
  public static get artifact(): ContractArtifact {
    return LendingContractArtifact;
  }

  /**
   * Returns this contract's artifact with public bytecode.
   */
  public static get artifactForPublic(): ContractArtifact {
    return loadContractArtifactForPublic(
      LendingContractArtifactJson as NoirCompiledContract
    );
  }

  public static get storage(): ContractStorageLayout<"portal_address"> {
    return {
      portal_address: {
        slot: new Fr(1n),
      },
    } as ContractStorageLayout<"portal_address">;
  }

  public static get notes(): ContractNotes<"UintNote"> {
    return {
      UintNote: {
        id: new NoteSelector(0),
      },
    } as ContractNotes<"UintNote">;
  }

  /** Type-safe wrappers for the public methods exposed by the contract. */
  public declare methods: {
    /** constructor(portal_address: struct) */
    constructor: ((
      portal_address: EthAddressLike
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, "selector">;

    /** lend_private(input_asset: struct, input_asset_bridge: struct, input_amount: integer, nonce_for_transfer_to_public_approval: field, secret_hash_for_L1_to_l2_message: field, caller_on_L1: struct) */
    lend_private: ((
      input_asset: AztecAddressLike,
      input_asset_bridge: AztecAddressLike,
      input_amount: bigint | number,
      nonce_for_transfer_to_public_approval: FieldLike,
      secret_hash_for_L1_to_l2_message: FieldLike,
      caller_on_L1: EthAddressLike
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, "selector">;

    /** lend_public(sender: struct, input_asset_bridge: struct, input_amount: integer, nonce_for_transfer_approval: field, recipient: struct, secret_hash_for_L1_to_l2_message: field, caller_on_L1: struct, nonce_for_lend_approval: field) */
    lend_public: ((
      sender: AztecAddressLike,
      input_asset_bridge: AztecAddressLike,
      input_amount: bigint | number,
      nonce_for_transfer_approval: FieldLike,
      recipient: AztecAddressLike,
      secret_hash_for_L1_to_l2_message: FieldLike,
      caller_on_L1: EthAddressLike,
      nonce_for_lend_approval: FieldLike
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, "selector">;

    /** process_log(log_ciphertext: struct, tx_hash: field, unique_note_hashes_in_tx: struct, first_nullifier_in_tx: field, recipient: struct) */
    process_log: ((
      log_ciphertext: { storage: FieldLike[]; len: bigint | number },
      tx_hash: FieldLike,
      unique_note_hashes_in_tx: { storage: FieldLike[]; len: bigint | number },
      first_nullifier_in_tx: FieldLike,
      recipient: AztecAddressLike
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, "selector">;

    /** public_dispatch(selector: field) */
    public_dispatch: ((selector: FieldLike) => ContractFunctionInteraction) &
      Pick<ContractMethod, "selector">;

    /** sync_notes() */
    sync_notes: (() => ContractFunctionInteraction) &
      Pick<ContractMethod, "selector">;
  };
}
