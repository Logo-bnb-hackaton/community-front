import {externalClient, internalClient} from "@/core/axios";
import {UpdateSubscriptionDTO, UpdateSubscriptionStatusDTO} from "@/api/dto/subscription.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const updateSubscription = async (data: UpdateSubscriptionDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/update`,
        data: data,
    });
}

export const updateSubscriptionStatus = async (data: UpdateSubscriptionStatusDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/updateStatus`,
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