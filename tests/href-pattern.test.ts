import type { BannerTest, BannerTestContext, TestResult } from "./types";
import { fetchHtml } from "./utils";

export const hrefPatternTest: BannerTest = {
    name: "Href Pattern",
    run: async (context: BannerTestContext): Promise<TestResult> => {
        const htmlContent = await fetchHtml(context.previewUrl);
        
        if (!htmlContent) {
            return {
                passed: false,
                message: "HTML file not found"
            };
        }

        const hasCorrectHref = /href\s*=\s*["']javascript:window\.open\(window\.clickTag\)["']/.test(htmlContent);

        if (!hasCorrectHref) {
            return {
                passed: false,
                message: 'Missing correct href="javascript:window.open(window.clickTag)"'
            };
        }

        return {
            passed: true,
            message: "Correct href pattern found"
        };
    }
};
