const fs = require('fs');
const Web3 = require('web3');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Replace with your actual Ethereum node endpoint
const web3 = new Web3('https://sepolia.mode.network/');

// Replace with your contract address
const contractAddress = '0xDbC50cE0F71621E334ebC73135ed26b184da4984';

// Read the ABI from the JSON file
const contractAbi = JSON.parse(fs.readFileSync('contractAbi.json', 'utf-8'));

// Connect to the contract
const contract = new web3.eth.Contract(contractAbi, contractAddress);

// File path for storing and reading ownerAddresses
const ownerAddressesFilePath = 'ownerAddresses.json';

async function getUniqueOwnerAddresses() {
  const uniqueOwnerAddresses = new Set();

  try {
    // Get all events of the NameRegistered type
    const events = await contract.getPastEvents('NameRegistered', {
      fromBlock: 3072734,
      toBlock: 'latest',
    });

    // Iterate through each event and add the owner address to the set
    events.forEach((event) => {
      const ownerAddress = event.returnValues.owner.toLowerCase(); // Convert to lowercase for uniqueness
      console.log(ownerAddress);
      uniqueOwnerAddresses.add(ownerAddress);
    });
    fs.writeFileSync(ownerAddressesFilePath, JSON.stringify(Array.from(uniqueOwnerAddresses), null, 2));

    return Array.from(uniqueOwnerAddresses); // Convert set to array for Merkle tree
  } catch (error) {
    console.error(error);
  }
}

async function createMerkleTree() {
//   await getUniqueOwnerAddresses();

   // Try to read ownerAddresses from the JSON file
  const ownerAddresses = JSON.parse(fs.readFileSync(ownerAddressesFilePath, 'utf-8'));

  const leafNodes = ownerAddresses.map(addr => keccak256(addr));

  // Create a Merkle tree
  const merkleTree = new MerkleTree(leafNodes, keccak256,  {
    sortLeaves: true,
    sortPairs: true
  });

  // Get the Merkle root
  const merkleRoot = merkleTree.getRoot().toString('hex');
  console.log('Merkle Root:', merkleRoot);

  const hexPrrof = merkleTree.getHexProof(keccak256("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"))

  console.log(hexPrrof);

  console.log(merkleTree.verify(hexPrrof,keccak256("0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"), merkleRoot));
}


web3.eth.net.isListening()
  .then(() => {
    createMerkleTree();
  })
  .catch((error) => {
    console.error(`Error: Unable to connect to the Ethereum node. ${error}`);
  });


  