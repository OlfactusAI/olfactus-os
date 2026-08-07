import {
  describe,
  expect,
  it,
} from "vitest";

import {
  forecastUncertainty,
} from "@/lib/prediction/forecast-confidence";

describe("Forecast uncertainty calibration", () => {
  it("widens gradually by horizon without exploding to meaningless ranges", () => {
    const d30 =
      forecastUncertainty({
        confidence: 70,
        horizonDays: 30,
      });
    const d90 =
      forecastUncertainty({
        confidence: 65,
        horizonDays: 90,
      });
    const d180 =
      forecastUncertainty({
        confidence: 60,
        horizonDays: 180,
      });
    const d365 =
      forecastUncertainty({
        confidence: 55,
        horizonDays: 365,
      });

    expect(d30).toBeLessThanOrEqual(
      d90,
    );
    expect(d90).toBeLessThanOrEqual(
      d180,
    );
    expect(d180).toBeLessThanOrEqual(
      d365,
    );
    expect(d365).toBeLessThanOrEqual(
      14,
    );
  });
});
