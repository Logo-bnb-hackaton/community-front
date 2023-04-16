import React, {SyntheticEvent, useState} from 'react';
import {DeleteOutlined, LoadingOutlined, UserAddOutlined} from '@ant-design/icons';
import {message, Upload} from 'antd';
import type {RcFile} from 'antd/es/upload';
import Image from "next/image";
import styles from '@/styles/Home.module.css'

const {Dragger} = Upload;

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};

// todo add logic with editable
export default function Logo({
                                 logoUrl,
                                 setLogoUrl,
                                 edited = false,
                                 hasError = false
                             }: { logoUrl?: string, setLogoUrl: Function, edited: boolean, hasError: boolean | undefined }) {
    const [loading, setLoading] = useState(false);

    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        // it's a workaround, replace to input with type data instead of `dragge`
        if (isJpgOrPng && isLt2M) {
            getBase64(file, (url) => {
                setLoading(false);
                setLogoUrl(url);
            });
        }
        return false;
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