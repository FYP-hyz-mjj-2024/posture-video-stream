import { useCallback } from "react";

/**
 * A custom hook that wraps a function with a debounce timer.
 * It debounces an operation with a customizable delay.
 * 
 * Debouncing: 
 * Every call of the function will reset the timer.
 * Only the last call of the function will be invoked.
 * @param fn The call back function.
 * @param delay Delay amount in ms.
 * @returns The registered call-back function with the delay wrapped under a useCallback hook.
 */
export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 500) {
    let timer: ReturnType<typeof setTimeout>;
    return useCallback(function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    }, []);
}