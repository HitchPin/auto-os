import * as fs from 'fs';
import { md5Buffer, hex } from "./md5";

const HASH_LEN = 8;

const hashBuffer = (b: Buffer): string => {
  return hex(md5Buffer(b));
};

const shortHashOfFile = (f: string): string => {
  const b = fs.readFileSync(f);
  const h = hashBuffer(b);
  return h.slice(0, HASH_LEN).toUpperCase();
};


export { shortHashOfFile };