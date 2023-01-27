#!/bin/sh

# Command to create react-library primitive component
nx generate @nrwl/react:library nativewind.view \
 --unitTestRunner=jest \
 --style=none \
 --directory=primitives \
 --bundler=rollup \
 --compiler=swc \
 --importPath=@react-universal/nativewind.view \
 --pascalCaseFiles \
 --publishable \
 --tags='primitives'