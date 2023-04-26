import {useRouter} from 'next/router'
import homeStyles from "@/styles/Home.module.css";
import styles from '@/styles/Subscription.module.css'
import React from "react";
import Header from "@/components/header/Header";
import {GetServerSidePropsContext, NextPage} from "next";

import * as Api from "@/api";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import SubscriptionBase, {BriefProfile} from "@/components/subscription/SubscriptionBase";
import Edit from "@/components/subscription/edit/Edit";

interface Props {
    subscription: UpdateSubscriptionDTO;
    profile: BriefProfile
}

const Subscription: NextPage<Props> = ({subscription, profile}) => {

    const router = useRouter()
    const {edited, profileId} = router.query

    return (
        <main className={homeStyles.main}>
            <Header
                saveCallback={undefined}
                editAvailable={false}
                edited={false}
                setEdited={undefined}
                disabled={false}
            />

            <div className={styles.eventWrapper}>
                {
                    edited ?
                        <Edit data={subscription} profileId={profileId as string}/>
                        :
                        <SubscriptionBase subscription={subscription} profile={profile}/>
                }
            </div>
        </main>
    );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    try {
        const profileId = ctx.query!!.profileId as string;
        if (!profileId) {
            return {
                redirect: {
                    destination: "/",
                    permanent: false,
                },
            }
        }

        const subscriptionId = ctx.query!!.subscriptionId as string;

        console.log(`loading sub: ${subscriptionId}`);
        let subscription;
        const subscriptionPromise = Api.subscription.loadSubscription(subscriptionId).then(data => subscription = data);
        console.log(`loading profile: ${profileId}`);
        let profile;
        const profilePromise = await Api.profile.loadProfile(profileId)
            .then(data => ({id: data.id, title: data.title, logo: data.logo}))
            .then(data => profile = data);

        await Promise.all([subscriptionPromise, profilePromise]);

        return {
            props: {
                subscription: subscription,
                profile: profile
            }
        };
    } catch (err) {
        console.log(err);
        // todo add redirecting here
        return {
            props: {
                subscription: undefined,
                profile: undefined
            }
        };
    }
};

export default Subscription;