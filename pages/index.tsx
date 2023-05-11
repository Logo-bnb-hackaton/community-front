import Head from "next/head";
import styles from "@/styles/Home.module.css";
import styles_header from "@/styles/Header.module.css";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {useAccount, useContractRead, useContractWrite, usePrepareContractWrite,} from "wagmi";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import CustomButton from "@/components/customButton/CustomButton";
import CustomAlert from "@/components/alert/CustomAlert";
import {MAIN_NFT_ABI, MAIN_NFT_ADDRESS, WAIT_BLOCK_CONFIRMATIONS,} from "@/constants";
import {BigNumber} from "ethers";
import {waitForTransaction} from "@wagmi/core";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {LoadingOutlined} from "@ant-design/icons";
import {AuthProps} from "@/pages/_app";
import {GetServerSidePropsContext, NextPage} from "next";
import {getAuthStatus} from "@/utils/getAuthStatus";

interface Props extends AuthProps {
}

const Home: NextPage<Props> = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [priceToMint, setPriceToMint] = useState<BigNumber | undefined>(undefined);
  const [userProfileId, setUserProfileId] = useState<number | undefined>(undefined);
  const [isSticky, setIsSticky] = useState(false);
  const [pageIsReady, setPageIsReady] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);
  const { openConnectModal } = useConnectModal();
  const [error, setError] = useState<string>("");

    // It's a workaround,
    // details - https://ethereum.stackexchange.com/questions/133612/error-hydration-failed-because-the-initial-ui-does-not-match-what-was-rendered
    const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
    useEffect(() => {
        if (isConnected) {
            setIsDefinitelyConnected(true);
        } else {
            setIsDefinitelyConnected(false);
        }
    }, [isConnected]);

    /**
     * Loading price to mint
     */
    const {data: priceToMintData, isSuccess: isPriceToMintDataSuccess} =
        useContractRead({
            address: MAIN_NFT_ADDRESS,
            abi: MAIN_NFT_ABI,
            functionName: "priceToMint",
            args: [address],
        });

    useEffect(() => {
        if (isPriceToMintDataSuccess) {
            setPriceToMint(priceToMintData as BigNumber);
        }
    }, [priceToMintData, isPriceToMintDataSuccess]);

  useEffect(() => {
    if (isDefinitelyConnected && userProfileId) {
      router.prefetch(`/profile/${userProfileId}`);
      setPageIsReady(true);
    }
  }, [isDefinitelyConnected, userProfileId]);

  const redirectClick = () => {
    setPageIsReady(false);
    router.push(`/profile/${userProfileId}`);
  };

    /**
     * Loading address tokens.
     *
     * I can't find a way to check if a user has a profile, so it's a workaround.
     *
     * success => has profile
     * error => no profile
     */
    const {
        data: tokenOfOwnerByIndexData,
        isSuccess: isTokenOfOwnerByIndexSuccess,
        refetch: tokenOfOwnerByIndexRefetch,
    } = useContractRead({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: "tokenOfOwnerByIndex",
        args: [address, 0],
    });

    useEffect(() => {
        if (isTokenOfOwnerByIndexSuccess) {
            setUserProfileId(tokenOfOwnerByIndexData as number);
        } else {
            setUserProfileId(undefined);
        }
    }, [
        priceToMintData,
        isPriceToMintDataSuccess,
        isTokenOfOwnerByIndexSuccess,
        tokenOfOwnerByIndexData,
    ]);

    const {config: safeMintConfig} = usePrepareContractWrite({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: "safeMint",
        overrides: {
            value: priceToMint,
        },
    });

  const [isMinting, setIsMinting] = useState(false);
  const {
    writeAsync: safeMintWriteAsync,
    error: safeMintWriteError,
    status: safeMintStatus,
  } = useContractWrite(safeMintConfig);

  useEffect(() => {
    if (safeMintWriteError) {
      console.log(safeMintWriteError.message);
      setError(safeMintWriteError.message);
    }
    console.log(safeMintStatus);
  }, [safeMintWriteError, safeMintStatus]);

  const mint = async () => {
    if (!priceToMint) {
      console.error("Can't load mint price.");
      setError("Can't load mint price.");
      return;
    }

    if (!safeMintWriteAsync) {
      setError("Insufficient funds in your wallet.");
      return;
    }

        setIsMinting(old => !old);

    safeMintWriteAsync?.()
      .then((data) => {
        return waitForTransaction({
          hash: data.hash,
          confirmations: WAIT_BLOCK_CONFIRMATIONS,
        })
          .then((data) => {
            console.log(data);
          })
          .finally(() => {
            // after minting we have to receive token by user again.
            tokenOfOwnerByIndexRefetch();
            redirectClick();
          });
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);

        setIsMinting(false);
      })
  };

    useEffect(() => {
        const handleScroll = () => {
            const logo = document.querySelector(`#logo_nodde`);
            if (logo) {
                const logoRect = logo.getBoundingClientRect();
                setIsSticky(logoRect.top <= 0);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleClick = () => {
        if (arrowRef.current) {
            arrowRef.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    const [showAlert, setShowAlert] = useState(false);
    const handleAlerShow = () => {
        setShowAlert(true);
    };

    const handleAlertClose = () => {
        setShowAlert(false);
    };

    return (
        <>
            {showAlert && (
                <CustomAlert type="warning" onClose={handleAlertClose}>
                    Firstly, connect your wallet to the platform
                </CustomAlert>
            )}

      {error && (
        <CustomAlert type="error" onClose={() => setError("")}>
          {error}
        </CustomAlert>
      )}

      <Head>
        <title>Nodde community</title>
        <meta
          name="description"
          content="Web3 application for closed sessions, streams, other events, and donations"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Header
          showLogo={isSticky}
          profileId={userProfileId?.toString()}
          // todo fix it
          base64Logo={undefined}
        />

        <div className={styles.center}>
          <div className={styles.welcome_content}>
            <div className={styles.welcome_content_left_side}>
              <h1>Welcome to</h1>
              <div id="logo_nodde" className={styles_header.logo_nodde}></div>
            </div>
            <div className={styles.welcome_content_right_side}>
              <div className={styles.home_image_0}></div>
            </div>
          </div>
          <p
            style={{
              marginBottom: "76px",
              fontSize: "32px",
            }}
          >
            Create closed sessions for training, streams, and other events, as
            well as receive donations from subscribers.
          </p>
          <h1>Build you own community</h1>
          <div
            id="arrow"
            className={styles.arrow}
            onClick={handleClick}
            ref={arrowRef}
          ></div>
          {!isDefinitelyConnected && (
            <div className={styles.section_wrapper}>
              <p
                style={{
                  marginBottom: "80px",
                  fontSize: "32px",
                }}
              >
                To use platform connect you wallet firstly
              </p>
              <CustomButton
                color="white"
                onClick={openConnectModal}
                style={{ width: "324px", fontSize: "21px" }}
                disabled={isDefinitelyConnected}
              >
                🌈 Connect wallet
              </CustomButton>
            </div>
          )}
          {isDefinitelyConnected && !userProfileId && (
            <div className={styles.section_wrapper}>
              <p
                style={{
                  marginBottom: "80px",
                  fontSize: "32px",
                }}
              >
                Create your NFT profile
              </p>
              <CustomButton
                color="white"
                onClick={!isDefinitelyConnected ? handleAlerShow : mint}
                style={{
                  width: "324px",
                  fontSize: "21px",
                  marginBottom: "176px",
                }}
                disabled={isMinting || !isDefinitelyConnected}
              >
                {isMinting ? <LoadingOutlined /> : "🚀"} Create a profile
              </CustomButton>
            </div>
          )}
          {isDefinitelyConnected && userProfileId && (
            <div className={styles.section_wrapper}>
              <p
                style={{
                  marginBottom: "80px",
                  fontSize: "32px",
                }}
              >
                Set your profile
              </p>
              <CustomButton
                color="white"
                onClick={redirectClick}
                style={{
                  width: "324px",
                  fontSize: "21px",
                  marginBottom: "176px",
                }}
                disabled={!pageIsReady}
              >
                {!pageIsReady ? <LoadingOutlined /> : "🚀"} Let's go right now
              </CustomButton>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    return {
        props: {
            authStatus: getAuthStatus(ctx)
        }
    }
}

export default Home;
