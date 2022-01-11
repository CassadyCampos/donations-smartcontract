import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Donation from'../etherjs/artifacts/Donation.json'
// Tasks
// 1) Allow owner of contract to see that they are the owner
// 2) Allow a non-owner to make a donation through UI 

// donation contract needs updating on every 'truffle migrate --reset'
const DonationContractAddress = '0x42A0275a2ECd62D53FfC73Cc2b1fDD540e5D8219';
const emptyAddress = '0x0000000000000000000000000000000000000000';


export default function IndexPage() {
    const [account, setAccount] = useState('');
    const [isOwner, setIsOwner] = useState('');

    async function initializeProvider() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        const signer = provider.getSigner();
        return new ethers.Contract(DonationContractAddress, Donation.abi, signer);
    }

    async function requestAccount() {
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(account[0]);
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
        }
    })

    return (
        <div>
            <div>Connected Account: {account} </div>
            
            <h1>Hello World</h1>
            {isOwner ? 
            <h1>Owner</h1>
        : <h1>Not Owner</h1>}
        </div>

    )

}