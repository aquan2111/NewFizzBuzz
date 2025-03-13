import { useState, useEffect } from "react";
import "../styles/styles.css";

interface CountdownTimerProps {
    onComplete: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ onComplete }) => {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (count === 0) {
            onComplete();
            return;
        }
        const timer = setTimeout(() => setCount(count - 1), 1000);
        return () => clearTimeout(timer);
    }, [count, onComplete]);

    return (
        <div className="countdown-timer">
            <h2>{count}</h2>
        </div>
    );
};

export default CountdownTimer;
