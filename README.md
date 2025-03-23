# Chameleon - Aztec + Noir privacy layer

![Chameleon logo](/dapp/public/chameleon.png)

## Overview

Chameleon is first private web-based wallet + privacy layer built with Aztec + Noir.

Current features include:

- Generating and persistent storage of Aztec wallet in the dapp
- Portfolio management for assets stores in Aztec wallet
- Private transfers of tokens from Aztec network to Ethereum
- Private swaps initiated from Aztec and executed through Uniswap on Ethereum by using token portal
- Private bridging to Ethereum using token portal

```mermaid
flowchart TD
    subgraph User["User Interaction"]
        A[Web Interface] --> B[Wallet Generation]
        A --> C[Portfolio Management]
    end

    subgraph AztecLayer["Aztec Blockchain Layer"]
        B --> D[Persistent Wallet Storage]
        D --> E[Private Asset Management]

        subgraph NoirContracts["Noir Privacy Contracts"]
            N1[Transfer Contract]
            N2[Swap Contract]
            N3[Bridge Contract]
        end

        E --> N1
        E --> N2
        E --> N3
    end

    subgraph EthLayer["Ethereum Blockchain Layer"]
        subgraph TokenPortal["Token Portal"]
            TP[Portal Contract]
        end

        subgraph SolidityContracts["Solidity Smart Contracts"]
            S1[Transfer Handler]
            S2[Swap Handler]
            S3[Bridge Handler]
        end

    end

    N1 --> TP
    N2 --> TP
    N3 --> TP

    TP --> S1
    TP --> S2
    TP --> S3

    classDef userInt fill:#f9d5e5,stroke:#333,stroke-width:1px;
    classDef aztecMain fill:#d0e8fa,stroke:#333,stroke-width:1px;
    classDef noir fill:#a6c8e6,stroke:#333,stroke-width:1px;
    classDef ethMain fill:#d1e7dd,stroke:#333,stroke-width:1px;
    classDef portal fill:#ffe5b4,stroke:#333,stroke-width:1px;
    classDef solidity fill:#b7e1cd,stroke:#333,stroke-width:1px;
    classDef dex fill:#c5e8b7,stroke:#333,stroke-width:1px;

    class A,B,C userInt;
    class D,E aztecMain;
    class N1,N2,N3 noir;
    class TP portal;
    class S1,S2,S3 solidity;
    class UNI dex;
```

## Setup

## Aztec Sandbox

For testing you need to have Aztec Sandbox running locally.

## Dapp

- move into dapp dir `cd /dapp`
- install dependencies `pnpm i`
- start local web app with `pnpm run dev`

### Token Portal

For Aztec token portal scripts to work properly Node.js has to be set to version 20.0 which can be done using `nvm use 20`. If this specific version isn't available it can be installed using `nvm install 20`

### Uniswap Testing

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.25. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
