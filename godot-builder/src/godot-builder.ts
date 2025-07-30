#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module godot-builder
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { scriptError } from '@spongex/script-error'

const colors = {
  RED:    `\x1b[31m`,
  GREEN:  `\x1b[32m`,
  MAGENTA: `\x1b[35m`,
  CYAN:   `\x1b[36m`,
  YELLOW: `\x1b[93m`,
  CLEAR:  `\x1b[0m`
}

/**
 * Constants
 */
const constants = {
  SETTINGS_FILE: `.godot_builder_config.json`,
}

/**
 * Load local settings file
 * @param SETTINGS_FILE File to load
 * @param noerror Pass true to ignore the script error
 * @returns Settings JSON object
 * @throws Error on fail then exits script
 */
export const loadSettings = (SETTINGS_FILE:string, noerror?:boolean) => {
  try {
    return JSON.parse(fs.readFileSync(path.normalize(SETTINGS_FILE)).toString())
  } catch (error) {
    if(!noerror) scriptError(`Can't find a '${SETTINGS_FILE}' configuration file.`)
  }
}

console.log(`${colors.GREEN}Building binaries...${colors.CLEAR}`)

var settings = loadSettings(`${process.cwd()}/${constants.SETTINGS_FILE}`, true)
