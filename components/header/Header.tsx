import styles from "@/styles/Home.module.css";
import WalletButton from "@/components/wallet/WalletButton";
import React, {useEffect, useState} from "react";
import {useAccount} from "wagmi";
import {Button} from "antd";
import {FormOutlined} from "@ant-design/icons";

export default function Header(
    {
        profileOwner = undefined,
        saveCallback = undefined,
        edited = false,
        setEdited = undefined,
    }: { profileOwner: string | undefined, saveCallback: Function | undefined, edited: boolean, setEdited: Function | undefined }
) {

    const [editAvailable, setEditAvailable] = useState(false);

    const account = useAccount();
    useEffect(() => {
        if (account && profileOwner && account.isConnected && account.address == profileOwner) {
            setEditAvailable(true);
            return;
        }
        setEditAvailable(false);
    }, [account, profileOwner])

    const onEditHandle = () => {
        setEdited!!(true);
    }

    const onSaveHandle = () => {
        if (!saveCallback) {
            console.log("Save callback is undefined");
            return
        }
        console.log("Saving result");
        saveCallback();
    }

    return (
        <div className={styles.description}>
            <p style={{fontSize: "48px", fontWeight:"bold", fontFamily: 'CoHeadlineCorp'}}><a href={"/"}>LOGO</a></p>
            <div style={{display: "flex", flexDirection: "row"}}>
                {editAvailable &&
                    <div style={{width: "60px", height: "60px", marginRight: "24px"}}>
                        <Button
                            onClick={edited ? onSaveHandle : onEditHandle}
                            style={{
                                height: "100%",
                                width: "100%",
                                border: "none",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                // boxShadow: "none",
                                // backgroundColor: "#F5F5F5",
                                borderRadius: "10px",
                                padding: "0"
                        }}
                        >
                            {edited ? "Save" : <FormOutlined style={{fontSize: "20px"}}/>}
                        </Button>
                    </div>
                }
                <WalletButton />
            </div>
        </div>
    );
}