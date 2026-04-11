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

case $STATUS in
    "started")
        MESSAGE="🚀 <b>Deploy started</b>
<b>Project:</b> ${CI_PROJECT_NAME:-'Aphantasia Test'}
<b>Commit:</b> ${CI_COMMIT_TITLE:-'N/A'}
<b>Author:</b> ${CI_COMMIT_AUTHOR:-'N/A'}"
        ;;
    "success")
        MESSAGE="✅ <b>Deploy successful</b>
<b>Project:</b> ${CI_PROJECT_NAME:-'Aphantasia Test'}
<b>Environment:</b> Production"
        ;;
    "failed")
        MESSAGE="❌ <b>Deploy failed</b>
<b>Project:</b> ${CI_PROJECT_NAME:-'Aphantasia Test'}
<b>Commit:</b> ${CI_COMMIT_TITLE:-'N/A'}
<b>Job:</b> <a href=\"${CI_JOB_URL}\">${CI_JOB_NAME}</a>"
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
