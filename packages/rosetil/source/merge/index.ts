/**
 * Deeply merge multiple objects.
 **/
const merge = <Source extends object>(...sources: Source[]): Source => {
  return sources.reduce((previousValue: any, currentValue) => {
    if (currentValue !== undefined) {
      if (!previousValue) {
        return currentValue;
      }

      if (typeof previousValue === "object" && typeof currentValue === "object") {
        if (currentValue === null) {
          return currentValue;
        }

        if (Array.isArray(previousValue) && Array.isArray(currentValue)) {
          return Array.from(new Set([...previousValue, ...currentValue]));
        }

        return Object.entries(currentValue).reduce((previousValue, [key, value]) => {
          const pValue = Reflect.get(previousValue, key);
          Reflect.set(previousValue, key, merge(pValue, value));
          return previousValue;
        }, previousValue);
      }

      return currentValue;
    }

    return previousValue;
  }, undefined);
};


export {
  merge,
};