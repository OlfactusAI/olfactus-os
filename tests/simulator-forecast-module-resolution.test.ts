import {
  describe,
  expect,
  it,
} from "vitest";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

describe("Predictive Simulator module resolution", () => {
  it("ships the simulator forecast module required by the Simulator page", () => {
    const modulePath =
      join(
        process.cwd(),
        "lib/predictive/simulator-forecast.ts",
      );

    expect(
      existsSync(modulePath),
    ).toBe(true);

    const source =
      readFileSync(
        modulePath,
        "utf8",
      );

    expect(source).toContain(
      "forecastSimulationScenario",
    );
    expect(source).toContain(
      "ForecastHorizonDays",
    );
  });
});
