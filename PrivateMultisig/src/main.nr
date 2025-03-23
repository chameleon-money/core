use dep::aztec::macros::aztec;

#[aztec]
pub contract Multisig {
    use dep::aztec::macros::{functions::{initializer, internal, private, public}, storage::storage};

    use dep::aztec::prelude::{AztecAddress, FunctionSelector, PublicImmutable, PublicMutable, Map};
    use dep::aztec::protocol_types::traits::Serialize;

    #[storage]
    struct Storage<Context> {
        threshold: PublicMutable<Field, Context>,
        signer1: PublicImmutable<AztecAddress, Context>,
        signer2: PublicImmutable<AztecAddress, Context>,
        is_executed: Map<Field, PublicMutable<bool, Context>, Context>,
        proposal_counter: PublicMutable<Field, Context>,
        total_proposals: PublicMutable<Field, Context>,
        proposals_to: Map<Field, PublicMutable<AztecAddress, Context>, Context>,
        proposals_amount: Map<Field, PublicMutable<Field, Context>, Context>,
    }

    #[initializer]
    #[public]
    fn constructor(owners: [AztecAddress; 2]) {
        storage.threshold.write(1);
        storage.proposal_counter.write(0);
        storage.total_proposals.write(0);
        storage.signer1.initialize(owners[0]);
        storage.signer2.initialize(owners[1]);
    }

    #[private]
    fn execute(to: AztecAddress, amount: Field) {
        // check if the caller is an owner
        let caller = context.msg_sender();
        let signer1 = storage.signer1.read();
        let signer2 = storage.signer2.read();
        
        assert((caller == signer1) + (caller == signer2), "Not an owner");

        Multisig::at(context.this_address())._execute(to, amount).enqueue(&mut context);
    }

    #[public]
    #[internal]
    fn _execute(to: AztecAddress, amount: Field) {
        // increment the proposal counter
        let proposal_counter = storage.proposal_counter.read();
        storage.proposal_counter.write(proposal_counter + 1);
        
        // create the proposal
        storage.proposals_to.at(proposal_counter).write(to);
        storage.proposals_amount.at(proposal_counter).write(amount);
        storage.is_executed.at(proposal_counter).write(false);
    }
}
