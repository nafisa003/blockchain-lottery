const HDWalletProvider=require('truffle-hdwallet-provider');
const Web3=require('web3');
const {interface,bytecode}=require('./compile');
const { meta_pass, infura_api } = require('./private');

const provider=new HDWalletProvider(
    `${meta_pass}`,
    `${infura_api}`
);

const web3=new Web3(provider);

const deploy=async ()=>{
    //GET LIST OF ACCOUNTS 
    const accounts=await web3.eth.getAccounts();

    console.group("Attempting to deploy from account",accounts[0]);
    //DEPLOY TO RINKEBY
   const result= await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data:bytecode})
    .send({from:accounts[0],gas:'1000000'});

    console.log(interface);
    console.log("Contract deployed to",result.options.address); //contract address on blockchain
    
};
deploy();