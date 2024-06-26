#!/bin/bash
set -e

# Read the latest version from the S3 file
latest_version=$(curl -s https://truffle-fe.s3.amazonaws.com/latest-mac.yml | grep "version:" | awk '{print $2}')
echo "** Latest version: $latest_version **"
# Increment the version
new_version=$(echo $latest_version | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')

# Update package.json with the new version
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$new_version\"/" package.json && rm package.json.bak

# Run electron-builder
bun electron-forge make
bun electron-builder build --mac --linux --publish always

echo "** Published version $new_version **"