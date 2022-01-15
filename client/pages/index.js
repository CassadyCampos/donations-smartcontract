import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { parseEther, formatEther } from '@ethersproject/units';
import Donation from '../etherjs/artifacts/Donation.json'
import { messagePrefix } from '@ethersproject/hash';
// Tasks
// 1) Allow owner of contract to see that they are the owner
// 2) Allow a non-owner to make a donation through UI 

// donation contract needs updating on every 'truffle migrate --reset'
const DonationContractAddress = '0x448D7FcdcFAa59144B5e198d6c41A5E098f2223e';
const emptyAddress = '0x0000000000000000000000000000000000000000';


export default function IndexPage() {
    const [account, setAccount] = useState('');
    const [amount, setAmount] = useState(0);
    const [isOwner, setIsOwner] = useState('');
    const [myDonation, setMyDonation] = useState(0);

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

    // request account
    useEffect(() => {
        requestAccount();
    }, []);

    // if connected perform side effects
    useEffect(() => {
        if (account) {
            fetchOwner();
            fetchMyDonation();
        }
    })

    return (
        <div>
            <div>Connected Account: {account} </div>

            <h1>Hello World</h1>
            <div>Your current donation: {myDonation} ETH</div>

            {!isOwner ? (
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
            ) : (
                <div>You own this Donation Contract
                    {/* <button onClick={withdraw}>Withdraw</button> */}
                </div>
            )}
        </div>
    )

}