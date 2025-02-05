import styles from "./SupportersContainer.module.scss";
import vrct_supporters_title from "@supporters_page_assets/vrct_supporters_title.png";
import calc_period_label from "@supporters_page_assets/calc_period_label.png";
import { SupportersWrapper } from "./supporters_wrapper/SupportersWrapper";

import json_data from "@supporters_page_assets/data.json";
const supporters_settings = json_data.supporters_settings;
const last_updated_local_date = new Date(supporters_settings.last_updated_utc_date).toLocaleString();

export const SupportersContainer = () => {
    return (
        <div className={styles.supporters_container}>
            <div className={styles.vrct_supporters_title_wrapper}>
                <img className={styles.vrct_supporters_title} src={vrct_supporters_title}/>
                <img className={styles.calc_period} src={calc_period_label}/>
                <p className={styles.last_updated_local_date}>{`Last updated date: ${last_updated_local_date}`}</p>
            </div>
            <SupportersWrapper />
            <p className={styles.vrct_supporters_desc_end}>{`みなさんのおかげで、みしゃ社長は布団で寝ることを許され(in開発室) しいなは喜び庭駆け回っています！！！ふわもちもぐもぐです！ありがとうございます。これからもまだまだ進化するVRCTをどうかよろしくお願いします！\nThanks to everyone, Misha has been granted the privilege of sleeping in a proper bed (in the development room), and Shiina is so happy, running around the yard! Fuwa-mochi-mogu-mogu! Thank you so much! We hope you'll continue to support the ever-evolving VRCT!`}</p>
        </div>
    );
};