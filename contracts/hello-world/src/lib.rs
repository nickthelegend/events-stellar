// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Stellar Soroban Contracts ^0.4.1
#![no_std]

use soroban_sdk::{Address, contract, contractimpl, Env, String, Symbol, symbol_short, Vec};
use stellar_access::ownable::{self as ownable, Ownable};
use stellar_macros::{default_impl, only_owner};
use stellar_tokens::non_fungible::{Base, NonFungibleToken};

#[contract]
pub struct MyToken;

// storage symbols
pub const OWNER: Symbol = symbol_short!("OWNER");
pub const NEXT_ID: Symbol = symbol_short!("NEXT_ID");
pub const RSVP: Symbol = symbol_short!("RSVP");
pub const ATTENDED: Symbol = symbol_short!("ATTENDED");
pub const TOKEN_OF: Symbol = symbol_short!("TOKEN_OF");

#[contractimpl]
impl MyToken {
    /// constructor: set metadata and owner
    pub fn __constructor(e: &Env, owner: Address, name: String, symbol: String, uri: String) {
        // set NFT metadata: uri, name, symbol
        Base::set_metadata(e, uri, name, symbol);
        // set owner
        ownable::set_owner(e, &owner);
        // init next id to 1
        e.storage().instance().set(&NEXT_ID, &1u32);
    }

    /// RSVP: attendee must sign
    pub fn rsvp(e: &Env, attendee: Address) {
        // attendee must sign this tx
        attendee.require_auth();

        // set (RSVP, attendee) => true
        e.storage()
            .instance()
            .set(&(RSVP, attendee), &true);
    }

    /// Check whether an address has RSVPed
    pub fn has_rsvped(e: &Env, attendee: Address) -> bool {
        match e.storage().instance().get(&(RSVP, attendee)) {
            Some(v) => v,
            None => false,
        }
    }

    /// Owner-only: mark attendee as attended and mint a unique NFT to them (1 NFT).
    /// Uses internal NEXT_ID counter for token ids (u32).
    #[only_owner]
    pub fn mark_attended(e: &Env, attendee: Address) {
        // ensure attendee hasn't already been marked attended / given an NFT
        if Self::has_attended(e, attendee.clone()) {
            // revert if already marked (prevents double-mint)
            panic!("attendee already marked attended / NFT already minted");
        }

        // (optional) enforce RSVP before attendance; comment out if not desired
        let rsvped = Self::has_rsvped(e, attendee.clone());
        if !rsvped {
            panic!("attendee did not RSVP");
        }

        // get next token id
        let mut next_id: u32 = e.storage().instance().get(&NEXT_ID).unwrap_or(1u32);

        // mint NFT to attendee with token id = next_id
        Base::mint(e, &attendee, next_id);

        // store token id for attendee: (TOKEN_OF, attendee) => token_id
        e.storage()
            .instance()
            .set(&(TOKEN_OF, attendee.clone()), &next_id);

        // mark attended
        e.storage()
            .instance()
            .set(&(ATTENDED, attendee), &true);

        // increment and persist next id
        next_id = next_id.checked_add(1).expect("token id overflow");
        e.storage().instance().set(&NEXT_ID, &next_id);
    }

    /// Check if address has been marked as attended
    pub fn has_attended(e: &Env, attendee: Address) -> bool {
        match e.storage().instance().get(&(ATTENDED, attendee)) {
            Some(v) => v,
            None => false,
        }
    }

    /// If minted, return token id owned by attendee (0 = none). You can change to Option if preferred.
    pub fn token_of(e: &Env, attendee: Address) -> u32 {
        match e.storage().instance().get(&(TOKEN_OF, attendee)) {
            Some(id) => id,
            None => 0u32,
        }
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for MyToken {
    type ContractType = Base;
}

//
// Utils
//

#[default_impl]
#[contractimpl]
impl Ownable for MyToken {}
