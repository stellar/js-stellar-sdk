import packageJson from "../../package.json";

export interface ConfigGenerateOptions {
  contractName: string;
  contractAddress?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
}

export interface Configs {
  packageJson: string;
  tsConfig: string;
  gitignore: string;
  readme: string;
}

/**
 * Generates a complete TypeScript project structure with contract bindings
 */
export class ConfigGenerator {
  /**
   * Generate the complete TypeScript project
   */
  generate(options: ConfigGenerateOptions): Configs {
    const { contractName, contractAddress, rpcUrl, networkPassphrase } =
      options;

    // Generate all project files
    return {
      packageJson: this.generatePackageJson(contractName),
      tsConfig: this.generateTsConfig(),
      gitignore: this.generateGitignore(),
      readme: this.generateReadme(
        contractName,
        contractAddress,
        rpcUrl,
        networkPassphrase,
      ),
    };
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(contractName: string): string {
    const generatedPackageJson = {
      name: contractName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      version: "0.0.1",
      description: `Generated TypeScript bindings for ${contractName} Stellar contract`,
      type: "module",
      main: "dist/index.js",
      types: "dist/index.d.ts",
      scripts: {
        build: "tsc",
      },
      dependencies: {
        "@stellar/stellar-sdk": `^${packageJson.version}`,
        buffer: "6.0.3",
      },
      devDependencies: {
        typescript: "^5.6.3",
      },
    };

    return JSON.stringify(generatedPackageJson, null, 2);
  }

  /**
   * Generate tsconfig.json
   */
  private generateTsConfig(): string {
    const tsConfig = {
      compilerOptions: {
        target: "ESNext",
        module: "NodeNext",
        moduleResolution: "nodenext",
        declaration: true,
        outDir: "./dist",
        strictNullChecks: true,
        skipLibCheck: true,
      },
      include: ["src/*"],
    };

    return JSON.stringify(tsConfig, null, 2);
  }

  /**
   * Generate .gitignore
   */
  private generateGitignore(): string {
    const gitignore = [
      "# Dependencies",
      "node_modules/",
      "",
      "# Build outputs",
      "dist/",
      "*.tgz",
      "",
      "# IDE",
      ".vscode/",
      ".idea/",
      "",
      "# OS",
      ".DS_Store",
      "Thumbs.db",
      "",
      "# Logs",
      "*.log",
      "npm-debug.log*",
      "",
      "# Runtime data",
      "*.pid",
      "*.seed",
    ].join("\n");

    return gitignore;
  }

  /**
   * Generate README.md
   */
  private generateReadme(
    contractName: string,
    contractAddress?: string,
    rpcUrl?: string,
    networkPassphrase?: string,
  ): string {
    const readme = [
      `# ${contractName} Contract Bindings`,
      "",
      `TypeScript bindings for the ${contractName} Stellar smart contract.`,
      "",
      "## Installation",
      "",
      "```bash",
      "npm install",
      "```",
      "",
      "## Build",
      "",
      "```bash",
      "npm run build",
      "```",
      "",
      "## Usage",
      "",
      "```typescript",
      'import { Client } from "./src";',
      "",
      "const client = new Client({",
      contractAddress
        ? `  contractId: "${contractAddress}",`
        : '  contractId: "YOUR_CONTRACT_ID",',
      rpcUrl
        ? `  rpcUrl: "${rpcUrl}",`
        : '  rpcUrl: "https://soroban-testnet.stellar.org:443",',
      networkPassphrase
        ? `  networkPassphrase: "${networkPassphrase}",`
        : '  networkPassphrase: "Test SDF Network ; September 2015",',
      "});",
      "",
      "// Call contract methods",
      "// const result = await client.methodName();",
      "```",
      "",
      "## Contract Information",
      "",
      contractAddress
        ? `**Contract Address:** \`${contractAddress}\``
        : "**Contract Address:** _Not embedded_",
      rpcUrl ? `**RPC URL:** \`${rpcUrl}\`` : "**RPC URL:** _Not embedded_",
      networkPassphrase
        ? `**Network:** \`${networkPassphrase}\``
        : "**Network:** _Not embedded_",
      "",
      "## Generated Files",
      "",
      "- `src/index.ts` - Entry point exporting the Client",
      "- `src/types.ts` - Type definitions for contract structs, enums, and unions",
      "- `src/contract.ts` - Client implementation",
      "- `tsconfig.json` - TypeScript configuration",
      "- `package.json` - NPM package configuration",
      "",
      "This package was generated using the Js-Stellar-SDK contract binding generator.",
    ].join("\n");

    return readme;
  }
}
