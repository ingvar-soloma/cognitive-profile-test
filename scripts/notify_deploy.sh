#!/bin/bash

# This script sends a Telegram notification about the deployment status.
# It expects TELEGRAM_BOT_TOKEN and TELEGRAM_GROUP_ID to be set in the environment.

STATUS=$1
PROJECT_NAME=${CI_PROJECT_NAME:-"Aphantasia Test Project"}
# Git info is extracted from CI variables where possible

if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_GROUP_ID" ]; then
    echo "Warning: TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID not set. Skipping notification."
    exit 0
fi

# Platform-agnostic variable mapping
PROJECT_NAME=${CI_PROJECT_NAME:-${GITHUB_REPOSITORY:-"Aphantasia Test"}}
COMMIT_TITLE=${CI_COMMIT_TITLE:-"N/A"}
COMMIT_AUTHOR=${CI_COMMIT_AUTHOR:-${GITHUB_ACTOR:-"N/A"}}
JOB_URL=${CI_JOB_URL:-"${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"}
JOB_NAME=${CI_JOB_NAME:-${GITHUB_WORKFLOW:-"Deploy"}}

# Try to get commit title if on GitHub and not provided
if [ "$COMMIT_TITLE" == "N/A" ] && [ -f "$GITHUB_EVENT_PATH" ]; then
    if command -v jq >/dev/null 2>&1; then
        COMMIT_TITLE=$(jq -r '.head_commit.message' "$GITHUB_EVENT_PATH" | head -n 1)
    else
        COMMIT_TITLE=$(grep -Po '(?<="message": ")[^"]*' "$GITHUB_EVENT_PATH" | head -n 1)
    fi
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_GROUP_ID" ]; then
    echo "Warning: TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID not set. Skipping notification."
    exit 0
fi

case $STATUS in
    "started")
        MESSAGE="🚀 <b>Deploy started</b>
<b>Project:</b> ${PROJECT_NAME}
<b>Commit:</b> ${COMMIT_TITLE}
<b>Author:</b> ${COMMIT_AUTHOR}"
        ;;
    "success")
        MESSAGE="✅ <b>Deploy successful</b>
<b>Project:</b> ${PROJECT_NAME}
<b>Environment:</b> Production"
        ;;
    "failed")
        MESSAGE="❌ <b>Deploy failed</b>
<b>Project:</b> ${PROJECT_NAME}
<b>Commit:</b> ${COMMIT_TITLE}
<b>Job:</b> <a href=\"${JOB_URL}\">${JOB_NAME}</a>"
        ;;
    *)
        MESSAGE="📦 <b>Deploy status:</b> ${STATUS}
<b>Project:</b> ${PROJECT_NAME}"
        ;;
esac

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d chat_id="${TELEGRAM_GROUP_ID}" \
    -d text="${MESSAGE}" \
    -d parse_mode="HTML" > /dev/null
