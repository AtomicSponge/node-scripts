# Comment Updater NodeJS Script

__WARNING!__  This script mass-modifies source code files.  Use at your own risk!

Install globally:
```
npm i -g @spongex/comment_updater
```

Or per-project as a dev-dependency:
```
npm i @spongex/comment_updater --save-dev
```

Batch updates code comments at the top of source files.

Create a __.comment_updater_config.json__ file in the project folder where the command will be ran.
See the following example:
```
{
  "author": "Time Lincoln",
  "comment_blocks": [
    {
      "name": "block1",
      "block": "\\author: $AUTHOR\n\\version:  $VERSION\n\\date:  2019-$YYYY",
      "comment_start": "/*!",
      "comment_end": " */",
      "line_delimiter": " * "
    },
    {
      "name": "block2",
      "block": "second block\nlazy example",
      "comment_start": "/*!",
      "comment_end": " */",
      "line_delimiter": " * "
    }
  ],
  "jobs": [
    {
      "job": "Source files",
      "block": "block2",
      "location": "/home/matthew/Projects/wtengine/src",
      "extension": ".cpp",
      "recursive": "true"
    },
    {
      "job": "Header files",
      "block": "block1",
      "location": "/home/matthew/Projects/wtengine/include/wtengine",
      "extension": ".hpp"
    }
  ]
}
```

A file __.comment_updater.log__ will be created with the results of the run.

## Variables

The following variables can be used in comment blocks:
- __$MM__ - Current month in MM format.
- __$DD__ - Current day in DD format.
- __$YYYY__ - Current year in YYYY format.
- __$PROJECT__ - Set with __settings['project']__
- __$AUTHOR__ - Set with __settings['author']__
- __$VERSION__ - Set with __settings['version']__
- __$COPYRIGHT__ - Set with __settings['copyright']__
- __$EMAIL__ - Set with __settings['email']__
- __$WEBSITE__ - Set with __settings['website']__
- __$CURRENT_FILENAME__ - The name of the file being edited.

## Optional Settings

The following additional options can also be set:
- __settings['verbose']__ - Show additional output.
- __settings['nologging']__ - Disable logging.

These can also be set on the command line using *-v* or *--verbose* and *--nologging*.

Passing the *-t* or *--test* option will not modify files but instead show the output to console.

# Changelog

## 2.0.1
Bump packages and relocated project on GitHub
