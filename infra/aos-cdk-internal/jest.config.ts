import type {Config} from 'jest';

const config: Config = {
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
};

export default config;