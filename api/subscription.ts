import axios from "@/core/axios";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const updateSubscription = async (data: UpdateSubscriptionDTO, cookie: any): Promise<void> => {
    return axios({
        method: 'post',
        url: `/subscription/update`,
        data: data,
        headers: {
            Cookie: cookie
        }
    });
}

export const loadSubscription = async (id: string, cookie: any): Promise<UpdateSubscriptionDTO> => {
    const response: ResponseDto<UpdateSubscriptionDTO> = (await axios({
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