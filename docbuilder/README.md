# Docbuilder NodeJS Script

Run multiple document generators for multiple projects with one command.

__Does heavy command injection, use at your own risk!__

See [NodeJS's documentation](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) on [exec](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) for more information on how commands work.

Requires the use of third party documentation generators such as [Doxygen](https://www.doxygen.nl/index.html) and [JSDoc](https://jsdoc.app/).

Install globally:
```
npm i -g @spongex/docbuilder
```

Or per-project as a dev-dependency:
```
npm i -D @spongex/docbuilder
```

## Usage

Inside the folder you wish to generate the documentation in, create a __.docbuilder_config.json__ file with the following format:
```
{
    "generators": {
        "doxygen": "doxygen \"$(find $PROJECT_LOCATION -maxdepth 1 -type f -name *.doxyfile)\"",
        "jdoc": "npx jsdoc -d $OUTPUT_FOLDER/$PROJECT $PROJECT_LOCATION/$PROJECT.js"
    },
    "jobs": [
        {
            "name": "wtengine",
            "generator": "doxygen",
            "path": "/home/matthew/Projects/wtengine",
            "checkfolder": "true"
        },
        {
            "name": "ppms",
            "generator": "doxygen",
            "path": "/home/matthew/Projects/ppms",
            "checkfolder": "true"
        },
        {
            "name": "libwtf",
            "generator": "doxygen",
            "path": "/home/matthew/Projects/libwtf",
            "checkfolder": "true"
        },
        {
            "name": "http_session_auth",
            "generator": "doxygen",
            "path": "/home/matthew/Projects/http_session_auth",
            "checkfolder": "true"
        },
        {
            "name": "wtgui",
            "generator": "jdoc",
            "path": "/home/matthew/Projects/wtgui"
        }
    ]
}
```

Then just run the script in the output folder:
```
npx docbuilder
```

A __.docbuilder.log__ file will be created with the results of each job.

## Generators
These are system commands used to launch each different document generator.

The following variables can be used:
- __$PROJECT__ - The name of the project.
- __$PROJECT_LOCATION__ - The full path to the project.
- __$OUTPUT_FOLDER__ - The name of the output folder from settings.

## Optional Settings:
- __"LOG_FILE": "filename"__ - Change the filename of the log file.
- __"OUTPUT_FOLDER": "foldername"__ - Change the output folder name. (default docs)
- __"nologging": "nologging"__ - Disable logging.
- __"removeold": "true"__ - Delete the old documentation folder before generation.
- __"checkfolder": "true"__ - Per-job setting to verify folder exists before generating docs.
