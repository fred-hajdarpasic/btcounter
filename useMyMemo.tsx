/* eslint-disable prettier/prettier */
import React from 'react';

function useMyMemo<T>(initialValue: T): [() => T, (newValue: T) => void] {
    const [getValue, setValue] = React.useMemo(() => {
        let value = initialValue;
        return [() => value,
            (newValue: T) => {
                value = newValue;
            }];
    }, [initialValue]);

    return [getValue, setValue];
}

export default useMyMemo;
