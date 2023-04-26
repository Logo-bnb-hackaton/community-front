import axios from "@/core/axios";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const updateSubscription = async (data: UpdateSubscriptionDTO): Promise<void> => {
    return axios({
        method: 'post',
        url: `/subscription/update`,
        data: data
    });
}

export const loadSubscription = async (id: string): Promise<UpdateSubscriptionDTO> => {
    const response: ResponseDto<UpdateSubscriptionDTO> = (await axios({
        method: 'post',
        url: '/subscription/',
        data: {
            subscriptionId: id
        }
    })).data;
    return response.data;
}