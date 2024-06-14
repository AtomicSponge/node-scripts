# Docbuilder NodeJS Script

Run multiple document generators for multiple projects with one command simultaneously.  Then merge them all into a single directory!

__Performs command injection, use at your own risk!  Please read documentation before use!__

Requires the use of third party documentation generators such as [Doxygen](https://www.doxygen.nl/index.html), [JSDoc](https://jsdoc.app/) or [Typedoc](https://typedoc.org/).

Install globally:
```
npm i -g @spongex/docbuilder
```

Or per-project as a dev-dependency:
```
npm i -D @spongex/docbuilder
```

## Usage

Inside the directory you wish to generate the documentation in, create a `.docbuilder.config.json` file with the following format:
```
{
  "generators": {
      "doxygen": "doxygen .doxyfile",
      "jsdoc": "npx jdsoc index.js",
      "typedoc": "npx typedoc"
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
      "out": "ppms-docs",
      "checkfolder": "true"
    },
    {
      "name": "wtgui",
      "generator": "typedoc",
      "path": "/home/matthew/Projects/wtgui",
    }
  ],
  "output_folder": "public/docs"
}
```

It is recommended to set the document generators to output to a directory named `docs/projectname` for proper merger.

Then just run the script in the output directory:
```
npx docbuilder
```

A `.docbuilder.log` file will be created with the results of each job.

The script works by running each generator locally in the project's directory, then combining the results into the current working directory.

## Generators
These are system commands used to launch each different document generator.

The following variables can be used:
- `$PROJECT` - The name of the project
- `$PROJECT_LOCATION` - The full path to the project
- `$OUTPUT_FOLDER` - The name of the output directory from settings

## Job Settings:
- `"name": "project-name"` - Name of the project
- `"generator": "gen"` - Which generator to use
- `"path": "project/path"` - Full path to the project

## Optional Global Settings:
- `"log_file": "filename"` - Change the filename of the log file
- `"output_folder": "foldername"` - Change the output directory name (default docs)
- `"nologging": "nologging"` - Disable logging

## Optional Job Settings:
- `"out": "out/folder"` - Output folder created by generator
- `"checkfolder": "true"` - Verify directory exists before generating docs
- `"removeold": "true"` - Delete the old documentation directory after generation

# Changelog

## Development branch
- Dependencies bump

## 2.1.1
- Improvements to README
- Made `out` default to `docs` and optional

## 2.1.0
- *NOTE* Changes in functionality that breaks previous versions
- Various improvements to script functionality - see above
- Dependencies bump

## 2.0.1
- Bump packages and relocated project on GitHub
