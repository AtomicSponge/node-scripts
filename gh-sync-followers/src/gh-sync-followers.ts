#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module gh_sync_followers
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

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
const program = new Command()
program
  .name('gh-sync-followers')
  .description('Sync your GitHub followers!')
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
await program.parseAsync()
console.log(`${colors.GREEN}Done!${colors.CLEAR}`)
process.exit(0)
