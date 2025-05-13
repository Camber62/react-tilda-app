import styles from './LoadingDots.module.css';

const LoadingDots = () => {
    return (
        <div className={styles.messageLoading}>
            <div className={styles.dots}>
                <span className={`${styles.dot} ${styles.dot1}`}></span>
                <span className={`${styles.dot} ${styles.dot2}`}></span>
                <span className={`${styles.dot} ${styles.dot3}`}></span>
            </div>
        </div>
    )
}

export default LoadingDots;