import styles from "@/styles/Event.module.css";
import {Button, message, Steps} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import {subscriptions} from "@/pages/subscription/[subscriptionId]";
import React, {useEffect, useState} from "react";
import BaseInfo, {BaseInfoData, BaseInfoErrors, hasError} from "@/components/event/edit/BaseInfo";
import {useRouter} from "next/router";
import {baseCoin} from "@/components/donate/donate";

export default function Edit({data: topLvlData}: { data: BaseInfoData | undefined }) {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<BaseInfoData>(
        new BaseInfoData(undefined, '', '', baseCoin, 0, undefined, undefined)
    );

    useEffect(() => {
        if (!topLvlData) return;
        setData(topLvlData);
        setCurrentStep(1);
    }, [topLvlData]);

    /**
     * Errors are undefined before calling 'next'
     */
    const [errors, setErrors] = useState<BaseInfoErrors | undefined>(undefined);

    const next = async () => {
        if (currentStep === 0) {
            await saveSubscriptionDraft(data);
        }
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    useEffect(() => {
        console.log(`effect`);
        console.log(errors);
        console.log(data);
        errors && validate(data, errors);
    }, [errors, data])

    /**
     * Save subscription
     */
    const saveSubscriptionDraft = async (data: BaseInfoData | undefined) => {
        setIsLoading(true);
        try {
            if (!validate(data, errors)) return;
            const id = subscriptions.length.toString();
            subscriptions.push({...data, id: id} as BaseInfoData);
            router.push(`/subscription/${id}?edited=true`);
        } finally {
            setIsLoading(false);
        }
    }

    const validate = (data: BaseInfoData | undefined, errors: BaseInfoErrors | undefined): boolean => {
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
        updatedErrors.base64MainImg = !data || !data.base64MainImg;
        updatedErrors.base64PreviewImg = !data || !data.base64PreviewImg;

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
                data={data}
                setter={setData}
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
                            Next {isLoading && <LoadingOutlined/>}
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button disabled={isLoading} type="primary"
                                onClick={() => {
                                    message.success('Processing complete!');
                                    router.push(`/subscription/${subscriptions.length}`);
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