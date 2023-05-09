import {ImageDto} from "@/api/dto/image.dto";

export interface UpdateSubscriptionDTO {
    id: string;
    ownerId: string;
    status: SubscriptionStatus;
    title: string;
    description: string;
    mainImage: ImageDto,
    previewImage: ImageDto,
    price: string;
    coin: string;
}

export interface SubscriptionBeforePayDTO {
    id: string;
}

export interface BriefSubscriptionInfo {
    id: string;
    status: SubscriptionStatus,
    ownerId: string;
    title: string;
    previewImage: ImageDto,
}

export type SubscriptionStatus =
    'DRAFT' |
    'NOT_PAID' |
    'BEFORE_PAY' |
    'UNPUBLISHED' |
    'PUBLISHED'
    ;