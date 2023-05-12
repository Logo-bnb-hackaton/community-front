const profileBucket = 'community-profile-images-1r34goy';
const subscriptionBucket = 'community-subscription-images-321t9587g';

export function buildProfileHost(): string {
    return `${profileBucket}.s3.amazonaws.com`;
}

export function buildProfileImageLink(id: String): string {
    return `https://${buildProfileHost()}/${id}`;
}

export function buildSubscriptionHost(): string {
    return `${subscriptionBucket}.s3.amazonaws.com`;
}

export function buildSubscriptionImageLink(id: String): string {
    return `https://${buildSubscriptionHost()}/${id}`;
}