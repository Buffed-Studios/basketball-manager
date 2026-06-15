declare module 'sockjs-client' {
  export default class SockJS {
    constructor(url: string, _reserved?: null, options?: {
      server?: string;
      sessionId?: number | (() => string);
      transports?: string | string[];
    });
    
    onopen: ((e: Event) => void) | null;
    onmessage: ((e: MessageEvent) => void) | null;
    onclose: ((e: CloseEvent) => void) | null;
    onerror: ((e: Event) => void) | null;
    
    close(code?: number, reason?: string): void;
    send(data: string): void;
    
    readyState: number;
    
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
  }
}
