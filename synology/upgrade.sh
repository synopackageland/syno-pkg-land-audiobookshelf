#!/usr/bin/env bash
# Merge an explicit upstream release and rebuild; never publish or access a NAS.
set -euo pipefail
packaging=$(cd -- "$(dirname -- "$0")" && pwd)
repo=$(cd -- "$packaging/.." && pwd)
cd "$repo"
[[ $# == 2 && $1 =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]] || {
  echo 'Usage: bash synology/upgrade.sh vX.Y.Z build-number' >&2; exit 2;
}
[[ -z $(git status --porcelain --untracked-files=normal) ]] || { echo 'Commit changes before upgrading.' >&2; exit 2; }
python3 "$packaging/scripts/public-scan.py"
node "$packaging/version.mjs" "$1" "$2" --validate
previous=$(node -e 'const s=JSON.parse(require("fs").readFileSync(process.argv[1]));process.stdout.write(s.checkout_commit||s.commit)' "$packaging/upstream-source.json")
[[ -z $(git diff "$previous" HEAD -- . ':(exclude)synology') ]] || { echo 'Wrapper changed upstream files.' >&2; exit 2; }
git fetch --no-tags upstream "+refs/tags/$1:refs/synopkgland/selected-upstream"
commit=$(git rev-parse 'refs/synopkgland/selected-upstream^{commit}')
old=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1])).commit)' "$packaging/upstream-source.json")
git merge-base --is-ancestor "$old" "$commit" || { echo 'Refusing upstream downgrade or divergent release.' >&2; exit 2; }
[[ -z $(git ls-tree "$commit" -- synology) ]] || { echo 'Upstream owns synology/.' >&2; exit 2; }
GIT_AUTHOR_NAME=synopackageland GIT_AUTHOR_EMAIL=synopackageland@gmail.com \
GIT_COMMITTER_NAME=synopackageland GIT_COMMITTER_EMAIL=synopackageland@gmail.com \
  git merge --no-ff -m "Merge upstream $1 [skip ci]" "$commit"
node "$packaging/version.mjs" "$1" "$2"
python3 "$packaging/scripts/pin-image.py" --tag "${1#v}" --commit "$commit" \
  --source-tree "$(git rev-parse "$commit^{tree}")" --build "$2"
node "$packaging/update-image.mjs" "$1"
node -e 'const fs=require("fs");const file=process.argv[1];const s=JSON.parse(fs.readFileSync(file));s.tag=process.argv[2];s.commit=process.argv[3];s.checkout_commit=process.argv[4];s.source_tree=process.argv[5];s.build=Number(process.argv[6]);fs.writeFileSync(file,JSON.stringify(s,null,2)+"\n")' \
  "$packaging/upstream-source.json" "$1" "$commit" "$(git rev-parse HEAD)" "$(git rev-parse "$commit^{tree}")" "$2"
python3 "$packaging/scripts/render-compose.py"
python3 "$packaging/scripts/build.py"
