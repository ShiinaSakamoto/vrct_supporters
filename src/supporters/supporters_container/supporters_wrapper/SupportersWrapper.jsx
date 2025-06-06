import React, { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import ArrowLeftSvg from "@images/arrow_left.svg?react";
import styles from "./SupportersWrapper.module.scss";
import { shuffleArray, randomIntMinMax, randomMinMax } from "@utils";

import json_data from "@supporters_page_assets/data.json";
const supporters_settings = json_data.supporters_settings;
const supporters_data = json_data.supporters_data;

const calc_support_period = supporters_settings.calc_support_period;

const chato_ex_count = supporters_settings.chato_ex_count;

const image_sets = {
    supporter_cards: import.meta.glob("@supporters_page_assets/supporter_cards/*.png", { eager: true }),
    chato_expressions: import.meta.glob("@supporters_page_assets/chato_expressions/*.png", { eager: true }),
    supporters_labels: import.meta.glob("@supporters_page_assets/supporters_labels/*.png", { eager: true }),
    supporters_icons: import.meta.glob("@supporters_page_assets/supporters_icons/*.png", { eager: true }),
};

const SHUFFLE_INTERVAL_TIME = 20000;

const and_you_data = {
    supporter_id: "and_you",
};

const getImagePath = (images, file_name) => {
    const image_path = Object.keys(images).find((path) => path.endsWith(`${file_name}.png`));
    return image_path ? images[image_path]?.default : null;
};



const getSupporterCard = (plan_name) => {
    const card_map = {
        "mogu_2000": "mogu_card",
        "mochi_1000": "mochi_card",
        "fuwa_500": "fuwa_card",
        "basic_300": "basic_card",
    };
    return getImagePath(image_sets.supporter_cards, card_map[plan_name] || "basic_card");
};

const getChatoExpressionsPath = (file_name) =>
    getImagePath(image_sets.chato_expressions, file_name);

const getSupportersLabelsPath = (file_name) =>
    getImagePath(image_sets.supporters_labels, file_name);

const getSupportersIconsPath = (file_name) =>
    getImagePath(image_sets.supporters_icons, file_name);


export const SupportersWrapper = () => {
    // const { saveScrollPosition, restoreScrollPosition } = useSettingBoxScrollPosition();

    const grouped_data = {
        mogu_2000: [],
        mochi_1000: [],
        fuwa_500: [],
        basic_300: [],
        former_supporter: [],
        and_you: [],
    };

    supporters_data.forEach((supporter) => {
        const value = supporter.highest_plan_during_the_period || "former_supporter";
        if (grouped_data[value]) {
            grouped_data[value].push(supporter);
        } else {
            grouped_data["former_supporter"].push(supporter);
        }
    });

    const [supportersData, setSupportersData] = useState(() => [
        ...grouped_data["mogu_2000"],
        ...grouped_data["mochi_1000"],
        ...grouped_data["fuwa_500"],
        ...grouped_data["basic_300"],
        ...grouped_data["former_supporter"],
        and_you_data,
    ]);


    const [chatoExpressions, setChatoExpressions] = useState(() =>
        supportersData.map(() =>
            getChatoExpressionsPath(`chato_expression_${randomIntMinMax(1, chato_ex_count)}`)
        )
    );


    const shuffleSupporters = useCallback(() => {
        // saveScrollPosition();
        const newSupportersData = [
            ...shuffleArray(grouped_data["mogu_2000"]),
            ...shuffleArray(grouped_data["mochi_1000"]),
            ...shuffleArray(grouped_data["fuwa_500"]),
            ...shuffleArray(grouped_data["basic_300"]),
            ...shuffleArray(grouped_data["former_supporter"]),
            and_you_data,
        ];
        setSupportersData(newSupportersData);


        setChatoExpressions(
            newSupportersData.map(() =>
                getChatoExpressionsPath(`chato_expression_${randomIntMinMax(1, chato_ex_count)}`)
            )
        );
        // setTimeout(() => restoreScrollPosition(), 0);
    }, [grouped_data]);

    const renderImages = () => {
        return supportersData.map((item, index) => {
            const target_plan = item.highest_plan_during_the_period;
            const img_src = getSupporterCard(target_plan);
            const is_default_icon = item.supporter_icon_id === "";
            const is_icon_plan = ["mogu_2000", "mochi_1000"].includes(target_plan);
            const is_and_you = item.supporter_id === "and_you";

            const random_delay = `${randomMinMax(0.1, 6).toFixed(1)}s`;



            const file_name = is_and_you ? "and_you" : `supporter_${item.supporter_id}`;
            const label_img_src = getSupportersLabelsPath(file_name);
            const icon_img_src = getSupportersIconsPath(`supporter_icon_${item.supporter_icon_id}`);

            const supporter_label_component_classname = clsx(styles.supporter_label_component, {
                [styles.is_icon_plan]: is_icon_plan,
            });

            const supporterLabelComponent = () => (
                <div className={supporter_label_component_classname}>
                    {is_icon_plan && (
                        <div className={styles.supporter_icon_wrapper}>
                            {is_default_icon ? (
                                <img
                                    className={styles.default_chato_expression_image}
                                    src={chatoExpressions[index]}
                                />
                            ) : (
                                <img className={styles.supporter_icon} src={icon_img_src} />
                            )}
                        </div>
                    )}
                    <img className={styles.supporter_label_image} src={label_img_src} />
                </div>
            );



            const supporter_image_wrapper_classname = clsx(styles.supporter_image_wrapper, {
                [styles.mogu_image]: target_plan === "mogu_2000",
            });

            return is_and_you ? (
                <a href="#support_us_container" key={item.supporter_id}>
                    <div className={styles.supporter_image_container}>
                        <div
                            className={supporter_image_wrapper_classname}
                            style={{ "--delay": random_delay }}
                        >
                            <img className={styles.supporter_image} src={img_src} />
                            {supporterLabelComponent()}
                            <AndYouIcon />
                        </div>
                    </div>

                </a>
            ): img_src ? (
                <div key={item.supporter_id} className={styles.supporter_image_container}>
                    <div
                        className={supporter_image_wrapper_classname}
                        style={{ "--delay": random_delay }}
                    >
                        <img className={styles.supporter_image} src={img_src} />
                        {supporterLabelComponent()}
                    </div>
                    <SupporterPeriodContainer settings={item} calc_support_period={calc_support_period}/>
                </div>
            ) : null;
        });
    };


    useEffect(() => {
        shuffleSupporters();
        const interval = setInterval(() => {
            shuffleSupporters();
        }, SHUFFLE_INTERVAL_TIME);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <ProgressBar />
            <div className={styles.supporters_wrapper}>{renderImages()}</div>
            <ProgressBar />
        </div>
    );
};


const AndYouIcon = () => {
    return (
        <>
            <div className={styles.and_you_container}>
                <div className={styles.and_you_1}></div>
                <div className={styles.and_you_2}></div>
            </div>
            <p className={styles.and_you_fanbox_link_text}>
                FANBOX Ko-fi Patreon
            </p>
            <ArrowLeftSvg className={styles.arrow_left_svg} />
        </>
    );
};

const SupporterPeriodContainer = ({ settings, calc_support_period }) => {
    const period_data = extractKeys(settings, calc_support_period);
    const offset = {
        popper: {
            sx: {
                [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]: { marginBottom: "0.2em" },
            }
        }
    };

    return (
        <div className={styles.supporter_period_container}>
            <div className={styles.supporter_period_wrapper}>
                {Object.entries(period_data).map(([key, item], index) => {
                    if (item === "") return null;
                    const period_box_class_name = clsx(styles.period_box, {
                        [styles.mogu_bar]: item === "mogu_2000",
                        [styles.mochi_bar]: item === "mochi_1000",
                        [styles.fuwa_bar]: item === "fuwa_500",
                        [styles.basic_bar]: item === "basic_300",
                    });

                    return (
                        <Tooltip
                            key={index}
                            title={
                                <p className={styles.tooltip_period_label}>{key}</p>
                            }
                            placement="top"
                            slotProps={offset}
                        >
                            <div className={styles.period_box_wrapper}>
                                <div className={period_box_class_name}></div>
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
};



const extractKeys = (data, keys_to_extract) => {
    const result = {};
    for (const key of keys_to_extract) {
        if (key in data) {
            result[key] = data[key];
        }
    }
    return result;
};


const ProgressBar = () => {
    const [is_active, setIsActive] = useState(false);
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsActive(true);
            });
        });

        const interval = setInterval(() => {
            setIsActive(false);
            setTimeout(() => setIsActive(true), 50);
        }, SHUFFLE_INTERVAL_TIME);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={clsx(styles.progress_bar, {
                [styles.progress_bar_active]: is_active,
            })}
        />
    );
};