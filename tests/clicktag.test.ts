import type { BannerTest, BannerTestContext, TestResult } from "./types";
import { fetchHtml } from "./utils";

export const clickTagTest: BannerTest = {
    name: "ClickTag Variable",
    run: async (context: BannerTestContext): Promise<TestResult> => {
        const htmlContent = await fetchHtml(context.previewUrl);
        
        if (!htmlContent) {
            return {
                passed: false,
                message: "HTML file not found"
            };
        }

        const hasClickTag = /var\s+clickTag\s*=/.test(htmlContent);

        if (!hasClickTag) {
            return {
                passed: false,
                message: "Missing clickTag variable declaration"
            };
        }

        return {
            passed: true,
            message: "clickTag variable found"
        };
    }
};
