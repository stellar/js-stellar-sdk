#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('stellar-contract-bindings-typescript')
  .description('CLI tool for generating contract bindings Stellar SDK')
  .version(require('../../package.json').version)
  .action(() => {
      console.log('Generating bindings...');
  });

// Execute CLI
program.parse(process.argv);
