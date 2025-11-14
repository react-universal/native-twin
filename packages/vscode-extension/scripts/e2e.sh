#!/usr/bin/env bash

export CODE_TESTS_PATH="$(pwd)/build/cjs/test"
export CODE_TESTS_WORKSPACE="$(pwd)/project-fixture"

node "$(pwd)/build/cjs/test/runTest"