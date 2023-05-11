import {externalClient, internalClient} from "@/core/axios";
import {SubscriptionBeforePayDTO, SubscriptionStatus, UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const updateSubscription = async (data: UpdateSubscriptionDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/update`,
        data: data,
    });
}

export const processPayment = async (data: SubscriptionBeforePayDTO): Promise<SubscriptionStatus> => {
    return (await internalClient({
        method: 'post',
        url: `/api/subscription/processPayment`,
        data: data,
    })).data.status;
}

export const publish = async (data: SubscriptionBeforePayDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/publish`,
        data: data,
    });
}
export const unpublish = async (data: SubscriptionBeforePayDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/unpublish`,
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