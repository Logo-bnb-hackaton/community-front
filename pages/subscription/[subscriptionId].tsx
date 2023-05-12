import {useRouter} from 'next/router'
import homeStyles from "@/styles/Home.module.css";
import styles from '@/styles/Subscription.module.css'
import React from "react";
import Header from "@/components/header/Header";
import {GetServerSidePropsContext, NextPage} from "next";

import * as Api from "@/api";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import Subscription, {BriefProfile} from "@/components/subscription/Subscription";
import SubscriptionEdit from "@/components/subscription/edit/SubscriptionEdit";
import Footer from "@/components/footer/Footer";
import {AuthProps} from "@/pages/_app";
import {getAuthStatus} from "@/utils/getAuthStatus";
import * as Contract from "@/contract";
import {ProfileDTO} from "@/api/dto/profile.dto";
import {TgChatStatusDTO} from "@/api/dto/integration.dto";

interface Props extends AuthProps {
    subscription: UpdateSubscriptionDTO;
    profile: BriefProfile,
    paymentStatus: 'PAID' | 'NOT_PAID',
    tgLinkStatus?: TgChatStatusDTO
}

const SubscriptionPage: NextPage<Props> = (
    {
        subscription,
        profile,
        paymentStatus,
        tgLinkStatus
    }
) => {
    const router = useRouter()
    const {edited} = router.query

    return (
        <main className={homeStyles.main}>
            <Header
                profileId={profile.id!!}
                base64Logo={profile.logo.base64Image}
            />

            <div className={styles.eventWrapper}>
                {
                    edited ?
                        <SubscriptionEdit data={subscription} profile={profile}/>
                        :
                        <Subscription
                            subscription={subscription}
                            profile={profile}
                            paymentStatus={paymentStatus}
                            tgLinkStatus={tgLinkStatus}
                        />
                }
            </div>

            <Footer/>
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

        const subscriptionId = ctx.query!!.subscriptionId as `0x${string}`;
        // todo mb remove cookie here
        const cookie = ctx.req.headers.cookie

        console.log(`loading sub: ${subscriptionId}`);
        let subscription: UpdateSubscriptionDTO | undefined;
        const subscriptionPromise = Api.subscription.loadSubscription(subscriptionId, cookie).then(data => subscription = data);
        console.log(`loading profile: ${profileId}`);
        let profile: ProfileDTO | undefined;
        const profilePromise = Api.profile.loadProfile(profileId, cookie).then(data => profile = data);

        let ownerAddress;
        const ownerPromise = Contract.profile
            .loadProfileOwner(profileId)
            .then((address) => (ownerAddress = address));

        let paymentStatus;
        const paymentStatusPromise = Api.subscription
            .paymentStatus({subscriptionId: subscriptionId}, cookie)
            .then(status => paymentStatus = status.status)
            .catch(e => {
                paymentStatus = 'NOT_PAID'
            })

        let tgLinkStatus;
        const tgLinkStatusPromise = Api.integration
            .getInviteLinkStatus(subscriptionId, cookie)
            .then(linkStatus => tgLinkStatus = linkStatus)
            .catch(e => {
                console.log(e);
                tgLinkStatus = null;
            });

        await Promise.all([subscriptionPromise, profilePromise, ownerPromise, paymentStatusPromise, tgLinkStatusPromise]);
        if (!profile || !subscription) {
            return {
                redirect: {
                    destination: `/${profileId}`,
                    permanent: false,
                },
            }
        }

        return {
            props: {
                authStatus: getAuthStatus(ctx),
                subscription: subscription,
                profile: {
                    id: profile.id,
                    title: profile.title,
                    logo: profile.logo,
                    ownerAddress: ownerAddress,
                },
                paymentStatus: paymentStatus,
                tgLinkStatus: tgLinkStatus
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

export default SubscriptionPage;