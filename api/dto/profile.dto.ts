import {ImageDto} from "@/api/dto/image.dto";
import {BriefSubscriptionInfo} from "@/api/dto/subscription.dto";

export interface ProfileDTO {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
    subscriptions: BriefSubscriptionInfo[],
}

export interface UpdateProfileDTO {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
}