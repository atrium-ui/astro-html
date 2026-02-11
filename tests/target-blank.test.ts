import type { BannerTest, BannerTestContext, TestResult } from "./types";
import { fetchHtml } from "./utils";

export const targetBlankTest: BannerTest = {
    name: "Target Blank",
    run: async (context: BannerTestContext): Promise<TestResult> => {
        const htmlContent = await fetchHtml(context.previewUrl);
        
        if (!htmlContent) {
            return {
                passed: false,
                message: "HTML file not found"
            };
        }

        const hasTargetBlank = /target\s*=\s*["']_blank["']/.test(htmlContent);

        if (hasTargetBlank) {
            return {
                passed: false,
                message: 'Contains target="_blank" (not allowed)'
            };
        }

        return {
            passed: true,
            message: 'No target="_blank" found'
        };
    }
};
