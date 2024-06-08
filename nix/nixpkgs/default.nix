{ system ? builtins.currentSystem, ... }:

import (builtins.fetchTarball {
  name = "nixos-24.05-2024-06-07";
  url = "https://github.com/NixOS/nixpkgs/archive/9e1c14684ff3cbfac7487f97d9929393a2aa9854.tar.gz";
  sha256 = "00d4rbk9i90xm3xdxl3z0c05bjvgmhr8vz2ljc0zq9m4d3brsk2h";
}) {
  inherit system;
  overlays = [];
  config = {};
}