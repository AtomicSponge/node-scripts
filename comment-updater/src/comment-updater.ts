#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/comment_updater
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'node:fs'
import path from 'node:path'

import { scriptError } from '@spongex/script-error'

/**
 * Font colors
 */
 const colors = {
  RED:    `\x1b[31m`,
  GREEN:  `\x1b[32m`,
  YELLOW: `\x1b[33m`,
  CYAN:   `\x1b[36m`,
  DIM:    `\x1b[2m`,
  CLEAR:  `\x1b[0m`
}

/**
 * Constants
 */
const constants = {
  SETTINGS_FILE: `.comment_updater_config.json`,
  LOG_FILE: `.comment_updater.log`,
  DAY: 0,
  MONTH: 0,
  YEAR: 0,
  VERBOSE: false,
  LOG: true,
  TESTING: false
}

//  Command interface
interface command {
  name:string
  flags:string
}

/**
 * Converts script arguments from array to object
 * @param args Argument array
 * @param commands Object representing a list of commands
 * @returns Argument object
 */
const parseArgs = (args:Array<string>, commands:Array<command>) => {
  var _args:any = {}
  //  Build the object using supplied command names
  commands.forEach((command:command) => {
    (command.name.includes('=') ?
      _args[command.name] = null : _args[command.name] = false)
  })
  //  Now parse the arguments
  args.forEach(arg => {
    var matchMe:string = ''
    var newVal:any = null
    if(arg.includes('=')) {
      matchMe = arg.substring(0, arg.indexOf('='))
      newVal = arg.substring(arg.indexOf('=') + 1)
    } else {
      matchMe = arg
      newVal = true
    }
    commands.forEach(command => {
      command.flags.replace(/\s+/g, '').split(',').forEach(item => {
        if(item == matchMe) _args[command.name] = newVal
      })
    })
  })
  return _args
}

/**
 * Load local settings file
 * @returns Settings JSON object
 * @throws Error on fail then exits script
 */
const loadSettings = () => {
  try {
    const res = fs.readFileSync(path.normalize(`${process.cwd()}/${constants.SETTINGS_FILE}`))
    const settings = res.toString()
    return JSON.parse(settings)
  } catch (error) {
    scriptError(`Can't find a local '${constants.SETTINGS_FILE}' configuration file.`)
  }
}

/**
 * Set the date variables in constants to current values
 */
const setDate = () => {
  const date = new Date()
  constants.DAY = date.getDate()
  constants.MONTH = date.getMonth()
  constants.YEAR = date.getFullYear()
}

/**
 * Write a message to the log file
 * @param message String to write
 * @throws Error on fail then exits script
 */
const writeLog = (message:string) => {
  try {
    fs.appendFileSync(path.normalize(`${process.cwd()}/${constants.LOG_FILE}`), message)
  } catch (error:any) { scriptError(error.message) }
}

//  Comment block interface
interface commentBlock {
  name:string
  block:string
  comment_start:string
  comment_end:string
  line_delimiter:string
  delimiter:string
  start:string
  end:string
}

/**
 * Process a single file
 * @param sourceFile Filename to edit
 * @param commentBlock The comment block object
 */
const processFile = (sourceFile:string, commentBlock:commentBlock) => {
  var tempBlock = Object.assign({}, commentBlock)
  if(constants.VERBOSE)
    console.log(`${colors.YELLOW}${colors.DIM}Processing file:${colors.CLEAR}  ${sourceFile}...  `)
  if(constants.LOG) writeLog(`Processing file:  ${sourceFile}...  `)

  try{
    //  Update comment block with current filename
    const sourceFileName = sourceFile.substring(1 + sourceFile.lastIndexOf('/'))
    tempBlock.block = tempBlock.block.replaceAll('$CURRENT_FILENAME', sourceFileName)

    //  Format new comment block
    var newBlock = tempBlock.block.split('\n')
    for(let i = 0; i < newBlock.length; i++) {
      newBlock[i] = `${tempBlock.delimiter}${newBlock[i]}`
    }

    var sourceData = fs.readFileSync(path.normalize(sourceFile), 'utf-8').split('\n')

    //  Find start/end of top comment block
    const startIDX = sourceData.findIndex(item => item == tempBlock.start)
    const endIDX = sourceData.findIndex(item => item == tempBlock.end)

    //  Splice in the new block
    sourceData.splice(startIDX + 1, endIDX - 1, ...newBlock)

    if(constants.TESTING) {
      console.log(`\n${sourceData.join('\n')}`)
    } else {
      fs.unlinkSync(path.normalize(sourceFile))
      fs.appendFileSync(path.normalize(sourceFile), sourceData.join('\n'))
    }
  } catch (error:any) {
    if(constants.LOG) writeLog(`ERROR!\n\n${error.message}\n\nScript canceled!`)
    scriptError(`ERROR!\n\n${error.message}\n\nScript canceled!`)
  }

  if(constants.VERBOSE) console.log(`${colors.GREEN}Done!${colors.CLEAR}`)
  if(constants.LOG) writeLog(`Done!\n`)
}

//  Job interface
interface job {
  job:string
  block: string
  location: string
  extension: string
  recursive: boolean
}

/**
 * Process each job
 * @param job An object representing the job task
 */
const runJob = (job:job) => {
  if(job['job'] === undefined || job['block'] === undefined ||
    job['location'] === undefined || job['extension'] === undefined)
    scriptError(`Invalid job format.`)

  var commentBlock:commentBlock = {
    'name': '',
    'block': '!@___not_found___@!',
    'comment_start': '',
    'comment_end': '',
    'line_delimiter': '',
    'delimiter': '',
    'start': '',
    'end': ''
  }

  if(constants.VERBOSE) console.log(`\n${colors.YELLOW}Running job ${job['job']}...${colors.CLEAR}`)
  if(constants.LOG) writeLog(`Running job ${job['job']}...\n\n`)

  //  Find a matching comment block
  settings['comment_blocks'].forEach((block:commentBlock) => {
    if(block['name'] == job['block']) {
      commentBlock.block = block['block']
      commentBlock.start = block['comment_start']
      commentBlock.end = block['comment_end']
      commentBlock.delimiter = block['line_delimiter']
      return
    }
  })
  if(commentBlock['block'] === '!@___not_found___@!')
    scriptError(`No matching comment block found with name '${job['block']}'.`)

  //  Update comment block with variable values
  commentBlock.block = commentBlock.block.replaceAll('$MM', `${constants.MONTH}`)
  commentBlock.block = commentBlock.block.replaceAll('$DD', `${constants.DAY}`)
  commentBlock.block = commentBlock.block.replaceAll('$YYYY', `${constants.YEAR}`)
  if(settings['project']) commentBlock.block = commentBlock.block.replaceAll('$PROJECT', settings['project'])
  if(settings['author']) commentBlock.block = commentBlock.block.replaceAll('$AUTHOR', settings['author'])
  if(settings['version']) commentBlock.block = commentBlock.block.replaceAll('$VERSION', settings['version'])
  if(settings['copyright']) commentBlock.block = commentBlock.block.replaceAll('$COPYRIGHT', settings['copyright'])
  if(settings['email']) commentBlock.block = commentBlock.block.replaceAll('$EMAIL', settings['email'])
  if(settings['website']) commentBlock.block = commentBlock.block.replaceAll('$WEBSITE', settings['website'])

  /**
   * Run a recursive job
   * @param location Initial location to start
   */
  const recursiveJob = (location:string) => {
    const fileList = fs.readdirSync(path.normalize(location), { withFileTypes: true })
    fileList.forEach(item => {
      if(item.isDirectory()) recursiveJob(`${location}/${item.name}`)
      else
        if(item.name.search(job['extension']) != -1) {
          processFile(`${location}/${item.name}`, commentBlock)
        }
    })
  }

  //  Now process each file in the job
  try {
    if(job['recursive']) recursiveJob(job['location'])
    else
      fs.readdirSync(path.normalize(job['location'])).forEach(item => {
        if(item.search(job['extension']) != -1)
          processFile(`${job['location']}/${item}`, commentBlock)
      })
  } catch (error:any) { scriptError(error.message) }

  if(constants.LOG) writeLog(`\n--------------------------------------------------\n\n`)
}

/*
 * Main script
 */
console.log(`${colors.CYAN}Comment Updater Script${colors.CLEAR}`)

const args = parseArgs(process.argv, [
  { name: 'verbose', flags: '-v, --verbose' },
  { name: 'nologging', flags: '--nologging' },
  { name: 'testing', flags: '-t, --test, --testing'} ])
const settings = loadSettings()
setDate()

//  Verify comment blocks are configured properly
settings['comment_blocks'].forEach((block:commentBlock) => {
  if(block['block'] === undefined || block['comment_start'] === undefined ||
     block['comment_end'] === undefined || block['line_delimiter'] === undefined)
    scriptError('Invalid comment block format.')
})

//  Set flags
if(settings['verbose'] || args.verbose) constants.VERBOSE = true
if(settings['nologging'] || args.nologging) constants.LOG = false
if(args.testing) constants.TESTING = true

if(constants.LOG) {
  //  Remove old log file
  try {
    fs.unlinkSync(path.normalize(`${process.cwd()}/${constants.LOG_FILE}`))
  } catch (error:any) { scriptError(error.message) }

  //  Create new log file
  const date = new Date()
  const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()]
  const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()]
  writeLog(`Comment Updater Script Log File\n`)
  writeLog(`Last ran: ${month}-${day}-${year} ${hour}:${minutes}:${seconds}\n\n`)
}

//  Run each job
settings['jobs'].forEach((job:job) => { runJob(job) })

console.log(`\n${colors.GREEN}Done!${colors.CLEAR}`)
