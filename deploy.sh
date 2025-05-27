#!/bin/bash

# Ensure dotenv is installed: npm install -g dotenv-cli

# Load environment variables
source .env

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
    local version_var_name=$2
    local version_key=$3 # Key name for the version in SharedConfig.js

    # Archive current deployment
    archive_current_deployment $directory

    # Get the current version from the environment variable
    local version=${!version_var_name}

    # Increment the version
    local new_version
    new_version=$(increment_version "$version")

    # Update the environment file with the new version
    sed -i.bak "/^${version_var_name}=/s/=.*/=${new_version}/" .env

    # Update versions in SharedConfig.js
    update_version_in_shared_config $version_key $new_version

    # Navigate to the project directory
    cd $directory || exit

    # Push the changes
    echo "Pushing changes for $directory..."
    clasp push

    # Deploy the changes with a description
    echo "Deploying new version ($new_version) for $directory..."
    clasp deploy -d "$directory version $new_version - Automated Deployment"

    # Return to the original directory
    cd - || exit
}

# Function to archive the current deployment version
function archive_current_deployment() {
    local directory=$1

    # Navigate to the project directory
    cd $directory || exit

    # Get the current deployment versions
    local current_versions=$(clasp versions)

    # Save current versions to a file for archiving
    echo "$current_versions" > "./deployment_version_archive.txt"

    echo "Archived current deployment versions for $directory."

    # Return to the original directory
    cd - || exit
}

# Function to update version number in SharedConfig.js
function update_version_in_shared_config() {
    local version_key=$1
    local new_version=$2

    # Update the specific version in SharedConfig.js
    sed -i.bak "s/$version_key: 'SNAPSHOT-[0-9.]*'/$version_key: '$new_version'/g" "Membership/SharedConfig.js"
}

# Update and deploy for each module
update_and_deploy "MemberPortal" "MEMBER_PORTAL_VERSION" "memberPortal"
update_and_deploy "Membership" "MEMBERSHIP_VERSION" "membership"
update_and_deploy "AdminPortal" "ADMIN_PORTAL_VERSION" "adminPortal"

echo "All projects updated and deployed successfully."