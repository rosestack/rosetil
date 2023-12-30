import {createFilter, Pattern} from "~/pattern";

import path from "path";
import fs from "fs";

interface FindOptions {
  /**
   * The name of the file or directory to find.
   **/
  name: string | string[];
  /**
   * The directory to start searching for the package.json file.
   * @default process.cwd()
   **/
  cwd?: string;
  /**
   * The direction to search the directory tree.
   * @example "up"
   * - search up the directory tree
   * @example "down"
   * - search down the directory tree
   * @example "both"
   * - search up and down the directory tree
   * @example "none"
   * - only search the current directory
   * @default "up"
   **/
  traversal?: "up" | "down" | "both" | "none";
  /**
   * The maximum number of directories to search.
   * @default Infinity
   */
  depth?: number;
  /**
   * The prefix of the file.
   * @example "prefix" result prefix.[name].[suffix].[extension]
   **/
  prefix?: string;
  /**
   * The suffix of the file.
   * @example "suffix" result [prefix].[name].suffix.[extension]
   **/
  suffix?: string;
  /**
   * The extension of the file.
   **/
  extension?: string | string[];
  /**
   * Patterns to include.
   **/
  include?: Pattern;
  /**
   * Patterns to exclude.
   * @default node_modules
   **/
  exclude?: Pattern;
}

//

const resolveConfig = (options: FindOptions): Required<FindOptions> => {
  return {
    cwd: process.cwd(),
    traversal: "up",
    depth: Infinity,
    prefix: "",
    suffix: "",
    extension: "",
    exclude: [
      "**/node_modules/**",
    ],
    include: [],
    ...options,
  };
};

const resolveFilenames = (options: Required<FindOptions>) => {
  return (Array.isArray(options.name) ? options.name : [options.name]).map((name) => {
    if (options.prefix) {
      name = `${options.prefix}.${name}`;
    }

    if (options.suffix) {
      name = `${name}.${options.suffix}`;
    }

    const extensions = (Array.isArray(options.extension) ? options.extension : [options.extension]).filter(Boolean);

    if (extensions.length) {
      return extensions.map((extension) => {
        return `${name}${extension.startsWith(".") ? "" : "."}${extension}`;
      });
    }

    return name;
  }).flat();
};

//

const exists = async (filePath: string) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const existsSync = (filePath: string) => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

//

const find = async (options: FindOptions) => {
  const config = resolveConfig(options);

  const filenames = resolveFilenames(config);

  const filter = createFilter({
    include: config.include,
    exclude: config.exclude,
    noNullChar: true,
    normalize: true,
  });

  const traverseUp = async (filename: string, currentPath: string, currentDepth: number): Promise<string | null> => {
    if (currentDepth > config.depth) {
      return null;
    }

    if (!filter(currentPath)) {
      return null;
    }

    const filePath = path.join(currentPath, filename);

    if (await exists(filePath)) {
      return filePath;
    }

    const parentDir = path.dirname(currentPath);

    if (parentDir === currentPath) {
      return null;
    }

    return traverseUp(filename, parentDir, currentDepth + 1);
  };

  const traverseDown = async (filename: string, currentPath: string, currentDepth: number): Promise<string | null> => {
    if (currentDepth > config.depth) {
      return null;
    }

    if (!filter(currentPath)) {
      return null;
    }

    const filePath = path.join(currentPath, filename);

    if (await exists(filePath)) {
      return filePath;
    }

    const subDirectories = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of subDirectories) {
      if (entry.isDirectory()) {
        const subDirectoryPath = path.join(currentPath, entry.name);

        const downResult = await traverseDown(filename, subDirectoryPath, currentDepth + 1);

        if (downResult) {
          return downResult;
        }
      }
    }

    return null;
  };

  for (const filename of filenames) {
    if (config.traversal === "none") {
      const filepath = path.join(config.cwd, filename);

      if (await exists(filepath)) {
        return filepath;
      }
    } else {
      if (config.traversal === "both" || config.traversal === "up") {
        const upResult = await traverseUp(filename, config.cwd, 0);

        if (upResult) {
          return upResult;
        }
      }

      if (config.traversal === "both" || config.traversal === "down") {
        const downResult = await traverseDown(filename, config.cwd, 0);

        if (downResult) {
          return downResult;
        }
      }
    }
  }

  return undefined;
};

const findSync = (options: FindOptions) => {
  const config = resolveConfig(options);

  const filenames = resolveFilenames(config);

  const filter = createFilter({
    include: config.include,
    exclude: config.exclude,
    noNullChar: true,
    normalize: true,
  });

  const traverseUp = (filename: string, currentPath: string, currentDepth: number): string | null => {
    if (currentDepth > config.depth) {
      return null;
    }

    if (!filter(currentPath)) {
      return null;
    }

    const filePath = path.join(currentPath, filename);

    if (existsSync(filePath)) {
      return filePath;
    }

    const parentDir = path.dirname(currentPath);

    if (parentDir === currentPath) {
      return null;
    }

    return traverseUp(filename, parentDir, currentDepth + 1);
  };

  const traverseDown = (filename: string, currentPath: string, currentDepth: number): string | null => {
    if (currentDepth > config.depth) {
      return null;
    }

    if (!filter(currentPath)) {
      return null;
    }

    const filePath = path.join(currentPath, filename);

    if (existsSync(filePath)) {
      return filePath;
    }

    const subDirectories = fs.readdirSync(currentPath, {
      withFileTypes: true,
    });

    for (const entry of subDirectories) {
      if (entry.isDirectory()) {
        const subDirectoryPath = path.join(currentPath, entry.name);

        const foundPath = traverseDown(filename, subDirectoryPath, currentDepth + 1);

        if (foundPath) {
          return foundPath;
        }
      }
    }

    return null;
  };

  for (const filename of filenames) {
    if (config.traversal === "none") {
      const filepath = path.join(config.cwd, filename);

      if (existsSync(filepath)) {
        return filepath;
      }
    } else {
      if (config.traversal === "both" || config.traversal === "up") {
        const upResult = traverseUp(filename, config.cwd, 0);

        if (upResult) {
          return upResult;
        }
      }

      if (config.traversal === "both" || config.traversal === "down") {
        const downResult = traverseDown(filename, config.cwd, 0);

        if (downResult) {
          return downResult;
        }
      }
    }
  }

  return undefined;
};

//

const findAll = async (options: FindOptions) => {
  const config = resolveConfig(options);

  const filenames = resolveFilenames(config);

  const filter = createFilter({
    include: config.include,
    exclude: config.exclude,
    noNullChar: true,
    normalize: true,
  });

  const traverseUp = async (filename: string, currentPath: string, currentDepth: number): Promise<string[]> => {
    const results: string[] = [];

    if (currentDepth > config.depth) {
      return results;
    }

    if (!filter(currentPath)) {
      return results;
    }

    const filePath = path.join(currentPath, filename);

    if (await exists(filePath)) {
      results.push(filePath);
    }

    const parentDir = path.dirname(currentPath);

    if (parentDir === currentPath) {
      return results;
    }

    const upResult = await traverseUp(filename, parentDir, currentDepth + 1);

    results.push(...upResult);

    return results;
  };
  const traverseDown = async (filename: string, currentPath: string, currentDepth: number): Promise<string[]> => {
    const results: string[] = [];

    if (currentDepth > config.depth) {
      return results;
    }

    if (!filter(currentPath)) {
      return results;
    }

    const filepath = path.join(currentPath, filename);

    if (await exists(filepath)) {
      results.push(filepath);
    }

    const subDirectories = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const dir of subDirectories) {
      if (dir.isDirectory()) {
        const downResults = await traverseDown(filename, path.join(currentPath, dir.name), currentDepth + 1);

        results.push(...downResults);
      }
    }

    return results;
  };

  const results: string[] = [];

  for (const filename of filenames) {
    if (config.traversal === "none") {
      const filepath = path.join(config.cwd, filename);

      if (await exists(filepath)) {
        results.push(filepath);
      }
    } else {
      if (config.traversal === "both" || config.traversal === "up") {
        const upResults = await traverseUp(filename, config.cwd, 0);
        results.push(...upResults);
      }

      if (config.traversal === "both" || config.traversal === "down") {
        const downResults = await traverseDown(filename, config.cwd, 0);
        results.push(...downResults);
      }
    }
  }

  return results;
};

const findAllSync = (options: FindOptions) => {
  const config = resolveConfig(options);

  const filenames = resolveFilenames(config);

  const filter = createFilter({
    include: config.include,
    exclude: config.exclude,
    noNullChar: true,
    normalize: true,
  });

  const traverseUp = (filename: string, currentPath: string, currentDepth: number): string[] => {
    const results: string[] = [];

    if (currentDepth > config.depth) {
      return results;
    }

    if (!filter(currentPath)) {
      return results;
    }

    const filePath = path.join(currentPath, filename);

    if (existsSync(filePath)) {
      results.push(filePath);
    }

    const parentDir = path.dirname(currentPath);

    if (parentDir === currentPath) {
      return results;
    }

    results.push(...traverseUp(filename, parentDir, currentDepth + 1));

    return results;
  };

  const traverseDown = (filename: string, currentPath: string, currentDepth: number): string[] => {
    const results: string[] = [];

    if (currentDepth > config.depth) {
      return results;
    }

    if (!filter(currentPath)) {
      return results;
    }

    const filepath = path.join(currentPath, filename);

    if (existsSync(filepath)) {
      results.push(filepath);
    }

    const subDirectories = fs.readdirSync(currentPath, {
      withFileTypes: true,
    });

    for (const dir of subDirectories) {
      if (dir.isDirectory()) {
        const downResults = traverseDown(filename, path.join(currentPath, dir.name), currentDepth + 1);

        results.push(...downResults);
      }
    }

    return results;
  };

  const results: string[] = [];

  for (const filename of filenames) {
    if (config.traversal === "none") {
      const filepath = path.join(config.cwd, filename);

      if (existsSync(filepath)) {
        results.push(filepath);
      }
    } else {
      if (config.traversal === "both" || config.traversal === "up") {
        const upResults = traverseUp(filename, config.cwd, 0);

        results.push(...upResults);
      }

      if (config.traversal === "both" || config.traversal === "down") {
        const downResults = traverseDown(filename, config.cwd, 0);

        results.push(...downResults);
      }
    }
  }

  return results;
};

//

const findDir = async (options: FindOptions) => {
  const file = await find(options);

  if (!file) {
    return;
  }

  if (await fs.promises.stat(file).then((stat) => stat.isDirectory())) {
    return file;
  }

  return path.dirname(file);
};

const findDirSync = (options: FindOptions) => {
  const file = findSync(options);

  if (!file) {
    return;
  }

  if (fs.statSync(file).isDirectory()) {
    return file;
  }

  return path.dirname(file);
};

export type {
  FindOptions,
};

export {
  find,
  findSync,
  //
  findAll,
  findAllSync,
  //
  findDir,
  findDirSync,
};