import ImageUploader from "@/components/imageUploader/ImageUploader";
import Image from "next/image";
import discordIcon from "@/assets/social_media_logo/discord.svg";
import {ConfigProvider, Input, InputNumber, Select} from "antd";
import React, {useState} from "react";
import styles from "@/styles/Event.module.css";
import {baseCoin, possibleTokens} from "@/components/donate/donate";

export default function BaseInfo() {
    const [base64MainImg, setBase64MainImg] = useState<string>();
    const [base64PreviewImg, setBase64PreviewImg] = useState<string>();

    const [coin, setCoin] = useState<string>(baseCoin);
    const [price, setPrice] = useState<number>(0.0);

    /**
     * Components
     */
    const availableCoinsSelector = () => {
        return (
            <Select defaultValue={baseCoin} style={{width: 200}} onChange={setCoin}>
                <Select.Option key={baseCoin} value={baseCoin}>{baseCoin}</Select.Option>
                {
                    possibleTokens.map(token => {
                            return (
                                <Select.Option key={token.symbol} value={token.symbol}>{token.symbol}</Select.Option>
                            );
                        }
                    )
                }
            </Select>
        );
    }

    return (
        <>
            <ConfigProvider
                theme={{
                    token: {
                        controlHeight: 64,
                        borderRadius: 20,
                        paddingSM: 24,
                        fontSize: 24,
                        fontFamily: 'CoHeadlineCorp',
                    }
                }}
            >
                <div className={styles.eventEditBaseInfoMainImageWrapper}>
                    <ImageUploader
                        description={"Add main picture"}
                        sizeText={"1100 x 450 px"}
                        hasError={false}
                        edited={true}
                        base64Img={base64MainImg}
                        setBase64Img={setBase64MainImg}
                    />
                </div>

                <div className={styles.eventEditBaseInfoTitleWrapper}>
                    <div className={styles.eventEditBaseInfoLogoWrapper}>
                        <Image src={discordIcon} alt={"Community logo"} style={{borderRadius: "20px"}} fill/>
                    </div>

                    <Input placeholder={"Add title"} className={styles.eventEditBaseInfoTitle}/>
                </div>

                <div className={styles.eventEditBaseInfoSecondWrapper}>
                    <div className={styles.eventEditBaseInfoPreviewImageWrapper}>
                        <ImageUploader
                            description={"Add main picture"}
                            sizeText={"350 x 450 px"}
                            hasError={false}
                            edited={true}
                            base64Img={base64PreviewImg}
                            setBase64Img={setBase64PreviewImg}
                        />
                    </div>

                    <div className={styles.eventEditBaseInfoDescriptionWrapper}>
                        <div className={styles.eventEditBaseInfoPriceWrapper}>
                            <InputNumber
                                style={{width: "100%"}}
                                type="number"
                                controls={false}
                                // disabled={isDonating}
                                value={price}
                                max={Number.MAX_SAFE_INTEGER}
                                addonAfter={availableCoinsSelector()}
                                placeholder="Please enter a donation amount"
                                onChange={value => setPrice(value ? value : 0.0)}
                            />
                        </div>

                        {/* todo don't use bold font here */}
                        <Input.TextArea
                            className={styles.eventEditBaseInfoDescription}
                            // can't move it to classname, because it doesn't work
                            style={{resize: "none", height: "100vh",}}
                            placeholder={"Add description"}
                        />
                    </div>

                </div>
            </ConfigProvider>
        </>
    );
}