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
            assert.include(e.message, "Donation Error: Owner of donation cannot use same address to donate!")
        }
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
})