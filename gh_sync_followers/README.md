# Sync GitHub Followers

Sync your GitHub followers!  Automaticlly follows back any one following you, and removes people that unfollow!

Uses the [GitHub CLI](https://cli.github.com/) tool to make requests to the [GitHub API](https://docs.github.com/en/rest).

Install globally to run anywhere:
```
npm i -g @spongex/gh_sync_followers
```

For this script to run you need to grant the "user" scope to GitHub CLI.  Run the following from the command line:
```
gh auth refresh -h github.com -s user
```

Once GitHub CLI is set up, there is no configuration for this script!  Just run:
```
npx gh_sync_followers
```