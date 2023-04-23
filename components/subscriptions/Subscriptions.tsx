import Image from "next/image";
import React from "react";
import {CheckOutlined} from "@ant-design/icons";
import styles from "@/styles/Subscriptions.module.css";
import {BaseInfoData} from "@/components/event/edit/BaseInfo";

const ROW_COUNT = 3;

export default function Subscriptions({subscriptions}: { subscriptions: BaseInfoData[] }) {

    return (
        <div className={styles.subscriptionsWrapper}>
            <p className={styles.subscriptionsTitle}>SUBSCRIPTIONS</p>
            <div className={styles.subscriptionsContainer}>
                {
                    subscriptions.map(subscription =>
                        <div
                            key={subscription.id}
                            className={styles.subscriptionWrapper}>
                            <Image
                                src={subscription.base64PreviewImg!!}
                                alt={"Subscription logo"}
                                className={styles.subscriptionImage}
                                fill
                            />
                            <p className={`${styles.subscriptionTitle}`}>{subscription.title}</p>
                            <div className={`${styles.subscriptionStatus}`}>
                                <CheckOutlined/>
                            </div>
                        </div>
                    )
                }
                {
                    subscriptions.length % ROW_COUNT < ROW_COUNT &&
                    Array(ROW_COUNT - subscriptions.length).fill(1).map((item, index) =>
                        <div
                            key={`stub-${index}`}
                            className={styles.subscriptionWrapper}
                        >
                            <div className={styles.subscriptionStub}>
                                <p>Coming soon :)</p>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}