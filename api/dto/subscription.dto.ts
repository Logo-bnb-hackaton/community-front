import {ImageDto} from "@/api/dto/image.dto";

export interface UpdateSubscriptionDTO {
    id: `0x${string}`;
    ownerId: string;
    status: SubscriptionStatus;
    title: string;
    description: string;
    mainImage: ImageDto,
    previewImage: ImageDto,
    price: string;
    coin: string;
}

export interface SubscriptionIdDTO {
    subscriptionId: string;
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
    'PAYMENT_PROCESSING' |
    'UNPUBLISHED' |
    'PUBLISHED'
    ;

export interface SubscriptionPaymentStatus {
    status: 'PAID' | 'NOT_PAID'
}