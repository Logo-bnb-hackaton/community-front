import {useRouter} from 'next/router'
import styles from "@/styles/Home.module.css";
import Logo from "@/components/logo/Logo";
import ReactMarkdown from "react-markdown";
import SocialMediaList, {SocialMediaLink, toSocialMediaLink} from "@/components/social_media_list/SocialMediaList";
import React, {useEffect, useState} from "react";
import Header from "@/components/header/Header";
import {Button, Input, Skeleton} from "antd";
import axios from "axios";
import {readContracts, useAccount, useContractRead} from "wagmi";
import {ABI, CONTRACT_ADDRESS} from "@/constants";
import Donate, {addressBySymbol, baseCoin, possibleTokens, symbolByAddress} from "@/components/donate/donate";
import {prepareWriteContract, waitForTransaction, writeContract} from "@wagmi/core";
import {FileAddOutlined, LoadingOutlined} from "@ant-design/icons";
import {subscriptions} from "@/pages/subscription/[subscriptionId]";

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
const BACKEND_BASE_URL = 'https://jr6v17son2.execute-api.us-east-1.amazonaws.com/dev';

export default function Profile() {

    const {address, isConnected} = useAccount();

    const router = useRouter()
    const {profileId} = router.query

    const [editAvailable, setEditAvailable] = useState(false);
    const [profileOwner, setProfileOwner] = useState<string | undefined>(undefined);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")

    const [logoId, setLogoId] = useState<string>();
    const [base64Logo, setBase64Logo] = useState<string>();
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
    const [edited, setEdited] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    const [isAvailableTokensLoading, setIsAvailableTokensLoading] = useState(false);
    const [processingToken, setProcessingToken] = useState<string | undefined>(undefined);
    const [availableTokens, setAvailableTokens] = useState<string[]>([]);

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
            const owner = ownerAddress as string;
            setProfileOwner(owner);
            if (isConnected && address === owner) {
                setEditAvailable(true);
                return;
            }
            setEditAvailable(false);
        }
    }, [ownerAddress, isOwnerLoadingSuccess]);

    useEffect(() => {
        try {
            setIsProfileLoading(true);
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
                        setIsProfileLoading(false);
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
                    setIsProfileLoading(false);
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

    /**
     * Read available tokens
     */
    useEffect(() => {
        loadAvailableTokens()
    }, [profileId]);

    const loadAvailableTokens = async () => {
        setIsAvailableTokensLoading(true);
        const baseConfig = {
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'donateTokenAddressesByAuthor',
        };
        const batchSize = 10;
        return readContracts({
            // todo idk how to fix it in 5 min
            // @ts-ignore
            contracts:
                Array(batchSize).fill(1)
                    .map((one, index) => {
                            return {
                                ...baseConfig,
                                args: [profileId, index]
                            }
                        }
                    )
        })
            .then(data => {
                const tokens = data.filter(item => item).map(address => symbolByAddress.get(address as `0x${string}`)) as string[];
                setAvailableTokens(tokens);
            })
            .finally(() => setIsAvailableTokensLoading(false));
    }

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

        await axios({
            method: 'post',
            url: `${BACKEND_BASE_URL}/profile/update`,
            data: {
                id: profileId,
                title: title,
                description: description,
                logoId: logoId,
                logo: logoId ? undefined : base64Logo, // if nothing change don't send image again
                socialMediaLinks: socialMediaLinks.map(link => link.link)
            },
        });
        return true;
    }

    const socialLinkHandler = (links: SocialMediaLink[]) => {
        setSocialMediaLinks(links);
        if (profileError) setProfileError({...profileError, socialMediaLinks: false});
    }

    const titleInputHandler = (e: any) => {
        setTitle(e.target.value);
        if (profileError) setProfileError({...profileError, title: false});
    }

    const descriptionInputHandler = (e: any) => {
        setDescription(e.target.value);
        if (profileError) setProfileError({...profileError, description: false});
    }

    const logoDraggerHandler = (base64Logo: string | undefined) => {
        setLogoId(undefined);
        setBase64Logo(base64Logo);
        if (profileError) setProfileError({...profileError, logo: false});
    }

    const enableOrDisableToken = async (tokenSymbol: string) => {
        setIsAvailableTokensLoading(true);
        setProcessingToken(tokenSymbol);
        try {
            const tokenAddress = addressBySymbol.get(tokenSymbol)!!;
            const enabled = availableTokens.find(token => token === tokenSymbol) !== undefined;

            const functionName = enabled ? 'removeDonateAddress' : 'addDonateAddress';
            console.log(`functionName: ${functionName}`);
            const config = await prepareWriteContract({
                address: CONTRACT_ADDRESS,
                abi: ABI,
                functionName: functionName,
                args: [tokenAddress, profileId]
            })
            const {hash} = await writeContract(config);
            await waitForTransaction({hash: hash});

            await loadAvailableTokens();
        } catch (e) {
            console.error(e);
        } finally {
            setIsAvailableTokensLoading(false);
            setProcessingToken(undefined);
        }
    }

    return (
        <main className={styles.main}>
            <Header
                isProfileLoading={isProfileLoading}
                saveCallback={saveCallback}
                edited={edited}
                editAvailable={editAvailable}
                setEdited={setEdited}
                disabled={isAvailableTokensLoading}
            />

            <div className={styles.center} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <div className={styles.grid}>
                    {
                        isProfileLoading ?
                            <Skeleton.Avatar active shape={"square"}
                                             style={{width: "100%", height: "100%", borderRadius: "30px"}}/> :
                            <Logo base64Logo={base64Logo}
                                  setBase64Logo={logoDraggerHandler}
                                  edited={edited}
                                  hasError={profileError && profileError.logo}
                            />
                    }

                    {isProfileLoading ?
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
                        edited ?
                            <div style={{
                                gridArea: "donate",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}>
                                <Button
                                    key={baseCoin}
                                    disabled={true}
                                    className={`${styles.payButton}`}
                                    style={{width: "22%", backgroundColor: "#DBFCAC"}}
                                    onClick={e => {
                                    }}
                                >{baseCoin.toUpperCase()}</Button>
                                {
                                    possibleTokens.map(item => item.symbol).map(symbol =>
                                        <Button
                                            disabled={isAvailableTokensLoading}
                                            key={symbol}
                                            className={`
                                            ${styles.payButton} 
                                            ${availableTokens.find(t => t === symbol) === undefined ? styles.notSelectedToken : ""}`}
                                            style={{width: "22%"}}
                                            onClick={e => enableOrDisableToken(symbol)}
                                        >{symbol.toUpperCase()} {symbol === processingToken ?
                                            <LoadingOutlined/> : ""}</Button>
                                    )
                                }
                            </div>
                            :
                            <Donate isLoading={isProfileLoading} profileId={profileId as string}
                                    availableTokens={availableTokens}/>
                    }

                </div>
                {editAvailable && !isProfileLoading &&
                    <Button
                        disabled={!isConnected}
                        className={`${styles.payButton}`}
                        style={{width: "100%", height: "100px", backgroundColor: "#f5f5f5", marginTop: "48px"}}
                        onClick={() => router.push("/subscription/create")}
                    >Add subscription <FileAddOutlined/></Button>
                }
                <div>
                    <h1>Subs</h1>
                    {
                        subscriptions.map(s => <h2 key={s.id}>{s.id}</h2>)
                    }
                </div>
            </div>
        </main>
    );
}
