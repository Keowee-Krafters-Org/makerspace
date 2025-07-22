#!/bin/bash

CONFIG_FILE="config.js"

# Function to semantically increment the patch/build number
function increment_version() {
    local version=$1
    version="${version//\'/}"  # remove any stray single quotes
    local major minor patch
    IFS='.' read -r major minor patch <<< "$version"
    patch=$((patch + 1))
    echo "$major.$minor.$patch"
}

# --- Function: extract version or deploymentId from config.js ---
function extract_from_config() {
  local key=$1
  local mode=$2
  awk -v mode="$mode" -v key="$key" '
    $0 ~ mode ":" { in_block=1; next }
    in_block && $0 ~ key ":" {
      match($0, /'\''[^'\'']*'\''/, m)
      gsub(/'\''/, "", m[0])        # remove quotes
      gsub(/,$/, "", m[0])          # remove trailing comma
      print m[0]
      exit
    }
  ' "$CONFIG_FILE"
}



# Function to update and deploy clasp projects
function update_and_deploy() {
    local directory=$1
    local mode=$2 # Either dev or prod

    cd "$directory" || exit

    # Use awk to extract config values
    local version
    version=$(extract_from_config "version" "$mode")
    echo "Extracted version: '$version'"
    local deploymentId
    deploymentId=$(extract_from_config "deploymentId" "$mode")
    echo "Extracted deploymentId: '$deploymentId'"

    if [[ -z "$version" || -z "$deploymentId" ]]; then
        echo "Failed to extract version or deploymentId for mode '$mode'."
        exit 1
    fi

    local new_version
    new_version=$(increment_version "$version")

    update_version_in_config "$new_version" "$mode"

    echo "Pushing changes for $directory..."
    clasp push

    echo "Deploying new version ($new_version) for $directory..."
    clasp redeploy -d "Mode:$mode Version:$new_version - Automated Deployment" "$deploymentId"

    cd - || exit
}

# --- Function: update version in config.js ---
function update_version_in_config() {
  local new_version=$1
  local mode=$2
  awk -v mode="$mode" -v newver="$new_version" '
    BEGIN { in_block=0 }
    {
      if ($0 ~ mode ":") in_block=1
      if (in_block && $0 ~ /version:[[:space:]]*'\''[^'\'']*'\''/) {
        sub(/version:[[:space:]]*'\''[^'\'']*'\''/, "version: '\''" newver "'\''")
        in_block=0
      }
      print
    }
  ' "$CONFIG_FILE" > config.tmp && mv config.tmp "$CONFIG_FILE"
}

# Entry point
if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <directory> <mode>"
    echo "Mode must be either dev or prod."
    exit 1
fi

update_and_deploy "$1" "$2"

echo "$1 updated and deployed successfully with mode $2."
