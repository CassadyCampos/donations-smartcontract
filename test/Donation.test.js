const Donation = artifacts.require("Donation")

contract("Donation", async accounts => {
    let donation;
    const contractOwner = accounts[0];
    const userAccountOne = accounts[1];
    const userAccountTwo = accounts[2];
    const amount = 5000000000000000000; //5eth
    const smallAmount = 3000000000000000000; //3eth
    
    beforeEach(async () => {
        donation = await Donation.new({ from: contractOwner })
    })

    it("should make donation", async () => {
        await donation.makeDonation({ value: amount, from: userAccountOne })
        const donationAmount = await donation.donations(userAccountOne)
        assert.equal(donationAmount, amount);
    })

    it("should not allow owner donation", async () => {
        try {
            await donation.makeDonation({ value: amount, from: contractOwner })
        }
        catch (e) {
            assert.include(e.message, "Error: Owner of donation cannot perform this task!")
        }
    })

    it("can fetch total donations", async () => {
        await donation.makeDonation({ value: amount, from: userAccountOne })
        await donation.makeDonation({ value: smallAmount, from: userAccountTwo })

        const donationTotal = await donation.fetchTotal();

        assert.equal(donationTotal, amount + smallAmount);
    })

    it("can fetch owner", async () => {
        const ownerAddress = await donation.fetchOwner();
        assert.equal(ownerAddress, contractOwner);
    })

    it("should require donation amount", async () => {
        try {
            await donation.makeDonation({ value: 0, from: userAccountOne })
        }
        catch (e) {
            assert.include(e.message, "Donation Error: Can't Donate 0!")
        }
    })

    it("should not allower non owner withdrawal", async () => {
        await donation.makeDonation({ value: amount, from: userAccountOne })
        
        try {
            await donation.makeWithdrawal({ from: userAccountTwo })
        }
        catch (e) {
            assert.include(e.message, "Error: Only the owner can perform this task!")
        }
    })

    it("can allow owner to withdraw", async () => {
        const contractOwnerBalanceBefore = await web3.eth.getBalance(contractOwner);

        await donation.makeDonation({ value: amount, from: userAccountOne })

        await donation.makeWithdrawal({from: contractOwner});

        const contractOwnerBalance = await web3.eth.getBalance(contractOwner);

        // hard to exactly determine the final withdrawal amount due to potential gas fees
        assert.isAbove(parseInt(contractOwnerBalance), parseInt(contractOwnerBalanceBefore), 'Contract owners balance now is greater than it was before');
    })
})