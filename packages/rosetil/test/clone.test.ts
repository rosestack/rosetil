import {describe, it, expect} from "vitest";

import {clone} from "~/main";

describe("clone", () => {
  it("should clone an object", () => {
    const obj = {a: 1};

    const cloned = clone(obj);

    cloned.a = 2;

    expect(obj.a).toEqual(1);
    expect(cloned.a).toEqual(2);
  });

  it("should clone an object with nested object", () => {
    const obj = {a: {b: 1}};

    const cloned = clone(obj);

    cloned.a.b = 2;

    expect(obj.a.b).toEqual(1);
    expect(cloned.a.b).toEqual(2);
  });

  it("should clone an object with nested array", () => {
    const obj = {a: [1, 2, 3]};

    const cloned = clone(obj);

    cloned.a[0] = 2;

    expect(obj.a[0]).toEqual(1);
    expect(cloned.a[0]).toEqual(2);
  });

  it("should clone an array", () => {
    const arr = [1, 2, 3];

    const cloned = clone(arr);

    cloned[0] = 2;

    expect(arr[0]).toEqual(1);
    expect(cloned[0]).toEqual(2);
  });

  it("should clone an array with nested object", () => {
    const arr = [{a: 1}];

    const cloned = clone(arr);

    cloned[0]!.a = 2;

    expect(arr[0]!.a).toEqual(1);
    expect(cloned[0]!.a).toEqual(2);
  });

  it("should clone an array with nested array", () => {
    const arr = [[1, 2, 3]];

    const cloned = clone(arr);

    cloned[0]![0] = 2;

    expect(arr[0]![0]).toEqual(1);
    expect(cloned[0]![0]).toEqual(2);
  });
});
