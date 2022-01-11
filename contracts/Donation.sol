pragma solidity ^0.8.10;

contract Donation {
    // owner of Donation smart contract
    address private owner;
    mapping(address => uint) public donations;
    uint totalDonations;

    constructor() {
        owner = msg.sender;
    }

    function makeDonation() public payable returns (bool) {
        require(msg.value > 0, "Cannot donate 0");
        donations[msg.sender] += msg.value;

        return true; 
    }

    function getTotalDonations() view public returns(uint) {
        return totalDonations;
    }
}