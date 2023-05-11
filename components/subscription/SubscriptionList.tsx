import Image from "next/image";
import React from "react";
import {CheckOutlined, FormOutlined} from "@ant-design/icons";
import styles from "@/styles/Subscriptions.module.css";
import {BriefSubscriptionInfo} from "@/api/dto/subscription.dto";
import {useRouter} from "next/router";

const ROW_COUNT = 3;

interface Props {
    profileId: string;
    subscriptions: BriefSubscriptionInfo[];
    isOwner: boolean;
}

const SubscriptionList: React.FC<Props> = ({profileId, subscriptions, isOwner}) => {
    const router = useRouter();

    return (
        <div className={styles.subscriptionsWrapper}>
            <h1 style={{margin: "48px 0"}}>Subscriptions</h1>
            <div className={styles.subscriptionsContainer}>
                {subscriptions.map((subscription) =>
                    <div key={subscription.id} className={styles.subscriptionWrapper}>
                        <Image
                            src={subscription.previewImage.base64Image!!}
                            alt={"Subscription logo"}
                            className={styles.subscriptionImage}
                            fill
                            onClick={(e) =>
                                router.push(`/subscription/${subscription.id}?profileId=${profileId}`)
                            }
                        />
                        <p className={`${styles.subscriptionTitle}`}>
                            {subscription.title}
                        </p>
                        {
                            isOwner && <div
                                className={`${styles.subscriptionStatus}`}
                                onClick={(e) =>
                                    router.push(`/subscription/${subscription.id}?edited=true&profileId=${profileId}`)
                                }
                            >
                                {subscription.ownerId === profileId ?
                                    <FormOutlined style={{fontSize: "20px"}}/> : <CheckOutlined/>}
                            </div>
                        }
                    </div>
                )}
                {subscriptions.length % ROW_COUNT < ROW_COUNT &&
                    Array(ROW_COUNT - subscriptions.length)
                        .fill(1)
                        .map((item, index) => (
                            <div key={`stub-${index}`} className={styles.subscriptionWrapper}>
                                <div className={styles.subscriptionStub}>
                                    <p>Coming soon :)</p>
                                </div>
                            </div>
                        ))}
            </div>
        </div>
    );
};

export default SubscriptionList;
