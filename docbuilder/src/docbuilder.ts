#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/docbuilder
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'

import { red, green, yellow, cyan, dim } from 'kolorist'

import { __locale } from '@spongex/system-locale'
import { AsyncResolver } from '@spongex/async-resolver'
import { scriptError } from '@spongex/script-error'

/**
 * Constants
 */
const constants = {
  SETTINGS_FILE: `.docbuilder.config.json`,
  LOG_FILE: `.docbuilder.log`,
  OUTPUT_FOLDER: 'docs'
}

/**
 * Load local settings file
 * @returns Settings JSON object
 * @throws Error on fail then exits script
 */
const loadSettings = () => {
  try {
    const settings = fs.readFileSync(path.join(process.cwd(), constants.SETTINGS_FILE))
    return JSON.parse(settings.toString())
  } catch (error:any) {
    scriptError(`Can't find a local '${constants.SETTINGS_FILE}' configuration file.`)
  }
}

/**
 * Write a message to the log file
 * @param message String to write
 * @throws Error on fail then exits script
 */
const writeLog = (message:string) => {
  try {
    fs.appendFileSync(path.normalize(path.join(process.cwd(), constants.LOG_FILE)), message)
  } catch (error:any) { scriptError(error.message) }
}

/**
 * Check if a folder exists, then create it if one does not
 * @param folder Folder to create
 * @throws Error on fail then exits script
 */
const verifyFolder = (folder:string) => {
  try {
    fs.accessSync(path.normalize(folder))
  } catch (error) {
    try {
      fs.mkdirSync(folder)
    } catch (error:any) { scriptError(error.message) }
  }
}

//  Job interface
interface job {
  name:string           /** Name of job */
  generator:string      /** Document generator to use */
  path:string           /** Path to process */
  checkfolder?:boolean  /** Check */
}

//  Command resolution interface
interface cmdRes {
  name:string     /** Name of process */
  command:string  /** Command ran */
  code:number     /** Status code */
  stdout:string   /** stdout buffer */
  stderr:string   /** stderr buffer */
}

/**
 * Job runner - wraps exec in a promise array and runs all jobs
 * @param jobs An array of jobs to run
 * @param command The system command to run
 * @param splicer The splicer function to edit the command
 * @param callback Command callback
 * @return Result of all jobs
 */
 const jobRunner = async (jobs:Array<job>, command:string, splicer:Function, callback:Function) => {
  splicer = splicer || (() => { return command })
  callback = callback || (() => {})
  //  Run all the jobs, resolve/reject promise once done
  const runningJobs:Array<AsyncResolver> = []
  jobs.forEach(job => {
    runningJobs.push(new AsyncResolver())
    const jobIDX = runningJobs.length - 1
    const run_command = splicer(job, command)
    exec(run_command, { cwd: path.normalize(job['path']) }, (error:any, stdout:string, stderr:string) => {
      let cmdRes:cmdRes
      if(error) {
        cmdRes = { name: job['name'], command: run_command,
                   code: error.code, stdout: stdout, stderr: stderr }
        runningJobs[jobIDX].reject(cmdRes)
      } else {
        cmdRes = { name: job['name'], command: run_command,
                   code: 0, stdout: stdout, stderr: stderr }
        runningJobs[jobIDX].resolve(cmdRes)
      }
      callback(error, cmdRes)
    })
  })
  //  Collect the promises and return once all complete
  let jobPromises:Array<Promise<job>> = []
  runningJobs.forEach(job => { jobPromises.push(job.promise) })
  return await Promise.allSettled(jobPromises)
}

/*
 * Main script
 */
console.log(cyan(`Documentation Generation Script\n`))

const settings = loadSettings()

//  Verify settings format
if (!settings.hasOwnProperty('generators')) scriptError('Must define documentation generators to run.')
settings['jobs'].forEach((job:job) => {
  if (!job.hasOwnProperty('name') ||
      !job.hasOwnProperty('generator') ||
      !job.hasOwnProperty('path'))
    scriptError(`Invalid job format.`)
})

//  Override constants if any are defined in settings
if (settings['LOG_FILE'] !== undefined) constants.LOG_FILE = settings['LOG_FILE']
if (settings['OUTPUT_FOLDER'] !== undefined) constants.OUTPUT_FOLDER = settings['OUTPUT_FOLDER']

//  If nologging is defined in settings, skip logging
if (!settings['nologging']) {
  console.log(dim(yellow(`Logging output to '${constants.LOG_FILE}'...`)))

  //  Remove old log file
  if(fs.existsSync(path.join(process.cwd(), constants.LOG_FILE))) {
    try {
      fs.unlinkSync(path.join(process.cwd(), constants.LOG_FILE))
    } catch (error:any) {
      scriptError(`Unable to remove old log file!  Verify you have write access`)
    }
  }
  writeLog(`Documentation Generation Script Log File\n\n`)
}

//  Remove old documentation folder if defined in settings
if (settings['removeold']) {
  if (fs.existsSync(path.join(process.cwd(), constants.OUTPUT_FOLDER))) {
    try {
      fs.rmSync(path.join(process.cwd(), constants.OUTPUT_FOLDER),
        {recursive: true, force: true})
    } catch (error:any) {
      scriptError(`Unable to remove old documentation folder!  Verify you have write access`)
    }
  }
}
verifyFolder(path.join(process.cwd(), constants.OUTPUT_FOLDER))

let logRes = ""
console.log(`Running jobs, please wait...`)
await jobRunner(settings['jobs'], "",
  (job:job) => {
    if (job['checkfolder'])
      verifyFolder(path.join(process.cwd(), constants.OUTPUT_FOLDER, job['name']))
    let runCmd = settings['generators'][job['generator']]
    runCmd = runCmd.replaceAll('$PROJECT_LOCATION', job['path'])
    runCmd = runCmd.replaceAll('$PROJECT', job['name'])
    runCmd = runCmd.replaceAll('$OUTPUT_FOLDER', constants.OUTPUT_FOLDER)
    return runCmd
  },
  (error:Error, cmdRes:cmdRes) => {
    logRes += `--------------------------------------------------\n` +
      `Job: ${cmdRes.name}\n--------------------------------------------------\n` +
      `Command: ${cmdRes.command}\nReturn code: ${cmdRes.code}\n\nOutput:\n${cmdRes.stdout}\nErrors:\n${cmdRes.stderr}\n\n`
    if (error)
      console.log(red(`\nWARNING:  Problems running job '${cmdRes.name}' see log for details...`))
  }
).then(jobResults => {
  let goodRes = jobResults.length
  jobResults.forEach(job => {if(job.status === 'rejected') goodRes-- })
  if(!settings['nologging']) {
    writeLog(logRes + `--------------------------------------------------\n\n`)
    writeLog(`${goodRes} of ${jobResults.length} jobs completed successfully at ${new Date().toLocaleString(__locale)}`)
  }
  console.log(`\n${goodRes} of ${jobResults.length} jobs completed successfully at ${new Date().toLocaleString(__locale)}`)
  console.log(green(`Done!\n`))
})
process.exit(0)
