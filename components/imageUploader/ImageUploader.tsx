import {message, Upload} from "antd";
import {DeleteOutlined, FileAddOutlined, LoadingOutlined,} from "@ant-design/icons";
import React, {SyntheticEvent, useState} from "react";
import {RcFile} from "antd/es/upload";
import styles from "@/styles/Profile.module.css";
import Image from "next/image";

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface Props {
  disabled: boolean;
  description: string;
  sizeText: string;
  hasError: boolean;
  editing: boolean;
  base64Img: string | undefined;
  setBase64Img: ((img: string | undefined) => void) | undefined;
}

const ImageUploader: React.FC<Props> = ({
  disabled,
  description,
  sizeText,
  hasError,
  editing,
  base64Img,
  setBase64Img,
}) => {
  const [isImgLoading, setIsImgLoading] = useState(false);

  const deleteButtonHandler = (e: SyntheticEvent<any>) =>
    setBase64Img!!(undefined);

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    // it's a workaround, replace to input with type data instead of `dragge`
    if (isJpgOrPng && isLt2M) {
      getBase64(file, (url) => {
        setIsImgLoading(false);
        setBase64Img!!(url);
      });
    }
    return false;
  };

  return (
    <>
      {base64Img && (
        <>
          <Image
            src={base64Img}
            alt={"Community logo"}
            style={{ borderRadius: "14px" }}
            fill
          />

          {editing && !disabled && (
            <div
              className={styles.logoDeleteButton}
              onClick={deleteButtonHandler}
            >
              <DeleteOutlined style={{ color: "red", fontSize: "20px" }} />
            </div>
          )}
        </>
      )}
      {!base64Img && (
        <Upload.Dragger
          disabled={disabled}
          maxCount={1}
          accept="image/*"
          beforeUpload={beforeUpload}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            border: "1px dashed",
            borderColor: hasError ? "red" : "black",
            borderRadius: "14px",
          }}
          className={`${styles.draggerWrapper}`}
        >
          <p className="ant-upload-drag-icon">
            {isImgLoading ? (
              <LoadingOutlined />
            ) : (
              <FileAddOutlined style={{ color: "#000" }} />
            )}
          </p>
          <p style={{ fontSize: "16px", fontFamily: "co-headline" }}>
            {description}
          </p>
          <p
            style={{
              paddingTop: "24px",
              fontSize: "16px",
              fontFamily: "co-headline",
              color: "#837F7F",
            }}
          >
            {sizeText}
          </p>
        </Upload.Dragger>
      )}
    </>
  );
};

export default ImageUploader;
