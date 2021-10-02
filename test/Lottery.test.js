const assert=require('assert');
const ganache=require('ganache-cli');
const Web3=require('web3');
const web3=new Web3(ganache.provider());
const {interface,bytecode} =require( '../compile.js');


let lottery;
let accounts;
beforeEach(async ()=>{
    //get a list of accounts from ganache
    accounts=await web3.eth.getAccounts();

    //deploy an instance of contract
    lottery=await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data:bytecode})
    .send({from:accounts[0],gas:'1000000'});
})

//tests

describe('Lottery contract',()=>{

    it('deploys a contract',()=>{
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async ()=>{
       await lottery.methods.enter().send({
           from:accounts[0],
           value: web3.utils.toWei('0.02','ether')  //converts ether to wei
       });

       const players=await lottery.methods.getPlayers().call({
           from:accounts[0]
       });
       assert.equal(accounts[0],players[0]);
       assert.equal(1,players.length);
    });

    //allows multiple accounts
    it('allows multiple accounts to enter', async ()=>{

       await lottery.methods.enter().send({
           from:accounts[0],
           value: web3.utils.toWei('0.02','ether')  //converts ether to wei
       });
       await lottery.methods.enter().send({
           from:accounts[1],
           value: web3.utils.toWei('0.02','ether')  //converts ether to wei
       });
       await lottery.methods.enter().send({
           from:accounts[2],
           value: web3.utils.toWei('0.02','ether')  //converts ether to wei
       });


       const players=await lottery.methods.getPlayers().call({
           from:accounts[0]
       });
      

       assert.equal(accounts[0],players[0]);
       assert.equal(accounts[1],players[1]);
       assert.equal(accounts[2],players[2]);
       assert.equal(3,players.length);
    });

    //ensuring that test throws error if ether is less than requirement
    it('requires a minimum amount of ether to enter', async()=>{
        try{
            await lottery.methods.enter().send({
                from:accounts[0],
                value:'200'
            });
            assert(false); //this ensures if above await works means you gave less ether still methods works ok 
                           //which it shouldn't be doing
        }
        catch(err){
            assert(err); //this ensures method doesn't work if you give
                          //less ether than requirement
        }
    });

    //if someone other than manager calls pickWinner(), error should be thrown

    it('only manager can call pickWinner',async ()=>{
        try{
            await lottery.methods.pickWinner().send({
                from:accounts[1]
            });
            assert(false);//if we get to this line auto fail the test
        }
        catch(err)
        {
            assert(err);
        }
    });

    //sends money to winner and resets contract
    it('sends money to the winner and resets the players array',async ()=>{
        await lottery.methods.enter().send({
            from:accounts[0],
            value:web3.utils.toWei('2','ether')
        });

        const initialBalance=await web3.eth.getBalance(accounts[0]); //checking balance before pickWinner returns wei
        
        //check if account balance has a difference 2 before and after calling pickWinner
        await lottery.methods.pickWinner().send({
            from:accounts[0]
        });

        const finalBalance=await web3.eth.getBalance(accounts[0]);//returns wei
        const difference=finalBalance-initialBalance;
        const players=await lottery.methods.getPlayers().call({
            from:accounts[0]
        });
        
        assert(difference > web3.utils.toWei('1.8','ether'));  //some ether was spent on gas so not exactly 2
        assert.equal(0,players.length);
    });
});