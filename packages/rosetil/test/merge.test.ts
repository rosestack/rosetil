import {describe, it, expect} from "vitest";

import {merge} from "~/main";

describe("merge", () => {
  it("should merge nothing", () => {
    expect(merge()).toBeUndefined();
    expect(merge({a: 1})).toEqual({a: 1});
  });

  it("should merge two objects", () => {
    expect(merge({a: 1}, {a: 2})).toEqual({a: 2});
    expect(merge({a: 1}, {b: 2})).toEqual({a: 1, b: 2});
  });

  it("should merge nested objects", () => {
    expect(merge({a: {b: 1}}, {a: {c: 2}})).toEqual({a: {b: 1, c: 2}});
  });

  it("should merge nested arrays", () => {
    expect(merge({a: [1]}, {a: [2]})).toEqual({a: [1, 2]});
  });
});