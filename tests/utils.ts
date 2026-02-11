export async function fetchHtml(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        return await response.text();
    } catch (err) {
        return null;
    }
}

export async function checkUrlExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (err) {
        return false;
    }
}

export async function getFileSize(url: string): Promise<number | null> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
            return null;
        }
        const contentLength = response.headers.get('content-length');
        return contentLength ? parseInt(contentLength, 10) : null;
    } catch (err) {
        return null;
    }
}
