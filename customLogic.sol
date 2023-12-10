// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract customLogic {

    bytes32 public testnetHolderMarkleRoot = 0x7463e95bd7146d235ac1324e00eed3aa49982eff6514fa80b28d858d16cfb4a1;
    bytes32 public ENSHolderMerkelRoot = 0xae56bf4221a23a620758386e549f70919188a19f19dfa9d9b4f70afc307c28a5;
    bytes32 public leaf;

    mapping(address => bool) public testnetClaimed;
    mapping(address => bool) public ensClaimed;
    uint256 public deploymentTime;

    modifier onlyDuringFirst7Days() {
        require(block.timestamp < deploymentTime + 7 days, "Claim period has ended");
        _;
    }

    modifier onlyTestnetHolder(bytes32[] calldata _merkleProof) {
        require(MerkleProof.verify(_merkleProof, testnetHolderMarkleRoot, leaf), "Not a testnet holder");
        _;
    }

    modifier onlyENSHolder(bytes32[] calldata _merkleProof, string calldata ensName) {
        require(MerkleProof.verify(_merkleProof, ENSHolderMerkelRoot, leaf), "Not an ENS holder");
        _;
    }

    constructor() {
        deploymentTime = block.timestamp;
    }


    function claimFreeHandle(bytes32[] calldata _merkleProof) external onlyDuringFirst7Days onlyTestnetHolder(_merkleProof) {
        require(!testnetClaimed[msg.sender], "Handle already claimed");
        testnetClaimed[msg.sender] = true;
        // We can add bulk registration here
    }

    function claimENSHandle(bytes32[] calldata _merkleProof,string calldata ensName) external onlyDuringFirst7Days onlyENSHolder(_merkleProof,ensName) {
        require(!ensClaimed[msg.sender], "Handle already claimed");
        ensClaimed[msg.sender] = true;
        // We can add bulk registration here
    }
}
