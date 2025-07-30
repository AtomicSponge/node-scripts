#  Godot Builder

Script for building Godot projects.

Recommended to install as a global script:
```
npm i -g @spongex/godot-builder
```

To use create a local `.godot_builder_config.json` file in your Godot project with the following format:

```
{
  "godot_command": "godotsteam.441.editor.linux.x86_64",
  "jobs": [
    {
      "preset": "Linux",
      "path": "builds/linux/project_venus.x86_64"
    },
    {
      "preset": "Windows",
      "path": "builds/win/project_venus.exe"
    }
  ]
}
```

Then run `npx godot-builder` and allow it to complete the builds.

# Changelog

## 1.0.0
- Initial release
