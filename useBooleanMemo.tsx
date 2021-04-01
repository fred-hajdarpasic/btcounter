/* eslint-disable prettier/prettier */
import React from 'react';

const useBooleanMemo = (initialValue: boolean): [() => boolean, (newValue: boolean) => void] => {
    const [getValue, setValue] = React.useMemo(() => {
        let counter = initialValue;
        return [() => counter,
            (newValue: boolean) => {
                counter = newValue;
            }];
    }, [initialValue]);

    return [getValue, setValue];
};

export default useBooleanMemo;
