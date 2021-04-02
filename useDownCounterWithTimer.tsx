/* eslint-disable prettier/prettier */
import React from 'react';

import useNumberMemo from './useNumberMemo';

const useDownCounterWithTimer = (initialValue: number, interval: number):
    [
        () => number,
        () => void,
        () => void
    ] => {
    const [getValue, setValue] = useNumberMemo(initialValue);

    const [start, stop] = React.useMemo((): [() => void, () => void] => {
        let timerId: NodeJS.Timeout;
        const startTimer = () => {
            setValue(initialValue);
            timerId = setInterval(() => {
                console.log(`Down timer tick ${getValue()}`);
                if (getValue() > 0) {
                    setValue(getValue() - 1);
                } else {
                    console.log('Down timer complete - stopping');
                    clearInterval(timerId);
                }
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

    return [getValue, start, stop];
};

export default useDownCounterWithTimer;
