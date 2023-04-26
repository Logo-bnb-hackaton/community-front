import {prepareWriteContract, readContract, waitForTransaction, writeContract} from "@wagmi/core";
import {MAIN_NFT_ABI, MAIN_NFT_ADDRESS, PUBLIC_DONATION_ABI, PUBLIC_DONATION_ADDRESS} from "@/constants";
import {symbolByAddress} from "@/utils/tokens";

export const loadAvailableTokens = async (profileId: string): Promise<string[]> => {
    return readContract({
        address: PUBLIC_DONATION_ADDRESS,
        abi: PUBLIC_DONATION_ABI,
        functionName: 'getAllDonateTokenAddressesByAuthor',
        args: [profileId]
    }).then(data => {
        return (data as string[]).map(address => symbolByAddress.get(address as `0x${string}`)) as string[];
    });
};

export const loadProfileOwner = async (profileId: string): Promise<string> => {
    return readContract({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: 'ownerOf',
        args: [profileId]
    }).then(data => data as string);
}

export const enableOrDisableToken = async (profileId: string, tokenAddress: string, enable: boolean): Promise<void> => {
    const functionName = enable ? 'addDonateAddress' : 'removeDonateAddress';
    const config = await prepareWriteContract({
        address: PUBLIC_DONATION_ADDRESS,
        abi: PUBLIC_DONATION_ABI,
        functionName: functionName,
        args: [tokenAddress, profileId]
    })
    const {hash} = await writeContract(config);
    await waitForTransaction({hash: hash});
}