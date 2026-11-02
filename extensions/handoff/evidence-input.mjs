// Input guards retained for the parent-run evidence utility, not agent prompts.
import { isAbsolute, posix } from 'node:path';

export const safeRelative = (path) => typeof path === 'string' && path.length > 0 && !isAbsolute(path)
  && !path.includes('\\') && !path.includes('\0') && !path.startsWith('-')
  && (path === '.' || (posix.normalize(path).replace(/\/$/, '') === path.replace(/\/$/, '') && !path.split('/').includes('..')));

export function parseRecord(text) {
  if (Buffer.byteLength(text) > 2_000_000) throw new Error('PAYLOAD_TOO_LARGE');
  let value;
  try { value = JSON.parse(text); } catch { throw new Error('INVALID_JSON'); }
  // JSON.parse accepts duplicate keys (last wins). Reject ambiguity, including
  // escaped spellings of the same key, without implementing a second JSON parser.
  const stack = [];
  for (const [token] of text.matchAll(/"(?:[^"\\]|\\.)*"|[{}\[\],:]|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)) {
    const current = stack.at(-1);
    if (token === '{') stack.push({ keys: new Set(), expectingKey: true });
    else if (token === '[') stack.push({ keys: null });
    else if (token === '}' || token === ']') stack.pop();
    else if (token === ',' && current?.keys) current.expectingKey = true;
    else if (token === ':' && current?.keys) current.expectingKey = false;
    else if (token.startsWith('"') && current?.keys && current.expectingKey) {
      const key = JSON.parse(token);
      if (current.keys.has(key)) throw new Error('DUPLICATE_JSON_KEY');
      current.keys.add(key);
    }
  }
  return value;
}
