#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/backup_scripts
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { exec } from 'node:child_process'
import { colors, loadSettings, scriptError } from './_common.js'

/**
 * Constants
 */
const constants = {
  SETTINGS_FILE: `_config.json`,
  SETTINGS_LOCATION: `${os.homedir()}/.sysbak`,
  LOG_LOCATION: `${os.homedir()}/.sysbak/log`,
  SYSBAK_LOG: `sysbak.log`,
  LASTRUN_FILE: `lastrun`
}

/**
 * Write a message to the log file
 * @param message String to write
 * @throws Error on fail then exits script
 */
 const writeLog = (message:string) => {
  try {
    fs.appendFileSync(
      path.normalize(`${constants.LOG_LOCATION}/${constants.SYSBAK_LOG}`),
      message)
  } catch (error:any) { scriptError(error.message) }
}

//  Job interface
interface job {
  name: string
  location: string
}

//  Command resolution interface
interface cmdRes {
  name: string
  command:string
  code: number
  stdout: string
  stderr: string
}

/**
 * Job runner - wraps exec in a promise array and runs all jobs
 * @param jobs An array of jobs to run
 * @param command The system command to run
 * @param splicer The splicer function to edit the command
 * @param callback Command callback
 * @return Result of all jobs
 */
const jobRunner = async (jobs:Array<job>, command:string, splicer:Function, callback?:Function) => {
  splicer = splicer || (() => { return command })
  callback = callback || (() => {})
  //  Wrapper class for promises
  class Resolver {
    promise
    reject:Function = () => {}
    resolve:Function = () => {}

    constructor() {
      this.promise = new Promise((resolve, reject) => {
        this.reject = reject
        this.resolve = resolve
      })
    }
  }
  //  Run all the jobs, resolve/reject promise once done
  var runningJobs:Array<Resolver> = []
  jobs.forEach(job => {
    runningJobs.push(new Resolver())
    const jobIDX = runningJobs.length - 1
    const run_command = splicer(job, command)
    exec(run_command, (error, stdout, stderr) => {
      var cmdRes:cmdRes
      if(error) {
        cmdRes = { name: job['name'], command: run_command,
                   code: 1, stdout: stdout, stderr: stderr }
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
  var jobPromises:Array<Promise<any>> = []
  runningJobs.forEach(job => { jobPromises.push(job.promise) })
  return await Promise.allSettled(jobPromises)
}

/*
 * Main script
 */
console.log(`${colors.CYAN}System Backup Script${colors.CLEAR}`)

const settings = loadSettings(`${constants.SETTINGS_LOCATION}/${constants.SETTINGS_FILE}`)

//  Verify jobs format
if(!(settings['jobs'] instanceof Array)) scriptError(`No Jobs defined.`)
settings['jobs'].forEach((job:job, IDX:number) => {
  if(job['name'] === undefined || job['location'] === undefined)
    scriptError(`Job ${IDX+1} of ${settings['jobs'].length} incorrect format.`)
})
//  Verify backup_command
if(!settings['backup_command']) scriptError(`No backup command defined.`)

//  Remove old log file
try{
  fs.unlinkSync(`${constants.LOG_LOCATION}/${constants.SYSBAK_LOG}`)
} catch (error) {}

console.log(`Running backup jobs, please wait...`)

writeLog(`Backup job started at ${new Date().toString()}\n\n`)

//  Failed job interface
interface failedJobs {
  name: string
  command: string
  code: number
  error: string
}

//  Job runner interface
interface jobRunner extends job {
  backup_command:string
  vars:Array<{ variable:string, value:string }>
}

// Run all jobs, splicing in the command variables
jobRunner(settings['jobs'], settings['backup_command'],
  (job:jobRunner, backup_command:string) => {
    //  Use job specific backup command if one is defined
    if(job['backup_command']) backup_command = job['backup_command']
    backup_command = backup_command.replaceAll('$JOB_NAME', job['name'])
    backup_command = backup_command.replaceAll('$JOB_LOCATION', job['location'])
    backup_command = backup_command.replaceAll('$LOG_LOCATION', constants.LOG_LOCATION)
    //  Process job specific variables
    if(job['vars'] instanceof Array) job['vars'].forEach(cmdVar => {
      backup_command = backup_command.replaceAll(cmdVar['variable'], cmdVar['value'])
    })
    //  Process global variabls
    if(settings['cmdVars'] instanceof Array) settings['cmdVars'].forEach(cmdVar => {
      backup_command = backup_command.replaceAll(cmdVar['variable'], cmdVar['value'])
    })
    return backup_command
  }
).then((jobResults) => {
  //  Check for any failed jobs
  var failedJobs:Array<failedJobs> = []
  jobResults.forEach(job => {
    if(job.status == 'rejected') {
      failedJobs.push({ name: job.reason.name,
                        command:  job.reason.command,
                        code: job.reason.code,
                        error: job.reason.stderr })
    }
  })
  if(failedJobs.length > 0) {
    var errorMsg = 'The following jobs failed:\n\n'
    failedJobs.forEach(job => {
      errorMsg += `==============================\n\n`
      errorMsg += `Job: '${job.name}'\tCode: ${job.code}\n\nCommand: ${job.command}`
      errorMsg += `\n\nReason:\n${job.error}\n`
    })
    errorMsg += `\n${failedJobs.length} of ${jobResults.length} jobs completed with errors.`
    writeLog(errorMsg)
    scriptError(errorMsg)
  }

  //  Log last run time
  try {
    fs.unlinkSync(`${constants.SETTINGS_LOCATION}/${constants.LASTRUN_FILE}`)
  } catch (error) {}
  try {
    fs.appendFileSync(
      `${constants.SETTINGS_LOCATION}/${constants.LASTRUN_FILE}`,
      new Date().toString()
    )
  } catch (error:any) { scriptError(error.message) }

  writeLog(`${jobResults.length} jobs completed successfully at ${new Date().toString()}`)
  console.log(`${colors.GREEN}Done!${colors.CLEAR}`)
})
