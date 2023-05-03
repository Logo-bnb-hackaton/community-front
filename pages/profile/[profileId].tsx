import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import Logo from "@/components/logo/Logo";
import ReactMarkdown from "react-markdown";
import SocialMediaList, {
  SocialMediaLink,
  toSocialMediaLink,
} from "@/components/social_media_list/SocialMediaList";
import React, { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import { Input } from "antd";
import CustomButton from "@/components/customButton/CustomButton";
import { useAccount } from "wagmi";
import Donate from "@/components/donate/donate";
import { FileAddOutlined, LoadingOutlined } from "@ant-design/icons";
import { GetServerSidePropsContext, NextPage } from "next";
import { addressBySymbol, baseCoin, possibleTokens } from "@/utils/tokens";
import SubscriptionList from "@/components/subscription/SubscriptionList";
import { ProfileDTO } from "@/api/dto/profile.dto";

import * as Api from "@/api";
import * as Contract from "@/contract";
import Footer from "@/components/footer/Footer";

class ProfileError {
  logo: boolean;
  title: boolean;
  description: boolean;
  socialMediaLinks: boolean;

  constructor(
    logo: boolean,
    title: boolean,
    description: boolean,
    socialMediaLinks: boolean
  ) {
    this.logo = logo;
    this.title = title;
    this.description = description;
    this.socialMediaLinks = socialMediaLinks;
  }
}

const MAX_DESCRIPTION_LEN = 250;

interface Props {
  profile: ProfileDTO | null;
  ownerId: string;
  tokens: string[];
}

const Profile: NextPage<Props> = ({ profile, ownerId, tokens }) => {
  const { address, isConnected } = useAccount();

  const router = useRouter();
  const { profileId } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [editAvailable, setEditAvailable] = useState(false);
  const [edited, setEdited] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [logoId, setLogoId] = useState<string>();
  const [base64Logo, setBase64Logo] = useState<string>();
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>(
    []
  );

  const [processingToken, setProcessingToken] = useState<string | undefined>(
    undefined
  );
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);

  const [profileError, setProfileError] = useState<ProfileError | undefined>(
    undefined
  );

  useEffect(() => {
    if (isConnected && !profile && address !== ownerId) {
      router.push("/");
      return;
    }
    setEditAvailable(isConnected && address === ownerId);
  }, [ownerId, isConnected, address, profile, router]);

  useEffect(() => {
    if (!profile) setEdited(true);
    setTitle(profile ? profile.title : "");
    setDescription(profile ? profile.description : "");
    setLogoId(profile ? profile!!.logo?.id : undefined);
    setBase64Logo(profile ? profile!!.logo?.base64Image : undefined);
    setSocialMediaLinks(
      profile
        ? profile.socialMediaLinks.map((link) => toSocialMediaLink(link))
        : []
    );
  }, [profile]);

  useEffect(() => {
    setAvailableTokens(tokens);
  }, [tokens]);

  /**
   * Updating profile
   */
  const saveCallback = async () => {
    console.log("Save profile callback....");
    try {
      setIsLoading(true);

      const hasLogoError = !base64Logo;
      const hasTitleError = !title;
      const hasDescriptionError =
        !description || description.length > MAX_DESCRIPTION_LEN;
      const hasSocialLinksError = socialMediaLinks.length === 0;

      if (
        hasLogoError ||
        hasTitleError ||
        hasDescriptionError ||
        hasSocialLinksError
      ) {
        const error = new ProfileError(
          hasLogoError,
          hasTitleError,
          hasDescriptionError,
          hasSocialLinksError
        );
        setProfileError(error);
        return false;
      }

      await Api.profile.updateProfile({
        id: profileId!! as string,
        title: title,
        description: description,
        logo: {
          id: logoId,
          base64Image: base64Logo,
        },
        socialMediaLinks: socialMediaLinks.map((link) => link.link),
      });

      setEdited(false);
      setProfileError(undefined);
    } catch (e) {
      console.error(`Catch error during updating profile. Error: ${e}`);
    } finally {
      setIsLoading(false);
    }
    return true;
  };

  const socialLinkHandler = (links: SocialMediaLink[]) => {
    setSocialMediaLinks(links);
    if (profileError)
      setProfileError({ ...profileError, socialMediaLinks: false });
  };

  const titleInputHandler = (e: any) => {
    setTitle(e.target.value);
    if (profileError) setProfileError({ ...profileError, title: false });
  };

  const descriptionInputHandler = (e: any) => {
    setDescription(e.target.value);
    if (profileError) setProfileError({ ...profileError, description: false });
  };

  const logoDraggerHandler = (base64Logo: string | undefined) => {
    setLogoId(undefined);
    setBase64Logo(base64Logo);
    if (profileError) setProfileError({ ...profileError, logo: false });
  };

  const enableOrDisableToken = async (tokenSymbol: string) => {
    setIsLoading(true);
    setProcessingToken(tokenSymbol);
    try {
      const tokenAddress = addressBySymbol.get(tokenSymbol)!!;
      const enabled =
        availableTokens.find((token) => token === tokenSymbol) !== undefined;

      await Contract.profile.enableOrDisableToken(
        profileId as string,
        tokenAddress,
        !enabled
      );
      setAvailableTokens(
        await Contract.profile.loadAvailableTokens(profileId as string)
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setProcessingToken(undefined);
    }
  };

  const getAvailableSubscriptions = () => {
    if (!profile) return [];
    return profile.subscriptions.filter(
      (s) => editAvailable || s.status !== "DRAFT"
    );
  };

  return (
    <main className={styles.main}>
      <Header
        saveCallback={saveCallback}
        edited={edited}
        editAvailable={editAvailable}
        setEdited={setEdited}
        disabled={isLoading}
      />

      <div
        className={styles.center}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className={styles.grid}>
          <Logo
            isLoading={isLoading}
            base64Logo={base64Logo}
            setBase64Logo={logoDraggerHandler}
            edited={edited}
            hasError={profileError && profileError.logo}
          />
          <div
            className={styles.profileDescription}
            style={{ gridArea: "description" }}
          >
            {edited ? (
              <Input
                disabled={isLoading}
                status={profileError && profileError.title ? "error" : ""}
                className={styles.titleInput}
                placeholder="Community name"
                value={title}
                onChange={titleInputHandler}
              />
            ) : (
              <h1>{title}</h1>
            )}

            <div
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                textAlign: "justify",
              }}
            >
              {edited ? (
                <Input.TextArea
                  disabled={isLoading}
                  status={
                    profileError && profileError.description ? "error" : ""
                  }
                  className={styles.descriptionInput}
                  value={description}
                  onChange={descriptionInputHandler}
                  autoSize={{ minRows: 6, maxRows: 6 }}
                  placeholder={`Community description. Max length is ${MAX_DESCRIPTION_LEN} characters.`}
                />
              ) : (
                <ReactMarkdown className={styles.lineBreak}>
                  {description}
                </ReactMarkdown>
              )}
            </div>
            <SocialMediaList
              socialMediaLinks={socialMediaLinks}
              setSocialLinks={socialLinkHandler}
              edited={edited && !isLoading}
              hasError={profileError && profileError.socialMediaLinks}
            />
          </div>
        </div>
        {edited ? (
          <div
          className={styles.donateArea}
            style={{
              gridArea: "donate",
            }}
          >
            <CustomButton
              key={baseCoin}
              disabled={true}
              style={{ backgroundColor: "var(--primary-green-color)" }}
              onClick={(e) => {}}
            >
              {baseCoin.toUpperCase()}
            </CustomButton>
            {possibleTokens
              .map((item) => item.symbol)
              .map((symbol) => (
                <CustomButton
                  disabled={isLoading}
                  key={symbol}
                  color={
                    availableTokens.find((t) => t === symbol) === undefined
                      ? "gray"
                      : "green"
                  }
                  onClick={(e) => enableOrDisableToken(symbol)}
                >
                  {symbol.toUpperCase()}{" "}
                  {symbol === processingToken ? <LoadingOutlined /> : ""}
                </CustomButton>
              ))}
          </div>
        ) : (
          <Donate
            profileId={profileId as string}
            availableTokens={availableTokens}
          />
        )}
        {editAvailable && !edited && (
          <CustomButton
            disabled={!isConnected}
            type={"wide"}
            color={"gray"}
            style={{ marginTop: "48px" }}
            onClick={() =>
              router.push(`/subscription/create?profileId=${profileId}`)
            }
          >
            Add subscription <FileAddOutlined />
          </CustomButton>
        )}
        {profile && !edited && getAvailableSubscriptions().length !== 0 && (
          <SubscriptionList
            profileId={profileId as string}
            subscriptions={getAvailableSubscriptions()}
          />
        )}
      </div>

      <Footer />
    </main>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const profileId = ctx.params!!.profileId as string;

    const props: Props = {
      tokens: [],
      ownerId: "",
      profile: null,
    };

    const tokensPromise = Contract.profile
      .loadAvailableTokens(profileId)
      .then((tokens) => (props.tokens = tokens));

    const profilePromise = Api.profile
      .loadProfile(profileId)
      .then((profile) => (props.profile = profile ?? null));

    const ownerPromise = Contract.profile
      .loadProfileOwner(profileId)
      .then((ownerId) => (props.ownerId = ownerId));

    await Promise.all([tokensPromise, profilePromise, ownerPromise]);
    return {
      props: props,
    };
  } catch (err) {
    console.log(err);
    // todo add redirecting here
    return {
      props: { profile: null, tokens: [], subscriptions: [] },
    };
  }
};

export default Profile;
