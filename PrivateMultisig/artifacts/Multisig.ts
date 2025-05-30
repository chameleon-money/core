
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
} from '@aztec/aztec.js';
import MultisigContractArtifactJson from '../target/PrivateMultisig-Multisig.json' assert { type: 'json' };
export const MultisigContractArtifact = loadContractArtifact(MultisigContractArtifactJson as NoirCompiledContract);



/**
 * Type-safe interface for contract Multisig;
 */
export class MultisigContract extends ContractBase {
  
  private constructor(
    instance: ContractInstanceWithAddress,
    wallet: Wallet,
  ) {
    super(instance, MultisigContractArtifact, wallet);
  }
  

  
  /**
   * Creates a contract instance.
   * @param address - The deployed contract's address.
   * @param wallet - The wallet to use when interacting with the contract.
   * @returns A promise that resolves to a new Contract instance.
   */
  public static async at(
    address: AztecAddress,
    wallet: Wallet,
  ) {
    return Contract.at(address, MultisigContract.artifact, wallet) as Promise<MultisigContract>;
  }

  
  /**
   * Creates a tx to deploy a new instance of this contract.
   */
  public static deploy(wallet: Wallet, owners: AztecAddressLike[]) {
    return new DeployMethod<MultisigContract>(PublicKeys.default(), wallet, MultisigContractArtifact, MultisigContract.at, Array.from(arguments).slice(1));
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified public keys hash to derive the address.
   */
  public static deployWithPublicKeys(publicKeys: PublicKeys, wallet: Wallet, owners: AztecAddressLike[]) {
    return new DeployMethod<MultisigContract>(publicKeys, wallet, MultisigContractArtifact, MultisigContract.at, Array.from(arguments).slice(2));
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified constructor method.
   */
  public static deployWithOpts<M extends keyof MultisigContract['methods']>(
    opts: { publicKeys?: PublicKeys; method?: M; wallet: Wallet },
    ...args: Parameters<MultisigContract['methods'][M]>
  ) {
    return new DeployMethod<MultisigContract>(
      opts.publicKeys ?? PublicKeys.default(),
      opts.wallet,
      MultisigContractArtifact,
      MultisigContract.at,
      Array.from(arguments).slice(1),
      opts.method ?? 'constructor',
    );
  }
  

  
  /**
   * Returns this contract's artifact.
   */
  public static get artifact(): ContractArtifact {
    return MultisigContractArtifact;
  }

  /**
   * Returns this contract's artifact with public bytecode.
   */
  public static get artifactForPublic(): ContractArtifact {
    return loadContractArtifactForPublic(MultisigContractArtifactJson as NoirCompiledContract);
  }
  

  public static get storage(): ContractStorageLayout<'threshold' | 'signer1' | 'signer2' | 'is_executed' | 'proposal_counter' | 'total_proposals' | 'proposals_to' | 'proposals_amount'> {
      return {
        threshold: {
      slot: new Fr(1n),
    },
signer1: {
      slot: new Fr(2n),
    },
signer2: {
      slot: new Fr(4n),
    },
is_executed: {
      slot: new Fr(6n),
    },
proposal_counter: {
      slot: new Fr(7n),
    },
total_proposals: {
      slot: new Fr(8n),
    },
proposals_to: {
      slot: new Fr(9n),
    },
proposals_amount: {
      slot: new Fr(10n),
    }
      } as ContractStorageLayout<'threshold' | 'signer1' | 'signer2' | 'is_executed' | 'proposal_counter' | 'total_proposals' | 'proposals_to' | 'proposals_amount'>;
    }
    

  

  /** Type-safe wrappers for the public methods exposed by the contract. */
  public declare methods: {
    
    /** constructor(owners: array) */
    constructor: ((owners: AztecAddressLike[]) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** execute(to: struct, amount: field) */
    execute: ((to: AztecAddressLike, amount: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** process_log(_log_ciphertext: struct, _tx_hash: field, _unique_note_hashes_in_tx: struct, _first_nullifier_in_tx: field, _recipient: struct) */
    process_log: ((_log_ciphertext: { storage: FieldLike[], len: (bigint | number) }, _tx_hash: FieldLike, _unique_note_hashes_in_tx: { storage: FieldLike[], len: (bigint | number) }, _first_nullifier_in_tx: FieldLike, _recipient: AztecAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** public_dispatch(selector: field) */
    public_dispatch: ((selector: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;

    /** sync_notes() */
    sync_notes: (() => ContractFunctionInteraction) & Pick<ContractMethod, 'selector'>;
  };

  
}
