import {describe, it, expect} from "vitest";

import {find, findSync, findAll, findAllSync, findDir, findDirSync} from "~/main";

describe("find", () => {
  it("should find package.json", async () => {
    const result = await find({
      cwd: process.cwd(),
      name: "package.json",
      traversal: "none",
    });

    expect(result).toBeDefined();
  });
});

describe("findSync", () => {
  it("should find package.json", () => {
    const result = findSync({
      cwd: process.cwd(),
      name: "package.json",
      traversal: "none",
    });

    expect(result).toBeDefined();
  });
});

describe("findAll", () => {
  it("should find package.json", async () => {
    const result = await findAll({
      cwd: process.cwd(),
      name: "package.json",
      traversal: "none",
    });

    expect(result).toBeDefined();
  });
});

describe("findAllSync", () => {
  it("should find package.json", () => {
    const result = findAllSync({
      cwd: process.cwd(),
      name: "package.json",
      traversal: "none",
    });

    expect(result).toBeDefined();
  });
});

describe("findDir", () => {
  it("should find package.json", async () => {
    const result = await findDir({
      cwd: process.cwd(),
      name: "package.json",
      traversal: "none",
    });

    expect(result).toBeDefined();
  });
});

describe("findDirSync", () => {
  it("should find package.json", () => {
    const result = findDirSync({
      cwd: process.cwd(),
      name: "package.json",
      traversal: "none",
    });

    expect(result).toBeDefined();
  });
});