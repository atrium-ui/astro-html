import type { BannerTest, BannerTestContext, TestResult } from "./types";
import { checkUrlExists } from "./utils";

export const placeholderTest: BannerTest = {
    name: "Placeholder Image",
    run: async (context: BannerTestContext): Promise<TestResult> => {
        const exists = await checkUrlExists(context.placeholderUrl);

        if (!exists) {
            return {
                passed: false,
                message: "Missing placeholder image (.jpg)"
            };
        }

        return {
            passed: true,
            message: "Placeholder image found"
        };
    }
};
