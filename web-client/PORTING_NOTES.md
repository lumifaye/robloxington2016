# Porting notes: native client to browser

## What the repository establishes

The project targets the original 2016 Windows client and lists WindowsClient, RCCService, Network, graphics3D, GfxRender, GfxCore, SDL2, Qt 4.8.5, Boost 1.56, OpenSSL 1.0.0c, and RakNet 5 among its legacy components. The documented build flow uses Visual Studio 2012-era tooling and Windows-specific project configurations.

That means a browser port is not a normal rebuild. Browsers cannot run a Win32 executable, expose arbitrary TCP/UDP sockets, or provide Direct3D/Win32 APIs directly. WebAssembly can run portable C/C++ code, but platform layers must be replaced and networking must use browser-supported transports such as WebSocket or WebTransport.

## Port strategy

### Phase 1: map the protocol and engine boundaries

- Locate the actual client entry point and identify initialization order.
- Trace the client connection handshake and packet framing in `Network` / RakNet usage.
- Inspect Rocknet separately and record which protocol version and packet types it implements.
- Identify which world state the server replicates and which simulation is client-side.
- Identify renderer dependencies and isolate platform-independent math, geometry, serialization, and game-state code.

### Phase 2: prove a minimal vertical slice

- Browser UI and WebGL renderer.
- A local deterministic mock server for connection and replication tests.
- One replicated static part, then camera movement, then character movement.
- Only after the wire protocol is confirmed, implement a real server adapter. Do not guess packet IDs or pretend JSON is the legacy protocol.

### Phase 3: expand compatibility

- Assets and legacy content decoding.
- Camera and input parity.
- Replicated physics and character controllers.
- Audio, UI, scripts, and remaining engine services.

## Hard blockers / questions to answer from source

1. Is the intended server Rocknet or another implementation, and what exact revision is compatible with this fork?
2. Does the 2016 client rely on RakNet's UDP reliability/channel semantics, peer discovery, or custom packet IDs that the browser cannot reproduce directly?
3. Which code paths can be compiled without Win32, Direct3D, COM, or legacy third-party libraries?
4. Is a browser gateway needed to translate WebSocket traffic to the server's native transport? In most cases, yes if the existing server only accepts native UDP/RakNet.

## Accuracy note

The current `index.html` / `app.js` is a local UI and scene preview only. It does not load Roblox places or connect to any server. This document intentionally records unknowns instead of inventing protocol behavior.
