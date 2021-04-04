import React from 'react';

const useRefreshTimer = (interval: number, tickFunction: () => void) => {
    React.useEffect(() => {
        let timerId: NodeJS.Timeout;
        const start = () => {
            timerId = setInterval(() => {
                console.log('Timer tick');
                tickFunction();
            }, interval);
        };

        const stop = () => {
            console.log('Refresh timer cleanup');
            clearInterval(timerId);
        };

        start();
        return () => {
            stop();
        };
    }, [interval, tickFunction]);
};

export default useRefreshTimer;
