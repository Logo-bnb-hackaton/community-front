import styles from "@/styles/Subscription.module.css";
import {message} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
// @ts-ignore
import {parse as uuidParse, v4 as uuidv4} from 'uuid';
import {ethers} from "ethers";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import {baseCoin} from "@/utils/tokens";

import * as Api from '@/api'

import BaseInfo, {BaseInfoData, BaseInfoErrors, hasError} from "@/components/subscription/edit/BaseInfo";
import {BriefProfile} from "@/components/subscription/Subscription";
import Integration from "@/components/subscription/integration/Integration";
import CustomButton from "@/components/customButton/CustomButton";
import {hasChanges} from "@/utils/compare";
import {ChatBindingStatus} from "@/api/dto/integration.dto";

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

const SubscriptionEdit: React.FC<Props> = ({data, profile}) => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    // this field contains top-level data to understand if there are changes
    // and updated after saving in db
    const [lastDbData, setLastDbData] = useState<UpdateSubscriptionDTO | undefined>(undefined);
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
        const inputData = toBaseInfoData(data);
        setBaseInfoData(inputData);
        setLastDbData(data);
    }, [data]);

    /**
     * Errors are undefined before calling 'next'
     */
    const [errors, setErrors] = useState<BaseInfoErrors | undefined>(undefined);

    const next = async () => {
        if (currentStep === 0) {
            await saveSubscriptionDraft(baseInfoData)
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

    /**
     * Save subscription
     */
    const saveSubscriptionDraft = async (
        baseInfo: BaseInfoData | undefined
    ) => {
        setIsLoading(true);
        try {
            if (!isValid(baseInfo, errors)) return;

            const oldId = lastDbData?.id;
            const isNewSub = oldId === undefined;
            const id: string = isNewSub ? ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uuidv4())) : oldId!!;
            const price = baseInfo!!.price.toString();
            const ethersPrice = ethers.utils.parseEther(price);

            if (lastDbData && hasChanges(toBaseInfoData(lastDbData), baseInfo!!)) {
                const request: UpdateSubscriptionDTO = {
                    id: id,
                    ownerId: profile!!.id,
                    status: isNewSub ? 'DRAFT' : lastDbData!!.status,
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
                };
                await Api.subscription.updateSubscription(request);
                setLastDbData(request);
            }

            // todo uncomment it later
            // todo fix logic later
            // if (isNewSub || lastDbData?.status === 'DRAFT') {
            //     await Contract.subscription.createNewSubscriptionByEth(id, profile!!.id, ethersPrice);
            //     await Api.subscription.updateSubscriptionStatus({id: id, status: 'UNPUBLISHED'});
            // } else if (price !== lastDbData?.price!!.toString()) {
            //     await Contract.subscription.updateSubscriptionTokenAndPrice(profile!!.id, ethersPrice);
            // }

            const chatDTO = await Api.integration.getChat(id);
            if (chatDTO.status === ChatBindingStatus.NOT_BINDED) {
                setCurrentStep(old => old + 1);
            }
        } catch (e) {
            console.error(e);
            console.error(`Catch error during updating subscription.`);
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
            title: 'Step 1: Subscription editing',
            content: <BaseInfo
                data={baseInfoData}
                profile={profile}
                setter={setBaseInfoData}
                isLoading={isLoading}
                errors={errors}/>,
        },
        {
            title: 'Step 2: Integration setup',
            content: <Integration
                subscriptionId={data!!.id as `0x${string}`} //todo fix late
                previousCallback={() => prev()}
                doneCallback={() => {
                    message.success('Processing complete!');
                    router.push(`/subscription/${lastDbData!!.id}`);
                }}/>,
        },
    ];

    return (
        <div className={styles.eventWrapper}>
            <div style={{width: "100%"}}>
                <p className={styles.eventEditTitle}>{steps[currentStep].title}</p>

                <div>{steps[currentStep].content}</div>

                <div className={styles.eventButtonWrapper}>
                    {currentStep === 0 && <CustomButton
                        style={{marginRight: '20px'}}
                        type={"small"}
                        color={"gray"}
                        disabled={isLoading}
                        onClick={() => router.push(`/profile/${profile!!.id}`)}>
                        Back to profile
                    </CustomButton>
                    }

                    {currentStep === 0 &&
                        <CustomButton
                            type={"small"}
                            color={"green"}
                            disabled={isLoading}
                            onClick={next}>
                            {data?.id ? "Update" : "Create"} {isLoading && <LoadingOutlined/>}
                        </CustomButton>
                    }
                </div>
            </div>
        </div>
    );
}

export default SubscriptionEdit;