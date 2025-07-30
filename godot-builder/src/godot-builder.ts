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

//  Job interface
interface Job {
  preset: string
  path: string
}

//  Settings interface
interface Settings {
  godot_command: string
  jobs: Array<Job>
}

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
 * Load local settings file - exit script on fail.
 * @param SETTINGS_FILE File to load
 * @returns Settings JSON object
 */
const loadSettings = (SETTINGS_FILE:string) => {
  try {
    return JSON.parse(fs.readFileSync(path.normalize(SETTINGS_FILE)).toString())
  } catch (error) {
    scriptError(`Can't find a local '${SETTINGS_FILE}' configuration file.`)
  }
}

console.log(`${colors.GREEN}Building binaries...${colors.CLEAR}`)

var settings:Settings = loadSettings(`${process.cwd()}/${constants.SETTINGS_FILE}`)

if(settings.godot_command === undefined) scriptError(`Must configure path to Godot executable`)
if(!(settings.jobs instanceof Array)) scriptError(`No Jobs defined.`)

settings.jobs.forEach((job:Job, IDX:number) => {
  if(job.preset === undefined || job.path === undefined)
    scriptError(`Job ${IDX+1} of ${settings.jobs.length} incorrect format.`)
  try {
    execSync(`${settings.godot_command} --export-release ${job.preset} ${job.path}`)
  } catch (error) {
    scriptError(`Failed to run job ${IDX+1} of ${settings.jobs.length}.`)
  }

  console.log(`Job ${colors.YELLOW}${IDX+1}${colors.CLEAR} of ` +
    `${colors.YELLOW}${settings.jobs.length}${colors.CLEAR} complete!`)
})

console.log(`${colors.GREEN}All jobs completed successfully!${colors.CLEAR}`)
