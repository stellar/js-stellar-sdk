/**
 * ASG Card x402 Payment Example
  * 
   * Demonstrates using the Stellar JS SDK with the x402 protocol
    * to create and fund virtual MasterCard cards for AI agents.
     * 
      * Requirements:
       *   npm install @asgcard/sdk @stellar/stellar-sdk
        * 
         * More info: https://asgcard.dev
          */

const { Keypair, Networks, TransactionBuilder, Operation, Asset } = require('@stellar/stellar-sdk');

// Example: Create a Stellar keypair for agent wallet
const agentKeypair = Keypair.random();
console.log('Agent Public Key:', agentKeypair.publicKey());
console.log('Agent Secret:', agentKeypair.secret());

// The x402 protocol flow:
// 1. Agent generates a Stellar keypair
// 2. Agent funds the wallet with USDC (Stellar asset)
// 3. Agent calls ASG Card API to create a virtual MasterCard
// 4. Payment is verified on-chain via x402 payment header
// 5. Agent receives card details (PAN, CVV, expiry)

// For the complete agent-ready implementation, see:
// https://github.com/ASGCompute/asgcard-public
// https://www.npmjs.com/package/@asgcard/sdk

console.log('\nTo set up an AI agent with payment capability:');
console.log('  npx @asgcard/cli onboard -y');
console.log('\nThis creates a Stellar wallet and configures the MCP server.');
console.log('Your agent can then autonomously create and manage virtual cards.');
