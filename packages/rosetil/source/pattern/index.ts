import picomatch from "picomatch";

import {normalize} from "~/path";

type Pattern = string | RegExp | (string | RegExp)[];


/**
 * Check if id match pattern.
 **/
const match = (id: string, pattern: Pattern) => {
  if (typeof pattern === "string") {
    return picomatch.isMatch(id, pattern);
  }

  if (pattern instanceof RegExp) {
    return pattern.test(id);
  }

  return false;
};

interface FilterOption {
  /**
   * Include id that match this pattern.
   **/
  include?: Pattern;
  /**
   * Exclude id that match this pattern.
   **/
  exclude?: Pattern;
  /**
   * Exclude null character.
   * @default false
   **/
  noNullChar?: boolean;
  /**
   * Exclude empty string.
   **/
  noEmptyString?: boolean;
  /**
   * Normalize id.
   **/
  normalize?: boolean;
}

type Filter = (id: any) => boolean;

/**
 * Create a filter function.
 **/
const createFilter = (filter?: FilterOption): Filter => {
  let includes: (string | RegExp)[] = [];

  if (filter?.include) {
    if (Array.isArray(filter.include)) {
      includes = filter.include;
    } else {
      includes = [filter.include];
    }
  }

  let excludes: (string | RegExp)[] = [];

  if (filter?.exclude) {
    if (Array.isArray(filter.exclude)) {
      excludes = filter.exclude;
    } else {
      excludes = [filter.exclude];
    }
  }

  return (id: any) => {
    if (typeof id !== "string") {
      return false;
    }

    if (filter?.noNullChar) {
      if (id.includes("\0")) {
        return false;
      }
    }

    if (filter?.noEmptyString) {
      if (id === "") {
        return false;
      }
    }

    if (filter?.normalize) {
      id = normalize(id);
    }

    if (includes.length > 0) {
      let include = false;

      for (const pattern of includes) {
        if (match(id, pattern)) {
          include = true;
          break;
        }
      }

      if (!include) {
        return false;
      }
    }

    if (excludes.length > 0) {
      for (const pattern of excludes) {
        if (match(id, pattern)) {
          return false;
        }
      }
    }

    return true;
  };
};

export type {
  Pattern,
  FilterOption,
  Filter,
};

export {
  match,
  createFilter,
};