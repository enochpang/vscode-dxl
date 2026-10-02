[default]
build:
    npx --no-install tsc --project tsconfig.build.json

test:
    node --test tests/**/*.test.ts

check:
    biome check

lint:
    biome lint

format:
    biome format --write