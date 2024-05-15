# Backup NodeJS Scripts

Local and system backup scripts.  See each section for usage of each script.

Install globally:
```
npm i -g @spongex/backup-scrips
```
Or per-project as a dev-dependency:
```
npm i @spongex/backup-scrips --save-dev
```

---

## Local Backup

__Command:__  *npx localbak*

Create a local ___backup__ folder and copy the current folder to the new one.

Allows for certain files and folders to be ignored.  In the running folder, create a file called __.localbak_config.json__ with the following format:
```
{
  "ignore": [
    ".cmake",
    ".git",
    "build",
    "docs",
    "node_modules"
  ]
}
```

---

## System Backup

__Command:__  *npx sysbak*

__Does heavy command injection, use at your own risk!__

See [NodeJS's documentation](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) on [exec](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) for more information on how commands work.

Use a third party sync utility such as [rclone](https://rclone.org/) and automate folder syncronization.

To use, define a command to run a sync utility and a list of jobs in a ___config.json__ file located in a __.sysbak__ folder placed in your user home directory.

Two variables are required to be defined:
- __"backup_command"__ - The sync command to run.  The script can replace variables defined in this command.
- __"jobs"__ - An array of job objects to run.  Each job should have a __name__ and __location__ item.

An exampe format is as follows:
```
{
  "backup_command": "rclone --log-file=$LOG_LOCATION/$JOB_NAME.log --log-level $LOGGING_LEVEL --skip-links --ask-password=false --password-command $RCLONE_PASSWORD_COMMAND sync $JOB_LOCATION $BACKUP_NAME:$JOB_NAME",
  "jobs": [
    {
      "name": "Backup",
      "location": "/home/matthew/Backup"
    },
    {
      "name": "Documents",
      "location": "/home/matthew/Documents"
    },
    {
      "name": "Music",
      "location": "/home/matthew/Music"
    },
    {
      "name": "Pictures",
      "location": "/home/matthew/Pictures"
    },
    {
      "name": "Projects",
      "location": "/home/matthew/Projects"
    },
    {
      "name": "Videos",
      "location": "/home/matthew/Videos"
      "vars" {
        {
          "variable": "$EXAMPLE",
          "value": "this is only an example!"
        }
      }
    }
  ],
  "cmdVars": [
    {
      "variable": "$LOGGING_LEVEL",
      "value": "NOTICE"
    },
    {
      "variable": "$RCLONE_PASSWORD_COMMAND",
      "value": "\"pass rclone/config\""
    },
    {
      "variable": "$BACKUP_NAME",
      "value": "backup_crypt"
    }
  ]
}
```

The script has the following command variables pre-defined:
- __$JOB_NAME__ - The name of the job from the job object
- __$JOB_LOCATION__ - The location of the job from the job object
- __$LOG_LOCATION__ - The location of the log files

### Additional options

Additional variables can be defiend for replacement in the __backup_command__.  Either with an optional __"cmdVars"__ array or a __"vars"__ array defiend in each job.  Each command is an object that requires a __"variable"__ and __"value"__ item.  See the above example for details.

Each job object can also have a __backup_command__ item that will overwrite the global defiend one.

# Changelog

## 2.0.1
- Bump packages and relocated project on GitHub
- Updated project name to proper NPM formatting
