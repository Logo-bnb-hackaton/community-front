import styles from "@/styles/Home.module.css";
import Image, {StaticImageData} from "next/image";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {Input, Modal, Select} from "antd";
import React, {useState} from "react";
import youtubeIcon from "@/assets/social_media_logo/youtube_icon.png";
import githubIcon from "@/assets/social_media_logo/github_square_icon.png";
import notionIcon from "@/assets/social_media_logo/notion_icon.png";
import telegramIcon from "@/assets/social_media_logo/telegram_icon.png";
import twitterIcon from "@/assets/social_media_logo/twitter_icon.png";
import gmailIcon from "@/assets/social_media_logo/gmail_icon.png";
import externalIcon from "@/assets/social_media_logo/external_link_icon.png";
import instagramIcon from "@/assets/social_media_logo/instagram_icon.png";

export default function SocialMediaList(
    {
        socialMediaLinks,
        setSocialLinks,
        edited = false,
        hasError = false
    }: { socialMediaLinks: SocialMediaLink[], setSocialLinks: Function, edited: boolean, hasError: boolean | undefined }
) {

    const [addSocialLinkMenu, setAddSocialLinkMenu] = useState(false)

    const [newSocialMediaType, setNewSocialMediaType] = useState(SocialMediaType.YouTube)
    const [newSocialMediaLink, setNewSocialMediaLink] = useState("")

    const showAddSocialLinkMenu = () => setAddSocialLinkMenu(true)

    const externalLinkRegExp = /((http|https):\/\/)(.*)/
    const prepareUrl = (url: string): string => {
        if (externalLinkRegExp.test(url)) return url;
        return `https://${url}`;
    }

    const addNewSocialLink = () => {
        if (!newSocialMediaType || !newSocialMediaLink || newSocialMediaLink.length == 0) {
            console.error("Please fill all fields")
            return
        }
        if (!urlValidatorByType(newSocialMediaType).test(newSocialMediaLink)) {
            console.error("Please fill all fields")
            return
        }
        let newLink = new SocialMediaLink(newSocialMediaType, staticImageByType(newSocialMediaType), prepareUrl(newSocialMediaLink));
        setSocialLinks([...socialMediaLinks, newLink]);
        setAddSocialLinkMenu(false);
        setNewSocialMediaLink("");
    }

    const deleteButtonHandler = (indexForDelete: number) => {
        setSocialLinks([...socialMediaLinks].filter((item, index) => index != indexForDelete));
    }

    return (
        <>
            {socialMediaLinks.map((item, index) =>
                <div className={styles.card} key={index}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <Image
                            src={item.icon}
                            alt={`${item.type} logo`}
                            fill
                        />
                    </a>
                    {edited &&
                        <div className={styles.cardDeleteButton}
                             onClick={() => deleteButtonHandler(index)}>
                            <DeleteOutlined style={{fontSize: "10px"}}/>
                        </div>
                    }
                </div>
            )
            }
            {
                socialMediaLinks.length < 7 && edited &&
                <>
                    <button className={`${styles.addCardButton} ${hasError ? styles.errorBorder : ""}`}
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
    Instagram = "Instagram",
    Link = "Link",
}

export const toSocialMediaLink = (url: string): SocialMediaLink => {
    const type = getType(url);
    console.log(`Type: ${type}, url: ${url}`);
    return new SocialMediaLink(type, staticImageByType(type), url);
}

const getType = (url: string): SocialMediaType => {
    let it = urlValidatorByTypeMap.entries();
    let entry = it.next();
    while (!entry.done) {
        const type = entry.value[0];
        const regExp = entry.value[1];
        if (regExp.test(url)) return type;
        entry = it.next();
    }
    return SocialMediaType.Link;
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
        case SocialMediaType.Instagram:
            return instagramIcon;
        case SocialMediaType.Link:
        default:
            return externalIcon;
    }
}

const defaultRegExp = /(.*)/;
const urlValidatorByTypeMap: Map<SocialMediaType, RegExp> = new Map([
    [SocialMediaType.YouTube, /((http|https):\/\/)?(www\.)?youtube\.com\/(.*)/],
    [SocialMediaType.Github, /((http|https):\/\/)?(www\.)?github\.com\/(.*)/],
    [SocialMediaType.Notion, /((http|https):\/\/)?(www\.)?notion\.so\/(.*)/],
    [SocialMediaType.Telegram, /((http|https):\/\/)?(www\.)?t\.me\/(.*)/],
    [SocialMediaType.Twitter, /((http|https):\/\/)?(www\.)?twitter\.com\/(.*)/],
    [SocialMediaType.Gmail, /(.*)gmail.com(.*)/],
    [SocialMediaType.Instagram, /((http|https):\/\/)?(www\.)?instagram\.com\/(.*)/],
    [SocialMediaType.Link, defaultRegExp],
]);

const urlValidatorByType = (type: SocialMediaType): RegExp => {
    const regExp = urlValidatorByTypeMap.get(type);
    if (regExp) return regExp;
    return defaultRegExp;
}