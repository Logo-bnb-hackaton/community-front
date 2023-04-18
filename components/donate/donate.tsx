import {Button, Input, Modal, Result, Select, Skeleton, Steps} from "antd";
import styles from "@/styles/Home.module.css";
import React, {useState} from "react";
import {useAccount} from "wagmi";
import {StepProps} from "antd/es/steps";
import {ResultStatusType} from "antd/es/result";
import {LoadingOutlined} from "@ant-design/icons";
import {BigNumber, ethers} from "ethers";
import {prepareWriteContract, waitForTransaction, writeContract, WriteContractPreparedArgs} from "@wagmi/core";
import {ABI, CONTRACT_ADDRESS, ERC20_ABI} from "@/constants";

const defaultDonateSteps: StepProps[] = [
    {
        title: 'Set donate size',
        status: "process",
        icon: undefined
    },
    {
        title: 'Approving spending cap',
        status: "wait",
        icon: undefined
    },
    {
        title: 'Approving transaction',
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
];
// deep copy
const bnbDonateStepsJson = JSON.stringify(defaultDonateSteps.filter((item, index) => index !== 1));
const getBnbDonateSteps = () => JSON.parse(bnbDonateStepsJson);
const tokenDonateStepsJson = JSON.stringify(defaultDonateSteps);
const getTokenDonateSteps = () => JSON.parse(tokenDonateStepsJson);

class Token {
    symbol: string;
    address: `0x${string}`;

    constructor(symbol: string, address: `0x${string}`) {
        this.symbol = symbol;
        this.address = address;
    }
}

const baseCoin = "BNB";
const availableTokens: Token[] = [
    // todo add adresses
    new Token("USDT", "0x"),
    new Token("USDC", "0x"),
    new Token("BUSD", "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814"),
];

export default function Donate({isLoading, profileId}: { isLoading: boolean, profileId: string | undefined }) {
    const {isConnected} = useAccount();

    const getDonateSteps = (coin: string) => {
        if (coin !== baseCoin) {
            return getTokenDonateSteps();
        }
        return getBnbDonateSteps();
    }

    const [isDonateMenuOpen, setIsDonateMenuOpen] = useState(false);
    const [isDonating, setIsDonating] = useState(false);
    const [currentDonateStep, setCurrentDonateStep] = useState<number>(0);
    const [donateCoin, setDonateCoin] = useState<string>(baseCoin);
    const [donateSize, setDonateSize] = useState<string>("0.001");
    const [donateSteps, setDonateSteps] = useState<StepProps[]>(getDonateSteps(donateCoin))
    const [donateResult, setDonateResult] = useState<{ status: ResultStatusType, title: string } | undefined>(undefined);

    const openDonateMenu = () => {
        setIsDonateMenuOpen(true)
    };
    const closeDonateMenu = () => {
        setIsDonateMenuOpen(false);
        setCurrentDonateStep(0);
        setDonateSteps(getDonateSteps(donateCoin));
        setDonateResult(undefined);
    };

    const setCurrentStepAndStatus = (stepIndex: number, status: 'wait' | 'process' | 'finish' | 'error') => {
        setCurrentDonateStep(stepIndex);
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

    const setCoin = (value: string) => {
        setDonateCoin(value);
        setDonateSteps(getDonateSteps(value));
    }

    const donate = async () => {
        // todo validate donateSize type and value
        setDonateResult(undefined);

        if (donateCoin === baseCoin) {
            await donateBaseCoin(donateCoin, donateSize);
        } else {
            await donateToken(donateCoin, donateSize);
        }
    }

    const donateBaseCoin = async (donateCoin: string, donateSize: string) => {
        const value = ethers.utils.parseEther(donateSize.toString());
        const donateEthConfig = async () => prepareWriteContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'donateEth',
            args: [profileId],
            overrides: {
                value: value
            }
        });

        const none = () => Promise.resolve();
        await executeDonation(donateEthConfig, none);
    }

    const donateToken = async (donateCoin: string, donateSize: string) => {
        const tokenAddress: `0x${string}` | undefined = availableTokens.find(token => token.symbol === donateCoin)?.address;
        const tokenAmount: BigNumber = ethers.utils.parseEther(donateSize);
        if (!tokenAddress || !tokenAmount) {
            console.error(`Invalid donate token params: ${tokenAddress} or ${tokenAmount}`);
            return;
        }
        console.log(`${tokenAddress} and ${tokenAmount}`);


        const donateTokenConfig = async () => prepareWriteContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'donateToken',
            args: [tokenAddress, tokenAmount, profileId],
        });

        const approveStep = async (indexProducer: () => number) => {
            const stepIndex = indexProducer();
            console.log(`Approve spending ${stepIndex}`);
            setCurrentStepAndStatus(stepIndex, 'process');

            const spendingConfig = await prepareWriteContract({
                address: tokenAddress!!,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [CONTRACT_ADDRESS, tokenAmount]

            });
            const approveResponse = await writeContract(spendingConfig);
            console.log(approveResponse);
            await waitForTransaction({
                hash: approveResponse.hash
            });
        }

        await executeDonation(donateTokenConfig, approveStep);
    }

    const executeDonation = async (
        configBuilder: () => Promise<WriteContractPreparedArgs<any, string>>,
        approveStep: (indexProducer: () => number) => Promise<void>
    ) => {
        try {
            let index = 1;
            console.log('Start ts execution');
            setIsDonating(true);

            // for tokens we have to approve spending step
            await approveStep(() => index++);
            console.log(`After approve step: ${index}`);

            setCurrentStepAndStatus(index++, 'process');
            const config = await configBuilder();
            let donateResult = await writeContract(config);

            setCurrentStepAndStatus(index++, 'process');
            console.log(`Donate hash: ${donateResult.hash}`);
            await waitForTransaction({
                hash: donateResult.hash
            });

            setCurrentStepAndStatus(index++, 'finish');
            setDonateResult({
                status: "success",
                title: "Thanks for the donation!"
            });
        } catch (e) {
            setDonateSteps(getDonateSteps(donateCoin));
            setCurrentDonateStep(0);
            setDonateResult({
                status: "error",
                title: "Something went wrong!"
            });
        } finally {
            setIsDonating(false);
            console.log("Done");
        }
    }

    // Components
    const availableCoinsSelector = () => {
        return (
            <Select defaultValue={baseCoin} style={{width: 100}} onChange={setCoin}>
                <Select.Option key={baseCoin} value={baseCoin}>{baseCoin}</Select.Option>
                {
                    availableTokens.map(token => token.symbol).map(symbol => {
                            return (
                                <Select.Option key={symbol} value={symbol}>{symbol}</Select.Option>
                            );
                        }
                    )
                }
            </Select>
        );
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
                width={"50vw"}
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
                        current={currentDonateStep}
                    />
                    <Input
                        disabled={isDonating}
                        value={donateSize}
                        addonAfter={availableCoinsSelector()}
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