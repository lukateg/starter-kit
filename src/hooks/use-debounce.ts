"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * A hook that returns a debounced version of the callback function.
 * The debounced function will only execute after the specified delay
 * has passed since the last call.
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  return debouncedCallback;
}

/**
 * A hook that debounces a value. Returns the debounced value
 * which only updates after the specified delay has passed.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A hook that debounces a value and also returns whether we're currently
 * waiting for the debounce to complete (useful for showing loading states).
 *
 * @returns [debouncedValue, isDebouncing] - The debounced value and a boolean
 * indicating if we're waiting for the debounce timer.
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number
): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    // If value matches debounced value, no need to debounce
    if (value === debouncedValue) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, debouncedValue]);

  return [debouncedValue, isDebouncing];
}
