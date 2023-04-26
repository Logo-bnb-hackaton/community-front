import axios from "@/core/axios";
import {ProfileDTO, UpdateProfileDTO} from "@/api/dto/profile.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const loadProfile = async (profileId: string): Promise<ProfileDTO> => {
    const response: ResponseDto<ProfileDTO> = (await axios({
        method: 'post',
        url: '/profile/',
        data: {
            profileId: profileId
        },
    })).data;
    // todo check status here
    return response.data;
}

export const updateProfile = async (data: UpdateProfileDTO): Promise<void> => {
    return axios({
        method: 'post',
        url: '/profile/update',
        data: data,
    });
}