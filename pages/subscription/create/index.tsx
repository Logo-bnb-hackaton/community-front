import React from "react";
import homeStyles from "@/styles/Home.module.css";
import Header from "@/components/header/Header";
import {useRouter} from "next/router";
import Edit from "@/components/subscription/edit/Edit";

export default function CreatePage() {
    const router = useRouter();
    const {profileId} = router.query

    return (
        <main className={homeStyles.main}>
            <Header
                saveCallback={undefined}
                editAvailable={false}
                edited={false}
                setEdited={undefined}
                disabled={false}
            />
            <Edit data={undefined} profileId={profileId as string}/>
        </main>
    );
}