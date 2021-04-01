/* eslint-disable prettier/prettier */
import React from 'react';

const useNumberMemo = (initialValue: number): [() => number, (newValue: number) => void] => {
    const [getValue, setValue] = React.useMemo(() => {
        let counter = initialValue;
        return [() => counter,
            (newValue: number) => {
                counter = newValue;
            }];
    }, [initialValue]);

    return [getValue, setValue];
};

export default useNumberMemo;
