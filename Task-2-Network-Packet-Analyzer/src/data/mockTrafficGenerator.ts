import { Packet, ThreatAlert, NetworkInterface, SavedSession } from '../types';

export const INITIAL_INTERFACES: NetworkInterface[] = [
  { id: 'if1', name: 'Wi-Fi (192.168.1.10)', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:5E', type: 'Wireless', isPromiscuous: true },
  { id: 'if2', name: 'Ethernet (10.0.0.5)', ip: '10.0.0.5', mac: '70:85:C2:A1:3B:90', type: 'Ethernet', isPromiscuous: false },
  { id: 'if3', name: 'Loopback (127.0.0.1)', ip: '127.0.0.1', mac: '00:00:00:00:00:00', type: 'Loopback', isPromiscuous: false },
  { id: 'if4', name: 'docker0 (172.17.0.1)', ip: '172.17.0.1', mac: '02:42:19:8B:2A:F1', type: 'Virtual', isPromiscuous: true },
];

const KNOWN_HOSTS: Record<string, string> = {
  '192.168.1.10': 'admin-laptop.local',
  '192.168.1.1': 'gateway.router.home',
  '192.168.1.15': 'nas-server.local',
  '192.168.1.8': 'smart-tv.local',
  '8.8.8.8': 'dns.google',
  '1.1.1.1': 'one.one.one.one',
  '142.250.190.78': 'google-services.com',
  '203.0.113.45': 'unknown-external-node.net',
  '192.168.1.110': 'security-scanner.internal',
};

function randomHexBytes(length: number): string {
  const hexChars = '0123456789ABCDEF';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += hexChars[Math.floor(Math.random() * 16)];
    if (i % 2 === 1 && i < length - 1) result += ' ';
  }
  return result;
}

function hexToAscii(hexString: string): string {
  const cleanHex = hexString.replace(/\s+/g, '');
  let ascii = '';
  for (let i = 0; i < cleanHex.length; i += 2) {
    const code = parseInt(cleanHex.substring(i, i + 2), 16);
    if (code >= 32 && code <= 126) {
      ascii += String.fromCharCode(code);
    } else {
      ascii += '.';
    }
  }
  return ascii;
}

export function generateSamplePackets(count: number = 30): Packet[] {
  const protocols: Packet['protocol'][] = ['TCP', 'UDP', 'ICMP', 'ARP', 'DNS', 'HTTP', 'HTTPS', 'DHCP'];
  const ips = ['192.168.1.10', '192.168.1.15', '192.168.1.1', '142.250.190.78', '8.8.8.8', '203.0.113.45', '10.0.0.5', '192.168.1.110'];
  const ports = [80, 443, 53, 22, 8080, 52344, 51514, 51513, 62000, 67];

  const packets: Packet[] = [];
  const baseTime = new Date(Date.now() - count * 1000);

  for (let i = 1; i <= count; i++) {
    const timestamp = new Date(baseTime.getTime() + i * 1000).toISOString().substr(11, 8);
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const srcIp = ips[Math.floor(Math.random() * ips.length)];
    let dstIp = ips[Math.floor(Math.random() * ips.length)];
    while (dstIp === srcIp) {
      dstIp = ips[Math.floor(Math.random() * ips.length)];
    }

    const srcPort = ports[Math.floor(Math.random() * ports.length)];
    const dstPort = ports[Math.floor(Math.random() * ports.length)];
    const length = Math.floor(Math.random() * 800) + 54;
    const ttl = Math.floor(Math.random() * 64) + 64;

    let flags = 'ACK';
    let info = '';
    let isSuspicious = false;
    let threatType: string | undefined;
    let threatSeverity: Packet['threatSeverity'];

    if (protocol === 'TCP') {
      flags = ['SYN', 'ACK', 'PSH, ACK', 'FIN, ACK', 'RST'][Math.floor(Math.random() * 5)];
      info = dstPort === 443 ? 'TLSv1.3 Application Data' : dstPort === 80 ? 'HTTP GET /index.html' : `${srcPort} → ${dstPort} [${flags}] Seq=1 Ack=1 Win=502 Len=${length - 54}`;
    } else if (protocol === 'UDP') {
      flags = 'N/A';
      info = dstPort === 53 ? 'Standard query 0xfa2b A google.com' : `Source port: ${srcPort} Destination port: ${dstPort} Len=${length}`;
    } else if (protocol === 'ICMP') {
      flags = 'N/A';
      info = 'Echo (ping) request id=0x0001, seq=1/256, ttl=64';
    } else if (protocol === 'ARP') {
      flags = 'N/A';
      info = `Who has ${dstIp}? Tell ${srcIp}`;
    } else if (protocol === 'DNS') {
      flags = 'N/A';
      info = 'Standard query response 0xfa2b A google.com A 142.250.190.78';
    } else if (protocol === 'HTTP') {
      flags = 'PSH, ACK';
      info = 'HTTP/1.1 200 OK (text/html)';
    } else if (protocol === 'HTTPS') {
      flags = 'ACK';
      info = 'Application Data [Client Hello] TLSv1.3';
    } else {
      flags = 'ACK';
      info = 'DHCP Request - Transaction ID 0x3d1d4a';
    }

    // Occasional simulated threat
    if (i % 7 === 0) {
      isSuspicious = true;
      threatType = 'Port Scan Detected';
      threatSeverity = 'High';
      info = `[SUSPICIOUS] Port scan detected on ${dstIp}`;
    } else if (i % 12 === 0) {
      isSuspicious = true;
      threatType = 'Ping Flood';
      threatSeverity = 'Medium';
      info = `[ALERT] ICMP ping flood from ${srcIp}`;
    }

    const payloadHex = randomHexBytes(Math.min(length, 64));
    const payloadAscii = hexToAscii(payloadHex);

    packets.push({
      no: 24580 + i,
      timestamp,
      sourceIp: srcIp,
      destinationIp: dstIp,
      sourcePort: srcPort,
      destinationPort: dstPort,
      protocol,
      length,
      ttl,
      flags,
      macSource: '00:1A:2B:3C:4D:5E',
      macDest: '14:22:33:44:55:66',
      hostnameSource: KNOWN_HOSTS[srcIp],
      hostnameDest: KNOWN_HOSTS[dstIp],
      info,
      payloadHex,
      payloadAscii,
      isSuspicious,
      threatType,
      threatSeverity,
    });
  }

  return packets.reverse();
}

export const INITIAL_ALERTS: ThreatAlert[] = [
  {
    id: 'alt-1',
    timestamp: '10:35:21',
    alertType: 'Port Scan Detected',
    sourceIp: '192.168.1.110',
    destIp: '192.168.1.10',
    description: 'Port scan detected on 192.168.1.10 (22 ports probed in 1.2s)',
    severity: 'High',
    status: 'New',
    packetNo: 24590,
    details: 'Sequential SYN connection attempts across ports 21, 22, 23, 80, 443, 8080 without completion.',
    mitreId: 'T1046 - Network Service Discovery',
    recommendedAction: 'Block IP 192.168.1.110 at perimeter firewall and inspect host logs.',
  },
  {
    id: 'alt-2',
    timestamp: '10:34:11',
    alertType: 'Ping Flood',
    sourceIp: '192.168.1.15',
    destIp: '192.168.1.1',
    description: 'ICMP ping flood detected (>120 pings/sec)',
    severity: 'Medium',
    status: 'New',
    packetNo: 24588,
    details: 'High frequency ICMP Echo Request packets sent with zero payload interval.',
    mitreId: 'T1498 - Network Denial of Service',
    recommendedAction: 'Rate limit ICMP packets on internal network switches.',
  },
  {
    id: 'alt-3',
    timestamp: '10:33:02',
    alertType: 'Suspicious IP',
    sourceIp: '203.0.113.45',
    destIp: '192.168.1.10',
    description: 'Suspicious activity from flagged threat intelligence IP 203.0.113.45',
    severity: 'High',
    status: 'Investigating',
    packetNo: 24584,
    details: 'Incoming traffic matches known C2 malware botnet IP blacklist database.',
    mitreId: 'T1071 - Application Layer Protocol',
    recommendedAction: 'Isolate affected host 192.168.1.10 and initiate incident response.',
  },
  {
    id: 'alt-4',
    timestamp: '10:32:45',
    alertType: 'Large Packet Flood',
    sourceIp: '192.168.1.8',
    destIp: '255.255.255.255',
    description: 'Large packet flood detected (>1500 bytes UDP broadcast)',
    severity: 'Medium',
    status: 'New',
    packetNo: 24565,
    details: 'Continuous max MTU frame generation overwhelming subnet broadcast domain.',
    mitreId: 'T1499 - Endpoint Denial of Service',
    recommendedAction: 'Check smart-tv.local device for firmware compromise or software bug.',
  },
];

export const INITIAL_SAVED_SESSIONS: SavedSession[] = [
  {
    id: 'cap-1',
    fileName: 'capture_2026-08-04_10-30-00.pcap',
    date: '2026-08-04 10:30',
    duration: '00:10:00',
    packetsCount: 12456,
    fileSize: '5.2 MB',
    packets: generateSamplePackets(15),
  },
  {
    id: 'cap-2',
    fileName: 'capture_2026-08-04_09-15-00.pcap',
    date: '2026-08-04 09:15',
    duration: '00:08:00',
    packetsCount: 8745,
    fileSize: '3.1 MB',
    packets: generateSamplePackets(10),
  },
  {
    id: 'cap-3',
    fileName: 'port_scan_incident_analysis.pcap',
    date: '2026-08-03 14:20',
    duration: '00:12:00',
    packetsCount: 15678,
    fileSize: '6.8 MB',
    packets: generateSamplePackets(20),
  },
];
