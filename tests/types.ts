export interface TestResult {
    passed: boolean;
    message: string;
    isWarning?: boolean;
}

export interface BannerTestContext {
    name: string;
    previewUrl: string;
    zipUrl: string;
    placeholderUrl: string;
}

export interface BannerTest {
    name: string;
    run: (context: BannerTestContext) => Promise<TestResult>;
}
