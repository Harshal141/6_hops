#!/usr/bin/env bash
# Pushes named variables from a local .env file to this Vercel project, without ever printing
# their values. Each value is piped to `vercel env add` on stdin, so it doesn't appear in the
# terminal, in shell history or in the process list (unlike --value).
#
#   scripts/push-env.sh <target> NAME [NAME...]
#   scripts/push-env.sh production AUTH_GOOGLE_ID AUTH_GOOGLE_SECRET
#
# Target is production | preview | development. Existing values for that target are
# overwritten (--force). Values are stored as Vercel "sensitive" vars (write-only in the UI).
# ENV_FILE overrides the source file (default: .env next to package.json).
set -euo pipefail

cd "$(dirname "$0")/.."

target="${1:?usage: push-env.sh <production|preview|development> NAME [NAME...]}"
shift
[ "$#" -gt 0 ] || { echo "usage: push-env.sh <target> NAME [NAME...]" >&2; exit 1; }
case "$target" in production|preview|development) ;; *) echo "bad target: $target" >&2; exit 1 ;; esac

env_file="${ENV_FILE:-.env}"
[ -f "$env_file" ] || { echo "no $env_file" >&2; exit 1; }
[ -f .vercel/project.json ] || { echo "not linked: run 'vercel link' first" >&2; exit 1; }

# The last assignment wins, like dotenv. Strips a trailing CR (Windows line endings) and one
# pair of surrounding quotes. Does not strip inline '#' comments, since a secret may contain '#'.
read_value() {
  local line value
  line="$(grep -E "^[[:space:]]*(export[[:space:]]+)?$1=" "$env_file" | tail -n 1)" || return 1
  value="${line#*=}"
  value="${value%$'\r'}"
  if [[ "$value" =~ ^\"(.*)\"$ || "$value" =~ ^\'(.*)\'$ ]]; then value="${BASH_REMATCH[1]}"; fi
  [ -n "$value" ] || return 1
  printf '%s' "$value"
}

failed=0
for name in "$@"; do
  if ! value="$(read_value "$name")"; then
    echo "skip  $name: missing or empty in $env_file" >&2
    failed=1
    continue
  fi
  if printf '%s' "$value" | vercel env add "$name" "$target" --force --sensitive >/dev/null 2>&1; then
    echo "ok    $name → $target (${#value} chars)"
  else
    echo "FAIL  $name → $target (re-run with the vercel output visible to debug)" >&2
    failed=1
  fi
  unset value
done
exit "$failed"
