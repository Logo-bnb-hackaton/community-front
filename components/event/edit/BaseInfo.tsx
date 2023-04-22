import ImageUploader from "@/components/imageUploader/ImageUploader";
import Image from "next/image";
import discordIcon from "@/assets/social_media_logo/discord.svg";
import {ConfigProvider, Input, InputNumber, Select} from "antd";
import React from "react";
import styles from "@/styles/Event.module.css";
import {baseCoin, possibleTokens} from "@/components/donate/donate";

export class BaseInfoErrors {
    title: boolean;
    description: boolean;
    price: boolean;
    base64MainImg: boolean;
    base64PreviewImg: boolean;

    constructor(title: boolean, description: boolean, price: boolean, base64MainImg: boolean, base64PreviewImg: boolean) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.base64MainImg = base64MainImg;
        this.base64PreviewImg = base64PreviewImg;
    }
}

export function hasError(errors: BaseInfoErrors): boolean {
    return errors.title || errors.description || errors.price || errors.base64MainImg || errors.base64PreviewImg;
}

export class BaseInfoData {
    title: string;
    description: string;
    coin: string;
    price: number;
    base64MainImg: string | undefined;
    base64PreviewImg: string | undefined;

    constructor(
        title: string,
        description: string,
        coin: string,
        price: number,
        base64MainImg: string | undefined,
        base64PreviewImg: string | undefined
    ) {
        this.title = title;
        this.description = description;
        this.coin = coin;
        this.price = price;
        this.base64MainImg = base64MainImg;
        this.base64PreviewImg = base64PreviewImg;
    }
}

export default function BaseInfo(
    {
        data,
        setter,
        isLoading,
        errors = new BaseInfoErrors(false, false, false, false, false)
    }: {
        data: BaseInfoData,
        setter: (data: BaseInfoData) => void,
        isLoading: boolean,
        errors: BaseInfoErrors | undefined
    }) {

    const getErrorClassName = (flag: boolean): string => {
        return flag ? styles.eventError : '';
    }

    /**
     * Components
     */
    const availableCoinsSelector = () => {
        return (
            <Select defaultValue={baseCoin} style={{width: 200}}
                    onChange={value => setter({...data, coin: value})
                    }>
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
                        disabled={isLoading}
                        description={"Add main picture"}
                        sizeText={"1100 x 450 px"}
                        hasError={errors.base64MainImg}
                        edited={true}
                        base64Img={data.base64MainImg}
                        setBase64Img={img => setter({...data, base64MainImg: img})}
                    />
                </div>

                <div className={styles.eventEditBaseInfoTitleWrapper}>
                    <div className={styles.eventEditBaseInfoLogoWrapper}>
                        <Image src={discordIcon} alt={"Community logo"} style={{borderRadius: "20px"}} fill/>
                    </div>

                    <Input
                        disabled={isLoading}
                        className={`${styles.eventEditBaseInfoTitle} ${getErrorClassName(errors.title)}`}
                        placeholder={"Add title"}
                        value={data.title}
                        onChange={e => setter({...data, title: e.target.value})}
                    />
                </div>

                <div className={styles.eventEditBaseInfoSecondWrapper}>
                    <div className={styles.eventEditBaseInfoPreviewImageWrapper}>
                        <ImageUploader
                            disabled={isLoading}
                            description={"Add main picture"}
                            sizeText={"350 x 450 px"}
                            hasError={errors.base64PreviewImg}
                            edited={true}
                            base64Img={data.base64PreviewImg}
                            setBase64Img={img => setter({...data, base64PreviewImg: img})}
                        />
                    </div>

                    <div className={styles.eventEditBaseInfoDescriptionWrapper}>
                        <div className={styles.eventEditBaseInfoPriceWrapper}>
                            <InputNumber
                                className={`${getErrorClassName(errors.price)}`}
                                disabled={isLoading}
                                style={{width: "100%"}}
                                type="number"
                                controls={false}
                                value={data.price}
                                min={0} max={Number.MAX_SAFE_INTEGER}
                                addonAfter={availableCoinsSelector()}
                                placeholder="Please enter a donation amount"
                                onChange={value => setter({...data, price: value ? value : 0.0})}
                            />
                        </div>

                        {/* todo don't use bold font here */}
                        <Input.TextArea
                            disabled={isLoading}
                            className={`${styles.eventEditBaseInfoDescription} ${getErrorClassName(errors.description)}`}
                            // can't move it to classname, because it doesn't work
                            style={{resize: "none", height: "100vh",}}
                            placeholder={"Add description"}
                            value={data.description}
                            onChange={e => setter({...data, description: e.target.value})}
                        />
                    </div>

                </div>
            </ConfigProvider>
        </>
    );
}