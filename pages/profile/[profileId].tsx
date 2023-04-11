import {useRouter} from 'next/router'
import styles from "@/styles/Home.module.css";
import Logo from "@/components/logo/Logo";
import ReactMarkdown from "react-markdown";
import SocialMediaList, {SocialMediaLink, toSocialMediaLink} from "@/components/social_media_list/SocialMediaList";
import React, {useEffect, useState} from "react";
import Header from "@/components/header/Header";
import {Input} from "antd";
import textIcon from "@/assets/test_logo.jpeg";

const mockkProfile = [
    {
        id: "1",
        title: "CRYPTUS",
        description: "## Как заработать на криптовалюте?\nВы находитесь в правильном месте, если задали себе этот вопрос. Инвестиции в криптовалюту, заработок на **криптовалюте**  - в скором времени вы изучите все про эти темы.\n",
        logoUrl: textIcon.src,
        socialLinks: [
            "https://www.youtube.com/@CRYPTUSMEDIA",
            "https://t.me/CRYPTUS_CHAT",
            "https://twitter.com/CryptusMedia"
        ]
    }
];

class ProfileError {
    logo: boolean;
    title: boolean;
    description: boolean;
    socialMediaLinks: boolean;

    constructor(logo: boolean, title: boolean, description: boolean, socialMediaLinks: boolean) {
        this.logo = logo;
        this.title = title;
        this.description = description;
        this.socialMediaLinks = socialMediaLinks;
    }
}

const MAX_DESCRIPTION_LEN = 250;

const Profile = () => {

    const router = useRouter()
    const {profileId} = router.query

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")
    const [logoUrl, setLogoUrl] = useState<string>();
    const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([])
    const [edited, setEdited] = useState(false)

    const [profileError, setProfileError] = useState<ProfileError | undefined>(undefined)

    useEffect(() => {
        if (!profileId) return;
        const profile = mockkProfile.filter(item => item.id === profileId)[0];
        toSocialMediaLink("https://twitter.com/CryptusMedia");
        if (profile) {
            setTitle(profile.title);
            setDescription(profile.description);
            setLogoUrl(profile.logoUrl);
            setSocialLinks(profile.socialLinks.map(link => toSocialMediaLink(link)));
        }
    }, [profileId]);

    const saveCallback = () => {
        console.log("Save profile callback....");

        const hasLogoError = !logoUrl;
        const hasTitleError = !title;
        const hasDescriptionError = !description || description.length > MAX_DESCRIPTION_LEN;
        const hasSocialLinksError = socialLinks.length === 0;

        if (
            hasLogoError ||
            hasTitleError ||
            hasDescriptionError ||
            hasSocialLinksError
        ) {
            const error = new ProfileError(hasLogoError, hasTitleError, hasDescriptionError, hasSocialLinksError);
            console.log(`Has error`);
            console.log(error);
            setProfileError(error);
            return false;
        }

        setEdited(false);
        setProfileError(undefined);
        console.log(socialLinks);
        console.log(logoUrl);
        return true;
    }

    const socialLinkHandler = (links: SocialMediaLink[]) => {
        setSocialLinks(links);
        if (profileError) {
            setProfileError(
                new ProfileError(
                    profileError.logo, profileError.title, profileError.description, false
                )
            );
        }
    }

    const titleInputHandler = (e: any) => {
        setTitle(e.target.value);
        if (profileError) {
            setProfileError(
                new ProfileError(
                    profileError.logo, false, profileError.description, profileError.socialMediaLinks
                )
            );
        }
    }

    const descriptionInputHandler = (e: any) => {
        setDescription(e.target.value);
        if (profileError) {
            setProfileError(
                new ProfileError(
                    profileError.logo, profileError.title, false, profileError.socialMediaLinks
                )
            );
        }
    }

    const logoDraggerHandler = (url: string) => {
        setLogoUrl(url);
        if (profileError) {
            setProfileError(
                new ProfileError(
                    false, profileError.title, profileError.description, profileError.socialMediaLinks
                )
            );
        }
    }

    return (
        <main className={styles.main}>
            <Header profileId={profileId as string} saveCallback={saveCallback} edited={edited} setEdited={setEdited}/>

            <div className={styles.center} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <div className={styles.grid}>
                    <Logo logoUrl={logoUrl} setLogoUrl={logoDraggerHandler} edited={edited}
                          hasError={profileError && profileError.logo}/>
                    <div className={styles.profileDescription} style={{gridArea: "description"}}>
                        {
                            edited ?
                                <Input
                                    status={profileError && profileError.title ? "error" : ""}
                                    className={styles.titleInput}
                                    placeholder="Community name"
                                    value={title}
                                    onChange={titleInputHandler}/> :
                                <p className={styles.title}>{title}</p>
                        }

                        <div style={{/*padding: "42px 0",*/ maxWidth: "100%", maxHeight: "100%"}}>
                            {
                                edited ?
                                    <Input.TextArea
                                        status={profileError && profileError.description ? "error" : ""}
                                        value={description}
                                        onChange={descriptionInputHandler}
                                        autoSize={{minRows: 6, maxRows: 6}}
                                        placeholder={`Community description. Max length is ${MAX_DESCRIPTION_LEN} characters.`}
                                    /> :
                                    <ReactMarkdown className={styles.lineBreak}>{description}</ReactMarkdown>
                            }
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "20px"
                        }}>
                            <SocialMediaList socialMediaLinks={socialLinks} setSocialLinks={socialLinkHandler}
                                             edited={edited} hasError={profileError && profileError.socialMediaLinks}/>
                        </div>
                    </div>
                    <button className={`${styles.payButton} ${styles.donateButton}`}>DONATE</button>
                </div>
            </div>
        </main>
    );
}

export default Profile