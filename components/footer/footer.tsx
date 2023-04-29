import styles from "@/styles/Home.module.css";
import WalletButton from "@/components/wallet/WalletButton";
import React from "react";
import { Button } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

export default function Footer() {
  return (
    <div className={styles.description}>
      <div className={styles.footer_content}>
        <div>NODDE</div>
        <div>
          NODDE is a Web3 native social platform created
          <br />
          by 0xc0de team.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <a href="https://discord.gg/bnbchain" target="_blank">
          <div
            className={`${styles.footer_images} ${styles.discord_footer_image}`}
          ></div>
        </a>
        <a href="https://twitter.com/BNBChain" target="_blank">
          <div
            className={`${styles.footer_images} ${styles.twitter_footer_image}`}
          ></div>
        </a>
      </div>
    </div>
  );
}
