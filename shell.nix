{ pkgs ? import ./nix/nixpkgs { } }:

let

in
with pkgs;

mkShell {
  packages = [ bazel_7 bazel-buildtools nix ];
}