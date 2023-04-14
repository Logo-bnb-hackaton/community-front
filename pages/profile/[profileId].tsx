import {useRouter} from 'next/router'
import styles from "@/styles/Home.module.css";
import Logo from "@/components/logo/Logo";
import ReactMarkdown from "react-markdown";
import SocialMediaList, {SocialMediaLink, toSocialMediaLink} from "@/components/social_media_list/SocialMediaList";
import React, {useEffect, useState} from "react";
import Header from "@/components/header/Header";
import {Input, Skeleton} from "antd";
import axios from "axios";

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

class ProfileRes {
    id: string;
    logo: string;
    title: string;
    description: string;
    socialMediaLinks: string[];


    constructor(id: string, logo: string, title: string, description: string, socialMediaLinks: string[]) {
        this.id = id;
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

    const [profileOwner, setProfileOwner] = useState("0xc0dEdbFD9224c8C7e0254825820CC706180259F2");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")
    const [logoUrl, setLogoUrl] = useState<string>();
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
    const [edited, setEdited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [profileError, setProfileError] = useState<ProfileError | undefined>(undefined)


    useEffect(() => {
        try {
            setIsLoading(true);
            if (!profileId) return;
            axios({
                method: 'post',
                url: "http://localhost:8080/profile/",
                data: {
                    profileId: profileId.toString()
                },
            }).then(res => {
                try {
                    if (res.data.status == "error") {
                        return;
                    }
                    const profile = res.data.profile as ProfileRes;
                    if (profile) {
                        // todo fix it
                        // setProfileOwner(profile.owner);
                        setTitle(profile.title);
                        setDescription(profile.description);
                        setLogoUrl(profile.logo);
                        setSocialMediaLinks(profile.socialMediaLinks.map(link => toSocialMediaLink(link)));
                    } else {
                        router.push("/");
                    }
                } finally {
                    setIsLoading(false);
                }
            });
        } catch (e) {
            console.error(`Catch error: ${e}`);
            return;
        }
    }, [profileId]);

    const saveCallback = async () => {
        console.log("Save profile callback....");

        const hasLogoError = !logoUrl;
        const hasTitleError = !title;
        const hasDescriptionError = !description || description.length > MAX_DESCRIPTION_LEN;
        const hasSocialLinksError = socialMediaLinks.length === 0;

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

        const req = {
            id: profileId,
            title: title,
            description: description,
            logo: logoUrl,
            socialMediaLinks: socialMediaLinks.map(link => link.link)
        }
        const rawResponse = await axios({
            method: 'post',
            url: "http://localhost:8080/profile/update",
            data: req,
        });

        console.log("rawResponse");
        console.log(rawResponse);
        return true;
    }

    const socialLinkHandler = (links: SocialMediaLink[]) => {
        setSocialMediaLinks(links);
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
            <Header profileOwner={profileOwner} saveCallback={saveCallback} edited={edited} setEdited={setEdited}/>

            {/*<button onClick={safeMint}>Safe mint</button>*/}
            <div className={styles.center} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <div className={styles.grid}>

                    {
                        isLoading ?
                            <Skeleton.Avatar active shape={"square"}
                                             style={{width: "100%", height: "100%", borderRadius: "30px"}}/> :
                            <Logo logoUrl={logoUrl}
                                  setLogoUrl={logoDraggerHandler}
                                  edited={edited}
                                  hasError={profileError && profileError.logo}
                            />
                    }

                    {isLoading ?
                        <Skeleton active className={styles.profileDescription}/> :
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

                            <div style={{maxWidth: "100%", maxHeight: "100%"}}>
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
                            <SocialMediaList socialMediaLinks={socialMediaLinks} setSocialLinks={socialLinkHandler}
                                             edited={edited}
                                             hasError={profileError && profileError.socialMediaLinks}/>

                        </div>
                    }

                    {
                        isLoading ?
                            <Skeleton.Button active className={styles.donateButton} shape={"square"}
                                             style={{height: "5rem", width: "100%"}}/> :
                            <button className={`${styles.payButton} ${styles.donateButton}`}>DONATE</button>
                    }

                </div>
            </div>
        </main>
    );
}

export default Profile