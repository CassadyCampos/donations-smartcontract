pragma solidity ^0.8.10;

contract Donation {
    // owner of Donation smart contract
    address private owner;
    mapping(address => uint) public donations;
    mapping(uint => address) public donators;
    uint totalDonations;
    uint totalDonators;

    // events
    event LogDonation(address indexed _donator, uint256 _donationAmount);
    event LogWithdrawal(address indexed _withdrawer, uint256 amount);

    constructor() {
        owner = msg.sender;
        totalDonators = 1;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Error: Only the owner can perform this task!");
        _;
    }

    modifier notOwner() {
        require(msg.sender != owner, "Error: Owner of donation cannot perform this task!");
        _;
    }


    function fetchOwner() view public returns (address) {
        return owner;
    }

    function fetchTotal() view public returns (uint) {
        return totalDonations;
    }

    // functions and addresses declared payable can receive ether into the contract
    function makeDonation() public payable notOwner() returns (bool) {
        require(msg.value > 0, "Donation Error: Can't Donate 0!");
        // require(msg.sender != owner, "Donation Error: Owner of donation cannot use same address to donate!");
        donations[msg.sender] += msg.value;
        donators[totalDonators++] = msg.sender;

        totalDonations += msg.value;

        emit LogDonation(msg.sender, donations[msg.sender]);
        return true; 
    }

    function makeWithdrawal() public isOwner() returns (bool) {
        uint amount = totalDonations;
        totalDonations = 0;
        
        bool isReset = resetDonations();
        require(isReset, "Resetting of donations failed");

        (bool success, ) = payable(owner).call{ value: amount }("");
        require (success, "Withdrawal failed");
        emit LogWithdrawal(msg.sender, amount);
        return true;
    }

    function resetDonations() public returns (bool) {
        for(uint i = 0; i < totalDonators; i++) {
            address toReset = donators[i];
            donations[toReset] = 0;
        }
        
        return true;
    }
}