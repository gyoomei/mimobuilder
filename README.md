# 🛠️ MiMoBuilder

> **Multi-chain developer reputation profiler powered by Xiaomi MiMo V2.5.**
> Paste any EVM address. Find out who's a real builder, who's a copy-cat, and who's never deployed a single line of code.

🔗 **Live demo:** [gyoomei.github.io/mimobuilder](https://gyoomei.github.io/mimobuilder/) · 📂 **Repo:** [github.com/gyoomei/mimobuilder](https://github.com/gyoomei/mimobuilder)

---

## What it does

Recruiters, investors, and DAO contributors keep falling for the same trick: a wallet that *claims* to be a senior dev, but never shipped anything. MiMoBuilder fixes that. Paste an address — the agent walks every internal transaction, enumerates every contract that wallet has deployed across **6 chains**, fetches verification status for each, classifies them across **15 expertise domains**, and composes a **0–100 builder score** with a plain-English profile explaining the verdict.

```
You paste:    0xe83f922c34a1962e9ae9f52b59e18239764f2818

MiMo replies: ⭐ SENIOR DEV — 71/100
              24 contracts deployed on Base, 50% verified, 2.8y active
              Specialization: Staking, DEX/AMM, Governance
              Reliable hire for production work.
```

That's the entire UX — paste, profile, hire (or pass).

---

## Features

| Capability | Detail |
|---|---|
| 🌐 **Multi-chain** | Ethereum · Base · Arbitrum · Polygon · Gnosis · zkSync — switch with one click |
| 📊 **Builder Score** | 0–100 weighted across deployment volume, verification rate, domain breadth, longevity |
| 🏆 **6 Trust Tiers** | NOT A BUILDER · JUNIOR · MID · SENIOR · ⭐ ELITE · ⚠ SHADY |
| 🧠 **15 Domain Tags** | ERC20 · DEX/AMM · Lending · Oracle · Bridge · NFT · Staking · Governance · Proxy · Multisig · Vault · Identity · Gaming · Utility · Token |
| 🔍 **Plain English** | Every score gets a narrative explaining *why* — not just numbers |
| 🌗 **Bilingual EN/ID** | Full translation, dark/light mode, mobile responsive |
| 🔗 **Shareable** | Deep-link any profile via `?chain=X#0x...` URL |
| 🛡 **Anti-scam** | SHADY DEV flag for copy-cat scammers (deployed many but verified zero) |

---

## How it works

```
┌─────────────────────────────────────────────────────────────────┐
│  Input: 0xabc... or vitalik.eth                                 │
│                          ↓                                       │
│  ENS Resolver (ensideas)  →  resolved hex address               │
│                          ↓                                       │
│  Blockscout v2 API        →  internal-txs + transactions        │
│  (chain-specific endpoint)   walk all CREATE operations          │
│                          ↓                                       │
│  Contract Enricher        →  fetch verification + metadata      │
│  (parallel, top 12)          for each deployed contract         │
│                          ↓                                       │
│  Domain Classifier        →  pattern-match contract names       │
│  (15 categories)             across 60+ keywords                 │
│                          ↓                                       │
│  Builder Score Engine     →  weighted formula:                  │
│                              · Deploy volume (30%)               │
│                              · Verify rate (25%)                 │
│                              · Domain breadth (20%)              │
│                              · Longevity (15%)                   │
│                              · Anti-scam check (10%)             │
│                          ↓                                       │
│  Tier + Narrative         →  Plain-English profile in EN or ID  │
└─────────────────────────────────────────────────────────────────┘
```

**Zero backend.** Everything runs client-side in your browser. No API key. No tracking.

---

## The 6 trust tiers

| Tier | Score | Profile |
|---|---|---|
| **NOT A BUILDER** | 0–10 | No deployments — regular user wallet, multisig signer, or trader |
| **JUNIOR DEV** | 11–35 | Has shipped contracts but limited volume or domain breadth |
| **MID-LEVEL DEV** | 36–55 | Solid track record, multiple verified deployments, fits contributor roles |
| **SENIOR DEV** | 56–75 | Substantial deployment history with strong verification discipline |
| **⭐ ELITE BUILDER** | 76–100 | Top-tier — protocol-level work, broad expertise, long-term active |
| **⚠ SHADY DEV** | flag | Many deploys but ≤10% verified — copy-cat or scam pattern |

---

## Try these examples

| Address | Chain | Expected verdict |
|---|---|---|
| `0x36928500bc1dcd7af6a2b4008875cc336b927d57` | Ethereum | USDT/Tether deployer — SENIOR |
| `0x51f22ac850d29c879367a77d241734acb276b815` | Ethereum | AAVE Protocol deployer — MID-LEVEL, 6 domains |
| `0xe83f922c34a1962e9ae9f52b59e18239764f2818` | Base | Aerodrome DEX deployer — SENIOR |
| `0xdd9176ea3e7559d6b68b537ef555d3e89403f742` | Base | Friend.tech deployer |
| `0x476307dac3fd170166e007fcaa14f0a129721463` | Polygon | Quickswap V2 factory dev |
| `vitalik.eth` | Ethereum | NOT A BUILDER — user wallet, no deploys |

---

## Stack

- **Frontend:** Vanilla JavaScript, single HTML file (~50KB total)
- **Data:** [Blockscout v2 API](https://eth.blockscout.com/api/v2) (6 chains, all free, no key)
- **ENS:** [ensideas.com](https://api.ensideas.com) free resolver
- **AI:** [Xiaomi MiMo V2.5](https://github.com/XiaomiMiMo) — narrative composition + persona reasoning
- **Hosting:** GitHub Pages (zero infra cost)

---

## Architecture decisions

**Why single HTML?** Zero deploy friction, zero backend cost, easy to fork. Anyone can clone and self-host in one minute.

**Why client-side only?** Privacy. Your wallet queries never hit a server we control. The browser talks directly to Blockscout.

**Why Blockscout?** Free, no API key, supports all major EVM chains, returns structured `created_contract` metadata that other explorers don't expose without paid plans.

**Why 6 chains?** Coverage of where real builders ship: Ethereum (mainnet protocols), Base (Coinbase L2 ecosystem), Arbitrum (DeFi hub), Polygon (gaming + scale), Gnosis (DAO tooling), zkSync (privacy-aware deployments).

---

## Roadmap

- [ ] Add Optimism + Scroll + Linea chains
- [ ] GitHub linkage — match wallet to GitHub username via ENS records
- [ ] Audit history scoring — pull from Code4rena, Spearbit, Sherlock
- [ ] Comparison mode — profile dev A vs dev B side-by-side
- [ ] PDF export for hiring decks
- [ ] Twitter share-as-image (1080×1920 poster like MiMoStory)

---

## Run locally

```bash
git clone https://github.com/gyoomei/mimobuilder.git
cd mimobuilder
python3 -m http.server 8080
# open http://localhost:8080
```

That's it. No build step, no `npm install`, no environment config.

---

## License

MIT — fork it, ship it, take credit. Just don't pretend you're a senior dev if you've never deployed anything.

---

**Built with 🧠 [Xiaomi MiMo V2.5](https://github.com/XiaomiMiMo) · Submitted to the [Xiaomi MiMo 100T program](https://100t.xiaomimimo.com/)**
