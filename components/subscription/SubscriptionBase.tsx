import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import Image from "next/image";
import telegramIcon from "@/assets/social_media_logo/telegram.svg";
import {DeleteOutlined, EditOutlined, ShareAltOutlined} from "@ant-design/icons";
import {useRouter} from "next/router";
import CustomButton from "@/components/customButton/CustomButton";
import React from "react";

export interface BriefProfile {
    id: string,
    title: string,
    logo: {
        id: string,
        base64Image: string
    }
}

export default function SubscriptionBase({
                                             subscription,
                                             profile
                                         }: { subscription: UpdateSubscriptionDTO, profile: BriefProfile }) {
    const router = useRouter()

    const isOwner = () => subscription.ownerId === profile.id;

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
                        onClick={() => {
                            console.log(`share ${subscription.id}`)
                        }}
                    >
                        <ShareAltOutlined style={{width: '25px'}}/>
                    </CustomButton>
                    {isOwner() && <CustomButton
                        color={"gray"}
                        style={{minWidth: '55px', height: '55px', marginRight: '16px'}}
                        onClick={() => router.push(`/subscription/${subscription.id}?edited=true&profileId=${profile.id}`)}
                    >
                        <EditOutlined style={{width: '25px'}}/>
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
                        <DeleteOutlined style={{width: '25px', color: '#EA5858'}}/>
                    </CustomButton>
                    }
                </div>
            </div>

            <div style={{marginTop: '30px'}}>
                <CustomButton
                    type="wide"
                    color={"green"}
                    onClick={() => {
                    }}
                >
                    Subscribe {subscription.price} {subscription.coin.toUpperCase()}
                </CustomButton>
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
        </div>
    );
}
