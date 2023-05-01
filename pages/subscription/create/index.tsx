import React from "react";
import homeStyles from "@/styles/Home.module.css";
import Header from "@/components/header/Header";
import Edit from "@/components/subscription/edit/Edit";
import Footer from "@/components/footer/Footer";
import {GetServerSidePropsContext, NextPage} from "next";
import {BriefProfile} from "@/components/subscription/SubscriptionBase";
import * as Api from "@/api";
import {ProfileDTO} from "@/api/dto/profile.dto";

interface Props {
    profile: BriefProfile
}

const CreatePage: NextPage<Props> = ({profile}) => {
    console.log(profile);
    return (
        <main className={homeStyles.main}>
            <Header
                saveCallback={undefined}
                editAvailable={false}
                edited={false}
                setEdited={undefined}
                disabled={false}
            />
            <Edit data={undefined} profile={profile}/>
            <Footer/>
        </main>
    );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    try {
        const profileId = ctx.query!!.profileId as string;

        const profile = await Api.profile.loadProfile(profileId).then(res => {
            const data = res as ProfileDTO
            return {
                id: data.id,
                title: data.title,
                logo: data.logo
            } as BriefProfile
        });
        if (!profile) {
            return {
                redirect: {
                    destination: `/profile/${profileId}`,
                    permanent: false,
                },
            }
        }

        return {
            props: {
                profile: profile,
            }
        };
    } catch (err) {
        console.log(err);
        // todo add redirecting here
        return {
            props: {profile: null, tokens: [], subscriptions: []}
        };
    }
};

export default CreatePage;