const SESSION_STORAGE_KEY = 'otelverse_session_id';
function generateUUID() {
    const chars = '0123456789abcdef';
    const sections = [8, 4, 4, 4, 12];
    return sections
        .map((len) => {
        let section = '';
        for (let i = 0; i < len; i++) {
            section += chars[Math.floor(Math.random() * 16)];
        }
        return section;
    })
        .join('-');
}
let cachedSessionId = null;
export function getSessionId() {
    if (cachedSessionId)
        return cachedSessionId;
    try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            cachedSessionId = stored;
            return cachedSessionId;
        }
    }
    catch {
        // sessionStorage not available
    }
    cachedSessionId = generateUUID();
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, cachedSessionId);
    }
    catch {
        // sessionStorage not available
    }
    return cachedSessionId;
}
export function resetSessionId() {
    cachedSessionId = null;
}
//# sourceMappingURL=session.js.map