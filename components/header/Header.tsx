import styles from "@/styles/Home.module.css";
import WalletButton from "@/components/wallet/WalletButton";
import React from "react";
import {Button} from "antd";
import {FormOutlined} from "@ant-design/icons";

export default function Header(
    {
        isProfileLoading,
        saveCallback = undefined,
        editAvailable = false,
        edited = false,
        setEdited = undefined,
        disabled
    }: {
        isProfileLoading: boolean,
        saveCallback: Function | undefined,
        editAvailable: boolean,
        edited: boolean,
        setEdited: Function | undefined,
        disabled: boolean
    }
) {

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
            <p style={{fontSize: "48px", fontWeight: "bold", fontFamily: 'CoHeadlineCorp'}}><a href={"/"}>LOGO</a></p>
            <div style={{display: "flex", flexDirection: "row"}}>
                {editAvailable && !isProfileLoading &&
                    <div style={{width: "60px", height: "60px", marginRight: "24px"}}>
                        <Button
                            disabled={disabled}
                            onClick={edited ? onSaveHandle : onEditHandle}
                            style={{
                                height: "100%",
                                width: "100%",
                                border: "none",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                borderRadius: "10px",
                                padding: "0"
                            }}
                        >
                            {edited ? "Save" : <FormOutlined style={{fontSize: "20px"}}/>}
                        </Button>
                    </div>
                }
                <WalletButton/>
            </div>
        </div>
    );
}