#!/usr/bin/env node

import { input } from '@inquirer/prompts'
import { Command } from 'commander'
import readline from 'readline'
// import { run } from './run';

const program = new Command();

program
  .name('my-cli')
  .description('A simple CLI tool')
  .version('1.0.0');

program
  .command('run')
  .description('Run the main functionality')
  .action(() => {
    // run();
  });

// program.parse(process.argv);