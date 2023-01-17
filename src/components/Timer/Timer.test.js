import {getHoursRemaining, getMinutesRemaining} from "./index.jsx";
import {test, expect} from "vitest";

test("getHoursRemaining(Date.now()) is zero", () => {
    const now = Date.now();
    expect(getHoursRemaining(now)).toBe(0);
});
test("getMinutesRemaining(Date.now()) is zero", () => {
    const now = Date.now();
    expect(getMinutesRemaining(now)).toBe(0);
});
test("getHoursRemaining(anHourFromNow) is 1", () => {
    const anHourFromNow = Date.now() + 3600000;
    expect(getHoursRemaining(anHourFromNow)).toBe(1);
});
test("getMinutesRemaining(anHourFromNow) is zero", () => {
    const anHourFromNow = Date.now() + 3600000;
    expect(getMinutesRemaining(anHourFromNow)).toBe(0);
});
test("getMinutesRemaining(fiftyNineMinutesFromNow) is 59", () => {
    const fiftyNineMinutesFromNow = Date.now() + 3540000;
    expect(getMinutesRemaining(fiftyNineMinutesFromNow)).toBe(59);
});
test("getMinutesRemaining(fiftyNinePointNineNineMinutesFromNow) is 59", () => {
    const fiftyNinePointNineNineMinutesFromNow = Date.now() + 3599999;
    expect(getMinutesRemaining(fiftyNinePointNineNineMinutesFromNow)).toBe(59);
});