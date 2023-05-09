import {SubscriptionStatus, UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import Image from "next/image";
import telegramIcon from "@/assets/social_media_logo/telegram.svg";
import {DeleteOutlined, EditOutlined, LoadingOutlined, ShareAltOutlined} from "@ant-design/icons";
import {useRouter} from "next/router";
import CustomButton from "@/components/customButton/CustomButton";
import React, {useState} from "react";
import {Input, Modal} from "antd";
import {ethers} from "ethers";
import * as Api from "@/api";
import * as Contract from "@/contract";

export interface BriefProfile {
    id: string,
    title: string,
    logo: {
        id: string,
        base64Image: string
    }
}

export default function Subscription({
                                         subscription,
                                         profile
                                     }: { subscription: UpdateSubscriptionDTO, profile: BriefProfile }) {
    const router = useRouter()

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const openCloseModal = () => setIsShareModalOpen(prev => !prev);

    const isOwner = () => subscription.ownerId === profile.id;

    const getPath = () => {
        const origin =
            typeof window !== 'undefined' && window.location.origin
                ? window.location.origin
                : '';

        return `${origin}${router.asPath}`;
    }


    const getButtonText = (status: SubscriptionStatus) => {
        switch (status) {
            case "DRAFT":
                return 'Continue editing';
            case "NOT_PAID":
                return 'Pay';
            case "BEFORE_PAY":
                return 'Check payment';
            case "UNPUBLISHED":
                return 'Publish';
            case "PUBLISHED":
                return 'Unpublish';
        }
    }

    const executeBaseOnSatus = (status: SubscriptionStatus) => {
        switch (status) {
            case "DRAFT":
                routeToEditing();
                return;
            case "NOT_PAID":
                pay();
                return;
            case "BEFORE_PAY":
                checkPayment();
                return;
            case "UNPUBLISHED":
                return 'Publish';
            case "PUBLISHED":
                return 'Unpublish';
        }
    }

    const routeToEditing = () => {
        router.push(`/subscription/${subscription.id}?edited=true&profileId=${profile.id}`);
    }

    const pay = async () => {
        try {
            setIsLoading(true);

            const ethersPrice = ethers.utils.parseEther(subscription.price);

            await Api.subscription.beforePay({id: subscription.id});
            await Contract.subscription.createNewSubscriptionByEth(subscription.id, profile!!.id, ethersPrice);
            await Api.subscription.afterPay({id: subscription.id});

            router.replace(router.asPath);
        } catch (e) {
            console.error('Catch error during pay');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div
            style={{
                width: '100%',
                marginTop: '80px'
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "450px"
                }}
            >
                <Image
                    src={subscription.mainImage.base64Image!!}
                    alt={'Subscription main image'}
                    style={{borderRadius: "20px"}}
                    fill
                />
            </div>

            <div
                style={{
                    paddingTop: '32px',
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: 'space-between',
                    alignItems: "center",
                    fontSize: '32px',
                    fontFamily: 'co-headline',
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: '64px',
                            height: '64px',
                            cursor: "pointer"
                        }}
                        onClick={e => router.push(`/profile/${profile.id}`)}
                    >
                        <Image
                            src={profile.logo.base64Image}
                            alt={'Profile image'}
                            style={{borderRadius: "20px"}}
                            fill
                        />
                    </div>
                    <p style={{paddingLeft: '18px'}}>{profile.title}</p>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <p style={{paddingRight: '18px'}}>WHERE:</p>
                    <div
                        style={{
                            position: "relative",
                            width: '64px',
                            height: '64px',
                        }}
                    >
                        <Image
                            src={telegramIcon}
                            alt={'Social media image'}
                            style={{borderRadius: "20px"}}
                            fill
                        />
                    </div>
                </div>
            </div>

            <div
                style={{
                    paddingTop: '30px',
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                <p style={{fontSize: '48px', fontFamily: 'co-headline'}}>
                    {subscription.title}
                </p>
                <div>
                    <CustomButton
                        color={"gray"}
                        style={{minWidth: '55px', height: '55px', marginRight: `${isOwner() ? '16px' : '0'}`}}
                        onClick={() => openCloseModal()}
                    >
                        <ShareAltOutlined style={{width: '32px'}}/>
                    </CustomButton>
                    {isOwner() && <CustomButton
                        color={"gray"}
                        style={{minWidth: '55px', height: '55px', marginRight: '16px'}}
                        onClick={routeToEditing}
                    >
                        <EditOutlined style={{width: '32px'}}/>
                    </CustomButton>
                    }
                    {isOwner() && <CustomButton
                        color={"gray"}
                        style={{minWidth: '55px', height: '55px', border: '2px solid #EA5858'}}
                        // todo fix it
                        onClick={() => {
                            console.log(`delete ${subscription.id}`)
                        }}
                    >
                        <DeleteOutlined style={{width: '32px', color: '#EA5858'}}/>
                    </CustomButton>
                    }
                </div>
            </div>

            <div style={{marginTop: '30px'}}>
                {!isOwner() &&
                    <CustomButton
                        type="wide"
                        color={"green"}
                        onClick={() => {
                        }}
                    >
                        Subscribe {subscription.price} {subscription.coin.toUpperCase()}
                    </CustomButton>
                }
                {
                    isOwner() &&
                    <CustomButton
                        disabled={isLoading}
                        type="wide"
                        color={"green"}
                        onClick={() => executeBaseOnSatus(subscription.status)}
                    >
                        {getButtonText(subscription.status)} {isLoading && <LoadingOutlined/>}
                    </CustomButton>
                }
            </div>

            <div
                style={{
                    margin: '50px 0',
                    width: '100%',
                    fontSize: '21px',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {subscription.description}
            </div>
            <Modal
                centered
                open={isShareModalOpen}
                onCancel={openCloseModal}
                footer={null}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: '32px',
                    width: '400px'
                }}>
                    <h3 style={{marginBottom: '32px'}}>Share the subscription</h3>
                    <div style={{width: '100%', display: "flex", flexDirection: "row", justifyContent: "center"}}>
                        <Input
                            style={{padding: '16px', width: '100%', marginRight: '20px'}}
                            readOnly
                            value={getPath()}
                            placeholder="Subscription link"
                        />
                        <CustomButton
                            type="small"
                            style={{minWidth: '100px', fontSize: '16px'}}
                            color={"green"}
                            onClick={() => {
                                navigator.clipboard.writeText(getPath())
                            }}
                        >Copy</CustomButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
