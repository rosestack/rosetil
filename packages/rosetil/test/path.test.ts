import {describe, it, expect} from "vitest";

import {normalize} from "~/main";

describe("normalize", () => {
  it("should normalize multiple dots", () => {
    expect(normalize("a/./b/../c")).toBe("a/c");
  });

  it("should normalize multiple slashes", () => {
    expect(normalize("a//b///c////d")).toBe("a/b/c/d");
  });

  it("should normalize backslashes", () => {
    expect(normalize("a\\b\\c\\d")).toBe("a/b/c/d");
  });

  it("should normalize mixed slashes", () => {
    expect(normalize("a\\/b\\\\c")).toBe("a/b/c");
  });

  it("should normalize empty string", () => {
    expect(normalize("")).toBe(".");
  });
});