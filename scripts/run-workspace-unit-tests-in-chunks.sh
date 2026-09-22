#!/bin/bash

# Split the workspace list into CHUNKS and run `test` for one chunk.
#
# Ported from yarn: `yarn workspaces list --json` streams NDJSON (one object per line),
# which the old pipeline consumed with `jq -j '[inputs | .name]'`. pnpm's equivalent
# emits a single JSON ARRAY, so the `inputs` idiom no longer applies and the whole
# three-stage jq chain collapses into one filter.
#
# The conditional is kept from upstream: GitHub Actions otherwise believes a secret is
# present in this output and refuses to pass it between jobs.
if [ -z "${CHUNKS}" ]; then
  export CHUNKS=$(pnpm ls -r --depth -1 --json \
    | jq -cM '[.[] | select(.name != null) | .name] | [_nwise((length / 2) | ceil)]')
fi

# get the workspaces of the current CHUNK environment
workspaces=$(echo $CHUNKS | jq -r ".[$CHUNK]")

echo "workspaces - $workspaces"
# Initialize an empty string for the filters
filters=""

# Loop through each workspace in the array
for workspace in $(echo "$workspaces" | jq -r '.[]'); do
  # Add the workspace name to the filters array as an argument
  filters+=" --filter=${workspace}"
done

command="pnpm run test $filters $@"
# Run the test in the selected chunk
eval "$command"
