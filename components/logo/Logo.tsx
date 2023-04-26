import React from 'react';
import ImageUploader from "@/components/imageUploader/ImageUploader";

// todo add logic with editable
export default function Logo({
                                 isLoading,
                                 base64Logo,
                                 setBase64Logo,
                                 edited = false,
                                 hasError = false
                             }: {
    isLoading: boolean,
    base64Logo?: string,
    setBase64Logo: (base64Img: string | undefined) => void,
    edited: boolean,
    hasError: boolean | undefined
}) {
    return (
        <div style={{
            gridArea: "logo",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <ImageUploader
                disabled={isLoading}
                description={"Click or drag logo file to this area to upload"}
                sizeText={"400 x 400 px"}
                hasError={hasError}
                edited={edited}
                base64Img={base64Logo}
                setBase64Img={setBase64Logo}
            />
        </div>
    );
};