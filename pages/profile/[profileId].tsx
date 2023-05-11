import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import React, { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import { useAccount } from "wagmi";
import { GetServerSidePropsContext, NextPage } from "next";
import { ProfileDTO } from "@/api/dto/profile.dto";
import Footer from "@/components/footer/Footer";
import ProfileEdit from "@/components/profile/edit/ProfileEdit";
import { ImageDto } from "@/api/dto/image.dto";
import Profile from "@/components/profile/Profile";
import EditeProfileButton from "@/components/profile/EditeProfileButton";

import * as Api from "@/api";
import * as Contract from "@/contract";
import { hasChanges } from "@/utils/compare";

export interface ProfileError {
  logo: boolean;
  title: boolean;
  description: boolean;
  socialMediaLinks: boolean;
}

const hasError = (error: ProfileError | undefined) => {
  return (
    error &&
    (error.logo || error.title || error.description || error.socialMediaLinks)
  );
};

export interface BaseProfile {
  id: string;
  title: string;
  description: string;
  logo: ImageDto;
  socialMediaLinks: string[];
}

const fromProfileDTO = (dto: ProfileDTO): BaseProfile => {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    logo: dto.logo,
    socialMediaLinks: dto.socialMediaLinks,
  };
};

const MAX_DESCRIPTION_LEN = 250;

interface Props {
  profile?: ProfileDTO;
  ownerAddress: string;
  tokens: string[];
}

const ProfilePage: NextPage<Props> = ({ profile, ownerAddress, tokens }) => {
  const { address, isConnected } = useAccount();

  const router = useRouter();
  const { profileId } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [editAvailable, setEditAvailable] = useState(false);
  const [edited, setEdited] = useState(false);

  const [baseData, setBaseData] = useState<BaseProfile>();
  const [profileError, setProfileError] = useState<ProfileError | undefined>(
    undefined
  );

  useEffect(() => {
    if (isConnected && !profile && address !== ownerAddress) {
      router.push("/");
      return;
    }
    setEditAvailable(isConnected && address === ownerAddress);
  }, [ownerAddress, isConnected, address, profile, router]);

  useEffect(() => {
    if (!profile) {
      setEdited(true);
      return;
    }
    setBaseData(fromProfileDTO(profile));
  }, [profile, profileId]);

  useEffect(() => {
    const hasLogoError = !baseData?.logo?.base64Image;
    const hasTitleError = !baseData?.title;
    const hasDescriptionError =
      !baseData?.description ||
      baseData?.description.length > MAX_DESCRIPTION_LEN;
    const hasSocialLinksError = baseData?.socialMediaLinks.length === 0;

    setProfileError({
      logo: hasLogoError,
      title: hasTitleError,
      description: hasDescriptionError,
      socialMediaLinks: hasSocialLinksError,
    });
  }, [baseData]);

  /**
   * Updating profile
   */
  const saveCallback = async () => {
    console.log("Save profile callback....");
    try {
      setIsLoading(true);
      if (hasError(profileError)) {
        return;
      }

      if (
        !profile ||
        (profile && hasChanges(baseData, fromProfileDTO(profile)))
      ) {
        await Api.profile.updateProfile({
          id: profileId!! as string,
          title: baseData!!.title,
          description: baseData!!.description,
          logo: baseData!!.logo,
          socialMediaLinks: baseData!!.socialMediaLinks,
        });
      }

      setEdited(false);
      setProfileError(undefined);
    } catch (e) {
      console.error(`Catch error during updating profile. Error: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Header
        profileId={profileId as string}
        base64Logo={profile?.logo?.base64Image}
      >
        {editAvailable && (
          <EditeProfileButton
            saveCallback={saveCallback}
            edited={edited}
            setEdited={setEdited}
            disabled={isLoading}
          />
        )}
      </Header>

      {edited || !profile ? (
        <ProfileEdit
          id={profileId as string}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          profile={baseData}
          setProfile={setBaseData}
          errors={profileError}
          tokens={tokens}
        />
      ) : (
        <Profile
          baseData={baseData ?? fromProfileDTO(profile)}
          tokens={tokens}
          subscriptions={profile.subscriptions ?? []}
          editAvailable={editAvailable}
        />
      )}
      <Footer />
    </main>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const profileId = ctx.params!!.profileId as string;

    const props: Props = {
      tokens: [],
      ownerAddress: "",
      profile: undefined,
    };

    const tokensPromise = Contract.profile
      .loadAvailableTokens(profileId)
      .then((tokens) => (props.tokens = tokens));

    const profilePromise = Api.profile
      .loadProfile(profileId)
      .then((profile) => (props.profile = profile ?? null));

    const ownerPromise = Contract.profile
      .loadProfileOwner(profileId)
      .then((ownerAddress) => (props.ownerAddress = ownerAddress));

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

export default ProfilePage;
