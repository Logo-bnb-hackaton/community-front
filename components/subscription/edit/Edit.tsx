import styles from "@/styles/Subscription.module.css";
import {Button, message, Steps} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
// @ts-ignore
import {parse as uuidParse, v4 as uuidv4} from 'uuid';
import {ethers} from "ethers";
import {SubscriptionStatus, UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import {baseCoin} from "@/utils/tokens";

import * as Api from '@/api'
import BaseInfo, {BaseInfoData, BaseInfoErrors, hasError} from "@/components/subscription/edit/BaseInfo";
import {BriefProfile} from "@/components/subscription/SubscriptionBase";

// todo maybe extract it later
function toBaseInfoData(dto: UpdateSubscriptionDTO): BaseInfoData {
    return {
        title: dto.title,
        description: dto.description,
        mainImage: dto.mainImage,
        previewImage: dto.previewImage,
        price: Number.parseFloat(dto.price),
        coin: dto.coin,
    }
}

interface Props {
    data: UpdateSubscriptionDTO | undefined;
    profile: BriefProfile
}

const Edit: React.FC<Props> = ({data ,profile}) => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [baseInfoData, setBaseInfoData] = useState<BaseInfoData>(
        {
            title: '',
            description: '',
            mainImage: undefined,
            previewImage: undefined,
            price: 0.0,
            coin: baseCoin,
        }
    );

    useEffect(() => {
        if (!data) return;
        setBaseInfoData(toBaseInfoData(data));
    }, [data]);

    /**
     * Errors are undefined before calling 'next'
     */
    const [errors, setErrors] = useState<BaseInfoErrors | undefined>(undefined);

    const next = async () => {
        if (currentStep === 0) {
            await saveSubscriptionDraft(data?.id, data?.status, baseInfoData)
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    useEffect(() => {
        errors && isValid(baseInfoData, errors);
    }, [errors, baseInfoData]);

    const hasChanges = (data: UpdateSubscriptionDTO, baseInfo: BaseInfoData) => {
        return JSON.stringify(toBaseInfoData(data)) !== JSON.stringify(baseInfo);
    }

    /**
     * Save subscription
     */
    const saveSubscriptionDraft = async (
        oldId: string | undefined,
        status: SubscriptionStatus | undefined,
        baseInfo: BaseInfoData | undefined
    ) => {
        setIsLoading(true);
        try {
            if (!isValid(baseInfo, errors)) return;
            if (data && !hasChanges(data, baseInfo!!)) {
                setCurrentStep(old => old + 1);
                return;
            }

            const isNewSub = oldId === undefined;

            const id: string = isNewSub ? ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uuidv4())) : oldId!!;
            const price = baseInfo!!.price.toString();
            const ethersPrice = ethers.utils.parseEther(price);

            await Api.subscription.updateSubscription({
                id: id,
                ownerId: profile!!.id,
                status: isNewSub ? 'DRAFT' : status!!,
                title: baseInfo!!.title,
                description: baseInfo!!.description,
                mainImage: {
                    id: baseInfo?.mainImage?.id,
                    base64Image: baseInfo?.mainImage?.base64Image,
                },
                previewImage: {
                    id: baseInfo?.previewImage?.id,
                    base64Image: baseInfo?.previewImage?.base64Image,
                },
                price: price,
                coin: baseInfo!!.coin,
            });

            // if (isNewSub) {
            //     await Contract.subscription.createNewSubscriptionByEth(id, profileId, ethersPrice);
            // }

            setCurrentStep(old => old + 1);
        } finally {
            setIsLoading(false);
        }
    }

    const isValid = (data: BaseInfoData | undefined, errors: BaseInfoErrors | undefined): boolean => {
        const updatedErrors: BaseInfoErrors = !errors ? {
            title: false,
            description: false,
            price: false,
            base64MainImg: false,
            base64PreviewImg: false,
        } : errors;

        updatedErrors.title = !data || data.title.trim().length === 0;
        updatedErrors.description = !data || data.description.trim().length === 0 || data.description.length > 2000;
        updatedErrors.price = !data || data.price <= 0;
        updatedErrors.base64MainImg = !data || !data.mainImage || !data.mainImage.base64Image;
        updatedErrors.base64PreviewImg = !data || !data.previewImage || !data.previewImage.base64Image;

        setErrors(updatedErrors);
        return !hasError(updatedErrors);
    }

    /**
     * Steps
     */
    const steps = [
        {
            title: 'Step 1',
            content: <BaseInfo
                data={baseInfoData}
                profile={profile}
                setter={setBaseInfoData}
                isLoading={isLoading}
                errors={errors}/>,
        },
        {
            title: 'Step 2',
            content: <p>Tg integration</p>,
        },
    ];

    const items = steps.map((item) => (
        {
            key: item.title,
            title: item.title,
            className: styles.eventStepTitle
        }
    ));

    return (
        <div className={styles.eventWrapper}>
            <div style={{width: "100%"}}>
                <p className={styles.eventEditTitle}>SUBSCRIPTION EDITING</p>
                <Steps
                    size="default"
                    className={styles.eventSteps}
                    current={currentStep}
                    items={items}
                />

                <div>{steps[currentStep].content}</div>

                <div className={styles.eventButtonWrapper}>
                    {currentStep < steps.length - 1 && (
                        <Button disabled={isLoading} type="primary" onClick={() => next()}>
                            {data?.id ? "Update" : "Create"} {isLoading && <LoadingOutlined/>}
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button disabled={isLoading} type="primary"
                                onClick={() => {
                                    message.success('Processing complete!');
                                    router.push(`/profile/${data!!.id}`);
                                }}>
                            Done
                        </Button>
                    )}
                    {currentStep > 0 && (
                        <Button disabled={isLoading} style={{margin: '0 8px'}} onClick={() => prev()}>
                            Previous
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Edit;