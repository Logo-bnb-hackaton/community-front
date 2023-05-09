import {externalClient, internalClient} from "@/core/axios";
import {SubscriptionBeforePayDTO, UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const updateSubscription = async (data: UpdateSubscriptionDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/update`,
        data: data,
    });
}

export const beforePay = async (data: SubscriptionBeforePayDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/beforePay`,
        data: data,
    });
}
export const afterPay = async (data: SubscriptionBeforePayDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/afterPay`,
        data: data,
    });
}

export const loadSubscription = async (id: string, cookie: any): Promise<UpdateSubscriptionDTO> => {
    const response: ResponseDto<UpdateSubscriptionDTO> = (await externalClient({
        method: 'post',
        url: '/subscription/',
        data: {
            subscriptionId: id
        },
        headers: {
            Cookie: cookie
        }
    })).data;
    return response.data;
}