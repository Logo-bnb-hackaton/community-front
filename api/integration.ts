import {internalClient} from "@/core/axios";


export const bindTelegram = async (subscriptionId: `0x${string}`, code: string): Promise<TgIntegrationDTO> => {
    return (await internalClient({
        method: 'post',
        url: `/api/integration/telegram`,
        data: {
            code: code,
            subscriptionId: subscriptionId,
        },
    })).data as TgIntegrationDTO;
}