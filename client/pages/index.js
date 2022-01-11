import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Tasks
// 1) Allow owner of contract to see that they are the owner
// 2) Allow a non-owner to make a donation through UI 

export default function IndexPage() {
    const [account, setAccount] = useState('');
    const [isOwner, setIsOwner] = useState('');

    async function initializeProvider() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        const signer = provider.getSigner();
        return new ethers.Contract(AuctionContractAddress, Auction.abi, signer);
    }

    async function requestAccount() {
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(account[0]);
    }

    async function fetchOwner() {
        if (typeof window.ethereum !== 'undefined') {
            const contract = await intializeProvider();
            try {
                const owner = await contract.getOwner();
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

    return (
        <div>
            <div>Connected Account: {account} </div>
            
            <h1>Hello World</h1>

        </div>

    )

}