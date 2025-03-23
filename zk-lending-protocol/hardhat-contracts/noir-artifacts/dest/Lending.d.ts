import { AztecAddress, type AztecAddressLike, type ContractArtifact, ContractBase, ContractFunctionInteraction, type ContractMethod, type ContractStorageLayout, type ContractNotes, DeployMethod, type EthAddressLike, type FieldLike, PublicKeys, type Wallet } from "@aztec/aztec.js";
export declare const LendingContractArtifact: ContractArtifact;
/**
 * Type-safe interface for contract Lending;
 */
export declare class LendingContract extends ContractBase {
    private constructor();
    /**
     * Creates a contract instance.
     * @param address - The deployed contract's address.
     * @param wallet - The wallet to use when interacting with the contract.
     * @returns A promise that resolves to a new Contract instance.
     */
    static at(address: AztecAddress, wallet: Wallet): Promise<LendingContract>;
    /**
     * Creates a tx to deploy a new instance of this contract.
     */
    static deploy(wallet: Wallet, portal_address: EthAddressLike): DeployMethod<LendingContract>;
    /**
     * Creates a tx to deploy a new instance of this contract using the specified public keys hash to derive the address.
     */
    static deployWithPublicKeys(publicKeys: PublicKeys, wallet: Wallet, portal_address: EthAddressLike): DeployMethod<LendingContract>;
    /**
     * Creates a tx to deploy a new instance of this contract using the specified constructor method.
     */
    static deployWithOpts<M extends keyof LendingContract["methods"]>(opts: {
        publicKeys?: PublicKeys;
        method?: M;
        wallet: Wallet;
    }, ...args: Parameters<LendingContract["methods"][M]>): DeployMethod<LendingContract>;
    /**
     * Returns this contract's artifact.
     */
    static get artifact(): ContractArtifact;
    /**
     * Returns this contract's artifact with public bytecode.
     */
    static get artifactForPublic(): ContractArtifact;
    static get storage(): ContractStorageLayout<"portal_address">;
    static get notes(): ContractNotes<"UintNote">;
    /** Type-safe wrappers for the public methods exposed by the contract. */
    methods: {
        /** constructor(portal_address: struct) */
        constructor: ((portal_address: EthAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** lend_private(input_asset: struct, input_asset_bridge: struct, input_amount: integer, nonce_for_transfer_to_public_approval: field, secret_hash_for_L1_to_l2_message: field, caller_on_L1: struct) */
        lend_private: ((input_asset: AztecAddressLike, input_asset_bridge: AztecAddressLike, input_amount: bigint | number, nonce_for_transfer_to_public_approval: FieldLike, secret_hash_for_L1_to_l2_message: FieldLike, caller_on_L1: EthAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** lend_public(sender: struct, input_asset_bridge: struct, input_amount: integer, nonce_for_transfer_approval: field, recipient: struct, secret_hash_for_L1_to_l2_message: field, caller_on_L1: struct, nonce_for_lend_approval: field) */
        lend_public: ((sender: AztecAddressLike, input_asset_bridge: AztecAddressLike, input_amount: bigint | number, nonce_for_transfer_approval: FieldLike, recipient: AztecAddressLike, secret_hash_for_L1_to_l2_message: FieldLike, caller_on_L1: EthAddressLike, nonce_for_lend_approval: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
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
//# sourceMappingURL=Lending.d.ts.map