/* eslint-disable prettier/prettier */
import React from 'react';

function useMyMemo<T>(initialValue: T): [() => T, (newValue: T) => void] {
    const [getValue, setValue] = React.useMemo(() => {
        let counter = initialValue;
        return [() => counter,
            (newValue: T) => {
                counter = newValue;
            }];
    }, [initialValue]);

    return [getValue, setValue];
};

export default useMyMemo;
