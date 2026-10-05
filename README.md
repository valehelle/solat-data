# solat-data

Data files the Solat app downloads at runtime, so they can be fixed without an App Store release.

## jakim-zones.json

JAKIM e-solat prayer-time zones with representative coordinates. The app uses the coordinates to pick the nearest zone for the user's location, then fetches times from e-solat.gov.my for that zone code.

- `zones[]`: `code`, `state`, `area`, `lat`, `lng`, and optional `extraPoints` (`[lat, lng]` pairs for other towns in the zone, used where the main point sits closer to a neighbouring zone).
- `renamed`: retired codes mapped to their replacement, so a zone a user picked manually keeps working.
- `version`: schema version. The app ignores files with a version it doesn't know.

The app keeps a bundled copy and uses it when offline or when this file fails validation. Changes reach users within a day of being pushed to `main`.

## Checking for JAKIM changes

`node scripts/check-zones.mjs` compares the codes here against the zone list on https://www.e-solat.gov.my/. A GitHub Action runs it every Monday and on every push; a failed run means JAKIM added or removed a zone.

When a zone is added, find a coordinate for its main town and add it. When one is removed, delete it and add it to `renamed` if JAKIM replaced it.
