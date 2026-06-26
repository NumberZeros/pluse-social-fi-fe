# Pulse Social User Guide

Step-by-step onboarding for creators and fans on Pulse Social.

## Create your profile

Claim your on-chain username and set up your creator identity.

1. Connect your Solana wallet
2. Open Dashboard from the navigation
3. Complete Step 1: Create profile and choose your username
4. Your profile is stored on-chain and visible at /:username

## Launch Supporter Shares

Let fans support you and unlock exclusive content.

1. From Dashboard, complete Step 2: Launch Supporter Shares
2. Confirm the on-chain transaction to initialize your pool
3. Fans visit your profile and click Support Creator
4. Price grows as more supporters join — early supporters pay less
5. Track supporters and volume on your Dashboard

## Post exclusive content

Gate posts to supporters only using IPFS accessLevel.

1. Go to Feed and click + Post in the navigation
2. Write your content (up to 280 characters)
3. Toggle "Supporters only" to gate the post
4. Only wallets holding your Supporter Shares can read the full content
5. Non-supporters see a blurred preview with a "Become a supporter" CTA

## Become a supporter

Back a creator and unlock their exclusive feed.

1. Discover creators on Explore or Feed
2. Visit their profile and click Support Creator
3. Choose how many Supporter Shares to buy
4. Confirm the transaction in your wallet
5. Return to their posts — exclusive content is now unlocked

## Send tips

Send SOL directly to creators — 100% goes to their wallet.

1. Find a post you want to support
2. Click the tip icon (dollar sign)
3. Enter the amount of SOL to send
4. Confirm the transaction
5. The creator receives SOL instantly

## Frequently Asked Questions

### What are Supporter Shares?

Supporter Shares let fans back a creator on-chain. Holders unlock exclusive posts. Price grows as more people support.

### How is exclusive content protected?

Supporter-only posts store a public preview on IPFS (teaser only). Full content lives in a separate gated blob fetched only after the app verifies your Supporter Shares on-chain.

### What fees apply when I cash out support?

Tips have 0% platform fee. When you sell Supporter Shares, 10% stays in the creator's pool vault (not a platform cut) to keep the supporter pool healthy.

### What are gas fees on Solana?

Transactions typically cost less than $0.01 on Solana.

### Is Pinata required?

Yes for production. Set VITE_PINATA_JWT in your environment. Dev builds can use local mock storage.

### Where did Marketplace, Groups, and Governance go?

These features are deferred post-MVP. Legacy URLs redirect to the guide.
