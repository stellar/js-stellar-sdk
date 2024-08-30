// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __USE_EVENTSOURCE__: boolean;

// eslint-disable-next-line import/no-mutable-exports
let eventSourceClient;

if (__USE_EVENTSOURCE__) {
  // eslint-disable-next-line global-require, prefer-import/prefer-import-over-require
  const eventsourceModule = require('./eventsource-client');
  eventSourceClient = eventsourceModule.EventSourceClient;
} else {
  // eslint-disable-next-line global-require, prefer-import/prefer-import-over-require
  const websocketModule = require('./websocket-client');
  eventSourceClient = websocketModule.EventSourceClient;
}

export { eventSourceClient };

