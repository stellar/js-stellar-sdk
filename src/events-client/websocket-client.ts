import WebSocket from 'ws';

class EventSourcePolyfill {
  private url: string;
  private ws: WebSocket | null = null;
  private eventListeners: { [key: string]: ((event: any) => void)[] } = {};
  private reconnectTimeout: number;

  constructor(url: string, options?: { reconnectTimeout?: number }) {
    this.url = url.replace(/^http/, 'ws');
    this.reconnectTimeout = options?.reconnectTimeout || 15000;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      this.dispatchEvent({ type: 'open' });
    });

    // Similarly, update other event handlers
    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data as string);
      this.dispatchEvent({ type: 'message', data });
    });

    this.ws.addEventListener('error', (error) => {
      this.dispatchEvent({ type: 'error', error });
    });

    this.ws.addEventListener('close', () => {
      setTimeout(() => this.connect(), this.reconnectTimeout);
    });
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (this.eventListeners[type]) {
      this.eventListeners[type] = this.eventListeners[type].filter(l => l !== listener);
    }
  }

  private dispatchEvent(event: { type: string;[key: string]: any }) {
    if (this.eventListeners[event.type]) {
      this.eventListeners[event.type].forEach(listener => listener(event));
    }

    const onPropertyName = `on${event.type}` as keyof this;
    const onMethod = this[onPropertyName] as ((event: any) => void) | undefined;
    if (typeof onMethod === 'function') {
      onMethod.call(this, event);
    }
  }

  close() {
    this.ws?.close();
  }

  // Define properties to mimic EventSource
  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  get CONNECTING() { return WebSocket.CONNECTING; }
  get OPEN() { return WebSocket.OPEN; }
  get CLOSED() { return WebSocket.CLOSED; }

  // Event handler properties
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
}

export { EventSourcePolyfill as EventSourceClient };
