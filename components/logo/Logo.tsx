import React, {SyntheticEvent, useState} from 'react';
import {DeleteOutlined, LoadingOutlined, UserAddOutlined} from '@ant-design/icons';
import {message, Upload} from 'antd';
import type {RcFile, UploadChangeParam, UploadProps} from 'antd/es/upload';
import type {UploadFile} from 'antd/es/upload/interface';
import Image from "next/image";
import styles from '@/styles/Home.module.css'

const {Dragger} = Upload;

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
};

// todo add logic with editable
export default function Logo({
                                 logoUrl,
                                 setLogoUrl,
                                 edited = false,
                                 hasError = false
                             }: { logoUrl?: string, setLogoUrl: Function, edited: boolean, hasError: boolean | undefined }) {
    const [loading, setLoading] = useState(false);

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as RcFile, (url) => {
                setLoading(false);
                setLogoUrl(url);
            });
        }
    };

    const deleteButtonHandler = (e: SyntheticEvent<any>) => setLogoUrl(undefined);

    return (
        <div style={{
            gridArea: "logo",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            {logoUrl &&
                <>
                    <Image src={logoUrl} alt={"Community logo"} style={{borderRadius: "30px"}} fill/>

                    {edited &&
                        <div className={styles.logoDeleteButton} onClick={deleteButtonHandler}>
                            <DeleteOutlined style={{color: "red", fontSize: "20px"}}/>
                        </div>
                    }
                </>
            }
            {
                !logoUrl &&
                <Dragger
                    maxCount={1}
                    className={`${styles.draggerWrapper} ${hasError ? styles.errorBorder : ""}`}
                    accept="image/*"
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    action={""}
                >
                    <p className="ant-upload-drag-icon">
                        {loading ? <LoadingOutlined/> : <UserAddOutlined style={{color: "#ECFDD7"}}/>}
                    </p>
                    <p className="ant-upload-text">Click or drag logo file to this area to upload</p>
                </Dragger>
            }
        </div>
    );
};