import { useEffect } from "react";

type Handler = (eventName: string, handler: (event: any) => void) => void;

interface EventableShort {
  on: Handler;
  off: Handler;
}
interface EventableLong {
  addEventListener: Handler;
  removeEventListener: Handler;
}
type Eventable = EventableShort | EventableLong;

type RegisterFunctionOn<T extends Eventable> = T extends EventableShort
  ? T["on"]
  : T extends EventableLong
  ? T["addEventListener"]
  : never;

export const createEventTracker = <T extends Eventable>(eventable: T) => {
  // Add event listeners and keep track of them to remove them on cleanup
  const listeners: { eventName: string; handler: any }[] = [];
  const registerEvent: Handler = (eventName, handler) => {
    listeners.push({ eventName, handler });
    if ("on" in eventable) {
      eventable.on(eventName, handler);
    } else {
      eventable.addEventListener(eventName, handler);
    }
  };

  return {
    on: registerEvent,
    cleanup: () => {
      // remove event listeners on cleanup
      for (const { eventName, handler } of listeners) {
        if ("off" in eventable) {
          eventable.off(eventName, handler);
        } else {
          eventable.removeEventListener(eventName, handler);
        }
      }
    },
  };
};

export function useEvents<T extends Eventable>(
  eventable: T | undefined,
  registerFunction: (on: RegisterFunctionOn<T>) => void,
  dependencies: any[]
) {
  useEffect(() => {
    if (!eventable) return;
    const eventTracker = createEventTracker(eventable);
    // @ts-ignore-next-line
    registerFunction(eventTracker.on || eventTracker.addEventListener);
    return eventTracker.cleanup;
  }, [eventable, registerFunction, ...dependencies]);
}
