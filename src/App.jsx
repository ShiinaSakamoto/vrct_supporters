import styles from "./App.module.scss";
import { Supporters } from "./supporters/Supporters";

export const App = () => {
    return (
        <div className={styles.container}>
            <Supporters />
        </div>
    );
};