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
  .version('1.0.0')

  //  Generate random numbers
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

  //  Generate random letters
  program.command('letters')
  .description('Generate random letters')
  .argument('<amount>', 'Amount of letters to generate')
  .action((amount) => {
    if(amount >= 2**31) scriptError('Amount is too large!')
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const res = Array.from(crypto.randomFillSync(new Uint32Array(amount)))
      .map((x) => chars[x % chars.length])
      .join('')
    console.log(`${colors.YELLOW}${res}${colors.CLEAR}`)
  })

  //  Generate random numbers & letters
  program.command('alphanum')
  .description('Generate random numbers and letters')
  .argument('<amount>', 'Amount of numbers and letters generate')
  .action((amount) => {
    if(amount >= 2**31) scriptError('Amount is too large!')
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const res_a = Array.from(crypto.randomFillSync(new Uint32Array(Math.floor(amount / 2))))
      .map((x) => chars[x % chars.length])
      .join('')
    const res_b:Array<number> = []
      for (let i = 0; i < Math.round(amount / 2); i++) {
        res_b.push(crypto.randomInt(0, 9))
      }

    /**
     * Merge any number of arrays together
     * @param arrays Any number of arrays to merge
     * @returns Merged array
     */
    const braidArrays = (...arrays:Array<any>) => {
      const braided:Array<any> = []
      for (let i = 0; i < Math.max(...arrays.map(a => a.length)); i++) {
        arrays.forEach((array) => {
          if (array[i] !== undefined) braided.push(array[i])
        })
      }
      return braided
    }
    const res = braidArrays(res_a, res_b)
    console.log(`${colors.YELLOW}${res.join('')}${colors.CLEAR}`)
  })

  //  Generate random hex
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
