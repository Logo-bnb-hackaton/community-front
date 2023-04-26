import {Button, InputNumber, Modal, Result, Select, Steps} from "antd";
import styles from "@/styles/Home.module.css";
import React, {useEffect, useState} from "react";
import {erc20ABI, useAccount, useBalance, useContractReads} from "wagmi";
import {StepProps} from "antd/es/steps";
import {ResultStatusType} from "antd/es/result";
import {LoadingOutlined} from "@ant-design/icons";
import {BigNumber, ethers} from "ethers";
import {prepareWriteContract, waitForTransaction, writeContract, WriteContractPreparedArgs} from "@wagmi/core";
import {MAIN_NFT_ADDRESS, PUBLIC_DONATION_ABI, PUBLIC_DONATION_ADDRESS} from "@/constants";
import {addressBySymbol, baseCoin} from "@/utils/tokens";

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

export interface Token {
    symbol: string;
    address: `0x${string}`;
}

export default function Donate({
                                   profileId,
                                   availableTokens
                               }: { profileId: string | undefined, availableTokens: string[] }) {
    const {address} = useAccount();
    const {data: baseBalanceResponse} = useBalance({
        address: address
    });

    const getDonateSteps = (coin: string) => {
        if (coin !== baseCoin) {
            return getTokenDonateSteps();
        }
        return getBnbDonateSteps();
    }

    const [isDonateMenuOpen, setIsDonateMenuOpen] = useState(false);
    const [isDonating, setIsDonating] = useState(false);
    const [donateCoin, setDonateCoin] = useState<string>(baseCoin);
    const [donateSize, setDonateSize] = useState<string>("0.001");
    const [currentDonateStep, setCurrentDonateStep] = useState<number>(0);
    const [donateSteps, setDonateSteps] = useState<StepProps[]>(getDonateSteps(donateCoin))
    const [donateResult, setDonateResult] = useState<{ status: ResultStatusType, title: string } | undefined>(undefined);
    const [tokenBalances, setTokenBalances] = useState<Map<string, BigNumber> | undefined>(undefined)

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

    /**
     * Loading balance for tokens
     */
    const {data: tokenBalancesData, isLoading: isTokenBalancesLoading} = useContractReads({
        contracts:
            availableTokens.map(symbol => {
                return {
                    address: addressBySymbol.get(symbol)!!,
                    abi: erc20ABI,
                    functionName: 'balanceOf',
                    args: [address]
                }
            })
        ,
    });

    useEffect(() => {
        if (isTokenBalancesLoading || !tokenBalancesData) return;

        const tokenBalances = new Map();
        availableTokens.forEach((symbol, index) => {
            tokenBalances.set(symbol, tokenBalancesData[index]!! as BigNumber);
        });
        setTokenBalances(tokenBalances);
    }, [tokenBalancesData, isTokenBalancesLoading, availableTokens]);

    const getMaxValue = () => {
        const balance = donateCoin === baseCoin ? baseBalanceResponse?.value : tokenBalances?.get(donateCoin);

        // todo maybe add max donate size
        if (!balance) return Number.MAX_SAFE_INTEGER.toString();

        const value = ethers.utils.formatEther(balance);
        // console.log(`Max token value for ${donateCoin} is ${value}`);
        return value.toString();
    }

    /**
     * Donate logic
     */
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
            address: PUBLIC_DONATION_ADDRESS,
            abi: PUBLIC_DONATION_ABI,
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
        const tokenAddress: `0x${string}` | undefined = addressBySymbol.get(donateCoin)!!;
        const tokenAmount: BigNumber = ethers.utils.parseEther(donateSize);
        if (!tokenAddress || !tokenAmount) {
            console.error(`Invalid donate token params: ${tokenAddress} or ${tokenAmount}`);
            return;
        }
        // console.log(`${tokenAddress} and ${tokenAmount}`);


        const donateTokenConfig = async () => prepareWriteContract({
            address: PUBLIC_DONATION_ADDRESS,
            abi: PUBLIC_DONATION_ABI,
            functionName: 'donateToken',
            args: [tokenAddress, tokenAmount, profileId],
        });

        const approveStep = async (indexProducer: () => number) => {
            const stepIndex = indexProducer();
            setCurrentStepAndStatus(stepIndex, 'process');

            const spendingConfig = await prepareWriteContract({
                address: tokenAddress!!,
                abi: erc20ABI,
                functionName: 'approve',
                args: [MAIN_NFT_ADDRESS, tokenAmount]

            });
            const approveResponse = await writeContract(spendingConfig);
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
            setIsDonating(true);

            // for tokens we have to approve spending step
            await approveStep(() => index++);

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
        }
    }

    /**
     * Components
     */
    const availableCoinsSelector = () => {
        return (
            <Select defaultValue={baseCoin} style={{width: 100}} onChange={setCoin} disabled={isDonating}>
                <Select.Option key={baseCoin} value={baseCoin}>{baseCoin}</Select.Option>
                {
                    availableTokens.map(symbol => {
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
            <Button
                className={`${styles.payButton} ${styles.donateButton}`}
                style={{width: "100%", height: "100px"}}
                onClick={openDonateMenu}
            >DONATE</Button>
            <Modal
                width={"50vw"}
                title="Donate"
                centered
                open={isDonateMenuOpen}
                onOk={donate}
                okButtonProps={{disabled: isDonating || donateSize === ""}}
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
                    <InputNumber
                        type="number"
                        controls={false}
                        disabled={isDonating}
                        value={donateSize}
                        max={getMaxValue()}
                        addonAfter={availableCoinsSelector()}
                        placeholder="Please enter a donation amount"
                        onChange={value => setDonateSize(value ? value.toString() : "")}
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