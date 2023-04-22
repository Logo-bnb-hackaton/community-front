import React, {useEffect, useState} from "react";

import {Button, message, Steps} from "antd";
import styles from "@/styles/Event.module.css";
import BaseInfo, {BaseInfoData, BaseInfoErrors, hasError} from "@/components/event/edit/BaseInfo";
import {baseCoin} from "@/components/donate/donate";
import {LoadingOutlined} from "@ant-design/icons";

export default function EditEvent() {

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [subscriptionData, setSubscriptionData] = useState(new BaseInfoData('', '', baseCoin, 0, undefined, undefined));

    /**
     * Errors are undefined before calling 'next'
     */
    const [errors, setErrors] = useState<BaseInfoErrors | undefined>(undefined);

    const next = async () => {
        if (currentStep === 0) {
            await saveSubscriptionDraft(subscriptionData);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    useEffect(()=>{
        errors && validate(subscriptionData);
    }, [errors, subscriptionData])

    /**
     * Save subscription
     */

    const saveSubscriptionDraft = async (data: BaseInfoData) => {
        setIsLoading(true);
        try {
            if (!validate(data)) return;
            console.log('data is ok')
        } finally {
            setIsLoading(false);
        }
    }

    const validate = (data: BaseInfoData): boolean => {
        const errors: BaseInfoErrors = {
            title: data.title.trim().length === 0,
            description: data.description.trim().length === 0 || data.description.length > 2000,
            price: data.price <= 0,
            base64MainImg: !data.base64MainImg,
            base64PreviewImg: !data.base64PreviewImg,
        };
        setErrors(errors);
        console.log(errors);
        return !hasError(errors);
    }


    /**
     * Steps
     */
    const steps = [
        {
            title: 'Step 1',
            content: <BaseInfo
                data={subscriptionData}
                setter={setSubscriptionData}
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
                    <Button disabled={isLoading} type="primary" onClick={() => message.success('Processing complete!')}>
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
    );
}