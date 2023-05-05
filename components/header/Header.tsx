import styles from "@/styles/Home.module.css";
import WalletButton from "@/components/wallet/WalletButton";
import React from "react";
import CustomButton from "@/components/customButton/CustomButton";
import Image from "next/image";
import EditSvg from "@/assets/svg_icon/edit_square.svg";

export default function Header({
                                   saveCallback = undefined,
                                   editAvailable = false,
                                   edited = false,
                                   setEdited = undefined,
                                   showLogo = true,
                                   disabled,
                                   profileId = undefined,
                                   base64Logo = undefined,
                               }: {
    saveCallback: Function | undefined;
    editAvailable: boolean;
    edited: boolean;
    setEdited: Function | undefined;
    disabled: boolean;
    showLogo?: boolean;
    profileId?: string;
    base64Logo?: string;
}) {
    const onEditHandle = () => {
        setEdited!!(true);
    };

    const onSaveHandle = () => {
        if (!saveCallback) {
            console.log("Save callback is undefined");
            return;
        }
        console.log("Saving result");
        saveCallback();
    };

    return (
        <div className={styles.header}>
            <div className={styles.description}>
                <div style={{display: "flex", flexDirection: "row"}}>
                    {showLogo && (
                        <a href={"/"}>
                            <div
                                style={{width: "179px", height: "35px", margin: 0}}
                                className={styles.logo_nodde}
                            ></div>
                        </a>
                    )}
                </div>
                <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    {editAvailable && (
                        <CustomButton
                            style={{
                                minWidth: "55px", height: "55px",
                                padding: "0 16px ", margin: '0 12px',
                                backgroundColor: '#fff',
                                display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }}
                            type="small"
                            color={"gray"}
                            disabled={disabled}
                            onClick={edited ? onSaveHandle : onEditHandle}
                        >
                            {edited ? "Save" : <Image src={EditSvg} alt={"Edit icon"} width={20} height={20}/>}
                        </CustomButton>
                    )}
                    <WalletButton profileId={profileId} base64Logo={base64Logo}/>
                </div>
            </div>
        </div>
    );
}
