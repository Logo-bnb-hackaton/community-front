import {Button, Input, Modal, Result, Skeleton, Steps} from "antd";
import styles from "@/styles/Home.module.css";
import React, {useState} from "react";
import {useAccount} from "wagmi";
import {StepProps} from "antd/es/steps";
import {ResultStatusType} from "antd/es/result";
import {LoadingOutlined} from "@ant-design/icons";
import {ethers} from "ethers";
import {prepareWriteContract, waitForTransaction, writeContract} from "@wagmi/core";
import {ABI, CONTRACT_ADDRESS} from "@/constants";

const defaultDonateSteps: StepProps[] = [
    {
        title: 'Set donate size',
        status: "process",
        icon: undefined
    },
    {
        title: 'Approving',
        status: "wait",
        icon: undefined
    },
    {
        title: 'Verification',
        status: "wait",
        icon: undefined
    },
    {
        title: 'Done',
        status: "wait",
        icon: undefined
    },
]
// deep copy
const defaultDonateStepsJson = JSON.stringify(defaultDonateSteps);
const getDefaultDonateSteps = () => JSON.parse(defaultDonateStepsJson);

export default function Donate({isLoading, profileId}: { isLoading: boolean, profileId: string | undefined }) {
    const {isConnected} = useAccount();

    const [isDonateMenuOpen, setIsDonateMenuOpen] = useState(false);
    const [isDonating, setIsDonating] = useState(false);
    const [donateStep, setDonateStep] = useState<number>(0);
    const [donateSteps, setDonateSteps] = useState<StepProps[]>(getDefaultDonateSteps())
    const [donateSize, setDonateSize] = useState<string>("0.001");
    const [donateResult, setDonateResult] = useState<{ status: ResultStatusType, title: string } | undefined>(undefined);

    const openDonateMenu = () => {
        setIsDonateMenuOpen(true)
    };
    const closeDonateMenu = () => {
        setIsDonateMenuOpen(false);
        setDonateStep(0);
        setDonateSteps(getDefaultDonateSteps());
        setDonateResult(undefined);
    };

    const setCurrentStepAndStatus = (stepIndex: number, status: 'wait' | 'process' | 'finish' | 'error') => {
        setDonateStep(stepIndex);
        setDonateSteps(
            [...donateSteps.filter((item, index) => {
                if (index === stepIndex) {
                    item.status = status;
                    if (status == 'process') {
                        item.icon = <LoadingOutlined/>
                    }
                } else if (index < stepIndex) {
                    item.icon = undefined;
                }
                return item;
            })]
        );
    }

    const donate = async () => {
        // todo validate donateSize type and value
        setDonateResult(undefined);
        const value = ethers.utils.parseEther(donateSize.toString());

        const donateEthConfig = await prepareWriteContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'donateEth',
            args: [profileId],
            overrides: {
                value: value
            }
        });

        try {
            setCurrentStepAndStatus(1, 'process');
            setIsDonating(true);
            let donateResult = await writeContract(donateEthConfig);
            setCurrentStepAndStatus(2, 'process');
            console.log(`Donate hash: ${donateResult.hash}`);
            await waitForTransaction({
                hash: donateResult.hash
            });
            setCurrentStepAndStatus(3, 'finish');
            setDonateResult({
                status: "success",
                title: "Thanks for the donation!"
            });
        } catch (e) {
            console.log("set default steps");
            setDonateSteps(getDefaultDonateSteps());
            setDonateStep(0);
            setDonateResult({
                status: "error",
                title: "Something went wrong!"
            });
        } finally {
            setIsDonating(false);
            console.log("Done");
        }
    }


    return (
        <>
            {
                isLoading ?
                    <Skeleton.Button active className={styles.donateButton} shape={"square"}
                                     style={{height: "5rem", width: "100%"}}/> :
                    <Button
                        disabled={!isConnected}
                        className={`${styles.payButton} ${styles.donateButton}`}
                        onClick={openDonateMenu}
                    >DONATE</Button>
            }
            <Modal
                width={"40vw"}
                title="Donate"
                centered
                open={isDonateMenuOpen}
                onOk={donate}
                okButtonProps={{disabled: isDonating}}
                cancelButtonProps={{disabled: isDonating}}
                onCancel={closeDonateMenu}
                okText={"Donate"}
            >

                <div style={{display: "flex", flexDirection: "column"}}>
                    <Steps
                        style={{padding: "30px 10px"}}
                        size={"small"}
                        items={donateSteps}
                        current={donateStep}
                    />
                    <Input
                        disabled={isDonating}
                        value={donateSize}
                        addonAfter="BNB"
                        placeholder="Social media link"
                        onChange={e => setDonateSize(e.target.value as string)}
                    />

                    {donateResult &&
                        <Result
                            status={donateResult.status}
                            title={donateResult.title}
                        />
                    }
                </div>
            </Modal>
        </>
    );
}