import {useRouter} from 'next/router'
import styles from "@/styles/Home.module.css";
import Logo from "@/components/logo/Logo";
import ReactMarkdown from "react-markdown";
import SocialMediaList, {SocialMediaLink, toSocialMediaLink} from "@/components/social_media_list/SocialMediaList";
import React, {useEffect, useState} from "react";
import Header from "@/components/header/Header";
import {Button, Input, Modal, Result, Skeleton, Steps} from "antd";
import axios from "axios";
import {useAccount, useContractRead} from "wagmi";
import {ethers} from "ethers";
import {ABI, CONTRACT_ADDRESS} from "@/constants";
import {prepareWriteContract, waitForTransaction, writeContract} from "@wagmi/core";
import {StepProps} from "antd/es/steps";
import {LoadingOutlined} from "@ant-design/icons";
import {ResultStatusType} from "antd/es/result";

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

const defaultDonateSteps: StepProps[] = [
    {
        title: 'Set donate size',
        status: "process",
        icon: undefined
    },
    {
        title: 'Approving',
        status: "wait",
        icon: undefined
    },
    {
        title: 'Verification',
        status: "wait",
        icon: undefined
    },
    {
        title: 'Done',
        status: "wait",
        icon: undefined
    },
]
// deep copy
const defaultDonateStepsJson = JSON.stringify(defaultDonateSteps);
const getDefaultDonateSteps = () => JSON.parse(defaultDonateStepsJson);

const MAX_DESCRIPTION_LEN = 250;

const Profile = () => {

    const {address, isConnected} = useAccount();

    const router = useRouter()
    const {profileId} = router.query

    const [profileOwner, setProfileOwner] = useState<string | undefined>(undefined);
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
                if (res.data.status == "error") {
                    router.push("/");
                    return;
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
                    setLogoUrl(profile.logo);
                    setSocialMediaLinks(profile.socialMediaLinks.map(link => toSocialMediaLink(link)));
                    setIsLoading(false);
                } else {
                    router.push("/");
                }
            });
        } catch (e) {
            console.error(`Catch error: ${e}`);
            return;
        }
    }, [profileId]);

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

    const [isDonateMenuOpen, setIsDonateMenuOpen] = useState(false);
    const [isDonating, setIsDonating] = useState(false);
    const [donateStep, setDonateStep] = useState<number>(0);
    const [donateSteps, setDonateSteps] = useState<StepProps[]>(getDefaultDonateSteps())
    const [donateSize, setDonateSize] = useState<string>("0.001");
    const [donateResult, setDonateResult] = useState<{ status: ResultStatusType, title: string } | undefined>(undefined);

    const openDonateMenu = () => {
        setIsDonateMenuOpen(true)
    };
    const closeDonateMenu = () => {
        setIsDonateMenuOpen(false);
        setDonateStep(0);
        setDonateSteps(getDefaultDonateSteps());
        setDonateResult(undefined);
    };

    const setCurrentStepAndStatus = (stepIndex: number, status: 'wait' | 'process' | 'finish' | 'error') => {
        setDonateStep(stepIndex);
        setDonateSteps(
            [...donateSteps.filter((item, index) => {
                if (index === stepIndex) {
                    item.status = status;
                    if (status == 'process') {
                        item.icon = <LoadingOutlined/>
                    }
                } else if (index < stepIndex) {
                    item.icon = undefined;
                }
                return item;
            })]
        );
    }
    const donate = async () => {
        // todo validate donateSize type and value
        setDonateResult(undefined);
        const value = ethers.utils.parseEther(donateSize.toString());

        const donateEthConfig = await prepareWriteContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'donateEth',
            args: [profileId],
            overrides: {
                value: value
            }
        });

        try {
            setCurrentStepAndStatus(1, 'process');
            setIsDonating(true);
            let donateResult = await writeContract(donateEthConfig);
            setCurrentStepAndStatus(2, 'process');
            console.log(`Donate hash: ${donateResult.hash}`);
            await waitForTransaction({
                hash: donateResult.hash
            });
            setCurrentStepAndStatus(3, 'finish');
            setDonateResult({
                status: "success",
                title: "Thanks for the donation!"
            });
        } catch (e) {
            console.log("set default steps");
            setDonateSteps(getDefaultDonateSteps());
            setDonateStep(0);
            setDonateResult({
                status: "error",
                title: "Something went wrong!"
            });
        } finally {
            setIsDonating(false);
            console.log("Done");
        }
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
                            <Button
                                disabled={!isConnected}
                                className={`${styles.payButton} ${styles.donateButton}`}
                                onClick={openDonateMenu}
                            >DONATE</Button>
                    }
                    <Modal
                        width={"40vw"}
                        title="Donate"
                        centered
                        open={isDonateMenuOpen}
                        onOk={donate}
                        okButtonProps={{disabled: isDonating}}
                        cancelButtonProps={{disabled: isDonating}}
                        onCancel={closeDonateMenu}
                        okText={"Donate"}
                    >
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <Steps
                                style={{padding: "30px 10px"}}
                                size={"small"}
                                items={donateSteps}
                                current={donateStep}
                            />
                            <Input
                                disabled={isDonating}
                                value={donateSize}
                                addonAfter="BNB"
                                placeholder="Social media link"
                                onChange={e => setDonateSize(e.target.value as string)}
                            />

                            {donateResult &&
                                <Result
                                    status={donateResult.status}
                                    title={donateResult.title}
                                />
                            }
                        </div>
                    </Modal>
                </div>
            </div>
        </main>
    );
}

export default Profile