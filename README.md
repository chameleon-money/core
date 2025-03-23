# Chameleon - Aztec + Noir privacy layer

<p align="center">
  <img src="/dapp/public/chameleon.png" alt="Chameleon logo" width="200" height="auto">
</p>

## Overview

Chameleon is first private web-based wallet + privacy layer built with Aztec + Noir.

<p align="center">
  <img src="/dapp/public/screenshot1.png" alt="Dapp hero element" width="1000" height="auto">
</p>

Current features include:

- Generating and persistent storage of Aztec wallet in the dapp
- Portfolio management for assets stores in Aztec wallet
- Private transfers of tokens from Aztec network to Ethereum
- Private swaps initiated from Aztec and executed through Uniswap on Ethereum by using token portal
- Private bridging to Ethereum using token portal

## Chameleon Architecture

```mermaid
flowchart TD
    %% Professional styling for Chameleon architecture diagram
    %% Enhanced with better contrasts and spacing

    subgraph User["🧑‍💻 User Interaction"]
        A[Web Interface] --> B[Wallet Generation]
        A --> C[Portfolio Management]
    end

    subgraph AztecLayer["🔐 Aztec Blockchain Layer"]
        B --> D[Persistent Wallet Storage]
        D --> E[Private Asset Management]

        subgraph NoirContracts["🧩 Noir Privacy Contracts"]
            N1[Transfer Contract]
            N2[Swap Contract]
            N3[Bridge Contract]
        end

        E --> N1
        E --> N2
        E --> N3
    end

    subgraph EthLayer["⛓️ Ethereum Blockchain Layer"]
        subgraph TokenPortal["🌉 Token Portal"]
            TP[Portal Contract]
        end

        subgraph SolidityContracts["📝 Solidity Smart Contracts"]
            S1[Transfer Handler]
            S2[Swap Handler]
            S3[Bridge Handler]
        end

        subgraph DEX["💱 DEX]
            UNI[Uniswap Protocol]
        end
    end

    N1 --> TP
    N2 --> TP
    N3 --> TP

    TP --> S1
    TP --> S2
    TP --> S3

    S2 --> UNI

    classDef userInt fill:#5D4EF1,stroke:#1a1a1a,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef aztecMain fill:#408AC9,stroke:#1a1a1a,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef noir fill:#2E5793,stroke:#1a1a1a,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef ethMain fill:#4CAF50,stroke:#1a1a1a,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef portal fill:#FF9800,stroke:#1a1a1a,stroke-width:2px,color:#1a1a1a,font-weight:bold;
    classDef solidity fill:#229954,stroke:#1a1a1a,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef dex fill:#6AC957,stroke:#1a1a1a,stroke-width:2px,color:#1a1a1a,font-weight:bold;

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
