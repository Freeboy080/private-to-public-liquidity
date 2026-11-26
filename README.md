# How can banks connect private blockchains to public DeFi liquidity?

Banks usually connect through a controlled gateway: an asset is locked or issued on one side, a matching token is minted or issued on the public side, and the eligibility check travels with the transfer. Three patterns exist today, validated cross-chain messaging, bank-issued tokens on public chains, and compliance-gated bridges, and each solves a different part of the problem.

Checked by me on Nov 26, 2026: every BRL1.p token on Rayls is backed 1:1 by BRL1 locked in a bridge contract on Polygon. At Rayls block 15,236,865 the supply and the locked amount were both 36.818245, a difference of 0. I also simulated calls to JPM Coin's token contract on Base, and it rejects calls involving addresses it does not recognise. Method and files are below.

## Two definitions

A private blockchain is a chain where an operator or its members decide who can join and who can read the data. Public DeFi liquidity means the pools, vaults and markets on open chains, where anyone with an address can take part, subject to each token's own rules.

## Three patterns

| Pattern | How it connects | Examples in this piece |
|---|---|---|
| Validated cross-chain messaging | A network validates a message on one chain and a contract acts on it on another | Chainlink CCIP, Swift's experiment |
| Bank-issued tokens on public chains | The bank issues a token on a public chain for its clients | JPM Coin on Base and Ethereum, plans for Canton |
| Compliance-gated bridge | Lock or burn on one ledger, mint or unlock on the other, with eligibility checked in the call | Rayls Sovereign to Public Chain route |

### 1. Validated cross-chain messaging

[Chainlink](https://chain.link/article/cross-chain-banking-infrastructure) describes its Cross-Chain Interoperability Protocol (CCIP) as enabling "the secure transfer of data and value between public and private blockchains". In its words, a contract on the source chain starts the request, node operators validate it offchain, and a contract on the destination chain credits an account or unlocks an asset. It also describes an Automated Compliance Engine that runs allow-list checks before transfers.

In 2023 Swift ran an experiment with CCIP to test whether institutions could handle tokenised assets on public and private chains using their existing back-end systems. [The Block](https://www.theblock.co/post/248293/swift-chainlink-ccip/) lists ANZ, BNP Paribas, BNY Mellon, Citi, Clearstream, Euroclear, Lloyds Banking Group, SIX Digital Exchange and DTCC as participants, and reports that Swift said the tests "successfully demonstrated" a secure connection. These are the vendors' and press descriptions. I did not test CCIP.

### 2. Bank-issued tokens on public chains

JPM Coin (JPMD) is a USD deposit token issued by Kinexys by J.P. Morgan. [The Block](https://www.theblock.co/news/business/2025-11-12-jpmorgan-deposit-token-jpm-coin-378493) reported on Nov 12, 2025 that it rolled out to institutional clients on Base, as "a representation of JPMorgan's existing bank deposits on a public blockchain". [JPMorgan's newsroom](https://www.jpmorgan.com/payments/newsroom/jpm-coin-live-on-ethereum) announced Ethereum availability on Oct 19, 2026 and says the token is "available to J.P. Morgan's institutional clients".

On Jan 7, 2026, Kinexys and Digital Asset [announced plans](https://www.theblock.co/news/business/2026-01-07-jpmorgan-jpm-coin-canton-384575) to launch JPM Coin on the Canton Network, with a phased rollout through 2026. I did not verify whether it is live there. [Canton](https://canton.network/) describes itself, in its own words, as "the only public blockchain with real privacy built for regulated markets", with a Global Synchronizer as its interoperability backbone. Separately, Interstice Digital launched a non-custodial swap engine with FalconX that links Canton with Ethereum, Solana and Robinhood Chain ([Cointelegraph](https://cointelegraph.com/news/interstice-falconx-cross-chain-swap-engine-canton-solana-ethereum-robinhood-chain), Aug 18, 2026). The initial supported assets were not disclosed.

### 3. Compliance-gated bridge

The [Rayls docs](https://docs.rayls.com/docs/connecting-rayls-sovereign-to-the-public-chain) describe a direct route from a Rayls Sovereign ledger, a bank's own EVM ledger, to the Rayls Public Chain. Tokens are locked on the Sovereign ledger and a mirror token is minted on the public chain. Going back, the mirror is burned and the original is unlocked. Only users registered in a user governance contract can call it, which the docs describe as "how KYC and compliance requirements are carried into the bridge itself". Each message carries a stored revert payload, so in the docs' words "Tokens are either delivered to the destination or returned to the sender".

A [Rayls blog post](https://www.rayls.com/blog/the-private-public-settlement-flow-tokenised-deposits-and-stablecoins-on-rayls) (vendor-authored) gives a settlement example: a local-currency tokenised deposit paid into a liquidity provider account inside the Sovereign chain triggers issuance of a dollar-denominated stablecoin on the Public Chain, with the currency conversion at the boundary. I read the docs and the post. I did not trace a Sovereign-to-Public transaction.

## What I checked myself

### Check 1: is BRL1.p backed 1:1 on the other chain?

BRL1.p is a bridged token on the Rayls Public Chain. [Rayls's guide](https://docs.rayls.com/docs/get-brl1p) says the bridge uses LayerZero, holds BRL1 in a contract on Polygon, and mints the same amount of BRL1.p. I compared the two sides with public RPC reads.

- Run time: 2026-11-26 08:08:28 UTC
- Rayls: block 15,236,865, BRL1.p (proxy 0xA069d3798FEAb32994aC5D98A9F011DA6024f334) totalSupply raw 36818245000000000000
- Polygon: block 97,983,374, BRL1 (0x5C067C80C00eCd2345b05E83A3e758eF799C40B5) balanceOf the bridge contract 0x3Ea6BaC7d4138BcC126D0F17aE10122B3620abA6, raw 36818245000000000000
- Difference: 0

On Oct 21, when the supply was 250,013.482911, the same comparison also gave a difference of 0 (details in the earlier gist). So the locked amount matched the supply at both readings, even though the supply was very different each time. Both bridge contracts have an owner account. As of Oct 21 it was the same ordinary account on both chains (0x633Ac5e2315b973417e8caa6B3Ad2162e0461ce1). I did not audit the bridge code or what the owner can do.

### Check 2: is access gated in the contract?

Rayls's first live vault (TokenOne TKONE02, 0x1811630B90e6966573e809270a5e9316A25DE6fe) takes BRL1.p and runs on Lagoon v0.6.0. Its contract keeps an access list. By Nov 21 it logged 6 addToWhitelist calls, 1 revokeFromWhitelist and 1 switchAccessMode call. Its share price and total assets matched [Rayls's own vaults page](https://dapp.rayls.com/vaults). Method, hashes and files are in the vault gist: https://gist.github.com/Freeboy080/4117a1371857eb65a335775094aaab65

### Check 3: does a bank-issued token check addresses in its own contract?

JPM Coin's deposit token (JPMD) on Base is at 0x7e0aedc93d9f898be835a44bfca3842e52416b82. I took the address from [CoinMarketCap's listing](https://coinmarketcap.com/currencies/jp-morgan-deposit-token/), and [BaseScan](https://basescan.org/token/0x7e0aedc93d9f898be835a44bfca3842e52416b82) labels it Kinexys. I did not find it on a JPMorgan page. I used public RPC reads and simulations (eth_call, nothing was sent) on Nov 26, 2026 at 08:17 UTC, Base block 62,453,432.

- Name and symbol JPMD, 2 decimals, total supply 1,001,000.00, and paused() returns false.
- The token is a proxy. Its implementation is 0x620244706ba6c771ec417662a0bfb6fe6d1c5ae2.
- The implementation code contains role functions (hasRole, grantRole), pause and unpause, mint, burn and an upgrade function (upgradeToAndCall). Presence in code does not say who holds the roles, and I did not identify them.
- A simulated transfer of 0 from a random address reverted with a custom error, selector 0x1a59ff33, naming the sender. A simulated approve of 0 from the same address reverted with the same selector, naming the spender. I could not identify the error's name.
- A public balanceOf read from the same address worked.

So the contract rejected both calls with an error that names an address I had just generated, which means the check depends on the addresses involved. I do not call it an allow-list because I could not identify the error. How an address gets approved is not visible onchain, and I did not test an approved address.

## Where Rayls fits

These patterns are not rivals. A messaging network connects many chains. An issuer token reaches existing clients on chains that already have liquidity. Rayls's documented route puts the bank's own ledger and the public chain in one stack, and checks eligibility inside the bridge call. This comparison is my own synthesis of the sources above, not a taxonomy from any of them. Checks 2 and 3 have one point in common: the contract itself keeps track of addresses. Check 2 logs the vault's whitelist calls and Check 3 shows JPM Coin rejecting an unknown address. I tested a rejection only for JPM Coin.

## Limits

- Check 1 is a public-to-public bridge from Polygon. It shows what the public side of a lock-and-mint design looks like. It is not the Sovereign-to-Public gateway.
- The private side of the Rayls route is documented only. I traced no Sovereign ledger transaction.
- CCIP, JPM Coin, Canton and the Interstice engine are described from vendor pages and press, not tested by me.
- I did not verify whether JPM Coin is live on Canton.
- Chainlink, Swift, J.P. Morgan and Canton are examples I describe from their own pages and press. I do not claim any of them works with Rayls.
- Check 3 used simulations only. The JPMD address comes from CoinMarketCap and a BaseScan label, the error's name is unidentified, I did not identify who holds the roles, and I did not test an approved account.
- Checks 2 and 3 are different contracts on different chains. They show that both keep track of addresses, not that they work the same way.
- The two reads in Check 1 are a few seconds apart, so a bridge transfer in progress can show a small difference.
- This is not investment advice.

## Reproduce it (about 10 seconds)

    python3 backing_check.py

It prints the Rayls supply and the Polygon balance of the bridge contract and their difference. The numbers change as people bridge, so expect the difference to stay at 0 while the amounts move. My saved run is in backing_check_output.txt.

Checks 2 and 3 use node and ethers (npm install ethers):

    node jpmd_check.js
    node jpmd_error.js

They read the public Base RPC and send nothing. My saved runs are jpmd_check_output.txt and jpmd_error_output.txt.

## Sources (accessed Nov 26, 2026)

- Chainlink, cross-chain banking infrastructure: https://chain.link/article/cross-chain-banking-infrastructure
- The Block, Swift and Chainlink CCIP experiment (Aug 31, 2023): https://www.theblock.co/post/248293/swift-chainlink-ccip/
- The Block, JPM Coin on Base (Nov 12, 2025): https://www.theblock.co/news/business/2025-11-12-jpmorgan-deposit-token-jpm-coin-378493
- JPMorgan, JPM Coin live on Ethereum: https://www.jpmorgan.com/payments/newsroom/jpm-coin-live-on-ethereum
- The Block, JPM Coin on Ethereum (Oct 19, 2026): https://theblock.co/news/business/2026-10-19-jpmorgan-jpm-coin-deposit-token-ethereum-418874
- The Block, JPM Coin on Canton (Jan 7, 2026): https://www.theblock.co/news/business/2026-01-07-jpmorgan-jpm-coin-canton-384575
- Canton Network: https://canton.network/
- Cointelegraph, Interstice and FalconX (Aug 18, 2026): https://cointelegraph.com/news/interstice-falconx-cross-chain-swap-engine-canton-solana-ethereum-robinhood-chain
- Rayls docs, connecting a Sovereign ledger to the Public Chain: https://docs.rayls.com/docs/connecting-rayls-sovereign-to-the-public-chain
- Rayls, the private-public settlement flow: https://www.rayls.com/blog/the-private-public-settlement-flow-tokenised-deposits-and-stablecoins-on-rayls
- Rayls docs, getting BRL1.p: https://docs.rayls.com/docs/get-brl1p
- Rayls vaults page: https://dapp.rayls.com/vaults
- BRL1.p backing check, Oct 21 gist: https://gist.github.com/Freeboy080/5dc543a13280b0482108698949851844
- Vault check gist: https://gist.github.com/Freeboy080/4117a1371857eb65a335775094aaab65
- BaseScan, JPMD token page: https://basescan.org/token/0x7e0aedc93d9f898be835a44bfca3842e52416b82
- CoinMarketCap, J.P. Morgan Deposit Token listing: https://coinmarketcap.com/currencies/jp-morgan-deposit-token/
