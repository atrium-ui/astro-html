import type { BannerTest } from "./types";
import { fileSizeTest } from "./file-size.test";
import { placeholderTest } from "./placeholder.test";
import { clickTagTest } from "./clicktag.test";
import { targetBlankTest } from "./target-blank.test";
import { hrefPatternTest } from "./href-pattern.test";

export const allTests: BannerTest[] = [
    fileSizeTest,
    placeholderTest,
    clickTagTest,
    targetBlankTest,
    hrefPatternTest,
];

export * from "./types";
export * from "./runner";
export * from "./utils";
export {
    fileSizeTest,
    placeholderTest,
    clickTagTest,
    targetBlankTest,
    hrefPatternTest,
};
