import {describe, it, expect} from "vitest";

import {match, createFilter} from "~/main";

describe("match", () => {
  it("should match string", () => {
    expect(match("foo", "foo")).toBe(true);
    expect(match("foo", "bar")).toBe(false);
  });

  it("should match glob", () => {
    expect(match("foo", "*.js")).toBe(false);
    expect(match("foo.js", "*.js")).toBe(true);
    expect(match("foo.js", "*.ts")).toBe(false);
  });

  it("should match regexp", () => {
    expect(match("foo", /foo/)).toBe(true);
    expect(match("foo", /bar/)).toBe(false);
  });

  it("should not match non pattern", () => {
    expect(match("foo", null as any)).toBe(false);
    expect(match("foo", undefined as any)).toBe(false);
    expect(match("foo", 1 as any)).toBe(false);
    expect(match("foo", false as any)).toBe(false);
    expect(match("foo", true as any)).toBe(false);
    expect(match("foo", {} as any)).toBe(false);
    expect(match("foo", [] as any)).toBe(false);
  });
});

describe("createFilter", () => {
  it("should return a function", () => {
    const filter = createFilter();
    expect(typeof filter).toBe("function");
  });

  it("should return true if no filters provided", () => {
    const filter = createFilter();
    expect(filter("foo")).toBe(true);
  });

  it("should return false if non string provided", () => {
    const filter = createFilter();
    expect(filter(1)).toBe(false);
  });

  it("should return false if noEmptyString", () => {
    const filter = createFilter({
      noEmptyString: true,
    });

    expect(filter("")).toBe(false);
  });
  it("should return true without noEmptyString", () => {
    const filter = createFilter({
      noEmptyString: false,
    });

    expect(filter("")).toBe(true);
  });

  it("should return false if noNullChar", () => {
    const filter = createFilter({
      noNullChar: true,
    });

    expect(filter("foo\0bar")).toBe(false);
  });
  it("should return true without noNullChar", () => {
    const filter = createFilter({
      noNullChar: false,
    });

    expect(filter("foo\0bar")).toBe(true);
  });

  it("should return true if normalize", () => {
    const filter = createFilter({
      normalize: true,
      include: "foo/bar",
    });

    expect(filter("foo\\bar")).toBe(true);
  });
  it("should return false if without normalize", () => {
    const filter = createFilter({
      normalize: false,
      include: "foo/bar",
    });

    expect(filter("foo\\bar")).toBe(false);
  });

  it("should match included filter (string)", () => {
    const filter = createFilter({
      include: "foo.js",
    });

    expect(filter("foo.js")).toBe(true);
    expect(filter("bar.ts")).toBe(false);
  });
  it("should match excluded filter (string)", () => {
    const filter = createFilter({
      exclude: "bar.ts",
    });

    expect(filter("foo.js")).toBe(true);
    expect(filter("bar.ts")).toBe(false);
  });

  it("should match included filter (glob)", () => {
    const filter = createFilter({
      include: ["*.js"],
    });

    expect(filter("foo.js")).toBe(true);
    expect(filter("bar.ts")).toBe(false);
  });
  it("should match excluded filter (glob)", () => {
    const filter = createFilter({
      exclude: ["*.ts"],
    });

    expect(filter("foo.js")).toBe(true);
    expect(filter("bar.ts")).toBe(false);
  });

  it("should match included filter (regexp)", () => {
    const filter = createFilter({
      include: new RegExp("foo.js"),
    });

    expect(filter("foo.js")).toBe(true);
    expect(filter("bar.ts")).toBe(false);
  });
  it("should match excluded filter (regexp)", () => {
    const filter = createFilter({
      exclude: new RegExp("bar.ts"),
    });

    expect(filter("foo.js")).toBe(true);
    expect(filter("bar.ts")).toBe(false);
  });
});