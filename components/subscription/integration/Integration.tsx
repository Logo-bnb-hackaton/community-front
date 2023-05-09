import React, {ReactNode, useState} from "react";
import {ConfigProvider, Input, Select} from "antd";
import styles from "@/styles/Subscription.module.css";
import Image from "next/image";
import heroIcon from "@/assets/Hero.png";
import CustomButton from "@/components/customButton/CustomButton";
import * as Api from '@/api'

enum Platform {
    Telegram = "Telegram",
}

interface Props {
    subscriptionId: `0x${string}`,
    previousCallback: () => void;
    doneCallback: () => void;
}

const Integration: React.FC<Props> = ({subscriptionId, previousCallback, doneCallback}) => {

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [platform, setPlatform] = useState<string>(Platform.Telegram.toString());
    const [code, setCode] = useState<string>('');
    const [tokenErrorMsg, setTokenErrorMsg] = useState<string | undefined>(undefined);

    const next = async () => {
        if (currentStep === 3) {
            if (!isCodeValid(code)) {
                setTokenErrorMsg('Please enter token!');
                return;
            }

            try {
                setIsLoading(true);
                console.log(`Bind tg: ${subscriptionId}, ${code}`)
                const res = await Api.integration.bindTelegram(subscriptionId, code);
                console.log(res);
                if (res.error?.message !== undefined) {
                    setTokenErrorMsg(res.error!!.message);
                    return;
                }
            } finally {
                setIsLoading(false);
            }
            setCurrentStep(currentStep + 1);
            return;
        } else {
            setTokenErrorMsg(undefined);
            setCurrentStep(currentStep + 1);
        }
    };

    const prev = () => {
        setTokenErrorMsg(undefined);
        if (currentStep === 0) {
            previousCallback();
            return;
        }
        setCurrentStep(currentStep - 1);
    };

    const onCodeChange = (token: string) => {
        setCode(token);
        setTokenErrorMsg(!isCodeValid(token) ? 'Please enter token!' : undefined);

    }

    const isCodeValid = (token: string): boolean => {
        return token !== undefined && token !== null && token.trim().length !== 0;
    }


    /**
     * Component
     */
    const generateStep = (step: number, title: string, descriptionItems: string[], child: ReactNode | undefined = undefined) => {
        return (
            <div className={styles.integrationStepWrapper}>
                <div className={styles.integrationStepIndex}>
                    {step}
                </div>

                <div className={styles.integrationStepContentWrapper}>
                    <div className={styles.integrationStepTitleWrapper}>
                        <h3>{title}</h3>
                    </div>
                    <div>
                        <div className={styles.integrationStepDescriptionWrapper}>
                            <ul>
                                {descriptionItems.map((text, index) => {
                                    return (
                                        <>
                                            {index !== 0 ? <br/> : <></>}
                                            <li>{text}</li>
                                        </>
                                    );
                                })}
                            </ul>

                            <div className={styles.integrationStepHero}>
                                <Image src={heroIcon} alt={"Hero img"} fill/>
                            </div>
                        </div>
                    </div>
                    {child && child}
                </div>
            </div>
        );
    }

    const firstAndSecondStep = () => {
        return (
            <>
                <div className={styles.integrationStepWrapper}>
                    <div className={styles.integrationStepIndex}>1
                    </div>

                    <Select
                        defaultValue={Platform.Telegram.toString()}
                        style={{width: '940px', marginLeft: '24px'}}
                        onChange={value => setPlatform(value)}
                    >
                        <Select.Option key={Platform.Telegram.toString()}
                                       value={Platform.Telegram.toString()}>{Platform.Telegram.toString()}</Select.Option>
                    </Select>
                </div>
                {
                    generateStep(2, 'Activate the @Nodde_Bot',
                        [
                            'To activate the @Nodde_Bot, go to Telegram and search for it by name in the search bar. Click on the bot\'s icon to go to its page.',
                            'Press the "Start" button on the bot\'s page.'
                        ])
                }
            </>
        );
    }

    const thirdStep = () => {
        return generateStep(
            3,
            'Add the bot to your private channel',
            [
                'Invite @Nodde_Bot to your private channel. To do this, go to the channel\'s information panel and find the "Members" tab.',
                'Click on the "Add member" button and find @Nodde_Bot in the list of available bots. Click on it to add it to the channel.'
            ]
        );
    }

    const fourthStep = () => {
        return generateStep(
            4,
            'Bind the bot to the channel',
            [
                'Write a message "@Nodde_Bot bind" in your private channel. The bot should respond with a message containing a code.'
            ]
        );
    }

    const fifthStep = () => {
        const child = (<>
            <Input
                placeholder={'Add Telegram Token'}
                onChange={e => onCodeChange(e.target.value)}
                className={styles.integrationTokenInput}
                style={{borderColor: tokenErrorMsg ? 'red' : ''}}
            />
            {tokenErrorMsg && <div style={{color: "red", fontSize: '12px', marginTop: '12px'}}>{tokenErrorMsg}</div>}
        </>);
        return (
            <>
                {
                    generateStep(
                        5,
                        'Enter the code code on the platform',
                        [
                            'Copy the code received from @Nodde_Bot.',
                            'Enter the copied code in the "Telegram Token" field.'
                        ],
                        child
                    )
                }
            </>
        );
    }

    const sixthStep = () => {
        return (
            <>
                {
                    generateStep(
                        6,
                        `Verify ${platform} information`,
                        [
                            `Your ${platform} code is '${code}' `
                        ]
                    )
                }
            </>
        );
    }

    const steps: ReactNode[] = [
        firstAndSecondStep(),
        thirdStep(),
        fourthStep(),
        fifthStep(),
        sixthStep(),
    ];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Select: {
                        fontSize: 24,
                        fontFamily: 'co-headline',
                        controlHeight: 64,
                        colorBorder: '#000',
                        borderRadius: 14,
                        colorPrimaryHover: '#000'
                    },
                    Input: {
                        colorPrimaryHover: '#d9d9d9'
                    }
                }
            }}
        >
            <div className={styles.integrationFlowWrapper}>
                {steps[currentStep]}
                <div className={styles.eventButtonWrapper} style={{marginTop: '217px'}}>

                    <CustomButton
                        type={"small"}
                        color={"gray"}
                        disabled={isLoading}
                        style={{margin: '0 10px'}}
                        onClick={prev}
                    >
                        Back
                    </CustomButton>

                    {currentStep < steps.length - 1 && (
                        <CustomButton
                            type={"small"}
                            color={"green"}
                            disabled={isLoading}
                            onClick={next}>
                            Next
                        </CustomButton>
                    )}
                    {currentStep === steps.length - 1 && (
                        <CustomButton
                            type={"small"}
                            color={"green"}
                            disabled={isLoading}
                            onClick={doneCallback}>
                            Done
                        </CustomButton>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}

export default Integration;
