import React from "react";
import ImageUploader from "@/components/imageUploader/ImageUploader";
import styles from "@/styles/Home.module.css";

// todo add logic with editable
export default function Logo({
  isLoading,
  base64Logo,
  setBase64Logo,
  edited = false,
  hasError = false,
}: {
  isLoading: boolean;
  base64Logo?: string;
  setBase64Logo: (base64Img: string | undefined) => void;
  edited: boolean;
  hasError: boolean | undefined;
}) {
  return (
    <div
      className={styles.logoProfile}
      style={{
        gridArea: "logo",
        cursor: edited ? "pointer" : "auto",
      }}
    >
      <ImageUploader
        disabled={isLoading}
        description={"Click or drag logo file to this area to upload"}
        sizeText={"380 x 380 px"}
        hasError={hasError}
        edited={edited}
        base64Img={base64Logo}
        setBase64Img={setBase64Logo}
      />
    </div>
  );
}
