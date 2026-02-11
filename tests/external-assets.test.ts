import type { BannerTest, BannerTestContext, TestResult } from "./types";
import { fetchHtml, checkUrlExists } from "./utils";

const ASSET_PATTERNS = [
    // Font files
    /(?:src|url)\s*[:=]\s*["']([^"']*\.(?:woff2?|ttf|otf|eot))["']/gi,
    // Images
    /(?:src|url)\s*[:=]\s*["']([^"']*\.(?:jpg|jpeg|png|gif|svg|webp))["']/gi,
];

function extractAssetUrls(htmlContent: string): string[] {
    const urls = new Set<string>();
    
    for (const pattern of ASSET_PATTERNS) {
        const matches = htmlContent.matchAll(pattern);
        for (const match of matches) {
            if (match[1]) {
                urls.add(match[1]);
            }
        }
    }
    
    return Array.from(urls);
}

function resolveUrl(baseUrl: string, assetUrl: string): string {
    if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
        return assetUrl;
    }
    
    if (assetUrl.startsWith('data:')) {
        return assetUrl;
    }
    
    const base = new URL(baseUrl);
    
    if (assetUrl.startsWith('/')) {
        return `${base.origin}${assetUrl}`;
    }
    
    const pathSegments = base.pathname.split('/');
    pathSegments.pop();
    pathSegments.push(assetUrl);
    
    return `${base.origin}${pathSegments.join('/')}`;
}

export const externalAssetsTest: BannerTest = {
    name: "External Assets",
    run: async (context: BannerTestContext): Promise<TestResult> => {
        const htmlContent = await fetchHtml(context.previewUrl);
        
        if (!htmlContent) {
            return {
                passed: false,
                message: "HTML file not found"
            };
        }

        const assetUrls = extractAssetUrls(htmlContent);
        
        if (assetUrls.length === 0) {
            return {
                passed: true,
                message: "No external assets referenced"
            };
        }

        const missingAssets: string[] = [];
        const dataUriCount = assetUrls.filter(url => url.startsWith('data:')).length;
        
        for (const assetUrl of assetUrls) {
            if (assetUrl.startsWith('data:')) {
                continue;
            }
            
            const fullUrl = resolveUrl(context.previewUrl, assetUrl);
            const exists = await checkUrlExists(fullUrl);
            
            if (!exists) {
                missingAssets.push(assetUrl);
            }
        }

        if (missingAssets.length > 0) {
            return {
                passed: false,
                message: `Missing ${missingAssets.length} asset(s): ${missingAssets.join(', ')}`
            };
        }

        const externalCount = assetUrls.length - dataUriCount;
        const message = externalCount > 0 
            ? `All ${externalCount} external asset(s) exist`
            : `All assets inlined (${dataUriCount} data URIs)`;

        return {
            passed: true,
            message
        };
    }
};
