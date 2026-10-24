#!/usr/bin/env node
import * as readline from 'readline'
import { styleText } from 'util'

const promptPrefix: string = 'JSON-Query> '

// Continuation prompt, padded to line up with the first line and dimmed so it reads as secondary
const continuePrefix: string = styleText('dim', '-> '.padStart(promptPrefix.length))

// Create the interface for reading from standard input/output
const rl: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: promptPrefix
})

// Buffer to store multi-line inputs
let inputBuffer: string = ''

console.log('JSON Filesystem Query CLI')
console.log('Type your command. End it with a semicolon (;) and press Enter to execute.')
console.log('Type "/exit" or press Ctrl+C to quit.\n')

// Open the session by displaying the initial prompt
rl.prompt()

// Handle line-by-line input
rl.on('line', (line: string): void => {
  const trimmedLine: string = line.trim()

  // Check if the user wants to exit
  if (trimmedLine.toLowerCase() === '/exit') {
    rl.close()
    return
  }

  // Skip blank lines, they add nothing to the query
  if (!trimmedLine) {
    rl.prompt()
    return
  }

  // Append current line to the buffer
  inputBuffer += (inputBuffer ? ' ' : '') + trimmedLine

  // Check if the line ends with a semicolon
  if (trimmedLine.endsWith(';')) {
    // Process the accumulated input
    processInput(inputBuffer)

    // Reset the buffer and prompt for next command
    inputBuffer = ''
    rl.setPrompt(promptPrefix)
  } else {
    // Change prompt visually to show it is expecting continuation
    rl.setPrompt(continuePrefix)
  }

  rl.prompt()
})

// Handle graceful exit on Ctrl+C or rl.close()
rl.on('close', (): void => {
  console.log('\nGoodbye!')
  process.exit(0)
})

// Business logic function to handle completed commands
function processInput (input: string): void {
  console.log('\n--- Processing Input ---')
  console.log(`Received:\n${input}`)
  console.log('------------------------\n')
}
