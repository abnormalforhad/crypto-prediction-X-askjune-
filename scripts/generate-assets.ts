/**
 * generate-assets.ts
 *
 * A utility script for batch-generating or managing the asset library.
 *
 * Usage:
 *   npx tsx scripts/generate-assets.ts --validate   # Validate manifest against files
 *   npx tsx scripts/generate-assets.ts --list        # List all assets
 *
 * For image generation:
 *   Use the Ask June web interface (askjune.ai) to generate images,
 *   then download and place them in public/assets/<category>/
 *   Finally, update public/assets/manifest.json with the new entries.
 *
 * Alternatively, use the Kling or other image models available through
 * the June platform for high-quality crypto-themed graphics.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, '..', 'public', 'assets');
const MANIFEST_PATH = path.join(ASSETS_DIR, 'manifest.json');

interface Asset {
  id: string;
  path: string;
  category: string;
  tags: string[];
  alt: string;
  width: number;
  height: number;
}

interface Manifest {
  version: number;
  generated: string;
  assets: Asset[];
}

function loadManifest(): Manifest {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw);
}

function validateManifest(): void {
  console.log('\n🔍 Validating asset manifest...\n');
  const manifest = loadManifest();
  let errors = 0;
  let ok = 0;

  for (const asset of manifest.assets) {
    const absPath = path.resolve(ASSETS_DIR, '..', asset.path.replace(/^\//, ''));

    if (fs.existsSync(absPath)) {
      console.log(`  ✅ ${asset.id} → ${asset.path}`);
      ok++;
    } else {
      console.log(`  ❌ ${asset.id} → ${asset.path} (FILE MISSING)`);
      errors++;
    }
  }

  console.log(`\n📊 Results: ${ok} ok, ${errors} missing out of ${manifest.assets.length} assets`);

  if (errors > 0) {
    console.log('\n⚠️  Some asset files are missing. Generate or download them first.');
    process.exit(1);
  } else {
    console.log('\n✅ All assets validated successfully!');
  }
}

function listAssets(): void {
  console.log('\n📋 Asset Library Contents\n');
  const manifest = loadManifest();

  const byCategory: Record<string, Asset[]> = {};
  for (const asset of manifest.assets) {
    if (!byCategory[asset.category]) byCategory[asset.category] = [];
    byCategory[asset.category].push(asset);
  }

  for (const [cat, assets] of Object.entries(byCategory)) {
    console.log(`\n  📁 ${cat.toUpperCase()} (${assets.length})`);
    for (const a of assets) {
      console.log(`     • ${a.id.padEnd(20)} ${a.alt}`);
      console.log(`       tags: ${a.tags.join(', ')}`);
    }
  }

  console.log(`\n  Total: ${manifest.assets.length} assets across ${Object.keys(byCategory).length} categories\n`);
}

// ─── Prompt templates for future June API image generation ───

export const GENERATION_PROMPTS = {
  coins: {
    template: 'A premium, glowing {COIN} coin icon on a dark black background. Metallic finish with holographic reflections and a soft {COLOR} glow. Minimalist, vector-style, for dark crypto terminal UI. No text. 512x512.',
    variants: [
      { coin: 'Bitcoin (BTC)', color: 'amber/gold', filename: 'btc.png' },
      { coin: 'Ethereum (ETH)', color: 'blue-purple', filename: 'eth.png' },
      { coin: 'Solana (SOL)', color: 'purple-teal', filename: 'sol.png' },
      { coin: 'BNB', color: 'golden-yellow', filename: 'bnb.png' },
    ]
  },
  charts: {
    template: 'A sleek crypto trading chart showing {TREND} on a dark black background. {COLOR} glowing candlesticks with a smooth {DIRECTION} trendline. Premium trading terminal display. No text, clean vector style. 800x400.',
    variants: [
      { trend: 'a strong bullish uptrend', color: 'Green', direction: 'ascending', filename: 'bullish-trend.png' },
      { trend: 'a bearish downtrend', color: 'Red', direction: 'descending', filename: 'bearish-trend.png' },
      { trend: 'sideways consolidation', color: 'Amber/gold', direction: 'flat', filename: 'neutral-range.png' },
    ]
  },
  concepts: {
    prompts: [
      { id: 'defi-network', prompt: 'Abstract DeFi network visualization with glowing interconnected nodes, amber/gold connecting lines. Dark black background. 800x400.' },
      { id: 'blockchain', prompt: 'Abstract 3D blockchain blocks connected in a chain, translucent glass cubes with amber/gold edges. Dark black background. 800x400.' },
      { id: 'smart-contract', prompt: 'Futuristic smart contract with glowing digital document surrounded by shield/lock, amber/gold accents. Dark background. 512x512.' },
      { id: 'nft', prompt: 'Abstract NFT digital art in a glowing frame with blockchain badge, amber/gold accents. Dark background. 512x512.' },
      { id: 'layer2', prompt: 'Layer 2 scaling visualization with large L1 orb connected to smaller L2 nodes via amber/gold beams. Dark background. 800x400.' },
      { id: 'security', prompt: 'Cybersecurity shield with circuit patterns and force field in amber/gold. Dark background. 512x512.' },
      { id: 'whale-alert', prompt: 'Dramatic whale silhouette made of glowing particles and data streams with amber/gold trails. Dark background. 800x400.' },
    ]
  }
};

// ─── CLI ───

const arg = process.argv[2];

switch (arg) {
  case '--validate':
    validateManifest();
    break;
  case '--list':
    listAssets();
    break;
  default:
    console.log('Usage:');
    console.log('  npx tsx scripts/generate-assets.ts --validate');
    console.log('  npx tsx scripts/generate-assets.ts --list');
}
