# `@david/temp`

[![JSR](https://jsr.io/badges/@david/temp)](https://jsr.io/@david/temp)

Sync and async API for working with temporary directories and files.

```sh
deno add jsr:@david/temp
```

```ts
import { createTempDirSync, createTempFile } from "@david/temp";

async function tempFileExample() {
  // or `using tempFile = createTempFileSync();`
  await using tempFile = await createTempFile();

  await tempFile.writeText("some data");

  // automatically cleaned up here due to async using
}

function tempDirExampleSync() {
  // or `await using tempDir = createTempDir();`
  using tempDir = createTempDirSync();

  tempDir.join("data.txt").writeTextSync("some data");

  // automatically cleaned up here due to using
}

await tempFileExample();
tempDirExampleSync();
```
