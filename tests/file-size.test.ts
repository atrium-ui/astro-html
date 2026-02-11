import type { BannerTest, BannerTestContext, TestResult } from "./types";
import { getFileSize } from "./utils";

const MAX_ZIP_SIZE = 150 * 1024; // 150KB - IAB standard
const WARN_ZIP_SIZE = 100 * 1024; // 100KB - warning threshold

export const fileSizeTest: BannerTest = {
    name: "File Size",
    run: async (context: BannerTestContext): Promise<TestResult> => {
        const zipSize = await getFileSize(context.zipUrl);

        if (zipSize === null) {
            return {
                passed: false,
                message: "Could not determine zip file size"
            };
        }

        const sizeKB = (zipSize / 1024).toFixed(2);

        if (zipSize > MAX_ZIP_SIZE) {
            return {
                passed: false,
                message: `Size ${sizeKB}KB exceeds max ${MAX_ZIP_SIZE / 1024}KB`
            };
        }

        if (zipSize > WARN_ZIP_SIZE) {
            return {
                passed: true,
                message: `Size ${sizeKB}KB approaching limit`,
                isWarning: true
            };
        }

        return {
            passed: true,
            message: `Size ${sizeKB}KB is within limits`
        };
    }
};
