import path from "path";

/**
 * Normalize id
 **/
const normalize = (id: string) => {
  return path.normalize(id).replace(/\\/g, "/");
};

export {
  normalize,
};