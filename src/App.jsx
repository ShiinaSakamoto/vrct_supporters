import { useEffect } from "react";
import styles from "./App.module.scss";
import { Supporters } from "./supporters/Supporters";

export const App = () => {
    useEffect(() => {
        const sendHeight = () => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage(
                { eventName: "setHeight", data: height },
                "*"
            );
        };

        // 親からのメッセージを受信
        const handleParentMessage = (e) => {
            if (e.data.type === "updateStyles") {
                const { styles } = e.data;
                Object.keys(styles).forEach((key) => {
                    console.log(`--${key}`, styles[key]);

                    document.documentElement.style.setProperty(`--${key}`, styles[key]);
                });
            }
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

        window.addEventListener("message", handleParentMessage);

        return () => {
            observer.disconnect();
            window.removeEventListener("message", handleParentMessage);
        };
    }, []);

    return (
        <div className={styles.container}>
            <Supporters />
        </div>
    );
};
