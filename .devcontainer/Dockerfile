FROM mcr.microsoft.com/devcontainers/base:noble

USER vscode

WORKDIR /home/vscode
RUN sudo apt-get update -y
RUN sudo apt-get install graphviz -y
RUN curl -L https://nixos.org/nix/install -o install.sh && chmod +x ./install.sh && sudo ./install.sh


COPY ./install.sh ./
RUN sudo ./install.sh
RUN rm ./install.sh