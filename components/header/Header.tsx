import styles from "@/styles/Home.module.css";
import WalletButton from "@/components/wallet/WalletButton";
import React from "react";
import { Button } from "antd";
import { FormOutlined } from "@ant-design/icons";

export default function Header({
  saveCallback = undefined,
  editAvailable = false,
  edited = false,
  setEdited = undefined,
  disabled,
  showLogo = true,
}: {
  saveCallback: Function | undefined;
  editAvailable: boolean;
  edited: boolean;
  setEdited: Function | undefined;
  disabled: boolean;
  showLogo?: boolean;
}) {
  const onEditHandle = () => {
    setEdited!!(true);
  };

  const onSaveHandle = () => {
    if (!saveCallback) {
      console.log("Save callback is undefined");
      return;
    }
    console.log("Saving result");
    saveCallback();
  };

  return (
    <div className={styles.header}>
      <div className={styles.description}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          {showLogo && (
            <a href={"/"}>
              <div
                style={{ width: "179px", height: "35px", margin: 0 }}
                className={styles.logo_nodde}
              ></div>
            </a>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          {editAvailable && (
            <div style={{ width: "60px", height: "60px", marginRight: "24px" }}>
              <Button
                disabled={disabled}
                onClick={edited ? onSaveHandle : onEditHandle}
                style={{
                  height: "100%",
                  width: "100%",
                  border: "none",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  borderRadius: "10px",
                  padding: "0",
                }}
              >
                {edited ? (
                  "Save"
                ) : (
                  <FormOutlined style={{ fontSize: "20px" }} />
                )}
              </Button>
            </div>
          )}
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
