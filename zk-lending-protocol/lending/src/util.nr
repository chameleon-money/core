use dep::aztec::prelude::{AztecAddress, EthAddress};
use dep::aztec::protocol_types::{hash::sha256_to_field, traits::ToField};

// This method computes the L2 to L1 message content hash for the public
// refer `l1-contracts/test/portals/UniswapPortal.sol` on how L2 to L1 message is expected
pub fn compute_lend_public_content_hash(
    input_asset_bridge_portal_address: EthAddress,
    input_amount: u128,
    aztec_recipient: AztecAddress,
    secret_hash_for_L1_to_l2_message: Field,
    caller_on_L1: EthAddress,
) -> Field {
    let mut hash_bytes = [0; 164]; // 5 fields of 32 bytes each + 4 bytes fn selector
    let input_token_portal_bytes: [u8; 32] =
        input_asset_bridge_portal_address.to_field().to_be_bytes();
    let in_amount_bytes: [u8; 32] = input_amount.to_field().to_be_bytes();
    let aztec_recipient_bytes: [u8; 32] = aztec_recipient.to_field().to_be_bytes();
    let secret_hash_for_L1_to_l2_message_bytes: [u8; 32] =
        secret_hash_for_L1_to_l2_message.to_be_bytes();
    let caller_on_L1_bytes: [u8; 32] = caller_on_L1.to_field().to_be_bytes();

    // The purpose of including the following selector is to make the message unique to that specific call. Note that
    // it has nothing to do with calling the function.
    let selector = comptime {
        keccak256::keccak256(
            "lend_public(address,uint256,bytes32,bytes32,address)".as_bytes(),
            52,
        )
    };

    hash_bytes[0] = selector[0];
    hash_bytes[1] = selector[1];
    hash_bytes[2] = selector[2];
    hash_bytes[3] = selector[3];

    for i in 0..32 {
        hash_bytes[i + 4] = input_token_portal_bytes[i];
        hash_bytes[i + 36] = in_amount_bytes[i];
        hash_bytes[i + 68] = aztec_recipient_bytes[i];
        hash_bytes[i + 100] =secret_hash_for_L1_to_l2_message_bytes[i];
        hash_bytes[i + 132] =caller_on_L1_bytes[i];
    }

    let content_hash = sha256_to_field(hash_bytes);
    content_hash
}

// This method computes the L2 to L1 message content hash for the private
// refer `l1-contracts/test/portals/UniswapPortal.sol` on how L2 to L1 message is expected
pub fn compute_lend_private_content_hash(
    input_asset_bridge_portal_address: EthAddress,
    input_amount: u128,
    secret_hash_for_L1_to_l2_message: Field,
    caller_on_L1: EthAddress,
) -> Field {
    let mut hash_bytes = [0; 132]; // 4 fields of 32 bytes each + 4 bytes fn selector
    let input_token_portal_bytes: [u8; 32] =
        input_asset_bridge_portal_address.to_field().to_be_bytes();
    let in_amount_bytes: [u8; 32] = input_amount.to_field().to_be_bytes();
    let secret_hash_for_L1_to_l2_message_bytes: [u8; 32] =
        secret_hash_for_L1_to_l2_message.to_be_bytes();
    let caller_on_L1_bytes: [u8; 32] = caller_on_L1.to_field().to_be_bytes();

    // The purpose of including the following selector is to make the message unique to that specific call. Note that
    // it has nothing to do with calling the function.
    let selector = comptime {
        keccak256::keccak256(
            "lend_private(address,uint256,bytes32,address)".as_bytes(),
            45,
        )
    };

    hash_bytes[0] = selector[0];
    hash_bytes[1] = selector[1];
    hash_bytes[2] = selector[2];
    hash_bytes[3] = selector[3];

    for i in 0..32 {
        hash_bytes[i + 4] = input_token_portal_bytes[i];
        hash_bytes[i + 36] = in_amount_bytes[i];
        hash_bytes[i + 68] = secret_hash_for_L1_to_l2_message_bytes[i];
        hash_bytes[i + 100] = caller_on_L1_bytes[i];
    }
    let content_hash = sha256_to_field(hash_bytes);
    content_hash
}

