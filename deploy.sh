#!/bin/bash

# Function to semantically increment a version number
function increment_version() {
    local version=$1
    local major minor patch

    IFS='.' read -r major minor patch <<< "$version"
    patch=$((patch + 1))

    echo "$major.$minor.$patch"
}

# Function to update and deploy clasp projects
function update_and_deploy() {
    local directory=$1
   # Navigate to the project directory
    cd $directory || exit


    local deploymentId=$(clasp deployments | grep -E 'SNAPSHOT-[0-9.]*' | grep -oP '(?<=- ).*(?= @)')
    local version=$(clasp deployments | grep -E 'SNAPSHOT-[0-9.]*' | grep -oP '(?<=SNAPSHOT-)[0-9.]*')

    # Increment the version
    local new_version
    new_version=$(increment_version $version)


    # Update versions in SharedConfig.js
    update_version_in_config $new_version


    # Push the changes
    echo "Pushing changes for $directory..."
    clasp push
    # Deploy the changes with a description
    echo "Deploying new version ($new_version) for $directory..."
    clasp redeploy -d "SNAPSHOT-$new_version - Automated Deployment"  $deploymentId

    # Return to the original directory
    cd - || exit
}


# Function to update version number in SharedConfig.js
function update_version_in_config() {
    local new_version=$1

    # Update the specific version in config.js
    sed -i.bak "s/version: '.*'/version: 'SNAPSHOT-$new_version'/g" "config.js"
}

# Update and deploy for each module
update_and_deploy $1

echo "$1 updated and deployed successfully."