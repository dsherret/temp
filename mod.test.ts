import { assert } from "@std/assert";
import { createTempDir, createTempDirSync, createTempFile } from "./mod.ts";
import { Path } from "@david/path";

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

Deno.test("dir dispose should remove dir recursive", async () => {
  let dir = "";
  {
    await using tempDir = await createTempDir();
    dir = tempDir.toString();
    tempDir.join("data.txt").writeTextSync("text");
  }
  assert(!new Path(dir).existsSync());
  {
    using tempDir = createTempDirSync();
    dir = tempDir.toString();
    tempDir.join("data.txt").writeTextSync("text");
  }
  assert(!new Path(dir).existsSync());
});
