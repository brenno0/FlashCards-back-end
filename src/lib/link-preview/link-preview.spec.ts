import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { isPublicAddress } from './is-public-address';
import { parseMetadata } from './parse-metadata';
import { BlockedUrlError, safeFetch } from './safe-fetch';

describe('isPublicAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    '::',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '[::1]',
    'not-an-ip',
  ])('blocks %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111', '172.32.0.1'])(
    'allows %s',
    (address) => {
      expect(isPublicAddress(address)).toBe(true);
    },
  );
});

describe('safeFetch', () => {
  let server: Server;
  let port: number;
  const allowLoopbackOnly = (address: string) => address === '127.0.0.1';

  beforeAll(async () => {
    server = createServer((req, res) => {
      if (req.url === '/redirect-private') {
        res.writeHead(302, { Location: 'http://10.0.0.1/' }).end();
      } else if (req.url === '/redirect-metadata') {
        res
          .writeHead(302, {
            Location: 'http://169.254.169.254/latest/meta-data',
          })
          .end();
      } else if (req.url === '/json') {
        res.writeHead(200, { 'Content-Type': 'application/json' }).end('{}');
      } else if (req.url === '/huge') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          `<head><title>Huge</title></head>${'x'.repeat(3 * 1024 * 1024)}`,
        );
      } else {
        res
          .writeHead(200, { 'Content-Type': 'text/html' })
          .end('<title>Ok</title>');
      }
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const opts = () => ({
    allowedPorts: [port],
    isAllowedAddress: allowLoopbackOnly,
  });

  it('fetches html from an allowed address', async () => {
    const result = await safeFetch(`http://127.0.0.1:${port}/`, opts());
    expect(result.body).toContain('Ok');
  });

  it.each([
    'http://127.0.0.1/',
    'http://localhost/',
    'http://10.0.0.1/',
    'http://192.168.0.10/',
    'http://169.254.169.254/latest/meta-data',
    'http://[::1]/',
    'http://[fc00::1]/',
    'ftp://example.com/',
    'file:///etc/passwd',
    'http://example.com:8080/',
    'http://user:pass@example.com/',
  ])('blocks %s with default policy', async (url) => {
    await expect(safeFetch(url)).rejects.toThrow();
  });

  it('blocks localhost via DNS resolution', async () => {
    await expect(safeFetch('http://localhost/')).rejects.toBeInstanceOf(
      BlockedUrlError,
    );
  });

  it('blocks redirect from allowed host to private or metadata address', async () => {
    await expect(
      safeFetch(`http://127.0.0.1:${port}/redirect-private`, opts()),
    ).rejects.toBeInstanceOf(BlockedUrlError);
    await expect(
      safeFetch(`http://127.0.0.1:${port}/redirect-metadata`, opts()),
    ).rejects.toBeInstanceOf(BlockedUrlError);
  });

  it('rejects non-html responses', async () => {
    await expect(
      safeFetch(`http://127.0.0.1:${port}/json`, opts()),
    ).rejects.toThrow(/Unexpected response/);
  });

  it('caps body size', async () => {
    const result = await safeFetch(`http://127.0.0.1:${port}/huge`, {
      ...opts(),
      maxBytes: 1024,
    });
    expect(result.body.length).toBeLessThanOrEqual(1024);
    expect(result.body).toContain('Huge');
  });
});

describe('parseMetadata', () => {
  it('prefers open graph tags and resolves favicon', () => {
    const html = `<html><head>
      <title>Plain</title>
      <meta property="og:title" content="Rich &amp; Title">
      <meta name="description" content='Desc'>
      <link rel="shortcut icon" href="/static/fav.png">
    </head><body><meta property="og:title" content="ignored"></body></html>`;
    expect(parseMetadata(html, 'https://news.example/a/b')).toEqual({
      title: 'Rich & Title',
      description: 'Desc',
      faviconUrl: 'https://news.example/static/fav.png',
    });
  });

  it('falls back to <title> and /favicon.ico, drops javascript: icons', () => {
    const html =
      '<head><title> Hello\n world </title><link rel="icon" href="javascript:alert(1)"></head>';
    expect(parseMetadata(html, 'https://a.io/x')).toEqual({
      title: 'Hello world',
      description: undefined,
      faviconUrl: 'https://a.io/favicon.ico',
    });
  });
});
