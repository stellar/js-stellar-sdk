const anyGlobal = global as any;
type Constructable<T> = new (e: string) => T;

// Try to get EventSource from global, window, or require it
const EventSourceImpl: Constructable<EventSource> = 
  anyGlobal.EventSource ?? 
  anyGlobal.window?.EventSource ?? 
  (() => {
    try {
      // eslint-disable-next-line global-require, prefer-import/prefer-import-over-require
      return require("eventsource");
    } catch (e) {
      throw new Error("EventSource is not available in this environment");
    }
  })();

export const EventSourceClient = EventSourceImpl;
