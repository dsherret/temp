import { createTempDirSync, createTempFile } from "./mod.ts";

Deno.test("readme example", async () => {
  async function tempFileExample() {
    await using tempFile = await createTempFile();// also has a sync api

    await tempFile.writeText("some data");

    // automatically cleaned up here due to async using
  }

  function tempDirExampleSync() {
    using tempDir = createTempDirSync();// also has an async api

    tempDir.join("data.txt").writeTextSync("some data");

    // automatically cleaned up here due to using
  }

  await tempFileExample();
  tempDirExampleSync();
});
