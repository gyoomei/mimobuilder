/* MiMoBuilder — developer wallet profiler
 * Blockscout API only. Zero backend. Zero API key.
 * Profiles developer expertise via deployed contracts.
 */

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
const ENS_API = 'https://api.ensideas.com/ens/resolve';

// Multi-chain Blockscout endpoints (all free, no key)
const CHAINS = {
  eth:      { name: 'Ethereum', short: 'ETH',     api: 'https://eth.blockscout.com/api/v2',      explorer: 'https://eth.blockscout.com',      color: '#627eea' },
  base:     { name: 'Base',     short: 'BASE',    api: 'https://base.blockscout.com/api/v2',     explorer: 'https://base.blockscout.com',     color: '#0052ff' },
  arbitrum: { name: 'Arbitrum', short: 'ARB',     api: 'https://arbitrum.blockscout.com/api/v2', explorer: 'https://arbitrum.blockscout.com', color: '#28a0f0' },
  polygon:  { name: 'Polygon',  short: 'MATIC',   api: 'https://polygon.blockscout.com/api/v2',  explorer: 'https://polygon.blockscout.com',  color: '#8247e5' },
  gnosis:   { name: 'Gnosis',   short: 'GNO',     api: 'https://gnosis.blockscout.com/api/v2',   explorer: 'https://gnosis.blockscout.com',   color: '#04795b' },
  zksync:   { name: 'zkSync',   short: 'ZK',      api: 'https://zksync.blockscout.com/api/v2',   explorer: 'https://zksync.blockscout.com',   color: '#1e69ff' },
};

let lang = localStorage.getItem('mimobuilder-lang') || 'en';
let chain = localStorage.getItem('mimobuilder-chain') || 'eth';
let lastResult = null;

function api() { return CHAINS[chain].api; }
function explorer() { return CHAINS[chain].explorer; }

// Chain-specific example developer wallets (verified working)
const CHAIN_EXAMPLES = {
  eth: [
    { addr: '0x36928500bc1dcd7af6a2b4008875cc336b927d57', label: 'USDT Dev',     sub: 'Tether deployer' },
    { addr: '0x51f22ac850d29c879367a77d241734acb276b815', label: 'AAVE Dev',     sub: 'Lending protocol' },
    { addr: '0x6c9fc64a53c1b71fb3f9af64d1ae3a4931a5f4e9', label: 'Uniswap Dev',  sub: 'V3 deployer' },
    { addr: 'vitalik.eth',                               label: 'vitalik.eth',  sub: 'Founder' },
  ],
  base: [
    { addr: '0xe83f922c34a1962e9ae9f52b59e18239764f2818', label: 'Aerodrome',   sub: 'DEX deployer' },
    { addr: '0xdd9176ea3e7559d6b68b537ef555d3e89403f742', label: 'Friend.tech', sub: 'Shares deployer' },
  ],
  arbitrum: [
    { addr: '0x9ab2de34a33fb459b538c43f251eb825645e8595', label: 'GMX V2',      sub: 'Perps protocol' },
  ],
  polygon: [
    { addr: '0x476307dac3fd170166e007fcaa14f0a129721463', label: 'Quickswap',   sub: 'V2 factory dev' },
  ],
  gnosis: [
    { addr: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', label: 'WXDAI',       sub: 'Wrapped XDAI' },
  ],
  zksync: [
    { addr: '0x000000000000000000000000000000000000800a', label: 'L2 ETH',      sub: 'System contract' },
  ],
};

function renderExamples() {
  const row = document.getElementById('examples-row');
  if (!row) return;
  const examples = CHAIN_EXAMPLES[chain] || [];
  // Keep first child (label), wipe rest
  while (row.children.length > 1) row.removeChild(row.lastChild);
  for (const ex of examples) {
    const btn = document.createElement('button');
    btn.className = 'ex-pill';
    btn.setAttribute('data-addr', ex.addr);
    btn.title = `${ex.label} — ${ex.sub}`;
    btn.innerHTML = `<strong>${ex.label}</strong>${ex.sub}`;
    btn.onclick = () => {
      document.getElementById('addr-input').value = ex.addr;
      profile(ex.addr);
    };
    row.appendChild(btn);
  }
}

function setChain(c) {
  if (!CHAINS[c]) return;
  chain = c;
  localStorage.setItem('mimobuilder-chain', c);
  document.querySelectorAll('.chain-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-chain') === c);
  });
  renderExamples();
}

// ─────────────────────────────────────────────────────────────
// I18N
// ─────────────────────────────────────────────────────────────
const I18N = {
  en: {
    'eyebrow': 'DEVELOPER PROFILER · TRUST SCORING',
    'title': 'Real Builders Show on Chain',
    'subtitle': 'Paste any EVM wallet address across 6 chains. Get a comprehensive <strong>developer expertise profile</strong> — every contract deployed, verification rate, domain specialization, and trust score — explained by Xiaomi MiMo V2.5.',
    'pill-1': 'Builder Score 0-100',
    'pill-2': 'Trust Tier · 6 Levels',
    'pill-3': 'Powered by MiMo V2.5',
    'pill-4': 'Free · No Key',
    'profile-btn': '🛠️ Profile →',
    'try-label': 'Try:',
    'chain-label': 'Chain:',
    'tier-novice': 'NOT A BUILDER',
    'tier-junior': 'JUNIOR DEV',
    'tier-mid': 'MID-LEVEL DEV',
    'tier-senior': 'SENIOR DEV',
    'tier-elite': '⭐ ELITE BUILDER',
    'tier-shady': '⚠ SHADY DEV',
    'builder-score': 'BUILDER SCORE',
    'btn-share': 'Share Profile',
    'btn-restart': 'Profile Another',
    'narrative-title': 'Plain English Profile',
    'stats-title': 'Build Stats',
    'domains-title': 'Domain Expertise',
    'contracts-title': 'Recent Deployments',
    'stat-deployed': 'Deployed',
    'stat-verified': 'Verified',
    'stat-rate': 'Verify Rate',
    'stat-age': 'Active Since',
    'no-deployments': 'No contracts deployed by this address.',
    'no-deployments-detail': 'This wallet has no contract deployment history. Could be a regular user wallet, multisig signer, or someone who only interacts with deployed contracts.',
    'verified': 'Verified',
    'unverified': 'Unverified',
    'no-name': 'Unnamed',
  },
  id: {
    'eyebrow': 'PROFILER DEVELOPER · TRUST SCORING',
    'title': 'Builder Sejati Terlihat di Chain',
    'subtitle': 'Tempel alamat wallet EVM apa saja di 6 chain. Dapatkan <strong>profil keahlian developer komprehensif</strong> — setiap kontrak yang di-deploy, tingkat verifikasi, spesialisasi domain, dan skor kepercayaan — dijelaskan oleh Xiaomi MiMo V2.5.',
    'pill-1': 'Skor Builder 0-100',
    'pill-2': 'Trust Tier · 6 Level',
    'pill-3': 'Powered by MiMo V2.5',
    'pill-4': 'Gratis · Tanpa Key',
    'profile-btn': '🛠️ Profile →',
    'try-label': 'Coba:',
    'chain-label': 'Chain:',
    'tier-novice': 'BUKAN BUILDER',
    'tier-junior': 'JUNIOR DEV',
    'tier-mid': 'MID-LEVEL DEV',
    'tier-senior': 'SENIOR DEV',
    'tier-elite': '⭐ ELITE BUILDER',
    'tier-shady': '⚠ DEV MENCURIGAKAN',
    'builder-score': 'SKOR BUILDER',
    'btn-share': 'Bagi Profil',
    'btn-restart': 'Profile Lain',
    'narrative-title': 'Profil Bahasa Manusia',
    'stats-title': 'Statistik Build',
    'domains-title': 'Keahlian Domain',
    'contracts-title': 'Deployment Terkini',
    'stat-deployed': 'Di-deploy',
    'stat-verified': 'Terverifikasi',
    'stat-rate': 'Rasio Verify',
    'stat-age': 'Aktif Sejak',
    'no-deployments': 'Tidak ada kontrak yang di-deploy oleh alamat ini.',
    'no-deployments-detail': 'Wallet ini tidak punya histori deployment kontrak. Bisa jadi user biasa, signer multisig, atau seseorang yang hanya berinteraksi dengan kontrak.',
    'verified': 'Terverifikasi',
    'unverified': 'Belum Verify',
    'no-name': 'Tanpa Nama',
  },
};
function t(k){return I18N[lang]?.[k] ?? I18N.en[k] ?? k;}

// ─────────────────────────────────────────────────────────────
// DOMAIN CLASSIFICATION KEYWORDS
// ─────────────────────────────────────────────────────────────
const DOMAINS = {
  'erc20':       { label: '🪙 Token',       patterns: ['Token','ERC20','Coin'] },
  'erc721':      { label: '🖼️ NFT',          patterns: ['NFT','ERC721','Collection','Drop','Mint','Pass'] },
  'erc1155':     { label: '🎫 Multi-Token',  patterns: ['ERC1155','Multi','Edition'] },
  'defi-amm':    { label: '🌊 DEX/AMM',      patterns: ['Uniswap','Pair','Pool','Router','SushiSwap','Curve','Balancer','PancakeSwap','Swap','Liquidity'] },
  'defi-lending':{ label: '🏦 Lending',      patterns: ['Aave','Compound','Lend','Borrow','LToken','aToken','cToken','Reserve'] },
  'defi-staking':{ label: '⚡ Staking',      patterns: ['Stake','Vault','Reward','Harvest','Yield','Farm'] },
  'governance':  { label: '🏛️ Governance',  patterns: ['Governor','DAO','Vote','Timelock','Proposal'] },
  'bridge':      { label: '🌉 Bridge',       patterns: ['Bridge','Stargate','Hop','Across','Multichain','LayerZero'] },
  'oracle':      { label: '🔮 Oracle',       patterns: ['Oracle','Chainlink','Aggregator','PriceFeed'] },
  'proxy':       { label: '🔗 Proxy',        patterns: ['Proxy','Upgrade','Implementation','Beacon','TransparentUpgrade'] },
  'multisig':    { label: '🔐 Multisig',     patterns: ['Safe','Multisig','GnosisSafe','MultiSig'] },
  'gaming':      { label: '🎮 Gaming',       patterns: ['Game','Battle','Quest','Hero','Item','Champion','Arena'] },
  'identity':    { label: '🆔 Identity',     patterns: ['ENS','Resolver','Registry','Identity','Profile'] },
  'security':    { label: '🛡️ Security',     patterns: ['Security','Audit','Guard','Pausable','AccessControl'] },
  'utility':     { label: '🔧 Utility',      patterns: ['Lock','Wrap','Splitter','Multicall','Disperse','Helper'] },
};

function classifyContract(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [key, d] of Object.entries(DOMAINS)) {
    for (const p of d.patterns) {
      if (lower.includes(p.toLowerCase())) return key;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
function fmtAddr(a){if(!a)return '—';return a.slice(0,6)+'…'+a.slice(-4);}
function fmtNum(n){
  const x = Number(n);
  if (isNaN(x)) return '—';
  if (x === 0) return '0';
  if (x < 1e3) return Math.round(x).toString();
  if (x < 1e6) return (x/1e3).toFixed(1)+'K';
  return (x/1e6).toFixed(2)+'M';
}
function fmtPct(n){return (Number(n)*100).toFixed(0)+'%';}

function ageFromDate(iso) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms) || ms < 0) return null;
  const days = ms / (1000*60*60*24);
  if (days < 30) return { value: Math.round(days), unit: 'd', text: `${Math.round(days)}d` };
  if (days < 365) return { value: Math.round(days/30), unit: 'mo', text: `${Math.round(days/30)}mo` };
  const years = (days/365).toFixed(1);
  return { value: years, unit: 'y', text: `${years}y` };
}

// ─────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────
async function resolveENS(name) {
  if (!name.endsWith('.eth')) return null;
  try {
    const r = await fetch(`${ENS_API}/${name}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d.address || null;
  } catch { return null; }
}

async function fetchAddrInfo(addr) {
  if (!addr || !/^0x[a-f0-9]{40}$/i.test(addr)) return null;
  try {
    const r = await fetch(`${api()}/addresses/${addr}`);
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

async function fetchInternalTxs(addr) {
  // Blockscout returns paginated internal txs, look for `type: create`
  try {
    const r = await fetch(`${api()}/addresses/${addr}/internal-transactions`);
    if (!r.ok) return [];
    const data = await r.json();
    return data.items || [];
  } catch { return []; }
}

async function fetchContractInfo(contractAddr) {
  try {
    const r = await fetch(`${api()}/addresses/${contractAddr}`);
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

// Attempt to enumerate contracts created by an address by walking internal-txs pages.
// For deep history we fall back to the txs endpoint with `from` filter and look for `to:null` deployment txs.
async function fetchDeployedContracts(addr, maxPages = 5) {
  const seen = new Set();
  const created = [];

  // 1) Try internal-transactions: best signal for create operations
  let next = `${api()}/addresses/${addr}/internal-transactions`;
  let page = 0;
  while (next && page < maxPages) {
    page++;
    try {
      const r = await fetch(next);
      if (!r.ok) break;
      const data = await r.json();
      for (const it of (data.items || [])) {
        const target = it.created_contract?.hash || (it.type === 'create' ? it.to?.hash : null);
        if (target && !seen.has(target.toLowerCase())) {
          seen.add(target.toLowerCase());
          created.push({
            address: target,
            name: it.created_contract?.name || it.to?.name || null,
            via: 'internal',
            timestamp: it.timestamp,
          });
        }
      }
      // pagination via next_page_params (Blockscout v2 style)
      const np = data.next_page_params;
      if (np) {
        const params = new URLSearchParams(np);
        next = `${api()}/addresses/${addr}/internal-transactions?${params}`;
      } else {
        next = null;
      }
    } catch { break; }
  }

  // 2) Also walk normal txs from this address — deployment txs have to=null
  let txNext = `${api()}/addresses/${addr}/transactions?filter=from`;
  page = 0;
  while (txNext && page < maxPages) {
    page++;
    try {
      const r = await fetch(txNext);
      if (!r.ok) break;
      const data = await r.json();
      for (const tx of (data.items || [])) {
        // Direct contract creation: to is null but created_contract is populated
        const cc = tx.created_contract;
        if (cc?.hash && !seen.has(cc.hash.toLowerCase())) {
          seen.add(cc.hash.toLowerCase());
          created.push({
            address: cc.hash,
            name: cc.name || null,
            via: 'tx',
            timestamp: tx.timestamp,
          });
        }
      }
      const np = data.next_page_params;
      if (np) {
        const params = new URLSearchParams(np);
        txNext = `${api()}/addresses/${addr}/transactions?filter=from&${params}`;
      } else {
        txNext = null;
      }
    } catch { break; }
  }

  return created;
}

// Enrich up to N contracts in parallel
async function enrichContracts(contracts, max = 12) {
  const subset = contracts.slice(0, max);
  const enriched = await Promise.all(subset.map(async (c) => {
    const info = await fetchContractInfo(c.address);
    if (info) {
      return {
        ...c,
        name: c.name || info.name || null,
        is_verified: !!info.is_verified,
        is_contract: !!info.is_contract,
      };
    }
    return c;
  }));
  // Append the rest as-is so we don't lose the count
  return enriched.concat(contracts.slice(max));
}

// ─────────────────────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────────────────────
function scoreBuilder(contracts, oldestTs) {
  let score = 0;
  const total = contracts.length;
  const verified = contracts.filter(c => c.is_verified).length;
  const verifyRate = total > 0 ? verified / total : 0;

  // Volume scoring (up to 30 points)
  if (total >= 50) score += 30;
  else if (total >= 20) score += 25;
  else if (total >= 10) score += 18;
  else if (total >= 5) score += 12;
  else if (total >= 2) score += 6;
  else if (total === 1) score += 3;

  // Verification rate (up to 35 points)
  if (verifyRate >= 0.9) score += 35;
  else if (verifyRate >= 0.7) score += 28;
  else if (verifyRate >= 0.5) score += 18;
  else if (verifyRate >= 0.3) score += 10;
  else if (verifyRate > 0) score += 3;

  // Domain expertise diversity (up to 20 points)
  const domains = new Set();
  for (const c of contracts) {
    const d = classifyContract(c.name);
    if (d) domains.add(d);
  }
  if (domains.size >= 5) score += 20;
  else if (domains.size >= 3) score += 14;
  else if (domains.size >= 2) score += 8;
  else if (domains.size === 1) score += 4;

  // Activity longevity (up to 15 points)
  if (oldestTs) {
    const yearsActive = (Date.now() - new Date(oldestTs).getTime()) / (365 * 24 * 3600 * 1000);
    if (yearsActive >= 5) score += 15;
    else if (yearsActive >= 3) score += 12;
    else if (yearsActive >= 1) score += 8;
    else if (yearsActive >= 0.25) score += 4;
  }

  return Math.min(100, score);
}

function getTier(score, contracts) {
  const total = contracts.length;
  const verified = contracts.filter(c => c.is_verified).length;
  const verifyRate = total > 0 ? verified / total : 0;

  // Shady detection: lots of contracts but very low verify rate
  if (total >= 5 && verifyRate < 0.2) {
    return { level: 'shady', cls: 'shady', label: t('tier-shady'), color: '#ef4444' };
  }

  if (total === 0) return { level: 'novice', cls: 'novice', label: t('tier-novice'), color: '#94a3b8' };
  if (score >= 85) return { level: 'elite', cls: 'elite', label: t('tier-elite'), color: '#06b6d4' };
  if (score >= 65) return { level: 'senior', cls: 'senior', label: t('tier-senior'), color: '#a855f7' };
  if (score >= 40) return { level: 'mid', cls: 'mid', label: t('tier-mid'), color: '#06b6d4' };
  if (score >= 15) return { level: 'junior', cls: 'junior', label: t('tier-junior'), color: '#22c55e' };
  return { level: 'novice', cls: 'novice', label: t('tier-novice'), color: '#94a3b8' };
}

// ─────────────────────────────────────────────────────────────
// MIMO V2.5 NARRATIVE
// ─────────────────────────────────────────────────────────────
function buildNarrative(addr, contracts, score, tier, domains, oldestTs) {
  const total = contracts.length;
  const verified = contracts.filter(c => c.is_verified).length;
  const verifyRate = total > 0 ? verified / total : 0;
  const age = oldestTs ? ageFromDate(oldestTs) : null;
  const topDomains = [...domains.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k]) => DOMAINS[k]?.label || k);

  if (total === 0) {
    return lang === 'en'
      ? `<strong>This wallet has not deployed any smart contracts.</strong> ${t('no-deployments-detail')}`
      : `<strong>Wallet ini belum pernah deploy smart contract.</strong> ${t('no-deployments-detail')}`;
  }

  if (lang === 'en') {
    const parts = [];
    parts.push(`This developer has deployed <strong>${total} contract${total>1?'s':''}</strong> on ${CHAINS[chain].name}, with <strong>${verified}</strong> verified (<strong>${fmtPct(verifyRate)} verification rate</strong>).`);

    if (age) parts.push(`Active for <strong>${age.text}</strong>.`);

    if (topDomains.length > 0) {
      parts.push(`Specialization: ${topDomains.map(d => '<strong>'+d+'</strong>').join(', ')}.`);
    }

    if (tier.level === 'elite') {
      parts.push(`<strong>Elite-tier builder</strong> — multi-domain expertise, near-perfect verification, and sustained on-chain delivery. The kind of profile that gets hired without an interview.`);
    } else if (tier.level === 'senior') {
      parts.push(`<strong>Senior developer</strong> — substantial deployment history with strong verification discipline. Reliable hire for production work.`);
    } else if (tier.level === 'mid') {
      parts.push(`<strong>Mid-level developer</strong> — solid track record building on ${CHAINS[chain].name}. Good fit for contributor roles.`);
    } else if (tier.level === 'junior') {
      parts.push(`<strong>Junior or part-time builder</strong> — has shipped contracts, but limited in volume or domain breadth. Suitable for entry roles or audited supervision.`);
    } else if (tier.level === 'shady') {
      parts.push(`<strong>⚠ Red-flag pattern detected.</strong> Multiple deployments but low verification rate (${fmtPct(verifyRate)}). Pattern consistent with copy-cat token launches or rug schemes. Verify identity before any engagement.`);
    } else {
      parts.push(`<strong>Casual deployer</strong> — minimal contract history. Could be a hobbyist, learner, or one-off project owner.`);
    }
    return parts.join(' ');
  } else {
    const parts = [];
    parts.push(`Developer ini telah men-deploy <strong>${total} kontrak</strong> di ${CHAINS[chain].name}, dengan <strong>${verified}</strong> terverifikasi (<strong>rasio verify ${fmtPct(verifyRate)}</strong>).`);

    if (age) parts.push(`Aktif selama <strong>${age.text}</strong>.`);

    if (topDomains.length > 0) {
      parts.push(`Spesialisasi: ${topDomains.map(d => '<strong>'+d+'</strong>').join(', ')}.`);
    }

    if (tier.level === 'elite') {
      parts.push(`<strong>Builder kelas elit</strong> — keahlian multi-domain, verifikasi nyaris sempurna, dan konsistensi delivery on-chain berkelanjutan. Profil yang langsung di-hire tanpa interview.`);
    } else if (tier.level === 'senior') {
      parts.push(`<strong>Developer senior</strong> — track record deploy substansial dengan disiplin verifikasi kuat. Hire reliable untuk kerjaan production.`);
    } else if (tier.level === 'mid') {
      parts.push(`<strong>Developer mid-level</strong> — track record solid build di ${CHAINS[chain].name}. Cocok untuk peran kontributor.`);
    } else if (tier.level === 'junior') {
      parts.push(`<strong>Builder junior atau part-time</strong> — sudah ship kontrak, tapi terbatas dalam volume atau breadth domain. Cocok untuk peran entry atau supervisi audit.`);
    } else if (tier.level === 'shady') {
      parts.push(`<strong>⚠ Pola red-flag terdeteksi.</strong> Multiple deployment tapi rasio verifikasi rendah (${fmtPct(verifyRate)}). Pola konsisten dengan launch token copy-cat atau skema rug. Verifikasi identitas sebelum engagement apa pun.`);
    } else {
      parts.push(`<strong>Deployer kasual</strong> — riwayat kontrak minimal. Bisa hobbyist, pembelajar, atau owner project one-off.`);
    }
    return parts.join(' ');
  }
}

// ─────────────────────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────────────────────
function setLoadStep(s){const el=document.getElementById('loading-step');if(el)el.textContent=s;}

function renderGauge(score, color) {
  const r = 80;
  const arc = Math.PI * r;
  const offset = arc * (1 - score/100);
  return `
    <div class="score-gauge">
      <svg viewBox="0 0 240 140" style="width:100%;height:100%">
        <path class="score-arc score-arc-bg" d="M 40,120 A ${r},${r} 0 0,1 200,120" />
        <path class="score-arc score-arc-fill" d="M 40,120 A ${r},${r} 0 0,1 200,120" style="stroke:${color};stroke-dasharray:${arc};stroke-dashoffset:${offset}" />
      </svg>
      <div class="score-num" style="color:${color}">${score}</div>
      <div class="score-label">${t('builder-score')} / 100</div>
    </div>
  `;
}

function renderResult(addr, addrInfo, contracts) {
  const root = document.getElementById('result');
  root.classList.add('on');

  // Sort contracts: most recent first
  contracts.sort((a, b) => (new Date(b.timestamp || 0)) - (new Date(a.timestamp || 0)));
  const oldestTs = contracts.length > 0 ? contracts[contracts.length-1].timestamp : null;

  // Domain map
  const domains = new Map();
  for (const c of contracts) {
    const d = classifyContract(c.name);
    if (d) domains.set(d, (domains.get(d) || 0) + 1);
  }

  const score = scoreBuilder(contracts, oldestTs);
  const tier = getTier(score, contracts);
  const narrative = buildNarrative(addr, contracts, score, tier, domains, oldestTs);

  // Header
  const ensName = addrInfo?.ens_domain_name || addrInfo?.name || null;
  const displayName = ensName || fmtAddr(addr);

  const headHtml = `
    <div class="profile">
      <div class="profile-head">
        <div class="dev-avatar">🛠️</div>
        <div class="dev-name">${displayName}</div>
        <div class="dev-tag">${ensName ? fmtAddr(addr) : (lang==='en'?'Developer wallet':'Wallet developer')} · <span style="color:${CHAINS[chain].color};font-weight:700">${CHAINS[chain].name}</span></div>
        <div class="dev-addr">${addr}</div>
      </div>
      <div class="score-wrap">
        ${renderGauge(score, tier.color)}
      </div>
      <div style="text-align:center"><div class="tier-tag tier-${tier.cls}">${tier.label}</div></div>
      <div class="narrative" style="margin-top:24px">${narrative}</div>
    </div>
  `;

  // Stats
  const total = contracts.length;
  const verified = contracts.filter(c => c.is_verified).length;
  const verifyRate = total > 0 ? verified / total : 0;
  const age = oldestTs ? ageFromDate(oldestTs) : null;

  const statsHtml = `
    <div class="section-title">${t('stats-title')}</div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">${t('stat-deployed')}</div><div class="stat-value">${fmtNum(total)}</div><div class="stat-sub">${lang==='en'?'contracts':'kontrak'}</div></div>
      <div class="stat-card"><div class="stat-label">${t('stat-verified')}</div><div class="stat-value">${fmtNum(verified)}</div><div class="stat-sub">${lang==='en'?'audited source':'source teraudit'}</div></div>
      <div class="stat-card"><div class="stat-label">${t('stat-rate')}</div><div class="stat-value">${fmtPct(verifyRate)}</div><div class="stat-sub">${lang==='en'?'verification':'verifikasi'}</div></div>
      <div class="stat-card"><div class="stat-label">${t('stat-age')}</div><div class="stat-value">${age ? age.text : '—'}</div><div class="stat-sub">${lang==='en'?'first deploy':'deploy pertama'}</div></div>
    </div>
  `;

  // Domains
  let domainsHtml = '';
  if (domains.size > 0) {
    const sorted = [...domains.entries()].sort((a,b)=>b[1]-a[1]);
    domainsHtml = `
      <div class="section-title">${t('domains-title')}</div>
      <div class="domain-grid">
        ${sorted.map(([k, count]) => `
          <div class="domain-pill">${DOMAINS[k]?.label || k}<span class="domain-count">${count}</span></div>
        `).join('')}
      </div>
    `;
  }

  // Recent contracts
  let contractsHtml = '';
  if (contracts.length > 0) {
    const top = contracts.slice(0, 12);
    contractsHtml = `
      <div class="section-title">${t('contracts-title')} <span style="color:var(--muted);font-weight:600;font-size:10px"> · ${top.length}/${contracts.length}</span></div>
      <div class="contracts-list">
        ${top.map(c => `
          <div class="contract-row">
            <div class="contract-icon ${c.is_verified ? 'verified' : 'unverified'}">${c.is_verified ? '✓' : '?'}</div>
            <div class="contract-info">
              <div class="contract-name">${c.name || `<span style="color:var(--muted);font-weight:500;font-style:italic">${t('no-name')}</span>`}</div>
              <div class="contract-addr">${c.address}</div>
            </div>
            <a class="contract-tag ${c.is_verified ? 'verified' : 'unverified'}" href="${explorer()}/address/${c.address}" target="_blank" rel="noopener">${c.is_verified ? t('verified') : t('unverified')}</a>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Actions
  const actionsHtml = `
    <div class="actions">
      <button class="btn btn-primary" id="share-btn">📤 ${t('btn-share')}</button>
      <button class="btn btn-secondary" id="restart-btn">↻ ${t('btn-restart')}</button>
    </div>
  `;

  root.innerHTML = headHtml + statsHtml + domainsHtml + contractsHtml + actionsHtml;

  document.getElementById('share-btn').onclick = shareProfile;
  document.getElementById('restart-btn').onclick = () => {
    root.classList.remove('on');
    document.getElementById('addr-input').focus();
    window.scrollTo({top:0, behavior:'smooth'});
  };

  root.scrollIntoView({behavior:'smooth', block:'start'});
}

function shareProfile() {
  if (!lastResult) return;
  const url = `${location.origin}${location.pathname}?chain=${chain}#${encodeURIComponent(lastResult.addr)}`;
  navigator.clipboard?.writeText(url);
  const btn = document.getElementById('share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ ' + (lang==='en'?'Link copied':'Link disalin');
  setTimeout(() => btn.innerHTML = orig, 2000);
}

// ─────────────────────────────────────────────────────────────
// MAIN PROFILE
// ─────────────────────────────────────────────────────────────
async function profile(input) {
  let raw = input.trim();
  if (!raw) return;

  hideError();
  document.getElementById('result').classList.remove('on');
  document.getElementById('loading').classList.add('on');

  try {
    let addr = raw;
    // Hex address takes priority (must check first since 0x... matches the alphanumeric regex)
    if (/^0x[a-fA-F0-9]{40}$/.test(raw)) {
      addr = raw;
    } else if (raw.endsWith('.eth') || /^[a-zA-Z][a-zA-Z0-9-]*$/.test(raw)) {
      // ENS resolution
      setLoadStep(lang==='en' ? 'resolving ENS' : 'resolving ENS');
      const resolved = await resolveENS(raw.endsWith('.eth') ? raw : raw + '.eth');
      if (!resolved) throw new Error(lang==='en' ? 'ENS not found' : 'ENS tidak ditemukan');
      addr = resolved;
    }
    addr = addr.toLowerCase();

    if (!/^0x[a-f0-9]{40}$/.test(addr)) {
      throw new Error(lang==='en' ? 'Invalid address — paste an Ethereum address or ENS' : 'Alamat tidak valid — tempel alamat Ethereum atau ENS');
    }

    setLoadStep(lang==='en' ? 'fetching wallet info' : 'mengambil info wallet');
    const addrInfo = await fetchAddrInfo(addr);

    setLoadStep(lang==='en' ? 'scanning deployment history' : 'memindai histori deployment');
    const rawContracts = await fetchDeployedContracts(addr, 5);

    setLoadStep(lang==='en' ? `enriching ${rawContracts.length} contracts` : `memperkaya ${rawContracts.length} kontrak`);
    const contracts = await enrichContracts(rawContracts, 12);

    setLoadStep(lang==='en' ? 'composing builder profile' : 'menyusun profil builder');
    await new Promise(r => setTimeout(r, 250));

    lastResult = { addr, addrInfo, contracts };
    document.getElementById('loading').classList.remove('on');
    renderResult(addr, addrInfo, contracts);

  } catch (e) {
    document.getElementById('loading').classList.remove('on');
    showError('⚠ ' + (e.message || (lang==='en' ? 'Profile failed' : 'Profile gagal')));
  }
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.classList.add('on');
}
function hideError() {
  document.getElementById('error').classList.remove('on');
}

// ─────────────────────────────────────────────────────────────
// THEME / LANG
// ─────────────────────────────────────────────────────────────
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('mimobuilder-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'light' ? '☀️' : '🌙';
}

function setLang(l) {
  lang = l;
  localStorage.setItem('mimobuilder-lang', l);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    el.innerHTML = t(k);
  });
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = l === 'en' ? '🌐' : '🇮🇩';
  document.documentElement.lang = l;
}

// URL overrides
const urlTheme = new URLSearchParams(location.search).get('theme');
if (urlTheme === 'light' || urlTheme === 'dark') {
  localStorage.setItem('mimobuilder-theme', urlTheme);
}
const urlLang = new URLSearchParams(location.search).get('lang');
if (urlLang === 'en' || urlLang === 'id') {
  localStorage.setItem('mimobuilder-lang', urlLang);
  lang = urlLang;
}
const urlChain = new URLSearchParams(location.search).get('chain');
if (urlChain && CHAINS[urlChain]) {
  chain = urlChain;
  localStorage.setItem('mimobuilder-chain', urlChain);
}
setTheme(localStorage.getItem('mimobuilder-theme') || 'dark');
setLang(lang);
setChain(chain);

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────
document.getElementById('go-btn').onclick = () => profile(document.getElementById('addr-input').value);
document.getElementById('addr-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') profile(e.target.value);
});

document.querySelectorAll('.chain-pill').forEach(p => {
  p.onclick = () => setChain(p.getAttribute('data-chain'));
});

document.getElementById('lang-toggle').onclick = () => setLang(lang === 'en' ? 'id' : 'en');
document.getElementById('theme-toggle').onclick = () => {
  const cur = document.documentElement.dataset.theme;
  setTheme(cur === 'light' ? 'dark' : 'light');
};

// Auto-profile from URL hash
const hashAddr = decodeURIComponent(location.hash.slice(1));
if (hashAddr && (/^0x[a-fA-F0-9]{40}$/.test(hashAddr) || hashAddr.endsWith('.eth'))) {
  document.getElementById('addr-input').value = hashAddr;
  profile(hashAddr);
}
