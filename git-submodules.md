# Git submodules best practices

## Useful commands

- Add a submodule:
`git submodule add [Your Repository URL] [Path]` for this repository please add to the `community` directory

— Clone repository with submodules automatically:

`git clone --recursive git@github.com:name/repo.git`

— Initialize submodules after regular cloning:

`git submodule update --init`

— Make submodules to track their respective remote branches (instead of being in detached HEAD state):

`git submodule foreach -q --recursive 'git checkout $(git config -f $toplevel/.gitmodules submodule.$name.branch || echo master)'`

— Display status of submodules when `git status` is invoked:

`git config --global status.submoduleSummary true`

— Script for pulling the main repo and updating the sumodules automatically:

```bash
#!/usr/bin/env bash

git pull "$@" &&
  git submodule sync --recursive &&
  git submodule update --init --recursive
```

## Additional reading

- [Mastering Git submodules](https://medium.com/@porteneuve/mastering-git-submodules-34c65e940407)
