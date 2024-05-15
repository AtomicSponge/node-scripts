#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/backup_scripts
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'fs'
import path from 'node:path'

/**
 * Font colors
 */
export const colors = {
  RED:    `\x1b[31m`,
  GREEN:  `\x1b[32m`,
  YELLOW: `\x1b[33m`,
  CYAN:   `\x1b[36m`,
  DIM:    `\x1b[2m`,
  CLEAR:  `\x1b[0m`
}

/**
 * Display an error message and exit script.
 * @param message Message to display.
 */
export const scriptError = (message:string) => {
  console.error(`${colors.RED}Error:  ${message}  Exiting...${colors.CLEAR}`)
  process.exit(1)
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
