import { useEffect } from "react";
import styles from "./App.module.scss";
import { Supporters } from "./supporters/Supporters";

export const App = () => {
    useEffect(() => {
        const sendHeight = () => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage(["setHeight", height], "*");
        };

        // 初期ロード時に高さを送信
        sendHeight();

        // DOM変化を監視して高さを再送信
        const observer = new MutationObserver(sendHeight);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className={styles.container}>
            <Supporters />
        </div>
    );
};
