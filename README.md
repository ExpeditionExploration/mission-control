# Installation

- Install Node.js 18+ from https://nodejs.org/en/download or your distribution package manager
- Download and install [Nix package manager](https://nixos.org/download/).
- Enable `nix-command` and `flakes` in `~/.config/nix/nix.conf` via
    `extra-experimental-features = nix-command flakes`
- Install livekit by running:

```bash
nix profile add \
        nixpkgs#livekit \
        nixpkgs#livekit-cli \
        nixpkgs#livekit-ingress \
        nixpkgs#livekit-libwebrtc
```

- Install Node.js dependencies with `npm install`
- Copy `.env.example` to `.env`, then provide your LiveKit credentials and the
    external token server URL (see `mission-control-remote` for a reference
    implementation)

Note: Nix is a package manager, while NixOS is a Linux distro using it. Just to
      avoid confusion. It is also possible to install as a non-root user.

Note: Please use real host device ip instead of vscode port forwards for
        WebRTC to work.
        