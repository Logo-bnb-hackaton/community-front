import {externalClient, internalClient} from "@/core/axios";
import {ProfileDTO, UpdateProfileDTO} from "@/api/dto/profile.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const loadProfile = async (profileId: string, cookie: any): Promise<ProfileDTO> => {
    const response: ResponseDto<ProfileDTO> = (await externalClient({
        method: 'post',
        url: '/profile/',
        data: {
            profileId: profileId
        },
        headers: {
            Cookie: cookie
        },
    })).data;
    // todo check status here
    return response.data;
}

export const updateProfile = async (data: UpdateProfileDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: '/api/profile/update',
        data: data,
    });
}