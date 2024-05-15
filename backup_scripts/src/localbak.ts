#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/backup_scripts
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'fs'
import path from 'node:path'
import { colors, loadSettings, scriptError } from './_common.js'

/**
 * Constants
 */
const constants = {
  SETTINGS_FILE: `.localbak_config.json`,
  BACKUP_FOLDER: `_backup`
}

/**
 * Counters to track items backed up
 */
const counters = {
  files: 0,
  folders: 0
}

/**
 * Recursively back up files & folders starting at a location
 * @param location Current processing location
 * @param backupLocation Current backup location
 * @param ignoreList List of files & folders to ignore
 */
const processFolder = (location:string, backupLocation:string, ignoreList:Array<string>) => {
  if(ignoreList === undefined) ignoreList = []
  const fileList = fs.readdirSync(path.normalize(location), { withFileTypes: true })
  fs.mkdirSync(backupLocation)
  fileList.forEach(item => {
    //  Check if the item is in the ignore list
    var ignoreMatch = false
    ignoreList.forEach(ignore => { if(item.name == ignore) ignoreMatch = true; return })
    if(ignoreMatch) return
    //  Process the item
    if(item.isDirectory()) {
      counters.folders++
      processFolder(`${location}/${item.name}`, `${backupLocation}/${item.name}`, ignoreList)
    }
    if(item.isFile()) {
      counters.files++
      fs.copyFileSync(`${location}/${item.name}`, `${backupLocation}/${item.name}`)
    }
    //  Ignore other things such as symlinks
  })
}

/*
 * Main script
 */
console.log(`${colors.CYAN}Local Backup Script${colors.CLEAR}\n`)

//  Check for a settings file
var settings = loadSettings(`${process.cwd()}/${constants.SETTINGS_FILE}`, true)
if(!settings) settings = {}
else console.log(`Loaded settings from a local '${constants.SETTINGS_FILE}' file.`)

//  Overrwite backup name if exists in settings
if(settings['backup_name']) constants.BACKUP_FOLDER = settings['backup_name']

//  If an extra name is specified, add it to the backup folder name
if(process.argv[2] != undefined) constants.BACKUP_FOLDER += process.argv[2]

//  Remove old backup
fs.rmSync(`${process.cwd()}/${constants.BACKUP_FOLDER}`, {recursive: true, force: true})

console.log(`Backing up '${process.cwd()}' to '${constants.BACKUP_FOLDER}'...`)

//  Process the backup
try {
  processFolder(process.cwd(), `${process.cwd()}/${constants.BACKUP_FOLDER}`, settings['ignore'])
} catch (error:any) { scriptError(error.message) }

console.log(`Backed up ${colors.YELLOW}${counters.files} files${colors.CLEAR} ` +
  `and ${colors.YELLOW}${counters.folders} folders${colors.CLEAR}.\n`)
console.log(`${colors.GREEN}Done!${colors.CLEAR}`)
