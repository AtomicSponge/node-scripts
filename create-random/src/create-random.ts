#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/create-random
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import crypto from 'node:crypto'
import { Command } from 'commander'
import { scriptError } from '@spongex/script-error'

const colors = {
  YELLOW: `\x1b[93m`,
  CLEAR:  `\x1b[0m`
}

const program = new Command()
program
  .name('create-random')
  .description('Generate random data')

  program.command('numbers')
  .description('Generate random numbers')
  .argument('<amount>', 'Amount of numbers to generate')
  .action((amount) => {
    if(amount >= Number.MAX_SAFE_INTEGER) scriptError('Amount is too large!')
    const res:Array<number> = []
    for (let i = 0; i < amount; i++) {
      res.push(crypto.randomInt(0, 9))
    }
    console.log(`${colors.YELLOW}${res.join('')}${colors.CLEAR}`)
  })

  program.command('letters')
  .description('Generate random letters')
  .argument('<amount>', 'Amount of letters to generate')
  .action((amount) => {
    if(amount >= 2**31) scriptError('Amount is too large!')
    const res = 'out'
    console.log(`${colors.YELLOW}${res}${colors.CLEAR}`)
  })

  program.command('alphanum')
  .description('Generate random numbers and letters')
  .argument('<amount>', 'Amount of numbers and letters generate')
  .action((amount) => {
    if(amount >= 2**31) scriptError('Amount is too large!')
    const res = 'out'
    console.log(`${colors.YELLOW}${res}${colors.CLEAR}`)
  })

  program.command('hex')
  .description('Generate random hex values')
  .argument('<amount>', 'Amount of hex values to generate')
  .action((amount) => {
    if(amount >= 2**31) scriptError('Amount is too large!')
    const res = crypto.randomBytes(Number(amount)).toString('hex')
    console.log(`${colors.YELLOW}${res}${colors.CLEAR}`)
  })
program.showHelpAfterError()
program.parse()
process.exit(0)
