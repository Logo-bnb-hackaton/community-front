import {useRouter} from 'next/router'
import styles from "@/styles/Home.module.css";
import Logo from "@/components/logo/Logo";
import ReactMarkdown from "react-markdown";
import SocialMediaList, {SocialMediaLink, toSocialMediaLink} from "@/components/social_media_list/SocialMediaList";
import React, {useEffect, useState} from "react";
import Header from "@/components/header/Header";
import {Input, Skeleton} from "antd";
import axios from "axios";
import {useAccount, useContractRead} from "wagmi";
import {ABI, CONTRACT_ADDRESS} from "@/constants";
import Donate from "@/components/donate/donate";

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
    title: string;
    description: string;
    logoId: string;
    base64Logo: string;
    socialMediaLinks: string[];


    constructor(id: string, title: string, description: string, logoId: string, base64Logo: string, socialMediaLinks: string[]) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.logoId = logoId;
        this.base64Logo = base64Logo;
        this.socialMediaLinks = socialMediaLinks;
    }
}

const MAX_DESCRIPTION_LEN = 250;
// const BACKEND_BASE_URL = 'https://jr6v17son2.execute-api.us-east-1.amazonaws.com/dev';
const BACKEND_BASE_URL = 'http://localhost:8080';

export default function Profile() {

    const {address} = useAccount();

    const router = useRouter()
    const {profileId} = router.query

    const [profileOwner, setProfileOwner] = useState<string | undefined>(undefined);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")

    const [logoId, setLogoId] = useState<string>();
    const [base64Logo, setBase64Logo] = useState<string>();
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
    const [edited, setEdited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [profileError, setProfileError] = useState<ProfileError | undefined>(undefined)

    /**
     * Loading profile owner
     */
    const {data: ownerAddress, isSuccess: isOwnerLoadingSuccess} = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'ownerOf',
        args: [profileId]
    });

    useEffect(() => {
        if (isOwnerLoadingSuccess) {
            setProfileOwner(ownerAddress as string);
        }
    }, [ownerAddress, isOwnerLoadingSuccess]);

    useEffect(() => {
        try {
            setIsLoading(true);
            if (!profileId || !profileOwner) return;
            axios({
                method: 'post',
                url: `${BACKEND_BASE_URL}/profile/`,
                data: {
                    profileId: profileId.toString()
                },
            }).then(res => {
                if (res.data.status == "error") {
                    if (profileOwner !== address) {
                        router.push("/");
                        return;
                    } else {
                        setEdited(true);
                        setIsLoading(false);
                        return;
                    }
                }
                let profile;
                try {
                    profile = res.data.profile as ProfileRes;
                } catch (e) {
                    console.log("Can't cast response to profile.");
                    console.error(e);
                    profile = undefined;
                }
                if (profile) {
                    setTitle(profile.title);
                    setDescription(profile.description);
                    setLogoId(profile.logoId);
                    setBase64Logo(profile.base64Logo);
                    setSocialMediaLinks(profile.socialMediaLinks.map(link => toSocialMediaLink(link)));
                    setIsLoading(false);
                } else {
                    router.push("/");
                    return;
                }
            });
        } catch (e) {
            console.error(`Catch error: ${e}`);
            return;
        }
    }, [address, profileId, profileOwner, router]);

    const saveCallback = async () => {
        console.log("Save profile callback....");

        const hasLogoError = !base64Logo;
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
            setProfileError(error);
            return false;
        }

        setEdited(false);
        setProfileError(undefined);

        const req = {
            id: profileId,
            title: title,
            description: description,
            logoId: logoId,
            logo: logoId ? undefined : base64Logo, // if nothing change don't send image again
            socialMediaLinks: socialMediaLinks.map(link => link.link)
        }
        await axios({
            method: 'post',
            url: `${BACKEND_BASE_URL}/profile/update`,
            data: req,
        });
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

    const logoDraggerHandler = (base64Logo: string) => {
        setLogoId(undefined);
        setBase64Logo(base64Logo);
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

            <div className={styles.center} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <div className={styles.grid}>
                    {
                        isLoading ?
                            <Skeleton.Avatar active shape={"square"}
                                             style={{width: "100%", height: "100%", borderRadius: "30px"}}/> :
                            <Logo logoUrl={base64Logo}
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
                    <Donate isLoading={isLoading} profileId={profileId as string}/>

                </div>
            </div>
        </main>
    );
}
