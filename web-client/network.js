/*
 * Browser transport seam for the future web client.
 * This is deliberately protocol-agnostic: it does NOT claim compatibility with
 * Roblox 2016, RakNet, or Rocknet. A verified codec must be supplied after the
 * native client and server packet formats have been inspected.
 */
export class BrowserTransport extends EventTarget {
  #socket = null;
  #url;
  #encode;
  #decode;

  constructor({ url, encode, decode }) {
    super();
    if (!url) throw new TypeError('A WebSocket URL is required');
    if (typeof encode !== 'function' || typeof decode !== 'function') {
      throw new TypeError('Provide verified protocol encode and decode functions');
    }
    this.#url = url;
    this.#encode = encode;
    this.#decode = decode;
  }

  get state() {
    if (!this.#socket) return 'closed';
    return ['connecting', 'open', 'closing', 'closed'][this.#socket.readyState] ?? 'unknown';
  }

  connect() {
    if (this.#socket && this.#socket.readyState < WebSocket.CLOSING) {
      throw new Error('Transport is already connecting or connected');
    }
    const socket = new WebSocket(this.#url);
    socket.binaryType = 'arraybuffer';
    this.#socket = socket;
    socket.addEventListener('open', () => this.dispatchEvent(new Event('open')));
    socket.addEventListener('error', () => this.dispatchEvent(new Event('transporterror')));
    socket.addEventListener('close', event => {
      this.dispatchEvent(new CustomEvent('close', { detail: {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      }}));
    });
    socket.addEventListener('message', async event => {
      try {
        let bytes;
        if (event.data instanceof ArrayBuffer) bytes = new Uint8Array(event.data);
        else if (event.data instanceof Blob) bytes = new Uint8Array(await event.data.arrayBuffer());
        else if (typeof event.data === 'string') bytes = new TextEncoder().encode(event.data);
        else throw new TypeError('Unsupported WebSocket message type');
        const packet = await this.#decode(bytes);
        this.dispatchEvent(new CustomEvent('packet', { detail: packet }));
      } catch (error) {
        this.dispatchEvent(new CustomEvent('decodeerror', { detail: error }));
      }
    });
    return socket;
  }

  async send(packet) {
    if (!this.#socket || this.#socket.readyState !== WebSocket.OPEN) {
      throw new Error('Transport is not connected');
    }
    const bytes = await this.#encode(packet);
    if (!(bytes instanceof Uint8Array) && !(bytes instanceof ArrayBuffer)) {
      throw new TypeError('Protocol encoder must return Uint8Array or ArrayBuffer');
    }
    this.#socket.send(bytes);
  }

  close(code = 1000, reason = 'client closed') {
    if (this.#socket && this.#socket.readyState < WebSocket.CLOSING) {
      this.#socket.close(code, reason);
    }
  }
}
