/* Autogenerated file, do not edit! */
/* eslint-disable */
import { Contract, ContractBase, DeployMethod, Fr, loadContractArtifact, loadContractArtifactForPublic, NoteSelector, PublicKeys, } from "@aztec/aztec.js";
import TokenBridgeContractArtifactJson from "../../../TokenBridge/target/TokenBridge-TokenBridge.json" assert { type: "json" };
export const TokenBridgeContractArtifact = loadContractArtifact(TokenBridgeContractArtifactJson);
/**
 * Type-safe interface for contract TokenBridge;
 */
export class TokenBridgeContract extends ContractBase {
    constructor(instance, wallet) {
        super(instance, TokenBridgeContractArtifact, wallet);
    }
    /**
     * Creates a contract instance.
     * @param address - The deployed contract's address.
     * @param wallet - The wallet to use when interacting with the contract.
     * @returns A promise that resolves to a new Contract instance.
     */
    static async at(address, wallet) {
        return Contract.at(address, TokenBridgeContract.artifact, wallet);
    }
    /**
     * Creates a tx to deploy a new instance of this contract.
     */
    static deploy(wallet, token, portal) {
        return new DeployMethod(PublicKeys.default(), wallet, TokenBridgeContractArtifact, TokenBridgeContract.at, Array.from(arguments).slice(1));
    }
    /**
     * Creates a tx to deploy a new instance of this contract using the specified public keys hash to derive the address.
     */
    static deployWithPublicKeys(publicKeys, wallet, token, portal) {
        return new DeployMethod(publicKeys, wallet, TokenBridgeContractArtifact, TokenBridgeContract.at, Array.from(arguments).slice(2));
    }
    /**
     * Creates a tx to deploy a new instance of this contract using the specified constructor method.
     */
    static deployWithOpts(opts, ...args) {
        return new DeployMethod(opts.publicKeys ?? PublicKeys.default(), opts.wallet, TokenBridgeContractArtifact, TokenBridgeContract.at, Array.from(arguments).slice(1), opts.method ?? "constructor");
    }
    /**
     * Returns this contract's artifact.
     */
    static get artifact() {
        return TokenBridgeContractArtifact;
    }
    /**
     * Returns this contract's artifact with public bytecode.
     */
    static get artifactForPublic() {
        return loadContractArtifactForPublic(TokenBridgeContractArtifactJson);
    }
    static get storage() {
        return {
            config: {
                slot: new Fr(1n),
            },
        };
    }
    static get notes() {
        return {
            UintNote: {
                id: new NoteSelector(0),
            },
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9rZW5CcmlkZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Ub2tlbkJyaWRnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxzQ0FBc0M7QUFFdEMsb0JBQW9CO0FBQ3BCLE9BQU8sRUFLTCxRQUFRLEVBRVIsWUFBWSxFQU9aLFlBQVksRUFLWixFQUFFLEVBR0Ysb0JBQW9CLEVBQ3BCLDZCQUE2QixFQUU3QixZQUFZLEVBR1osVUFBVSxHQUlYLE1BQU0saUJBQWlCLENBQUM7QUFDekIsT0FBTywrQkFBK0IsTUFBTSwwREFBMEQsQ0FBQyxTQUFTLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUMvSCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxvQkFBb0IsQ0FDN0QsK0JBQXVELENBQ3hELENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxZQUFZO0lBQ25ELFlBQW9CLFFBQXFDLEVBQUUsTUFBYztRQUN2RSxLQUFLLENBQUMsUUFBUSxFQUFFLDJCQUEyQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQXFCLEVBQUUsTUFBYztRQUMxRCxPQUFPLFFBQVEsQ0FBQyxFQUFFLENBQ2hCLE9BQU8sRUFDUCxtQkFBbUIsQ0FBQyxRQUFRLEVBQzVCLE1BQU0sQ0FDeUIsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsTUFBTSxDQUNsQixNQUFjLEVBQ2QsS0FBdUIsRUFDdkIsTUFBc0I7UUFFdEIsT0FBTyxJQUFJLFlBQVksQ0FDckIsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUNwQixNQUFNLEVBQ04sMkJBQTJCLEVBQzNCLG1CQUFtQixDQUFDLEVBQUUsRUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQy9CLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQUMsb0JBQW9CLENBQ2hDLFVBQXNCLEVBQ3RCLE1BQWMsRUFDZCxLQUF1QixFQUN2QixNQUFzQjtRQUV0QixPQUFPLElBQUksWUFBWSxDQUNyQixVQUFVLEVBQ1YsTUFBTSxFQUNOLDJCQUEyQixFQUMzQixtQkFBbUIsQ0FBQyxFQUFFLEVBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUMvQixDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FDMUIsSUFBNkQsRUFDN0QsR0FBRyxJQUFtRDtRQUV0RCxPQUFPLElBQUksWUFBWSxDQUNyQixJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFDdkMsSUFBSSxDQUFDLE1BQU0sRUFDWCwyQkFBMkIsRUFDM0IsbUJBQW1CLENBQUMsRUFBRSxFQUN0QixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDOUIsSUFBSSxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQzdCLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLEtBQUssUUFBUTtRQUN4QixPQUFPLDJCQUEyQixDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sS0FBSyxpQkFBaUI7UUFDakMsT0FBTyw2QkFBNkIsQ0FDbEMsK0JBQXVELENBQ3hELENBQUM7SUFDSixDQUFDO0lBRU0sTUFBTSxLQUFLLE9BQU87UUFDdkIsT0FBTztZQUNMLE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ2pCO1NBQ2lDLENBQUM7SUFDdkMsQ0FBQztJQUVNLE1BQU0sS0FBSyxLQUFLO1FBQ3JCLE9BQU87WUFDTCxRQUFRLEVBQUU7Z0JBQ1IsRUFBRSxFQUFFLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQzthQUN4QjtTQUMyQixDQUFDO0lBQ2pDLENBQUM7Q0EwRUYifQ==