import { Packet } from '../../src/types';

/**
 * Deterministic Test Fixtures for Sovereign Network Security Testing
 * Grounded in exact wire frame structures without random generation.
 */

// 1. Normal Web & DNS Traffic (Clean Baseline)
export const NORMAL_WEB_FIXTURE: Packet[] = [
  {
    id: 101, no: 101, timestamp: '12:00:01',
    sourceIp: '192.168.1.15', destinationIp: '8.8.8.8',
    sourcePort: 54321, destinationPort: 53, protocol: 'DNS',
    length: 74, ttl: 64, flags: 'N/A',
    info: 'Standard query A cdn.cloudflare.com',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 102, no: 102, timestamp: '12:00:02',
    sourceIp: '8.8.8.8', destinationIp: '192.168.1.15',
    sourcePort: 53, destinationPort: 54321, protocol: 'DNS',
    length: 90, ttl: 58, flags: 'N/A',
    info: 'Standard query response A 104.16.123.96',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 103, no: 103, timestamp: '12:00:03',
    sourceIp: '192.168.1.15', destinationIp: '104.16.123.96',
    sourcePort: 51234, destinationPort: 443, protocol: 'HTTPS',
    length: 66, ttl: 64, flags: 'SYN',
    info: '51234 → 443 [SYN] Seq=0 Win=65535 Len=0',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 104, no: 104, timestamp: '12:00:04',
    sourceIp: '104.16.123.96', destinationIp: '192.168.1.15',
    sourcePort: 443, destinationPort: 51234, protocol: 'HTTPS',
    length: 66, ttl: 55, flags: 'SYN, ACK',
    info: '443 → 51234 [SYN, ACK] Seq=0 Ack=1 Win=28960 Len=0',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: true, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 105, no: 105, timestamp: '12:00:05',
    sourceIp: '192.168.1.15', destinationIp: '104.16.123.96',
    sourcePort: 51234, destinationPort: 443, protocol: 'HTTPS',
    length: 54, ttl: 64, flags: 'ACK',
    info: '51234 → 443 [ACK] Seq=1 Ack=1 Win=65535 Len=0',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: true, psh: false, fin: false, rst: false, urg: false }
  }
];

// 2. SYN Port Sweep Fixture (T1046 - Multiple sequential probes from same source)
export const PORT_SCAN_FIXTURE: Packet[] = [
  {
    id: 201, no: 201, timestamp: '12:05:01',
    sourceIp: '192.168.1.110', destinationIp: '192.168.1.10',
    sourcePort: 61001, destinationPort: 21, protocol: 'TCP',
    length: 60, ttl: 64, flags: 'SYN',
    info: '61001 → 21 [SYN] Port Sweep Probe (FTP)',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 202, no: 202, timestamp: '12:05:02',
    sourceIp: '192.168.1.110', destinationIp: '192.168.1.10',
    sourcePort: 61002, destinationPort: 22, protocol: 'TCP',
    length: 60, ttl: 64, flags: 'SYN',
    info: '61002 → 22 [SYN] Port Sweep Probe (SSH)',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 203, no: 203, timestamp: '12:05:03',
    sourceIp: '192.168.1.110', destinationIp: '192.168.1.10',
    sourcePort: 61003, destinationPort: 80, protocol: 'TCP',
    length: 60, ttl: 64, flags: 'SYN',
    info: '61003 → 80 [SYN] Port Sweep Probe (HTTP)',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 204, no: 204, timestamp: '12:05:04',
    sourceIp: '192.168.1.110', destinationIp: '192.168.1.10',
    sourcePort: 61004, destinationPort: 445, protocol: 'TCP',
    length: 60, ttl: 64, flags: 'SYN',
    info: '61004 → 445 [SYN] Port Sweep Probe (SMB)',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 205, no: 205, timestamp: '12:05:05',
    sourceIp: '192.168.1.110', destinationIp: '192.168.1.10',
    sourcePort: 61005, destinationPort: 3389, protocol: 'TCP',
    length: 60, ttl: 64, flags: 'SYN',
    info: '61005 → 3389 [SYN] Port Sweep Probe (RDP)',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false, urg: false }
  }
];

// 3. ICMP Echo Flood Fixture (T1498 - High frequency echo requests)
export const ICMP_FLOOD_FIXTURE: Packet[] = Array.from({ length: 18 }, (_, idx) => ({
  id: 301 + idx,
  no: 301 + idx,
  timestamp: `12:10:${(idx * 0.1).toFixed(1).padStart(4, '0')}`,
  sourceIp: '10.0.0.99',
  destinationIp: '192.168.1.1',
  sourcePort: 0,
  destinationPort: 0,
  protocol: 'ICMP',
  length: 98,
  ttl: 64,
  flags: 'N/A',
  info: `ICMP Echo Request (id=0x1234, seq=${idx + 1}) TTL=64`,
  isSuspicious: false,
  tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false, urg: false }
}));

// 4. DNS Anomaly / High-Frequency Fixture (T1071.004)
export const DNS_ANOMALY_FIXTURE: Packet[] = [
  {
    id: 401, no: 401, timestamp: '12:15:01',
    sourceIp: '192.168.1.45', destinationIp: '8.8.8.8',
    sourcePort: 55001, destinationPort: 53, protocol: 'DNS',
    length: 120, ttl: 64, flags: 'N/A',
    info: 'Standard query TXT 7f3a9b1c8e2d4f5a6b7c8d9e0f1a2b3c4d5e6f.tunnel.exfil.net',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 402, no: 402, timestamp: '12:15:01',
    sourceIp: '192.168.1.45', destinationIp: '8.8.8.8',
    sourcePort: 55002, destinationPort: 53, protocol: 'DNS',
    length: 120, ttl: 64, flags: 'N/A',
    info: 'Standard query TXT a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6.tunnel.exfil.net',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false, urg: false }
  }
];

// 5. C2 Outbound Beaconing Fixture (T1071 - Periodic egress interval)
export const C2_BEACON_FIXTURE: Packet[] = [
  {
    id: 501, no: 501, timestamp: '12:20:00',
    sourceIp: '192.168.1.20', destinationIp: '203.0.113.45',
    sourcePort: 49160, destinationPort: 8443, protocol: 'TCP',
    length: 128, ttl: 64, flags: 'PSH, ACK',
    info: '49160 → 8443 [PSH, ACK] Periodic Telemetry Beacon',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: true, psh: true, fin: false, rst: false, urg: false }
  },
  {
    id: 502, no: 502, timestamp: '12:20:05',
    sourceIp: '192.168.1.20', destinationIp: '203.0.113.45',
    sourcePort: 49160, destinationPort: 8443, protocol: 'TCP',
    length: 128, ttl: 64, flags: 'PSH, ACK',
    info: '49160 → 8443 [PSH, ACK] Periodic Telemetry Beacon',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: true, psh: true, fin: false, rst: false, urg: false }
  },
  {
    id: 503, no: 503, timestamp: '12:20:10',
    sourceIp: '192.168.1.20', destinationIp: '203.0.113.45',
    sourcePort: 49160, destinationPort: 8443, protocol: 'TCP',
    length: 128, ttl: 64, flags: 'PSH, ACK',
    info: '49160 → 8443 [PSH, ACK] Periodic Telemetry Beacon',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: true, psh: true, fin: false, rst: false, urg: false }
  }
];

// 6. Abnormal TCP Flag Combination Fixture (T1046)
export const ABNORMAL_FLAGS_FIXTURE: Packet[] = [
  {
    id: 601, no: 601, timestamp: '12:25:01',
    sourceIp: '192.168.1.180', destinationIp: '192.168.1.10',
    sourcePort: 58123, destinationPort: 80, protocol: 'TCP',
    length: 54, ttl: 64, flags: 'NONE',
    info: '58123 → 80 [NONE] NULL Scan Probe',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false, urg: false }
  },
  {
    id: 602, no: 602, timestamp: '12:25:02',
    sourceIp: '192.168.1.180', destinationIp: '192.168.1.10',
    sourcePort: 58124, destinationPort: 80, protocol: 'TCP',
    length: 54, ttl: 64, flags: 'FIN, PSH, URG',
    info: '58124 → 80 [FIN, PSH, URG] Xmas Tree Scan Probe',
    isSuspicious: false,
    tcpFlags: { syn: false, ack: false, psh: true, fin: true, rst: false, urg: true }
  },
  {
    id: 603, no: 603, timestamp: '12:25:03',
    sourceIp: '192.168.1.180', destinationIp: '192.168.1.10',
    sourcePort: 58125, destinationPort: 80, protocol: 'TCP',
    length: 54, ttl: 64, flags: 'SYN, FIN',
    info: '58125 → 80 [SYN, FIN] Evasion Scan Probe',
    isSuspicious: false,
    tcpFlags: { syn: true, ack: false, psh: false, fin: true, rst: false, urg: false }
  }
];
