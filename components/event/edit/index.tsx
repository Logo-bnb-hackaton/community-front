import React, {useState} from "react";

import {Button, message, Steps} from "antd";
import styles from "@/styles/Event.module.css";
import BaseInfo from "@/components/event/edit/BaseInfo";

const steps = [
    {
        title: 'Step 1',
        content: <BaseInfo/>,
    },
    {
        title: 'Step 2',
        content: <p>Tg integration</p>,
    },
];
export default function EditEvent() {

    const [currentStep, setCurrentStep] = useState(0);

    const next = () => {
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

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
                    <Button type="primary" onClick={() => next()}>
                        Next
                    </Button>
                )}
                {currentStep === steps.length - 1 && (
                    <Button type="primary" onClick={() => message.success('Processing complete!')}>
                        Done
                    </Button>
                )}
                {currentStep > 0 && (
                    <Button style={{margin: '0 8px'}} onClick={() => prev()}>
                        Previous
                    </Button>
                )}
            </div>
        </div>
    );
}