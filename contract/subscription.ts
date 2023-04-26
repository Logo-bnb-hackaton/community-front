import {prepareWriteContract, waitForTransaction, writeContract} from "@wagmi/core";
import {SUBSCRIPTIONS_ABI, SUBSCRIPTIONS_ADDRESS, WAIT_BLOCK_CONFIRMATIONS} from "@/constants";
import {BigNumber} from "ethers";

export const createNewSubscriptionByEth = async (id: string, profileId: string, price: BigNumber) => {
    const config = await prepareWriteContract({
        address: SUBSCRIPTIONS_ADDRESS,
        abi: SUBSCRIPTIONS_ABI,
        functionName: 'createNewSubscriptionByEth',
        args: [id, profileId, false, 0, price, []]
    });

    const {hash} = await writeContract(config);
    await waitForTransaction({hash, confirmations: WAIT_BLOCK_CONFIRMATIONS})
}