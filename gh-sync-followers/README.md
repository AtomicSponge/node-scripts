# Sync GitHub Followers

Sync your GitHub followers!  Automaticlly follows back any one following you, and removes people that unfollow!

Uses the [GitHub CLI](https://cli.github.com/) tool to make requests to the [GitHub API](https://docs.github.com/en/rest).

Install globally to run anywhere:
```
npm i -g @spongex/gh-sync-followers
```

For this script to run you need to grant the "user" scope to GitHub CLI.  Run the following from the command line:
```
gh auth refresh -h github.com -s user
```

Once GitHub CLI is set up run:
```
npx gh-sync-followers
```

The script will create a configuration file located in your operating system's local app storage.  This location is determined using the [os-appdata-path](https://www.npmjs.com/package/@spongex/os-appdata-path) module.

## Approvelist & Ignorelist

To add a user or a list of users to the approved list, enter:

```
npx gh-sync-followers approvelist <users...>
```

To add a user or a list of users to the ignored list, enter:

```
npx gh-sync-followers ignorelist <users...>
```

To remove a user or group of users from the approved list, enter:

```
npx gh-sync-followers approvelist-remove <users...>
```

To remove a user or group of users from the ignored list, enter:

```
npx gh-sync-followers ignorelist-remove <users...>
```

Examples:
```
npx gh-sync-followers approvelist AtomicSponge otheruser
```

```
npx gh-sync-followers ignorelist-remove AtomicSponge
```

To view either the approved or ignored lists, enter:
```
npx gh-sync-followers approvelist-show
```

```
npx gh-sync-followers ignorelist-show
```

# Changelog

## 1.1.0
- Added approvelist & ignorelist features
- Bump dependencies

## 1.0.1
- Bump packages and relocated project on GitHub
- Updated project name to proper NPM formatting

## 1.0.0
 - Initial release
