#!/usr/bin/env bash
set -euo pipefail

root_dir="$(git rev-parse --show-toplevel)"
mkdir -p "$root_dir/.git/hooks"
cat > "$root_dir/.git/hooks/pre-commit" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
repo_root="$(git rev-parse --show-toplevel)"
"$repo_root/scripts/pre-commit.sh"
HOOK
chmod +x "$root_dir/.git/hooks/pre-commit"
echo "Pre-commit hook instalado (usa make pre-commit)."
