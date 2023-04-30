import Head from "next/head";
import styles from "@/styles/Home.module.css";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {useAccount, useContractRead, useContractWrite, usePrepareContractWrite,} from "wagmi";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import {Button} from "antd";
import {MAIN_NFT_ABI, MAIN_NFT_ADDRESS, WAIT_BLOCK_CONFIRMATIONS,} from "@/constants";
import {BigNumber} from "ethers";
import {waitForTransaction} from "@wagmi/core";

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [priceToMint, setPriceToMint] = useState<BigNumber | undefined>(
    undefined
  );
  const [userProfileId, setUserProfileId] = useState<number | undefined>(
    undefined
  );
  const [isSticky, setIsSticky] = useState(false);
  const arrowRef = useRef<HTMLDivElement>(null);

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
  const { data: priceToMintData, isSuccess: isPriceToMintDataSuccess } =
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
      router.push(`/profile/${userProfileId}`);
    }
  }, [isDefinitelyConnected, userProfileId]);

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

  const { config: safeMintConfig } = usePrepareContractWrite({
    address: MAIN_NFT_ADDRESS,
    abi: MAIN_NFT_ABI,
    functionName: "safeMint",
    overrides: {
      value: priceToMint,
    },
  });

  const [isMinting, setIsMinting] = useState(false);
  const { writeAsync: safeMintWriteAsync } = useContractWrite(safeMintConfig);

  const mint = async () => {
    if (!priceToMint) {
      console.error("Can't load mint price.");
      return;
    }

    setIsMinting(!!safeMintWriteAsync);

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
          });
      })
      .catch((err) => {
        console.error(err);
        setIsMinting(false);
      });
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
      arrowRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
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
          saveCallback={undefined}
          editAvailable={false}
          edited={false}
          setEdited={undefined}
          disabled={false}
          showLogo={isSticky}
        />

        <div className={styles.center}>
          <div className={styles.welcome_content}>
            <div className={styles.welcome_content_left_side}>
              <h1>Welcome to</h1>
              <div id="logo_nodde" className={styles.logo_nodde}></div>
              <p>Create a closed sessions for training, streams, and other events,
              as well as receive donations from subscribers.</p>
            </div>
          </div>

          <Button
            className={styles.createProfileButton}
            loading={isMinting}
            onClick={mint}
            disabled={!isDefinitelyConnected}
          >
            Create a profile
          </Button>
          <h1>Build you own community</h1>
          <div
            id="arrow"
            className={styles.arrow}
            onClick={handleClick}
            ref={arrowRef}
          ></div>
          <div className={styles.home_content}>
            <div className={styles.home_content_left_side}>
              <p>Firstly, connect your wallet to the platform</p>
            </div>
            <div className={styles.home_content_right_side}>
              <div
                className={`${styles.home_image} ${styles.home_image_1}`}
              ></div>
            </div>
          </div>
          <div className={styles.home_content}>
            <div className={styles.home_content_left_side}>
              <div
                className={`${styles.home_image} ${styles.home_image_2}`}
              ></div>
            </div>
            <div className={styles.home_content_right_side}>
              <div className={styles.home_right_side_text}>
                <p>Click the "Create Profile" button and pay the registration fee</p>
              </div>
            </div>
          </div>
          <div className={styles.home_content}>
            <div className={styles.home_content_left_side}>
              <p>Fill out your profile, including your community name, photos,
              description, and other details</p>
            </div>
            <div className={styles.home_content_right_side}>
              <div
                className={`${styles.home_image} ${styles.home_image_3}`}
              ></div>
            </div>
          </div>
          <div className={styles.home_content}>
            <div className={styles.home_content_left_side}>
              <div
                className={`${styles.home_image} ${styles.home_image_4}`}
              ></div>
            </div>
            <div className={styles.home_content_right_side}>
              <div className={styles.home_right_side_text}>
                <p>Select the currencies for donations</p>
              </div>
            </div>
          </div>
          <div className={styles.home_content}>
            <div className={styles.home_content_left_side}>
              <p>Click the "Save" button to complete the registration</p>
            </div>
            <div className={styles.home_content_right_side}>
              <div
                className={`${styles.home_image} ${styles.home_image_5}`}
              ></div>
            </div>
          </div>

          <Button
            className={styles.createProfileButton}
            loading={isMinting}
            onClick={mint}
            disabled={!isDefinitelyConnected}
          >
            Create a profile
          </Button>
        </div>

        <Footer />
      </main>
    </>
  );
}
