import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import Donation from '../etherjs/artifacts/Donation.json'
// Tasks
// 1) Allow owner of contract to see that they are the owner
// 2) Allow a non-owner to make a donation through UI 

// donation contract needs updating on every 'truffle migrate --reset'
const DonationContractAddress = '0x5F3E9620ad4eF76d07b34afdBA8dfE0ef3331331';
const emptyAddress = '0x0000000000000000000000000000000000000000';


export default function IndexPage() {
    const [account, setAccount] = useState('');
    const [amount, setAmount] = useState(0);
    const [isOwner, setIsOwner] = useState('');
    const [myDonation, setMyDonation] = useState(0);
    const [donationTotal, setDonationTotal] = useState(0);

    async function initializeProvider() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();
        return new ethers.Contract(DonationContractAddress, Donation.abi, signer);
    }

    async function requestAccount() {
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(account[0]);
    }

    async function fetchMyDonation() {
        if (typeof window.ethereum !== 'undefined') {
            const contract = await initializeProvider();
            try {
                const myDonation = await contract.donations(account);
                setMyDonation(parseFloat(formatEther(myDonation.toString())));
            }
            catch (e) {
                console.log('Error fetching your donation: ', e);
            }
        }
    }

    async function submitDonation(event) {
        event.preventDefault();
        if (typeof window.ethereum !== 'undefined') {
            const contract = await initializeProvider();

            try {
                // convert ether to wei
                const wei = parseEther(amount);
                await contract.makeDonation({ value: wei });

                // wait for smart contract to emit LogBid event then update component
                contract.on('LogDonation', (_, __) => {
                    fetchMyDonation();
                });
            }
            catch (e) {
                console.log('Error making donation: ', e);
            }
        }
    }

    async function withdraw(event) {
        event.preventDefault();
        if (typeof window.ethereum !== 'undefined') {
            const contract = await initializeProvider();

            try {
                // convert ether to wei
                await contract.Withdraw();
            }
            catch(e) {
                console.log('Error making withdrawal: ', e);
            }
        }
    }

    async function fetchOwner() {
        if (typeof window.ethereum !== 'undefined') {
            const contract = await initializeProvider();
            try {
                const owner = await contract.fetchOwner();
                setIsOwner(owner.toLowerCase() === account);
            }
            catch (e) {
                console.log("Error fetching owner: ", e);
            }
        }
    }

    async function fetchDonationTotal() {
        if (typeof window.ethereum !== 'undefined') {
            const contract = await initializeProvider();
            try {
                const response = await contract.fetchTotal();
                const donationTotal = parseFloat(ethers.utils.formatEther(response));
                setDonationTotal(donationTotal);
            }
            catch (e) {
                console.log("Error fetching donation total: ", e);
            }
        }
    }

    // request account
    useEffect(() => {
        requestAccount();
    }, []);

    // if connected perform side effects
    useEffect(() => {
        if (account) {
            fetchOwner();
            fetchDonationTotal();
            fetchMyDonation();
        }
    })

    return (
        <div>
            <div>Connected Account: {account} </div>

            <h1>Hello World Donation Pool</h1>
            <div>Current Donation Total: {donationTotal} ETH</div>

            {!isOwner ? (
                <div>
                    <div>Your current donation: {myDonation} ETH</div>
                    <form onSubmit={submitDonation}>
                        <input
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            name="Donation Amount"
                            type="number"
                            placeholder="Enter Donation Amount"
                        />
                        <button type="submit">Submit</button>
                    </form>
                </div>

            ) : (
                <div>
                    <div>
                        You own this Donation Contract
                    </div>
                    <button onClick={withdraw}>Withdraw Donations!</button>
                </div>
            )}
        </div>
    )

}