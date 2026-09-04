import { Packet } from '../types';

export const DETERMINISTIC_DEMO_PACKETS: Packet[] = [
  {
    id: 1, no: 1, timestamp: "10:00:01", sourceIp: "192.168.1.10", destinationIp: "8.8.8.8",
    sourcePort: 54321, destinationPort: 53, protocol: "DNS", length: 74, ttl: 64,
    flags: "N/A", macSource: "00:1a:2b:3c:4d:5e", macDest: "fa:16:3e:89:12:a4",
    info: "Standard query 0x2b4f A api.github.com",
    payloadHex: "0000   45 00 00 4a 1a 2b 40 00  40 11 4a 2c c0 a8 01 0a   E..J.@.@.J,.....\n0010   08 08 08 08 d4 31 00 35  00 36 12 34 2b 4f 01 00   .....1.5.6.4+O..\n0020   00 01 00 00 00 00 00 00  03 61 70 69 06 67 69 74   .........api.git",
    hexDump: "0000   45 00 00 4a 1a 2b 40 00  40 11 4a 2c c0 a8 01 0a   E..J.@.@.J,.....\n0010   08 08 08 08 d4 31 00 35  00 36 12 34 2b 4f 01 00   .....1.5.6.4+O..\n0020   00 01 00 00 00 00 00 00  03 61 70 69 06 67 69 74   .........api.git",
    payloadAscii: "E..J.@.@.J,..........1.5.6.4+O...........api.git",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 2, no: 2, timestamp: "10:00:02", sourceIp: "8.8.8.8", destinationIp: "192.168.1.10",
    sourcePort: 53, destinationPort: 54321, protocol: "DNS", length: 90, ttl: 58,
    flags: "N/A", macSource: "fa:16:3e:89:12:a4", macDest: "00:1a:2b:3c:4d:5e",
    info: "Standard query response 0x2b4f A api.github.com A 140.82.121.6",
    payloadHex: "0000   45 00 00 5a 2c 3d 40 00  3a 11 3a 1c 08 08 08 08   E..Z,=@.:.:.....\n0010   c0 a8 01 0a 00 35 d4 31  00 46 5a 12 2b 4f 81 80   .....5.1.FZ.+O..\n0020   00 01 00 01 00 00 00 00  03 61 70 69 06 67 69 74   .........api.git",
    hexDump: "0000   45 00 00 5a 2c 3d 40 00  3a 11 3a 1c 08 08 08 08   E..Z,=@.:.:.....\n0010   c0 a8 01 0a 00 35 d4 31  00 46 5a 12 2b 4f 81 80   .....5.1.FZ.+O..\n0020   00 01 00 01 00 00 00 00  03 61 70 69 06 67 69 74   .........api.git",
    payloadAscii: "E..Z,=@.:.:..........5.1.FZ.+O...........api.git",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 3, no: 3, timestamp: "10:00:03", sourceIp: "192.168.1.10", destinationIp: "140.82.121.6",
    sourcePort: 49152, destinationPort: 443, protocol: "TCP", length: 66, ttl: 64,
    flags: "SYN", macSource: "00:1a:2b:3c:4d:5e", macDest: "fa:16:3e:89:12:a4",
    info: "49152 → 443 [SYN] Seq=0 Win=65535 Len=0 MSS=1460 WS=64",
    payloadHex: "0000   45 00 00 42 3e 4f 40 00  40 06 2b 1a c0 a8 01 0a   E..B>O@.@.+.....\n0010   8c 52 79 06 c0 00 01 bb  a1 2b 3c 4d 00 00 00 00   .Ry......+<M....\n0020   a0 02 ff ff 12 34 00 00  02 04 05 b4 01 03 03 06   .....4..........",
    hexDump: "0000   45 00 00 42 3e 4f 40 00  40 06 2b 1a c0 a8 01 0a   E..B>O@.@.+.....\n0010   8c 52 79 06 c0 00 01 bb  a1 2b 3c 4d 00 00 00 00   .Ry......+<M....\n0020   a0 02 ff ff 12 34 00 00  02 04 05 b4 01 03 03 06   .....4..........",
    payloadAscii: "E..B>O@.@.+......Ry......+<M.........4..........",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 4, no: 4, timestamp: "10:00:04", sourceIp: "140.82.121.6", destinationIp: "192.168.1.10",
    sourcePort: 443, destinationPort: 49152, protocol: "TCP", length: 66, ttl: 55,
    flags: "SYN, ACK", macSource: "fa:16:3e:89:12:a4", macDest: "00:1a:2b:3c:4d:5e",
    info: "443 → 49152 [SYN, ACK] Seq=0 Ack=1 Win=28960 Len=0 MSS=1460",
    payloadHex: "0000   45 00 00 42 5a 6b 40 00  37 06 1c 0e 8c 52 79 06   E..BZk@.7....Ry.\n0010   c0 a8 01 0a 01 bb c0 00  b2 3c 4d 5e a1 2b 3c 4e   .........<M^.+<N\n0020   a0 12 71 20 4a 2c 00 00  02 04 05 b4 01 03 03 07   ..q J,..........",
    hexDump: "0000   45 00 00 42 5a 6b 40 00  37 06 1c 0e 8c 52 79 06   E..BZk@.7....Ry.\n0010   c0 a8 01 0a 01 bb c0 00  b2 3c 4d 5e a1 2b 3c 4e   .........<M^.+<N\n0020   a0 12 71 20 4a 2c 00 00  02 04 05 b4 01 03 03 07   ..q J,..........",
    payloadAscii: "E..BZk@.7....Ry..........<M^.+<N..q J,..........",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: true, ack: true, psh: false, fin: false, rst: false }
  },
  {
    id: 5, no: 5, timestamp: "10:00:05", sourceIp: "192.168.1.10", destinationIp: "140.82.121.6",
    sourcePort: 49152, destinationPort: 443, protocol: "TCP", length: 54, ttl: 64,
    flags: "ACK", macSource: "00:1a:2b:3c:4d:5e", macDest: "fa:16:3e:89:12:a4",
    info: "49152 → 443 [ACK] Seq=1 Ack=1 Win=65535 Len=0",
    payloadHex: "0000   45 00 00 36 6c 7d 40 00  40 06 fc e8 c0 a8 01 0a   E..6l}@.@.......",
    hexDump: "0000   45 00 00 36 6c 7d 40 00  40 06 fc e8 c0 a8 01 0a   E..6l}@.@.......",
    payloadAscii: "E..6l}@.@.......",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: true, psh: false, fin: false, rst: false }
  },
  {
    id: 6, no: 6, timestamp: "10:00:06", sourceIp: "192.168.1.10", destinationIp: "140.82.121.6",
    sourcePort: 49152, destinationPort: 443, protocol: "HTTPS", length: 517, ttl: 64,
    flags: "PSH, ACK", macSource: "00:1a:2b:3c:4d:5e", macDest: "fa:16:3e:89:12:a4",
    info: "TLSv1.3 Client Hello (SNI: api.github.com)",
    payloadHex: "0000   16 03 01 02 00 01 00 01  fc 03 03 a1 b2 c3 d4 e5   ................",
    hexDump: "0000   16 03 01 02 00 01 00 01  fc 03 03 a1 b2 c3 d4 e5   ................",
    payloadAscii: "................",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: true, psh: true, fin: false, rst: false }
  },
  {
    id: 7, no: 7, timestamp: "10:00:07", sourceIp: "140.82.121.6", destinationIp: "192.168.1.10",
    sourcePort: 443, destinationPort: 49152, protocol: "HTTPS", length: 1450, ttl: 55,
    flags: "PSH, ACK", macSource: "fa:16:3e:89:12:a4", macDest: "00:1a:2b:3c:4d:5e",
    info: "TLSv1.3 Server Hello, Encrypted Extensions, Certificate",
    payloadHex: "0000   16 03 03 00 7a 02 00 00  76 03 03 f1 e2 d3 c4 b5   ....z...v.......",
    hexDump: "0000   16 03 03 00 7a 02 00 00  76 03 03 f1 e2 d3 c4 b5   ....z...v.......",
    payloadAscii: "....z...v.......",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: true, psh: true, fin: false, rst: false }
  },
  {
    id: 8, no: 8, timestamp: "10:00:08", sourceIp: "192.168.1.1", destinationIp: "192.168.1.10",
    sourcePort: 0, destinationPort: 0, protocol: "ARP", length: 42, ttl: 64,
    flags: "N/A", macSource: "fa:16:3e:89:12:a4", macDest: "ff:ff:ff:ff:ff:ff",
    info: "Who has 192.168.1.10? Tell 192.168.1.1",
    payloadHex: "0000   00 01 08 00 06 04 00 01  fa 16 3e 89 12 a4 c0 a8   ..........>.....",
    hexDump: "0000   00 01 08 00 06 04 00 01  fa 16 3e 89 12 a4 c0 a8   ..........>.....",
    payloadAscii: "..........>.....",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 9, no: 9, timestamp: "10:00:09", sourceIp: "192.168.1.10", destinationIp: "192.168.1.1",
    sourcePort: 0, destinationPort: 0, protocol: "ARP", length: 42, ttl: 64,
    flags: "N/A", macSource: "00:1a:2b:3c:4d:5e", macDest: "fa:16:3e:89:12:a4",
    info: "192.168.1.10 is at 00:1a:2b:3c:4d:5e",
    payloadHex: "0000   00 01 08 00 06 04 00 02  00 1a 2b 3c 4d 5e c0 a8   ..........+<M^..",
    hexDump: "0000   00 01 08 00 06 04 00 02  00 1a 2b 3c 4d 5e c0 a8   ..........+<M^..",
    payloadAscii: "..........+<M^..",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 10, no: 10, timestamp: "10:00:10", sourceIp: "192.168.1.10", destinationIp: "8.8.8.8",
    sourcePort: 0, destinationPort: 0, protocol: "ICMP", length: 84, ttl: 64,
    flags: "N/A", macSource: "00:1a:2b:3c:4d:5e", macDest: "fa:16:3e:89:12:a4",
    info: "ICMP Echo (ping) Request id=0x1a2b seq=1 ttl=64",
    payloadHex: "0000   45 00 00 54 8f 90 40 00  40 01 e5 f0 c0 a8 01 0a   E..T..@.@.......",
    hexDump: "0000   45 00 00 54 8f 90 40 00  40 01 e5 f0 c0 a8 01 0a   E..T..@.@.......",
    payloadAscii: "E..T..@.@.......",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 11, no: 11, timestamp: "10:00:11", sourceIp: "8.8.8.8", destinationIp: "192.168.1.10",
    sourcePort: 0, destinationPort: 0, protocol: "ICMP", length: 84, ttl: 58,
    flags: "N/A", macSource: "fa:16:3e:89:12:a4", macDest: "00:1a:2b:3c:4d:5e",
    info: "ICMP Echo (ping) Reply id=0x1a2b seq=1",
    payloadHex: "0000   45 00 00 54 9a 01 40 00  3a 01 da 7f 08 08 08 08   E..T..@.:.......",
    hexDump: "0000   45 00 00 54 9a 01 40 00  3a 01 da 7f 08 08 08 08   E..T..@.:.......",
    payloadAscii: "E..T..@.:.......",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 12, no: 12, timestamp: "10:00:12", sourceIp: "192.168.1.110", destinationIp: "192.168.1.10",
    sourcePort: 61234, destinationPort: 21, protocol: "TCP", length: 60, ttl: 64,
    flags: "SYN", macSource: "b8:27:eb:aa:bb:cc", macDest: "00:1a:2b:3c:4d:5e",
    info: "[DEMO THREAT] 61234 → 21 [SYN] Port Sweep Probe",
    payloadHex: "0000   45 00 00 3c 01 02 40 00  40 06 63 50 c0 a8 01 6e   E..<..@.@.cP..n",
    hexDump: "0000   45 00 00 3c 01 02 40 00  40 06 63 50 c0 a8 01 6e   E..<..@.@.cP..n",
    payloadAscii: "E..<..@.@.cP..n",
    isSuspicious: true,
    threatType: "SYN Port Scan Detected",
    threatSeverity: "High",
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 13, no: 13, timestamp: "10:00:13", sourceIp: "192.168.1.110", destinationIp: "192.168.1.10",
    sourcePort: 61235, destinationPort: 22, protocol: "TCP", length: 60, ttl: 64,
    flags: "SYN", macSource: "b8:27:eb:aa:bb:cc", macDest: "00:1a:2b:3c:4d:5e",
    info: "[DEMO THREAT] 61235 → 22 [SYN] Port Sweep Probe",
    payloadHex: "0000   45 00 00 3c 01 03 40 00  40 06 63 4f c0 a8 01 6e   E..<..@.@.cO..n",
    hexDump: "0000   45 00 00 3c 01 03 40 00  40 06 63 4f c0 a8 01 6e   E..<..@.@.cO..n",
    payloadAscii: "E..<..@.@.cO..n",
    isSuspicious: true,
    threatType: "SYN Port Scan Detected",
    threatSeverity: "High",
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 14, no: 14, timestamp: "10:00:14", sourceIp: "192.168.1.110", destinationIp: "192.168.1.10",
    sourcePort: 61236, destinationPort: 80, protocol: "TCP", length: 60, ttl: 64,
    flags: "SYN", macSource: "b8:27:eb:aa:bb:cc", macDest: "00:1a:2b:3c:4d:5e",
    info: "[DEMO THREAT] 61236 → 80 [SYN] Port Sweep Probe",
    payloadHex: "0000   45 00 00 3c 01 04 40 00  40 06 63 4e c0 a8 01 6e   E..<..@.@.cN..n",
    hexDump: "0000   45 00 00 3c 01 04 40 00  40 06 63 4e c0 a8 01 6e   E..<..@.@.cN..n",
    payloadAscii: "E..<..@.@.cN..n",
    isSuspicious: true,
    threatType: "SYN Port Scan Detected",
    threatSeverity: "High",
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: true, ack: false, psh: false, fin: false, rst: false }
  },
  {
    id: 15, no: 15, timestamp: "10:00:15", sourceIp: "192.168.1.10", destinationIp: "142.250.190.78",
    sourcePort: 51230, destinationPort: 80, protocol: "HTTP", length: 240, ttl: 64,
    flags: "PSH, ACK", macSource: "00:1a:2b:3c:4d:5e", macDest: "fa:16:3e:89:12:a4",
    info: "HTTP GET /health HTTP/1.1 (Host: 142.250.190.78)",
    payloadHex: "0000   47 45 54 20 2f 68 65 61  6c 74 68 20 48 54 54 50   GET /health HTTP\n0010   2f 31 2e 31 0d 0a 48 6f  73 74 3a 20 6c 6f 63 61   /1.1..Host: loca",
    hexDump: "0000   47 45 54 20 2f 68 65 61  6c 74 68 20 48 54 54 50   GET /health HTTP\n0010   2f 31 2e 31 0d 0a 48 6f  73 74 3a 20 6c 6f 63 61   /1.1..Host: loca",
    payloadAscii: "GET /health HTTP/1.1..Host: loca",
    isSuspicious: false,
    captureSource: 'DEMO_MODE',
    tcpFlags: { syn: false, ack: true, psh: true, fin: false, rst: false }
  }
];

export const DEMO_INITIAL_ALERTS = [
  {
    id: 'demo-alt-1',
    timestamp: '10:00:14',
    alertType: 'SYN Port Scan Detected',
    sourceIp: '192.168.1.110',
    destIp: '192.168.1.10',
    description: '[DEMO MODE] Heuristic detection: Inbound TCP SYN sweep across ports 21, 22, 80',
    severity: 'High',
    status: 'New',
    packetNo: 14,
    details: 'Sequential connection initiation without finishing handshake from host 192.168.1.110.',
    mitreId: 'T1046 - Network Service Discovery',
    mitreTechnique: 'T1046 Network Service Discovery',
    recommendedAction: 'Drop incoming SYN packets from 192.168.1.110 at firewall boundary.',
    isSimulation: true
  }
];
