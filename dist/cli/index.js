#!/usr/bin/env node
"use strict";

require("core-js/modules/esnext.weak-map.delete-all.js");
var readline = _interopRequireWildcard(require("readline"));
var _util = require("util");
var _queryStatus = require("../data/queries/queryStatus");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const promptPrefix = 'JSON-Query> ';
// Continuation prompt, padded to line up with the first line and dimmed so it reads as secondary
const continuePrefix = waitingFor => (0, _util.styleText)('dim', `${waitingFor}> `.padStart(promptPrefix.length));
// Create the interface for reading from standard input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: promptPrefix
});
// Buffer to store multi-line inputs
let inputBuffer = '';
console.log('JSON Filesystem Query CLI');
console.log('Type your command. End it with a semicolon (;) and press Enter to execute.');
console.log('Type "/exit" or press Ctrl+C to quit.\n');
// Open the session by displaying the initial prompt
rl.prompt();
// Handle line-by-line input
rl.on('line', line => {
  const trimmedLine = line.trim();
  // Check if the user wants to exit
  if (!inputBuffer && trimmedLine.toLowerCase() === '/exit') {
    rl.close();
    return;
  }
  // Skip blank lines, they add nothing to the query
  if (!inputBuffer && !trimmedLine) {
    rl.prompt();
    return;
  }
  // Append current line to the buffer
  inputBuffer += (inputBuffer ? '\n' : '') + line;
  const status = (0, _queryStatus.queryStatus)(inputBuffer);
  // Check if the line ends with a semicolon
  if (status.complete) {
    // Process the accumulated input
    processInput(inputBuffer);
    // Reset the buffer and prompt for next command
    inputBuffer = '';
    rl.setPrompt(promptPrefix);
  } else {
    // Change prompt visually to show it is expecting continuation
    rl.setPrompt(continuePrefix(status.waitingFor));
  }
  rl.prompt();
});
// Handle graceful exit on Ctrl+C or rl.close()
rl.on('close', () => {
  console.log('\nGoodbye!');
  process.exit(0);
});
// Business logic function to handle completed commands
function processInput(input) {
  console.log('\n--- Processing Input ---');
  console.log(`Received:\n${input}`);
  console.log('------------------------\n');
}