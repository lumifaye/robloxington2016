# Robloxington 2016 Web Client (prototype)

This directory is the starting point for a browser-based client effort. It is **not yet a playable port** of the native WindowsClient.

## Why this is a separate client

The existing 2016 client is a native Windows C++ application built around an old Visual Studio/MSVC toolchain and platform-specific graphics, input, audio, and networking dependencies. It cannot be made browser-compatible just by moving its executable or changing a build flag. A true port would require either:

1. porting/replacing platform-specific engine systems and compiling a supported subset to WebAssembly/WebGL, or
2. implementing a browser client that speaks the revival's protocol and renders replicated world data itself.

The second route is likely the practical first milestone. The native client and Rocknet protocol/server behavior need to be inspected before implementing networking; this prototype intentionally does not invent a protocol or claim to connect to servers.

## Run

Open `index.html` in a modern browser. It is a static prototype and requires no build step.

## Milestones

- [x] Establish a browser entry point and render surface.
- [ ] Inspect the existing client, networking code, and Rocknet protocol; document the supported handshake and replication messages.
- [ ] Define a minimal browser-safe protocol adapter.
- [ ] Render replicated parts and basic camera controls.
- [ ] Add avatar movement, physics compatibility, audio, UI, and asset loading incrementally.
- [ ] Add a local mock server for deterministic tests before connecting to a live revival server.

Do not expose production credentials or connect this prototype to an untrusted server. The page currently runs entirely locally.
