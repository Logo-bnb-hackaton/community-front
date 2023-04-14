import styles from "@/styles/Home.module.css";
import Image, {StaticImageData} from "next/image";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {Input, Modal, Select} from "antd";
import React, {useState} from "react";
import youtubeIcon from "@/assets/social_media_logo/youtube.svg";
import githubIcon from "@/assets/social_media_logo/github.svg";
import telegramIcon from "@/assets/social_media_logo/telegram.svg";
import twitterIcon from "@/assets/social_media_logo/twitter.svg";
import externalIcon from "@/assets/social_media_logo/external_link.svg";
import instagramIcon from "@/assets/social_media_logo/instagram.svg";
import facebookIcon from "@/assets/social_media_logo/facebook.svg";
import vkIcon from "@/assets/social_media_logo/vk.svg";
import discordIcon from "@/assets/social_media_logo/discord.svg";


const SOCIAL_MEDIA_LINK_SIZE = 6;

export default function SocialMediaList(
    {
        socialMediaLinks,
        setSocialLinks,
        edited = false,
        hasError = false
    }: { socialMediaLinks: SocialMediaLink[], setSocialLinks: Function, edited: boolean, hasError: boolean | undefined }
) {

    const [addSocialLinkMenu, setAddSocialLinkMenu] = useState(false)

    const [editedLinkItemId, setEditedLinkItemId] = useState<number | undefined>(undefined);
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
            console.error("Please fill all fields.")
            return
        }
        if (!urlValidatorByType(newSocialMediaType).test(newSocialMediaLink)) {
            console.error("Invalid type and link.")
            return
        }
        let newLink = new SocialMediaLink(newSocialMediaType, staticImageByType(newSocialMediaType), prepareUrl(newSocialMediaLink));

        if (editedLinkItemId !== undefined) {
            console.log(`editing ${editedLinkItemId}`);
            setSocialLinks([...socialMediaLinks.map((item, index) => {
                if (index === editedLinkItemId) {
                    return newLink;
                } else {
                    return item;
                }
            })]);
        } else {
            const json = JSON.stringify(newLink);
            const hasLink = socialMediaLinks.filter(item => JSON.stringify(item) == json).length > 0;
            if (!hasLink) {
                setSocialLinks([...socialMediaLinks, newLink]);
            }
        }

        resetToDefaultValue();
    }

    const cancelNewSocialLink = () => {
        resetToDefaultValue();
    }

    const deleteButtonHandler = (indexForDelete: number) => {
        setSocialLinks([...socialMediaLinks].filter((item, index) => index != indexForDelete));
    }


    const showEditSocialLinkMenu = (index: number, type: SocialMediaType, link: string) => {
        setEditedLinkItemId(index);
        setNewSocialMediaType(type);
        setNewSocialMediaLink(link);
        setAddSocialLinkMenu(true);
    }

    const resetToDefaultValue = () => {
        setEditedLinkItemId(undefined);
        setAddSocialLinkMenu(false);
        setNewSocialMediaLink("");
        setNewSocialMediaType(SocialMediaType.YouTube);
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "28px"
        }}>
            {socialMediaLinks.map((item, index) =>
                <div className={styles.card} key={index}>
                    <a href={edited ? '#' : item.link} target={edited ? "" : "_blank"} rel="noopener noreferrer"
                       onClick={edited ? () => showEditSocialLinkMenu(index, item.type, item.link) : () => {
                       }}>
                        <Image
                            style={{borderRadius: "20px"}}
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
                socialMediaLinks.length < SOCIAL_MEDIA_LINK_SIZE && edited &&
                <>
                    {
                        Array(SOCIAL_MEDIA_LINK_SIZE - socialMediaLinks.length).fill(
                            <button className={`${styles.addCardButton} ${hasError ? styles.errorBorder : ""}`}
                                    onClick={showAddSocialLinkMenu}>
                                <PlusOutlined/>
                                <p style={{paddingTop: "8px"}}>Add link</p>
                            </button>
                        )
                    }
                    <Modal
                        title="Add social media link"
                        centered
                        open={addSocialLinkMenu}
                        onOk={addNewSocialLink}
                        onCancel={cancelNewSocialLink}
                    >
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <Select
                                defaultValue={newSocialMediaType}
                                value={newSocialMediaType}
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
        </div>
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
    Telegram = "Telegram",
    Twitter = "Twitter",
    Instagram = "Instagram",
    Facebook = "Facebook",
    Vk = "Vk",
    Discord = "Discord",
    Link = "Link",
}

export const toSocialMediaLink = (url: string): SocialMediaLink => {
    const type = getType(url);
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
        case SocialMediaType.Telegram:
            return telegramIcon;
        case SocialMediaType.Twitter:
            return twitterIcon;
        case SocialMediaType.Instagram:
            return instagramIcon;
        case SocialMediaType.Facebook:
            return facebookIcon;
        case SocialMediaType.Vk:
            return vkIcon;
        case SocialMediaType.Discord:
            return discordIcon;
        case SocialMediaType.Link:
        default:
            return externalIcon;
    }
}

// todo think about this filters
const defaultRegExp = /(.*)/;
const urlValidatorByTypeMap: Map<SocialMediaType, RegExp> = new Map([
    [SocialMediaType.YouTube, /((http|https):\/\/)?(www\.)?youtube\.com\/(.*)/],
    [SocialMediaType.Github, /((http|https):\/\/)?(www\.)?github\.com\/(.*)/],
    [SocialMediaType.Telegram, /((http|https):\/\/)?(www\.)?t\.me\/(.*)/],
    [SocialMediaType.Twitter, /((http|https):\/\/)?(www\.)?twitter\.com\/(.*)/],
    [SocialMediaType.Instagram, /((http|https):\/\/)?(www\.)?instagram\.com\/(.*)/],
    [SocialMediaType.Facebook, /((http|https):\/\/)?(www\.)?facebook\.com\/(.*)/],
    [SocialMediaType.Vk, /((http|https):\/\/)?(www\.)?vk\.com\/(.*)/],
    [SocialMediaType.Discord, /((http|https):\/\/)?(www\.)?discord\.gg\/(.*)/],
    [SocialMediaType.Link, defaultRegExp],
]);

const urlValidatorByType = (type: SocialMediaType): RegExp => {
    const regExp = urlValidatorByTypeMap.get(type);
    if (regExp) return regExp;
    return defaultRegExp;
}