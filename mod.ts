import { Path } from "@david/path";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as os from "node:os";
import * as nodePath from "node:path";
import { randomBytes } from "node:crypto";

/** Options for creating a temporary directory or file. */
export interface MakeTempOptions {
  /** Directory in which to create the temporary entry. Defaults to the
   * operating system's default directory for temporary files. */
  dir?: string;
  /** String that should precede the random portion of the entry's name. */
  prefix?: string;
  /** String that should follow the random portion of the entry's name. */
  suffix?: string;
}

/** Creates a temporary directory asynchronously. */
export async function createTempDir(
  options?: MakeTempOptions,
): Promise<TempDir> {
  while (true) {
    const path = buildTempPath(options);
    try {
      await fsPromises.mkdir(path);
      return new (TempDir as any)(path);
    } catch (err) {
      if ((err as { code?: string }).code !== "EEXIST") throw err;
    }
  }
}

/** Creates a temporary directory synchronously. */
export function createTempDirSync(options?: MakeTempOptions): TempDir {
  while (true) {
    const path = buildTempPath(options);
    try {
      fs.mkdirSync(path);
      return new (TempDir as any)(path);
    } catch (err) {
      if ((err as { code?: string }).code !== "EEXIST") throw err;
    }
  }
}

/** Creates a temporary file asynchronously. */
export async function createTempFile(
  options?: MakeTempOptions,
): Promise<TempFile> {
  while (true) {
    const path = buildTempPath(options);
    try {
      const fd = await fsPromises.open(path, "wx");
      await fd.close();
      return new (TempFile as any)(path);
    } catch (err) {
      if ((err as { code?: string }).code !== "EEXIST") throw err;
    }
  }
}

/** Creates a temporary file synchronously. */
export function createTempFileSync(options?: MakeTempOptions): TempFile {
  while (true) {
    const path = buildTempPath(options);
    try {
      const fd = fs.openSync(path, "wx");
      fs.closeSync(fd);
      return new (TempFile as any)(path);
    } catch (err) {
      if ((err as { code?: string }).code !== "EEXIST") throw err;
    }
  }
}

/** A reference to a temporary directory.
 *
 * This should be cleaned up by calling `dispose` or `asyncDispose`
 * when done (ex. via a `using` or `async using`).
 */
export class TempDir {
  #path: Path;

  /** @internal */
  private constructor(path: string) {
    this.#path = new Path(path).resolve();
  }

  /** @internal */
  [Symbol.for("Deno.customInspect")](): string {
    return `TempDir("${this.#path}")`;
  }

  /** @internal */
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `TempDir("${this.#path}")`;
  }

  /** Gets the underlying path to the temporary directory. */
  get path(): Path {
    return this.#path;
  }

  /** Gets the path as a string representation. */
  toString(): string {
    return this.#path.toString();
  }

  /** Gets a reference to a path relative the temporary directory. */
  join(...paths: string[]): Path {
    return this.#path.join(...paths);
  }

  /** Converts the temp directory path to a file URL. */
  toFileUrl(): URL {
    return this.#path.toFileUrl();
  }

  /** Deletes the temporary directory. */
  [Symbol.dispose]() {
    try {
      fs.rmSync(this.toString(), { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  /** Deletes the temporary directory asynchronously. */
  async [Symbol.asyncDispose]() {
    try {
      await fsPromises.rm(this.toString(), { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

/** A reference to a temporary file.
 *
 * This should be cleaned up by calling `dispose` or `asyncDispose`
 * when done (ex. via a `using` or `async using`).
 */
export class TempFile extends Path {
  /** @internal */
  private constructor(path: string) {
    super(new Path(path).resolve());
  }

  /** @internal */
  [Symbol.for("Deno.customInspect")](): string {
    return `TempFile("${this.toString()}")`;
  }

  /** @internal */
  [Symbol.for("nodejs.util.inspect.custom")](): string {
    return `TempFile("${this.toString()}")`;
  }

  /** Deletes the temporary file. */
  [Symbol.dispose]() {
    try {
      fs.rmSync(this.toString(), { force: true });
    } catch {
      // ignore
    }
  }

  /** Deletes the temporary file asynchronously. */
  async [Symbol.asyncDispose]() {
    try {
      await fsPromises.rm(this.toString(), { force: true });
    } catch {
      // ignore
    }
  }
}

function buildTempPath(options: MakeTempOptions | undefined): string {
  const dir = options?.dir ?? os.tmpdir();
  const prefix = options?.prefix ?? "";
  const suffix = options?.suffix ?? "";
  const random = randomBytes(6).toString("hex");
  return nodePath.join(dir, `${prefix}${random}${suffix}`);
}
