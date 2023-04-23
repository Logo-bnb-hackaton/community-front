import homeStyles from "@/styles/Home.module.css";
import Header from "@/components/header/Header";
import React, {useEffect, useState} from "react";
import styles from "@/styles/Event.module.css"
import {useRouter} from "next/router";
import {BaseInfoData} from "@/components/event/edit/BaseInfo";
import {baseCoin} from "@/components/donate/donate";
import Edit from "@/components/event/edit/Edit";
import {Button} from "antd";

export const subscriptions: BaseInfoData[] = [];

export default function Subscription() {

    const router = useRouter()
    const {subscriptionId, edited} = router.query

    const [data, setData] = useState(
        new BaseInfoData(undefined, '', '', baseCoin, 0, undefined, undefined)
    );

    useEffect(() => {
        console.log('here');
        // todo load info from contract and backend
        if (subscriptions.length === 0) return;
        const sub = subscriptions.find(s => s.id === subscriptionId);
        if (sub) setData(sub);
    }, [subscriptionId]);


    return (
        <main className={homeStyles.main}>
            <Header
                isProfileLoading={false}
                saveCallback={undefined}
                editAvailable={false}
                edited={false}
                setEdited={undefined}
                disabled={false}
            />

            <div className={styles.eventWrapper}>
                {!edited && <h1>{data.id} {data.title}</h1>}
                <Button onClick={() => router.push('/profile/2')}> to profile</Button>
                {edited && <Edit data={data}/>}
            </div>
        </main>
    );
}