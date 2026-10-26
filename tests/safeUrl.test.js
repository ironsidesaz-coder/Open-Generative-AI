const test = require('node:test');
const assert = require('node:assert/strict');

const { isAllowedDownloadUrl, isSafeExternalUrl } = require('../electron/lib/safeUrl');

test('isSafeExternalUrl allows only http(s)', () => {
    assert.equal(isSafeExternalUrl('https://muapi.ai/access-keys'), true);
    assert.equal(isSafeExternalUrl('http://example.com'), true);
    assert.equal(isSafeExternalUrl('javascript:alert(1)'), false);
    assert.equal(isSafeExternalUrl('file:///etc/passwd'), false);
    assert.equal(isSafeExternalUrl('data:text/html,hi'), false);
    assert.equal(isSafeExternalUrl('not a url'), false);
});

test('isAllowedDownloadUrl requires public https hosts', () => {
    assert.equal(isAllowedDownloadUrl('https://github.com/leejet/stable-diffusion.cpp/releases/download/x/y.zip'), true);
    assert.equal(isAllowedDownloadUrl('https://huggingface.co/owner/model/resolve/main/weights.gguf'), true);
    assert.equal(isAllowedDownloadUrl('http://github.com/x'), false);
    assert.equal(isAllowedDownloadUrl('https://127.0.0.1/malware'), false);
    assert.equal(isAllowedDownloadUrl('https://localhost/malware'), false);
    assert.equal(isAllowedDownloadUrl('https://192.168.1.10/malware'), false);
    assert.equal(isAllowedDownloadUrl('https://user:pass@evil.example/x'), false);
    assert.equal(isAllowedDownloadUrl('file:///tmp/x'), false);
});
