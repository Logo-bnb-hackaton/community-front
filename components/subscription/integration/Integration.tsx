import React, {ReactNode, useEffect, useState} from "react";
import {ConfigProvider, Input, Select} from "antd";
import styles from "@/styles/Subscription.module.css";
import CustomButton from "@/components/customButton/CustomButton";
import * as Api from "@/api";
import {TgChatDTO} from "@/api/dto/integration.dto";

enum Platform {
    Telegram = "Telegram",
}

interface Props {
    topLvlChat: TgChatDTO | undefined,
    subscriptionId: `0x${string}`,
    previousCallback: () => void;
    doneCallback: () => void;
}

const TgBotName = 'Nodde_Bot';
const savingStepIndex = 1;
const finalStepIndex = 2;

const Integration: React.FC<Props> = ({topLvlChat, subscriptionId, previousCallback, doneCallback}) => {

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [platform, setPlatform] = useState<string>(Platform.Telegram.toString());
    const [code, setCode] = useState<string>('');
    const [tokenErrorMsg, setTokenErrorMsg] = useState<string | undefined>(undefined);
    const [chat, setChat] = useState<TgChatDTO | undefined>(undefined);

    useEffect(() => {
        if (!topLvlChat) return;
        setCurrentStep(finalStepIndex);
        setChat(topLvlChat);
    }, [topLvlChat]);

    const next = async () => {
        if (currentStep === savingStepIndex) {
            await bindTelegram();
        } else {
            setTokenErrorMsg(undefined);
        }
        setCurrentStep(currentStep + 1);
    };

    const prev = () => {
        setTokenErrorMsg(undefined);
        if (currentStep === 0 || chat) {
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

    const bindTelegram = async () => {
        if (!isCodeValid(code)) {
            setTokenErrorMsg('Please enter token!');
            return;
        }

        try {
            setIsLoading(true);
            const bindRes = await Api.integration.bindTelegram(subscriptionId, code);
            if (bindRes.error?.message !== undefined) {
                setTokenErrorMsg(bindRes.error!!.message);
                return;
            }
            setChat(await Api.integration.getChat(subscriptionId));
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Component
     */
    const generateDescriptions = (descriptionItems: string[], child: ReactNode | undefined = undefined) => {
        return (
            <div className={styles.integrationStepWrapper}>
                <div className={styles.integrationStepContentWrapper}>
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
                    </div>
                    {child && child}
                </div>
            </div>
        );
    }

    const firstStep = () => {
        return (
            <>
                <div className={styles.integrationStepWrapper}>
                    <Select
                        placeholder={'Add hosting platform'}
                        defaultValue={Platform.Telegram.toString()}
                        style={{width: '100%'}}
                        onChange={value => setPlatform(value)}
                    >
                        <Select.Option key={Platform.Telegram.toString()}
                                       value={Platform.Telegram.toString()}>{Platform.Telegram.toString()}</Select.Option>
                    </Select>
                </div>
                {
                    generateDescriptions(
                        [
                            `To activate the @${TgBotName}, go to Telegram and search for it by name in the search bar. Click on the bot\'s icon to go to its page.`,
                            `Press the "Start" button on the bot\'s page.`,
                            `Invite @${TgBotName} to your private channel. To do this, go to the channel\'s information panel and find the "Members" tab.`,
                            `Click on the "Add member" button and find @${TgBotName} in the list of available bots. Click on it to add it to the channel.`,
                        ])
                }
            </>
        );
    }

    const secondStep = () => {
        return (
            <>
                {
                    generateDescriptions(
                        [
                            `Write a message "@${TgBotName} bind" in your private channel. The bot should respond with a message containing a code.`,
                            `Copy the code received from @${TgBotName}.`,
                            `Enter the copied code in the "Telegram Code" field.`,
                        ])
                }
                <div className={styles.integrationStepWrapper}>
                    <Input
                        disabled={isLoading}
                        style={{width: '100%', height: 64, paddingLeft: 20, borderColor: tokenErrorMsg ? 'red' : ''}}
                        value={code}
                        placeholder="Enter telegram code"
                        onChange={v => onCodeChange(v.target.value)}
                    />
                    {tokenErrorMsg &&
                        <div style={{color: "red", fontSize: '12px', marginTop: '12px'}}>{tokenErrorMsg}</div>}
                </div>
            </>
        );
    }

    const thirdStep = () => {
        return (
            <>
                {chat &&
                    <>
                        <p>Telegram chat name: {chat!!.chat.title}</p>
                        <a href={chat!!.chat.link} target="_blank">Tg chat link</a>
                    </>
                }
            </>
        );
    }

    const steps: ReactNode[] = [
        firstStep(),
        secondStep(),
        thirdStep(),
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    fontSize: 24,
                    fontFamily: 'co-headline',
                    controlHeight: 64,
                    colorBorder: '#000',
                    borderRadius: 14,
                    colorPrimaryHover: '#000',
                    colorPrimaryActive: '#fff'
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
