/* eslint-disable prettier/prettier */
import React from 'react';

const useTimer = (interval: number, tickFunction: () => void):
    [
        () => void,
        () => void
    ] => {

    const [start, stop] = React.useMemo((): [() => void, () => void] => {
        let timerId: NodeJS.Timeout;
        const startTimer = () => {
            timerId = setInterval(() => {
                // console.log('Timer tick');
                tickFunction();
            }, interval);
            return timerId;
        };

        const stopTimer = () => {
            // console.log('Down timer cleanup');
            clearInterval(timerId);
        };

        return [startTimer, stopTimer];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        // start();
        return () => {
            stop();
        };
    }, [start, stop]);

    return [start, stop];
};

export default useTimer;
