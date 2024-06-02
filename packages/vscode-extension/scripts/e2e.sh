#!/usr/bin/env bash

export CODE_TESTS_PATH="$(pwd)/build/test"
export CODE_TESTS_WORKSPACE="$(pwd)/project-fixture"

node "$(pwd)/build/test/runTest"