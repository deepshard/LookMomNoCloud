#!/bin/bash

# Assign the first argument to FILE_NAME
FILE_NAME=$1

# Assign the second argument to OPTIONAL_TEST_FUNCTION, if provided
OPTIONAL_TEST_FUNCTION=$2

# Set PYTHONPATH to the current directory
export PYTHONPATH="."

# if filename not provider, throw error
if [ -z "$FILE_NAME" ]; then
    echo "No filename provided"
    exit 1
fi

# Run pytest with the provided arguments
if [ -z "$OPTIONAL_TEST_FUNCTION" ]; then
    pytest tests/$FILE_NAME -s -v
else
    pytest tests/$FILE_NAME -s -v -k $OPTIONAL_TEST_FUNCTION
fi