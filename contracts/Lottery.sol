pragma solidity ^0.4.17;

contract Lottery{
    address public manager;
    address[] public players;
    
    function Lottery() public{
        
        //Constructor takes address of the person who created contract/manager
        manager=msg.sender;
        
    }
    
    //function to set people entering the Lottery(must pay to enter)
    function enter() public payable{
        require(msg.value>0.01 ether);
        players.push(msg.sender);
    }
    
    //generating a random wwinner
    function random() private view returns(uint){
        return uint(keccak256(block.difficulty,now,players));
    }
    
    function pickWinner() public restricted{
        // require(msg.sender==manager)      //only manager can call this function
        uint index=random() % players.length;
        players[index].transfer(this.balance);
        players=new address[](0);
        
    }
    
    //using modifier to stick to DRY
    modifier restricted(){
        require(msg.sender==manager);
        _;
    }
    
    //return players array
    function getPlayers() public view returns(address[]){
        return players;
    }
}