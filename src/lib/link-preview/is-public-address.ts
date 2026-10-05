import { BlockList, isIP } from 'node:net';

const blocked = new BlockList();

// IPv4: "this" network, private, CGNAT, loopback, link-local (incl. cloud metadata),
// IETF/test nets, benchmarking, multicast, reserved, broadcast.
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv4');
}

// IPv6: unspecified, loopback, IPv4-translated, discard, unique local, link-local,
// site-local, multicast, documentation.
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['fc00::', 7],
  ['fe80::', 10],
  ['fec0::', 10],
  ['ff00::', 8],
  ['2001:db8::', 32],
] as const) {
  blocked.addSubnet(network, prefix, 'ipv6');
}

/** Unwraps IPv4-mapped IPv6 (::ffff:a.b.c.d / ::ffff:7f00:1) to plain IPv4. */
const unmapIpv4 = (address: string): string => {
  const lower = address.toLowerCase();
  const dotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) {
    return dotted[1];
  }
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const high = parseInt(hex[1], 16);
    const low = parseInt(hex[2], 16);
    return [high >> 8, high & 255, low >> 8, low & 255].join('.');
  }
  return address;
};

/** True only for globally routable unicast addresses. */
export const isPublicAddress = (rawAddress: string): boolean => {
  const address = unmapIpv4(rawAddress.replace(/^\[|\]$/g, ''));
  const family = isIP(address);
  if (family === 4) {
    return !blocked.check(address, 'ipv4');
  }
  if (family === 6) {
    return !blocked.check(address, 'ipv6');
  }
  return false;
};
