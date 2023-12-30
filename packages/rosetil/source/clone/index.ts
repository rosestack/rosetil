const clone = <T>(target: T): T => {
  if (!target) {
    return target;
  }

  if (typeof target !== "object") {
    return target;
  }

  if (Array.isArray(target)) {
    return Array.from(target.map(clone)) as T;
  }

  return Object.entries(target).reduce((previousValue: any, [key, value]) => {
    previousValue[key] = clone(value);
    return previousValue;
  }, {});
};

export {
  clone,
};