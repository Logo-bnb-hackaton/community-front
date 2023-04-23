import React from "react";
import homeStyles from "@/styles/Home.module.css";
import Header from "@/components/header/Header";
import Edit from "@/components/event/edit/Edit";

export default function CreatePage() {
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
            <Edit data={undefined}/>
        </main>
    );
}