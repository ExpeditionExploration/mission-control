#!/bin/bash

# Initialize flags
CLEAN=false
INSTALL=false

# Parse optional flags
while getopts "fi" opt; do
  case $opt in
    f)
      CLEAN=true
      ;;
    i)
      INSTALL=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

# Shift parsed options away to get the remaining arguments
shift $((OPTIND -1))

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 [-f] [-i] <remote_host>"
    exit 1
fi

REMOTE_HOST=$1
LOCAL_FILE="dist"
REMOTE_DIR="~/mission-control"

# Clean the remote directory if the -c flag is set
if [ "$CLEAN" = true ]; then
    echo "Cleaning remote directory on $REMOTE_HOST"
    ssh "$REMOTE_HOST" "rm -rf $REMOTE_DIR/*"
fi

# Ensure the remote directory exists
# ssh "$REMOTE_HOST" "mkdir -p $REMOTE_DIR"

# Rsync the local file to the remote host
rsync -avz "$LOCAL_FILE" "package.json" "$REMOTE_HOST:$REMOTE_DIR"

# Check if rsync was successful
if [ $? -eq 0 ]; then
    echo "File '$LOCAL_FILE' successfully copied to '$REMOTE_HOST:$REMOTE_DIR'"
else
    echo "Error: Failed to copy file '$LOCAL_FILE' to '$REMOTE_HOST:$REMOTE_DIR'"
    exit 1
fi

# Install dependencies if the -i flag is set
if [ "$INSTALL" = true ]; then
    echo "Installing dependencies on $REMOTE_HOST"
    ssh "$REMOTE_HOST" "cd $REMOTE_DIR && npm install --omit=dev"
fi