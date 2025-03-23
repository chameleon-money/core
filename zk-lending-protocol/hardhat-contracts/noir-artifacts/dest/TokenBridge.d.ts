import { AztecAddress, type AztecAddressLike, type ContractArtifact, ContractBase, ContractFunctionInteraction, type ContractMethod, type ContractStorageLayout, type ContractNotes, DeployMethod, type EthAddressLike, type FieldLike, PublicKeys, type Wallet } from "@aztec/aztec.js";
export declare const TokenBridgeContractArtifact: ContractArtifact;
/**
 * Type-safe interface for contract TokenBridge;
 */
export declare class TokenBridgeContract extends ContractBase {
    private constructor();
    /**
     * Creates a contract instance.
     * @param address - The deployed contract's address.
     * @param wallet - The wallet to use when interacting with the contract.
     * @returns A promise that resolves to a new Contract instance.
     */
    static at(address: AztecAddress, wallet: Wallet): Promise<TokenBridgeContract>;
    /**
     * Creates a tx to deploy a new instance of this contract.
     */
    static deploy(wallet: Wallet, token: AztecAddressLike, portal: EthAddressLike): DeployMethod<TokenBridgeContract>;
    /**
     * Creates a tx to deploy a new instance of this contract using the specified public keys hash to derive the address.
     */
    static deployWithPublicKeys(publicKeys: PublicKeys, wallet: Wallet, token: AztecAddressLike, portal: EthAddressLike): DeployMethod<TokenBridgeContract>;
    /**
     * Creates a tx to deploy a new instance of this contract using the specified constructor method.
     */
    static deployWithOpts<M extends keyof TokenBridgeContract["methods"]>(opts: {
        publicKeys?: PublicKeys;
        method?: M;
        wallet: Wallet;
    }, ...args: Parameters<TokenBridgeContract["methods"][M]>): DeployMethod<TokenBridgeContract>;
    /**
     * Returns this contract's artifact.
     */
    static get artifact(): ContractArtifact;
    /**
     * Returns this contract's artifact with public bytecode.
     */
    static get artifactForPublic(): ContractArtifact;
    static get storage(): ContractStorageLayout<"config">;
    static get notes(): ContractNotes<"UintNote">;
    /** Type-safe wrappers for the public methods exposed by the contract. */
    methods: {
        /** claim_private(recipient: struct, amount: integer, secret_for_L1_to_L2_message_consumption: field, message_leaf_index: field) */
        claim_private: ((recipient: AztecAddressLike, amount: bigint | number, secret_for_L1_to_L2_message_consumption: FieldLike, message_leaf_index: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** claim_public(to: struct, amount: integer, secret: field, message_leaf_index: field) */
        claim_public: ((to: AztecAddressLike, amount: bigint | number, secret: FieldLike, message_leaf_index: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** constructor(token: struct, portal: struct) */
        constructor: ((token: AztecAddressLike, portal: EthAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** exit_to_l1_private(token: struct, recipient: struct, amount: integer, caller_on_l1: struct, nonce: field) */
        exit_to_l1_private: ((token: AztecAddressLike, recipient: EthAddressLike, amount: bigint | number, caller_on_l1: EthAddressLike, nonce: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** exit_to_l1_public(recipient: struct, amount: integer, caller_on_l1: struct, nonce: field) */
        exit_to_l1_public: ((recipient: EthAddressLike, amount: bigint | number, caller_on_l1: EthAddressLike, nonce: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** get_config() */
        get_config: (() => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** get_config_public() */
        get_config_public: (() => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** process_log(log_ciphertext: struct, tx_hash: field, unique_note_hashes_in_tx: struct, first_nullifier_in_tx: field, recipient: struct) */
        process_log: ((log_ciphertext: {
            storage: FieldLike[];
            len: bigint | number;
        }, tx_hash: FieldLike, unique_note_hashes_in_tx: {
            storage: FieldLike[];
            len: bigint | number;
        }, first_nullifier_in_tx: FieldLike, recipient: AztecAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** public_dispatch(selector: field) */
        public_dispatch: ((selector: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** sync_notes() */
        sync_notes: (() => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
    };
}
//# sourceMappingURL=TokenBridge.d.ts.map