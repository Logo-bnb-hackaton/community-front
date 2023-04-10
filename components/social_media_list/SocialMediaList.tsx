import styles from "@/styles/Home.module.css";
import Image, {StaticImageData} from "next/image";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {Input, Modal, Select} from "antd";
import React, {useEffect, useState} from "react";
import youtubeIcon from "@/assets/social_media_logo/youtube_icon.png";
import githubIcon from "@/assets/social_media_logo/github_square_icon.png";
import notionIcon from "@/assets/social_media_logo/notion_icon.png";
import telegramIcon from "@/assets/social_media_logo/telegram_icon.png";
import twitterIcon from "@/assets/social_media_logo/twitter_icon.png";
import gmailIcon from "@/assets/social_media_logo/gmail_icon.png";

export default function SocialMediaList(
    {socialMediaLinks}: { socialMediaLinks: SocialMediaLink[] }
) {

    const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([])
    const [addSocialLinkMenu, setAddSocialLinkMenu] = useState(false)

    const [newSocialMediaType, setNewSocialMediaType] = useState(SocialMediaType.YouTube)
    const [newSocialMediaLink, setNewSocialMediaLink] = useState("")

    useEffect(() => {
        setSocialLinks(socialMediaLinks)
    }, [socialMediaLinks])

    const showAddSocialLinkMenu = () => {
        setAddSocialLinkMenu(true)
    }

    const addNewSocialLink = () => {
        if (!newSocialMediaType || !newSocialMediaLink || newSocialMediaLink.length == 0) {
            console.error("Please fill all fields")
            return
        }
        let newLink = new SocialMediaLink(newSocialMediaType, staticImageByType(newSocialMediaType), newSocialMediaLink);
        setSocialLinks([...socialLinks, newLink]);
        setAddSocialLinkMenu(false);
        setNewSocialMediaLink("");
    }

    const deleteButtonHandler = (indexForDelete: number) => {
        console.log(indexForDelete);
        setSocialLinks([...socialLinks].filter((item, index) => index != indexForDelete));
    }

    return (
        <>
            {socialLinks.map((item, index) =>
                <div className={styles.card} key={index}>
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={item.icon}
                            alt={`${item.type} logo`}
                            fill
                        />
                    </a>
                    <div className={styles.cardDeleteButton}
                         onClick={() => deleteButtonHandler(index)}>
                        <DeleteOutlined style={{fontSize: "10px"}}/>
                    </div>
                </div>
            )
            }
            {
                socialLinks.length < 7 &&
                <>
                    <button style={{
                        width: "70px",
                        height: "70px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                        border: "1px dashed #d9d9d9",
                        borderRadius: "8px",
                    }}
                            onClick={showAddSocialLinkMenu}>
                        <PlusOutlined/>
                        <p style={{paddingTop: "8px"}}>Add link</p>
                    </button>
                    <Modal
                        title="Add social media link"
                        centered
                        open={addSocialLinkMenu}
                        onOk={() => addNewSocialLink()}
                        onCancel={() => setAddSocialLinkMenu(false)}
                    >
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <Select
                                defaultValue={newSocialMediaType}
                                style={{width: 120}}
                                onChange={v => setNewSocialMediaType(v)}
                                options={
                                    Object.keys(SocialMediaType).filter((item) => {
                                        return isNaN(Number(item));
                                    }).map(item => {
                                        return {
                                            value: item, label: item
                                        }
                                    })
                                }
                            />
                            <Input
                                value={newSocialMediaLink}
                                placeholder="Social media link"
                                onChange={e => setNewSocialMediaLink(e.target.value)}
                            />
                        </div>
                    </Modal>
                </>
            }
        </>
    );
}

export class SocialMediaLink {
    type: SocialMediaType;
    icon: StaticImageData;
    link: string;

    constructor(type: SocialMediaType, icon: StaticImageData, link: string) {
        this.type = type;
        this.icon = icon;
        this.link = link;
    }
}

export enum SocialMediaType {
    YouTube = "YouTube",
    Github = "Github",
    Notion = "Notion",
    Telegram = "Telegram",
    Twitter = "Twitter",
    Gmail = "Gmail",
    Link = "Link",
}

const staticImageByType = (type: SocialMediaType) => {
    switch (type) {
        case SocialMediaType.YouTube:
            return youtubeIcon;
        case SocialMediaType.Github:
            return githubIcon;
        case SocialMediaType.Notion:
            return notionIcon;
        case SocialMediaType.Telegram:
            return telegramIcon;
        case SocialMediaType.Twitter:
            return twitterIcon;
        case SocialMediaType.Gmail:
            return gmailIcon;
        case SocialMediaType.Link:
            // todo fix create default image
            return youtubeIcon;
    }
}