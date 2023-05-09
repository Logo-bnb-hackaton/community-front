import {internalClient} from "@/core/axios";
import {TgChatDTO} from "@/api/dto/integration.dto";


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

export const getChat = async (subscriptionId: `0x${string}`): Promise<TgChatDTO> => {
    return (await internalClient({
        method: 'post',
        url: `/api/integration/telegramChat`,
        data: {
            subscriptionId: subscriptionId,
        },
    })).data as TgChatDTO;
}