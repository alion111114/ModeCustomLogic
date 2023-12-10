const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const Web3 = require('web3');

// Assuming you have a web3 instance
const web3 = new Web3();

// Read CSV data from file
const csvData = fs.readFileSync('ens_data.csv', 'utf-8');

// Parse CSV data into an array of objects
const csvRows = csvData.trim().split('\n').slice(1); // Skip the header
const csvObjects = csvRows.map(row => {
    const [id, labelName, owner_id] = row.split(',');
    return { id, labelName, owner_id };
});

// Hash function using soliditySha3
function hash(labelName, senderAddress) {
    // Convert to hexadecimal if needed
    const hexLabelName = web3.utils.utf8ToHex(labelName);
    const hexSenderAddress = web3.utils.toHex(senderAddress);

    // Ensure they are passed as strings
    const hashValue = web3.utils.soliditySha3(hexLabelName, hexSenderAddress);
    return hashValue;
}

// Create leaves for the Merkle Tree using the provided hash function
const leaves = csvObjects.map(obj => hash(obj.labelName, obj.owner_id));

// Create a Merkle Tree
const tree = new MerkleTree(leaves, keccak256, {
    sortLeaves: true,
    sortPairs: true
});

// Get the Merkle root
const root = tree.getRoot().toString('hex');

console.log(root);

// Verify if ENS name and owner_id match by checking their hash in the Merkle Tree
const verify = (labelName, owner_id) => {
    const hashToVerify = hash(labelName, owner_id);
    console.log(hashToVerify);
    const proof = tree.getHexProof(hashToVerify);
    console.log(proof);
    return tree.verify(proof, hashToVerify, root);
};

// Example verification
const exampleLabelName = 'remix1';
const exampleOwner_id = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';

if (verify(exampleLabelName, exampleOwner_id)) {
    console.log(`Verification successful for ${exampleLabelName}-${exampleOwner_id}`);
} else {
    console.log(`Verification failed for ${exampleLabelName}-${exampleOwner_id}`);
}

