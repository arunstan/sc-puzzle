const readline = require('readline')
const driver = require('./src/driver')

const inputLines = []

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.on('line', (line) => inputLines.push(line))
rl.on('close', () => {
  const results = driver.processInput(inputLines)
  if (results) {
    results.seatRanges.map((range) => console.log(range))
    console.log(results.seatsRemaining)
  }
})
