import homeStyles from "@/styles/Home.module.css";
import Header from "@/components/header/Header";
import React from "react";
import styles from "@/styles/Event.module.css"
import EditEvent from "@/components/event/edit";

export default function Index() {

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
                <EditEvent/>
            </div>
        </main>
    );
}