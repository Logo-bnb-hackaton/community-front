import {ConnectButton, useAccountModal} from '@rainbow-me/rainbowkit';
import {useAccount} from "wagmi";
import Image from "next/image";
import React, {useEffect, useRef, useState} from "react";
import discordIcon from "@/assets/social_media_logo/discord.svg";
import {MenuOutlined} from "@ant-design/icons";
import {Dropdown, MenuProps} from "antd";
import {useRouter} from "next/router";
import CustomButton from "@/components/customButton/CustomButton";

export default function WalletButton({profileId, base64Logo}: { profileId?: string, base64Logo?: string }) {


    const router = useRouter();
    const {isConnected} = useAccount();
    const {openAccountModal} = useAccountModal();

    const [isOpen, setIsOpen] = useState(false);
    const openCloseMenu = () => setIsOpen(p => !p);

    const wrapperRef = useRef(null);

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: any) {
            // @ts-ignore
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <div key={"menu-item-1"}
                     style={{fontSize: '14px', fontFamily: 'co-headline', padding: '10px'}}
                     onClick={() => router.push(`/profile/${profileId!!}`)}
                >
                    Profile
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <div key={"menu-item-2"}
                     style={{fontSize: '14px', fontFamily: 'co-headline', padding: '10px'}}
                     onClick={openAccountModal}
                >
                    Wallet
                </div>
            ),
        },
    ];

    const dynamicContent = () => {
        if (!isConnected) {
            return <ConnectButton/>
        }
        return (
            <Dropdown
                menu={{items}}
                placement="bottomRight"
                arrow={false}
                open={isOpen}
                dropdownRender={body => <div ref={wrapperRef}>{body}</div>}
            >
                <CustomButton onClick={openCloseMenu} style={{
                    backgroundColor: '#fff',
                    height: '56px',
                    minWidth: '100px',
                    position: "relative",
                    display: 'flex',
                    justifyContent: "center",
                    alignItems: "center",
                    padding: '8px'
                }}>
                    <MenuOutlined style={{fontSize: '24px', marginRight: '8px'}}/>
                    <Image
                        width={40}
                        height={40}
                        style={{borderRadius: '50%'}}
                        // todo fix it, use some default logo
                        src={base64Logo ? base64Logo : discordIcon}
                        alt={`Profile logo`}
                    />
                </CustomButton>
            </Dropdown>
        );
    }

    return (
        <>
            {dynamicContent()}
        </>
    );
}
