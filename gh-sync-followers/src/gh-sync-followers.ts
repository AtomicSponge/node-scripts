#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module gh_sync_followers
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { Command } from 'commander'
import { scriptError } from '@spongex/script-error'
import { __os_appdata_path } from '@spongex/os-appdata-path'

const colors = {
  RED:    `\x1b[31m`,
  GREEN:  `\x1b[32m`,
  CYAN:   `\x1b[36m`,
  CLEAR:  `\x1b[0m`
}

console.log(`${colors.GREEN}GitHub Sync Followers Script${colors.CLEAR}`)

if (__os_appdata_path === null) scriptError('Unable to find local app storage!')
const listLocation = path.join(<string>__os_appdata_path, 'gh-sync-followers')

let approveList:Array<string> = []
let ignoreList:Array<string> = []

/**
 * Save the approve & ignore lists to file
 * @throws Any errors related to saving the file
 */
const saveListData = () => {
  try {
    if(!fs.existsSync(listLocation)) fs.mkdirSync(listLocation)
    const temp = JSON.stringify({
      approveList: approveList,
      ignoreList: ignoreList
    })
    fs.writeFileSync(path.join(listLocation, 'gh-user-lists.json'), temp)
  } catch (error:any) { throw error }
}

if (fs.existsSync(path.join(listLocation, 'gh-user-lists.json'))) {
  //  Lists file exists, load it
  try {
    const data = JSON.parse(fs.readFileSync(path.join(listLocation, 'gh-user-lists.json')).toString())
    if(data.hasOwnProperty('approveList'))
      data.approveList.forEach((item:string) => { approveList.push(item) })
    if(data.hasOwnProperty('ignoreList'))
      data.ignoreList.forEach((item:string) => { ignoreList.push(item) })
  } catch (error:any) {
    scriptError(error.message)
  }
} else {
  //  Lists file does not exist, create it
  try {
    saveListData()
  } catch (error:any) {
    scriptError(error.message)
  }
}

const program = new Command()
program
  .name('gh-sync-followers')
  .summary('Sync your GitHub followers!')
  .description('Run this command without any arguments to perform a sync of your GitHub followers')
  .action(async () => {
    const exeCmd = `gh api`
    const apiHeaders = 
      `-H "Accept: application/vnd.github+json" ` +
      `-H "X-GitHub-Api-Version: 2022-11-28"`

    //  Get followers
    console.log(`Getting followers...`)
    const myFollowers = (() => {
      try {
        const res = execSync(`${exeCmd} ${apiHeaders} /user/followers --paginate`)
        return JSON.parse(res.toString())
      } catch(error:any) { scriptError(error.message) }
    })()

    //  Get following
    console.log(`Getting following...`)
    const myFollowing = (() => {
      try {
        const res = execSync(`${exeCmd} ${apiHeaders} /user/following --paginate`)
        return JSON.parse(res.toString())
      } catch(error:any) { scriptError(error.message) }
    })()

    console.log(`Filtering...`)
    //  Filter followers for any not being followed
    const addFollowers = myFollowers.filter((follower:{id:number}) =>
      !myFollowing.map((following:{id:number}) => following.id).includes(follower.id))
    //  Filter following for any not following back
    const removeFollowers = myFollowing.filter((following:{id:number}) =>
      !myFollowers.map((follower:{id:number}) => follower.id).includes(following.id))

    //  Add new followers not being followed
    console.log(`Adding followers...`)
    addFollowers.forEach((follower:{login:string}) => {
      try {
        execSync(`${exeCmd} --method PUT ${apiHeaders} /user/following/${follower.login}`)
      } catch(error:any) { scriptError(error.message, { exit: false }) }
    })
    console.log(`Added ${colors.CYAN}${addFollowers.length}${colors.CLEAR} new followers!`)

    //  Remove not following back
    console.log(`Removing unfollowers...`)
    removeFollowers.forEach((following:{login:string}) => {
      try {
        execSync(`${exeCmd} --method DELETE ${apiHeaders} /user/following/${following.login}`)
      } catch(error:any) { scriptError(error.message, { exit: false }) }
    })
    console.log(`Removed ${colors.CYAN}${removeFollowers.length}${colors.CLEAR} unfollowers!`)
  })

/*
 * Add GitHub users to Approve List
 */
program.command('approvelist')
  .description('Add GitHib users to your approved list')
  .argument('<users...>', 'One or more GitHub usernames to add')
  .action((users) => {
    users.forEach((user:string) => { approveList.push(user) })
    approveList = approveList.filter((val, idx, arr) => {
      return arr.indexOf(val) === idx
    })

    try {
      saveListData()
    } catch (error:any) {
      scriptError(error.message)
    }
  })

/*
 * Add GitHub users to Ignore List
 */
program.command('ignorelist')
  .description('Add GitHib users to your ignored list')
  .argument('<users...>', 'One or more GitHub usernames to add')
  .action((users) => {
    users.forEach((user:string) => { ignoreList.push(user) })
    ignoreList = ignoreList.filter((val, idx, arr) => {
      return arr.indexOf(val) === idx
    })

    try {
      saveListData()
    } catch (error:any) {
      scriptError(error.message)
    }
  })

/*
 * Remove GitHub users from Approved List
 */
program.command('approvelist-remove')
  .description('Remove GitHib users from your approved list')
  .argument('<users...>', 'One or more GitHub usernames to remove')
  .action((users) => {
    users.forEach((user:string) => {
      const idx = approveList.indexOf(user)
      if (idx > -1) approveList.splice(idx, 1)
    })

    try {
      saveListData()
    } catch (error:any) {
      scriptError(error.message)
    }
  })

/*
 * Remove GitHub users from Ignore List
 */
program.command('ignorelist-remove')
  .description('Remove GitHib users from your ignored list')
  .argument('<users...>', 'One or more GitHub usernames to remove')
  .action((users) => {
    users.forEach((user:string) => {
      const idx = approveList.indexOf(user)
      if (idx > -1) approveList.splice(idx, 1)
    })

    try {
      saveListData()
    } catch (error:any) {
      scriptError(error.message)
    }
  })

program.showHelpAfterError()
await program.parseAsync()
console.log(`${colors.GREEN}Done!${colors.CLEAR}`)
process.exit(0)
