import React, {SyntheticEvent, useEffect, useState} from 'react';
import {DeleteOutlined, LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {message, Upload} from 'antd';
import type {RcFile, UploadChangeParam, UploadProps} from 'antd/es/upload';
import type {UploadFile} from 'antd/es/upload/interface';
import Image from "next/image";
import styles from '@/styles/Home.module.css'

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
export default function Logo({logoUrl, editable = false}: { logoUrl?: string, editable: boolean }) {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();

    useEffect(() => {
        if (logoUrl) setImageUrl(logoUrl);
    }, [logoUrl]);

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj as RcFile, (url) => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined/> : <PlusOutlined/>}
            <div style={{marginTop: 8}}>Upload</div>
        </div>
    );

    const deleteButtonHandler = (e: SyntheticEvent<any>) => setImageUrl(undefined);

    return (
        <div style={{
            gridArea: "logo",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            {imageUrl &&
                <>
                    <Image src={imageUrl} alt={"Community logo"} style={{borderRadius: "30px"}} fill/>

                    <div className={styles.logoDeleteButton} onClick={deleteButtonHandler}>
                        <DeleteOutlined style={{color: "red", fontSize: "20px"}}/>
                    </div>
                </>
            }
            {
                !imageUrl &&
                <div style={{width: "110px", height: "110px"}}>
                    <Upload
                        name="avatar"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        accept="image/*"
                    >
                        {uploadButton}
                    </Upload>
                </div>
            }
        </div>
    );
};