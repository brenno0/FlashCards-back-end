import { lookup as dnsLookup } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { isIP, type LookupFunction } from 'node:net';

import { isPublicAddress } from './is-public-address';

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  allowedPorts?: number[];
  isAllowedAddress?: (address: string) => boolean;
}

export interface SafeFetchResult {
  url: string;
  contentType: string;
  body: string;
}

export class BlockedUrlError extends Error {}

const DEFAULTS = {
  timeoutMs: 5000,
  maxBytes: 1024 * 1024,
  maxRedirects: 3,
  allowedPorts: [80, 443],
  isAllowedAddress: isPublicAddress,
};

/**
 * SSRF-safe GET of an HTML page: http(s) only, allowed ports only, every resolved
 * address checked at connect time (no DNS rebinding window), redirects re-validated,
 * total timeout and body cap. Throws on any violation or failure.
 */
export const safeFetch = async (
  rawUrl: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResult> => {
  const config = { ...DEFAULTS, ...options };
  const deadline = Date.now() + config.timeoutMs;

  let current = rawUrl;
  for (let hop = 0; hop <= config.maxRedirects; hop += 1) {
    const response = await requestOnce(current, config, deadline);
    if (response.redirect) {
      current = new URL(response.redirect, current).toString();
      continue;
    }
    return {
      url: current,
      contentType: response.contentType,
      body: response.body,
    };
  }
  throw new BlockedUrlError('Too many redirects');
};

const validateUrl = (url: URL, config: typeof DEFAULTS) => {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError(`Protocol ${url.protocol} not allowed`);
  }
  if (url.username || url.password) {
    throw new BlockedUrlError('Credentials not allowed');
  }
  const port = url.port
    ? Number(url.port)
    : url.protocol === 'https:'
      ? 443
      : 80;
  if (!config.allowedPorts.includes(port)) {
    throw new BlockedUrlError(`Port ${port} not allowed`);
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host) && !config.isAllowedAddress(host)) {
    throw new BlockedUrlError(`Address ${host} not allowed`);
  }
};

const requestOnce = (
  rawUrl: string,
  config: typeof DEFAULTS,
  deadline: number,
): Promise<{ redirect?: string; contentType: string; body: string }> =>
  new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(rawUrl);
      validateUrl(url, config);
    } catch (error) {
      reject(error);
      return;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      reject(new Error('Timeout'));
      return;
    }

    // Resolves and checks every address used for the actual connection.
    const lookup: LookupFunction = (hostname, lookupOptions, callback) => {
      dnsLookup(
        hostname,
        { ...lookupOptions, all: true },
        (error, addresses) => {
          if (error) {
            callback(error, '', 4);
            return;
          }
          const list = Array.isArray(addresses) ? addresses : [];
          const disallowed = list.find(
            (entry) => !config.isAllowedAddress(entry.address),
          );
          if (list.length === 0 || disallowed) {
            callback(
              new BlockedUrlError(
                `Address ${disallowed?.address ?? hostname} not allowed`,
              ),
              '',
              4,
            );
            return;
          }
          if (lookupOptions.all) {
            callback(null, list);
          } else {
            callback(null, list[0].address, list[0].family);
          }
        },
      );
    };

    const client = url.protocol === 'https:' ? https : http;
    const request = client.get(
      url,
      {
        lookup,
        timeout: remaining,
        headers: {
          'User-Agent': 'bflashcards-link-preview/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if (status >= 300 && status < 400 && response.headers.location) {
          response.resume();
          resolve({
            redirect: response.headers.location,
            contentType: '',
            body: '',
          });
          return;
        }
        const contentType = String(response.headers['content-type'] ?? '');
        if (
          status < 200 ||
          status >= 300 ||
          !/text\/html|application\/xhtml/i.test(contentType)
        ) {
          response.resume();
          reject(new Error(`Unexpected response ${status} ${contentType}`));
          return;
        }

        const chunks: Buffer[] = [];
        let size = 0;
        response.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > config.maxBytes) {
            // Enough for metadata in <head>; stop reading and use what we have.
            chunks.push(
              chunk.subarray(0, chunk.length - (size - config.maxBytes)),
            );
            response.destroy();
            resolve({
              contentType,
              body: Buffer.concat(chunks).toString('utf8'),
            });
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () =>
          resolve({
            contentType,
            body: Buffer.concat(chunks).toString('utf8'),
          }),
        );
        response.on('error', reject);
      },
    );
    request.on('timeout', () => request.destroy(new Error('Timeout')));
    request.on('error', reject);
  });
