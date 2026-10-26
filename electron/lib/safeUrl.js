function parseHttpUrl(raw) {
    if (typeof raw !== 'string' || raw.trim() === '') return null;
    try {
        return new URL(raw);
    } catch {
        return null;
    }
}

function isLoopbackOrPrivateHost(hostname) {
    const host = String(hostname || '').toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
    if (!host) return true;
    if (host === 'localhost' || host.endsWith('.localhost') || host === '::1') return true;
    if (host.includes(':')) return true;

    const parts = host.split('.');
    if (parts.length === 4 && parts.every((part) => /^\d+$/.test(part))) {
        const octets = parts.map((part) => Number(part));
        if (octets.some((octet) => octet < 0 || octet > 255)) return true;
        const [first, second] = octets;
        return (
            first === 0 ||
            first === 10 ||
            first === 127 ||
            (first === 169 && second === 254) ||
            (first === 172 && second >= 16 && second <= 31) ||
            (first === 192 && second === 168)
        );
    }

    return false;
}

// Window.open / <a target=_blank> from the Electron renderer. Only http(s)
// leaves the app; javascript:, file:, and custom schemes are rejected.
function isSafeExternalUrl(raw) {
    const parsed = parseHttpUrl(raw);
    return Boolean(parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:'));
}

// Binary / model downloads from the Electron main process. HTTPS only, no
// localhost / RFC1918 / IP-literal targets, so a redirect cannot exfiltrate
// to an internal host. Public HTTPS CDNs (GitHub, Hugging Face LFS, etc.)
// remain allowed because model artifacts are hosted there.
function isAllowedDownloadUrl(raw) {
    const parsed = parseHttpUrl(raw);
    if (!parsed || parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    return !isLoopbackOrPrivateHost(parsed.hostname);
}

module.exports = {
    isAllowedDownloadUrl,
    isSafeExternalUrl,
};
