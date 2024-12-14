import { Path } from "@david/path";

/** Creates a temporary directory asynchronously. */
export async function createTempDir(
  options?: Deno.MakeTempOptions,
): Promise<TempDir> {
  const path = await Deno.makeTempDir(options);
  return new (TempDir as any)(path);
}

/** Creates a temporary directory synchronously. */
export function createTempDirSync(options?: Deno.MakeTempOptions): TempDir {
  const path = Deno.makeTempDirSync(options);
  return new (TempDir as any)(path);
}

/** Creates a temporary file asynchronously. */
export async function createTempFile(
  options?: Deno.MakeTempOptions,
): Promise<TempFile> {
  const path = await Deno.makeTempFile(options);
  return new (TempFile as any)(path);
}

/** Creates a temporary file synchronously. */
export function createTempFileSync(options?: Deno.MakeTempOptions): TempFile {
  const path = Deno.makeTempFileSync(options);
  return new (TempFile as any)(path);
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
      Deno.removeSync(this.toString(), { recursive: true });
    } catch {
      // ignore
    }
  }

  /** Deletes the temporary directory asynchronously. */
  async [Symbol.asyncDispose]() {
    try {
      await Deno.remove(this.toString(), { recursive: true });
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
      Deno.removeSync(this.toString());
    } catch {
      // ignore
    }
  }

  /** Deletes the temporary file asynchronously. */
  async [Symbol.asyncDispose]() {
    try {
      await Deno.remove(this.toString());
    } catch {
      // ignore
    }
  }
}
