import styles from "@/styles/Home.module.css";
import WalletButton from "@/components/wallet/WalletButton";
import React, {useEffect, useState} from "react";
import {useAccount} from "wagmi";
import {Button} from "antd";
import {FormOutlined} from "@ant-design/icons";

export default function Header(
    {
        profileId,
        saveCallback = undefined,
        edited = false,
        setEdited = undefined,
    }: { profileId: number | string | undefined, saveCallback: Function | undefined, edited: boolean, setEdited: Function | undefined }
) {

    const [editAvailable, setEditAvailable] = useState(false);

    const account = useAccount();
    useEffect(() => {
        if (!account || !profileId) return;
        // todo fix it
        setEditAvailable(true);
    }, [account, profileId])

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
            <p><a href={"/"}>Logo 1</a></p>
            <div style={{display: "flex", flexDirection: "row"}}>
                {editAvailable &&
                    <div style={{paddingRight: "10px"}}>
                        {edited ?
                            <Button onClick={onSaveHandle} style={{height: "100%"}}>Save</Button> :
                            <Button onClick={onEditHandle} style={{height: "100%"}}>
                                <FormOutlined style={{fontSize: "15px"}}/>
                            </Button>
                        }
                    </div>
                }
                <WalletButton/>
            </div>
        </div>
    );
}