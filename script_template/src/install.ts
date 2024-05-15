#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module script_template
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'node:fs'
import path from 'node:path'

import prompt, { type PrevCaller } from 'prompts'
import { red, green, yellow } from 'kolorist'

/**
 * Display an error message and exit script.
 * @param message Message to display.
 */
const scriptError = (message:string) => {
  console.error(red(`Error:  ${message}  Exiting...`))
  process.exit(1)
}

/**
 * Wrapper for prompt to create a basic text input prompt
 * @param message Message to display
 * @param validate Validation function
 * @returns The inputted string
 */
const textPrompt = async (message:string, validate?:PrevCaller<string, boolean | string>) => {
  const temp = await prompt({
    type: 'text',
    name: 'value',
    message: message,
    validate: validate
  })
  return temp.value
}

//  Prompt for name
const projectName = await (async () => {
  if(process.argv[2] === undefined) {
    return await textPrompt(`Enter a project name: `, ((value:string) => {
      if(value.length === 0) return `Please enter a name`
      if(/[^\S\r\n]/g.test(value)) return `Please no spaces`
      if(/\s/g.test(value)) return `Please no spaces`
      return true
    }))
  } else return process.argv[2]
})()

console.log(projectName)

process.exit(0)

//  Create project directory
const currentDir = process.cwd()
const projectDir = path.resolve(currentDir, projectName)
fs.mkdirSync(projectDir, { recursive: true })

//  Copy over files to new directory
const templateDir = path.resolve(__dirname, 'template')
fs.cpSync(templateDir, projectDir, { recursive: true })

//  Rename gitignore
fs.renameSync(
  path.join(projectDir, 'gitignore'),
  path.join(projectDir, '.gitignore')
)

//  Rename npmignore
fs.renameSync(
  path.join(projectDir, 'npmignore'),
  path.join(projectDir, '.npmignore')
)

const projectPackageJson = require(path.join(projectDir, 'package.json'))

projectPackageJson.name = projectName

fs.writeFileSync(
  path.join(projectDir, 'package.json'),
  JSON.stringify(projectPackageJson, null, 2)
)
