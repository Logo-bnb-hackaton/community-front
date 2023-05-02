import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import Image from "next/image";
import telegramIcon from "@/assets/social_media_logo/telegram.svg";
import {Button} from "antd";
import {ShareAltOutlined} from "@ant-design/icons";
import {useRouter} from "next/router";

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
                    paddingTop: '64px',
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
                    paddingTop: '24px',
                    fontSize: '48px',
                    fontFamily: 'co-headline',
                }}>
                <p>{subscription.title}</p>
            </div>

            <div
                style={{
                    marginTop: '48px',
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    gap: '0 24px',
                    height: '100px',
                }}
            >
                <Button style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#DBFCAC',
                    border: "none",
                    borderRadius: '20px',
                    fontSize: '48px',
                    fontFamily: 'co-headline',
                }}>
                    SUBSCRIBE 7,5 USDT
                </Button>
                <Button
                    style={{
                        width: '100px',
                        height: '100%',
                        backgroundColor: '#F5F5F5',
                        border: "none",
                        borderRadius: '20px',
                    }}>
                    <ShareAltOutlined style={{fontSize: '50px'}}/>
                </Button>
            </div>

            <div
                style={{
                    margin: '70px 0',
                    width: '100%',
                    fontSize: '24px',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {subscription.description}
            </div>
        </div>
    );
}
