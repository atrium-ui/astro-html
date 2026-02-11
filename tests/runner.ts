import type { BannerTest, BannerTestContext, TestResult } from "./types";
import { allTests } from "./index";

export interface BannerTestReport {
    name: string;
    previewUrl: string;
    results: Array<{
        testName: string;
        result: TestResult;
    }>;
    passed: boolean;
    failedCount: number;
    warningCount: number;
}

export interface BannerAsset {
    name: string;
    previewUrl: string;
    zipUrl: string;
    placeholderUrl: string;
}

function createContext(asset: BannerAsset): BannerTestContext {
    return {
        name: asset.name,
        previewUrl: asset.previewUrl,
        zipUrl: asset.zipUrl,
        placeholderUrl: asset.placeholderUrl,
    };
}

export async function runTests(
    asset: BannerAsset,
    tests: BannerTest[] = allTests
): Promise<BannerTestReport> {
    const context = createContext(asset);
    
    const results = await Promise.all(
        tests.map(async test => ({
            testName: test.name,
            result: await test.run(context),
        }))
    );

    const failedCount = results.filter(r => !r.result.passed).length;
    const warningCount = results.filter(r => r.result.isWarning).length;
    const passed = failedCount === 0;

    return {
        name: asset.name,
        previewUrl: asset.previewUrl,
        results,
        passed,
        failedCount,
        warningCount,
    };
}

export async function runTestsOnAssets(
    assets: BannerAsset[],
    tests: BannerTest[] = allTests
): Promise<BannerTestReport[]> {
    return Promise.all(
        assets.map(asset => runTests(asset, tests))
    );
}
