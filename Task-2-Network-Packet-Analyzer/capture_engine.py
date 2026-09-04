#!/usr/bin/env python3
"""
Sovereign Network Packet Analyzer - Capture Engine & Decapsulator
Handles real-time Linux AF_PACKET raw socket sniffing, binary PCAP parsing,
protocol decoding (L2-L7), bitwise TCP flag inspection, and heuristic threat detection.
"""

import sys
import os
import socket
import struct
import binascii
import json
import time
import select

def mac_to_str(mac_bytes):
    return ':'.join(f'{b:02x}' for b in mac_bytes)

def ip_to_str(ip_bytes):
    return '.'.join(str(b) for b in ip_bytes)

def format_hex_dump(data_bytes):
    """Formats byte array into standard Wireshark-style 16-byte offset hex + ASCII dump."""
    lines = []
    for i in range(0, len(data_bytes), 16):
        chunk = data_bytes[i:i+16]
        hex_parts = [f'{b:02x}' for b in chunk]
        first_half = ' '.join(hex_parts[:8])
        second_half = ' '.join(hex_parts[8:])
        hex_str = f"{first_half:<23}  {second_half:<23}"
        
        ascii_str = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in chunk)
        lines.append(f"{i:04x}   {hex_str}   {ascii_str}")
    return '\n'.join(lines) if lines else '0000   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................'

class ThreatDetector:
    def __init__(self):
        self.syn_history = {} # src_ip -> list of (timestamp, dst_port)
        self.icmp_history = {} # src_ip -> list of timestamp
        self.known_suspicious_ips = {'203.0.113.45', '198.51.100.23', '192.168.1.110'}
        self.arp_table = {} # ip -> mac

    def evaluate(self, packet):
        alerts = []
        now = time.time()
        src_ip = packet.get('sourceIp', '')
        dst_ip = packet.get('destinationIp', '')
        proto = packet.get('protocol', '')
        dst_port = packet.get('destinationPort', 0)
        src_port = packet.get('sourcePort', 0)
        tcp_flags = packet.get('tcpFlags', {})

        # 1. SYN Port Scan Detection (Reconnaissance T1046)
        if proto == 'TCP' and tcp_flags.get('syn') and not tcp_flags.get('ack'):
            if src_ip not in self.syn_history:
                self.syn_history[src_ip] = []
            self.syn_history[src_ip].append((now, dst_port))
            # Clean older than 5 seconds
            self.syn_history[src_ip] = [(t, p) for t, p in self.syn_history[src_ip] if now - t < 5.0]
            unique_ports = len(set(p for _, p in self.syn_history[src_ip]))
            if unique_ports >= 4:
                alerts.append({
                    'type': 'SYN Port Scan Detected',
                    'severity': 'High',
                    'description': f'Host {src_ip} initiated sequential SYN probes across {unique_ports} distinct ports within 5s.',
                    'mitre': 'T1046 - Network Service Discovery',
                    'action': f'Rate-limit or block ingress SYN packets from {src_ip}.'
                })

        # 2. Abnormal TCP Flag Combinations (T1046)
        if proto == 'TCP':
            syn = tcp_flags.get('syn', False)
            ack = tcp_flags.get('ack', False)
            fin = tcp_flags.get('fin', False)
            rst = tcp_flags.get('rst', False)
            psh = tcp_flags.get('psh', False)
            urg = tcp_flags.get('urg', False)

            if not any([syn, ack, fin, rst, psh, urg]):
                alerts.append({
                    'type': 'Abnormal TCP Flag Combination',
                    'severity': 'High',
                    'description': f'NULL scan (no flags set) detected from {src_ip} targeting port {dst_port}.',
                    'mitre': 'T1046 - Network Service Discovery',
                    'action': f'Block TCP packets with zero flags from {src_ip}.'
                })
            elif fin and psh and urg:
                alerts.append({
                    'type': 'Abnormal TCP Flag Combination',
                    'severity': 'High',
                    'description': f'Xmas tree scan (FIN+PSH+URG) detected from {src_ip} targeting port {dst_port}.',
                    'mitre': 'T1046 - Network Service Discovery',
                    'action': f'Drop invalid TCP flag combination packets at perimeter.'
                })
            elif syn and fin:
                alerts.append({
                    'type': 'Abnormal TCP Flag Combination',
                    'severity': 'High',
                    'description': f'SYN+FIN evasion scan detected from {src_ip} targeting port {dst_port}.',
                    'mitre': 'T1046 - Network Service Discovery',
                    'action': f'Drop SYN+FIN packets and inspect firewall inspection state.'
                })

        # 3. ICMP Echo Flood Detection (DoS T1498)
        if proto == 'ICMP':
            if src_ip not in self.icmp_history:
                self.icmp_history[src_ip] = []
            self.icmp_history[src_ip].append(now)
            self.icmp_history[src_ip] = [t for t in self.icmp_history[src_ip] if now - t < 2.0]
            if len(self.icmp_history[src_ip]) >= 15:
                alerts.append({
                    'type': 'ICMP Echo Flood',
                    'severity': 'Medium',
                    'description': f'High frequency ICMP traffic ({len(self.icmp_history[src_ip])} echo requests in 2s) from {src_ip}.',
                    'mitre': 'T1498 - Network Denial of Service',
                    'action': f'Throttle ICMP echo requests on gateway interface.'
                })

        # 4. Threat Intelligence / Suspicious C2 IP
        if src_ip in self.known_suspicious_ips:
            alerts.append({
                'type': 'Suspicious C2 Node Beacon',
                'severity': 'High',
                'description': f'Inbound packet matches threat intelligence watchlist node {src_ip}.',
                'mitre': 'T1071 - Application Layer Protocol',
                'action': f'Isolate local destination host {dst_ip} and review firewall logs.'
            })

        # 5. Unusual Backdoor Destination Port (T1571)
        high_risk_ports = {4444, 31337, 6667, 1337}
        if dst_port in high_risk_ports or src_port in high_risk_ports:
            p = dst_port if dst_port in high_risk_ports else src_port
            alerts.append({
                'type': 'Unusual Destination Port Observed',
                'severity': 'High',
                'description': f'Traffic targeting known high-risk/backdoor port {p} ({proto}).',
                'mitre': 'T1571 - Non-Standard Port',
                'action': f'Inspect process listening on port {p} and verify perimeter ACL.'
            })

        # 6. Large Broadcast Flood (T1499)
        if dst_ip == '255.255.255.255' and packet.get('length', 0) > 1200:
            alerts.append({
                'type': 'Large Broadcast Flood',
                'severity': 'Low',
                'description': f'Oversized broadcast datagram ({packet.get("length")} bytes) from {src_ip}.',
                'mitre': 'T1499 - Endpoint Denial of Service',
                'action': 'Verify endpoint DHCP / mDNS configuration.'
            })

        # 7. ARP Poisoning / Conflicting MAC Binding (T1557.002)
        if proto == 'ARP':
            src_mac = packet.get('macSource', '')
            if src_ip and src_mac and src_mac not in ('00:00:00:00:00:00', 'ff:ff:ff:ff:ff:ff'):
                if src_ip in self.arp_table and self.arp_table[src_ip].lower() != src_mac.lower():
                    alerts.append({
                        'type': 'ARP Poisoning / Duplicate IP Anomaly',
                        'severity': 'Critical',
                        'description': f'Conflicting MAC binding: Host {src_ip} claimed by {src_mac} (previously {self.arp_table[src_ip]}).',
                        'mitre': 'T1557.002 - Adversary-in-the-Middle: ARP Poisoning',
                        'action': 'Enable Dynamic ARP Inspection (DAI) on local switchports.'
                    })
                else:
                    self.arp_table[src_ip] = src_mac

        return alerts

def decode_ethernet_frame(raw_data, packet_seq=1):
    """Dissects raw layer 2 frame into structured JSON packet."""
    if len(raw_data) < 14:
        return None

    # L2: Ethernet II header (14 bytes)
    eth_header = raw_data[:14]
    eth = struct.unpack('!6s6sH', eth_header)
    dst_mac = mac_to_str(eth[0])
    src_mac = mac_to_str(eth[1])
    eth_type = socket.ntohs(eth[2])

    now_str = time.strftime('%H:%M:%S', time.localtime()) + f".{int(time.time()*1000)%1000:03d}"

    packet = {
        'id': packet_seq,
        'no': packet_seq,
        'timestamp': now_str,
        'length': len(raw_data),
        'macSource': src_mac,
        'macDest': dst_mac,
        'protocol': 'ETH',
        'sourceIp': src_mac,
        'destinationIp': dst_mac,
        'sourcePort': 0,
        'destinationPort': 0,
        'ttl': 64,
        'flags': 'N/A',
        'info': f'Ethernet II Frame (Type 0x{eth_type:04x})',
        'hexDump': format_hex_dump(raw_data[:256]),
        'payloadHex': binascii.hexlify(raw_data[:64]).decode('ascii'),
        'payloadAscii': ''.join(chr(b) if 32 <= b <= 126 else '.' for b in raw_data[:64]),
        'isSuspicious': False,
        'tcpFlags': {'syn': False, 'ack': False, 'psh': False, 'fin': False, 'rst': False}
    }

    # IPv4 (EtherType 0x0800 -> 2048)
    if eth_type == 2048 and len(raw_data) >= 34:
        ip_header = raw_data[14:34]
        iph = struct.unpack('!BBHHHBBH4s4s', ip_header)
        version_ihl = iph[0]
        ihl = (version_ihl & 0xF) * 4
        ttl = iph[5]
        protocol_num = iph[6]
        src_ip = ip_to_str(iph[8])
        dst_ip = ip_to_str(iph[9])

        packet['sourceIp'] = src_ip
        packet['destinationIp'] = dst_ip
        packet['ttl'] = ttl

        payload_start = 14 + ihl

        # TCP (Protocol 6)
        if protocol_num == 6 and len(raw_data) >= payload_start + 20:
            packet['protocol'] = 'TCP'
            tcp_header = raw_data[payload_start:payload_start+20]
            tcph = struct.unpack('!HHLLBBHHH', tcp_header)
            src_port = tcph[0]
            dst_port = tcph[1]
            seq_num = tcph[2]
            ack_num = tcph[3]
            offset_reserved = tcph[4]
            tcp_offset = (offset_reserved >> 4) * 4
            flags_byte = tcph[5]

            fin = bool(flags_byte & 0x01)
            syn = bool(flags_byte & 0x02)
            rst = bool(flags_byte & 0x04)
            psh = bool(flags_byte & 0x08)
            ack = bool(flags_byte & 0x10)
            urg = bool(flags_byte & 0x20)

            active_flags = []
            if syn: active_flags.append('SYN')
            if ack: active_flags.append('ACK')
            if psh: active_flags.append('PSH')
            if fin: active_flags.append('FIN')
            if rst: active_flags.append('RST')
            if urg: active_flags.append('URG')

            packet['sourcePort'] = src_port
            packet['destinationPort'] = dst_port
            packet['flags'] = ', '.join(active_flags) if active_flags else 'NONE'
            packet['tcpFlags'] = {'syn': syn, 'ack': ack, 'psh': psh, 'fin': fin, 'rst': rst, 'urg': urg}

            app_payload = raw_data[payload_start + tcp_offset:]
            if dst_port == 80 or src_port == 80 or dst_port == 8080 or src_port == 8080:
                packet['protocol'] = 'HTTP'
                try:
                    head = app_payload[:120].decode('latin-1', errors='ignore')
                    first_line = head.split('\r\n')[0] if '\r\n' in head else head
                    packet['info'] = f"HTTP {first_line[:40]}"
                except Exception:
                    packet['info'] = f"{src_port} → {dst_port} [HTTP] Len={len(app_payload)}"
            elif dst_port == 443 or src_port == 443:
                packet['protocol'] = 'HTTPS'
                packet['info'] = f"{src_port} → {dst_port} [TLSv1.3 Application Data] Len={len(app_payload)}"
            else:
                packet['info'] = f"{src_port} → {dst_port} [{packet['flags']}] Seq={seq_num} Ack={ack_num} Len={len(app_payload)}"

        # UDP (Protocol 17)
        elif protocol_num == 17 and len(raw_data) >= payload_start + 8:
            packet['protocol'] = 'UDP'
            udp_header = raw_data[payload_start:payload_start+8]
            udph = struct.unpack('!HHHH', udp_header)
            src_port = udph[0]
            dst_port = udph[1]
            udp_len = udph[2]

            packet['sourcePort'] = src_port
            packet['destinationPort'] = dst_port

            if src_port == 53 or dst_port == 53:
                packet['protocol'] = 'DNS'
                packet['info'] = f"DNS Query/Response ({src_port} → {dst_port}) Len={udp_len}"
            elif src_port == 67 or dst_port == 67 or src_port == 68 or dst_port == 68:
                packet['protocol'] = 'DHCP'
                packet['info'] = f"DHCP Discover/Offer Transaction Len={udp_len}"
            else:
                packet['info'] = f"UDP Datagram {src_port} → {dst_port} Len={udp_len}"

        # ICMP (Protocol 1)
        elif protocol_num == 1 and len(raw_data) >= payload_start + 4:
            packet['protocol'] = 'ICMP'
            icmp_header = raw_data[payload_start:payload_start+4]
            icmph = struct.unpack('!BBH', icmp_header)
            icmp_type = icmph[0]
            icmp_code = icmph[1]
            type_name = "Echo Request" if icmp_type == 8 else ("Echo Reply" if icmp_type == 0 else f"Type {icmp_type}")
            packet['info'] = f"ICMP {type_name} (code={icmp_code}) TTL={ttl}"

        else:
            packet['protocol'] = 'IPv4'
            packet['info'] = f"IPv4 Protocol {protocol_num} from {src_ip} to {dst_ip}"

    # IPv6 (EtherType 0x86dd -> 34525)
    elif eth_type == 34525 and len(raw_data) >= 54:
        packet['protocol'] = 'IPv6'
        ip6_header = raw_data[14:54]
        try:
            ip6h = struct.unpack('!IHBB16s16s', ip6_header)
            next_header = ip6h[2]
            hop_limit = ip6h[3]
            src6 = socket.inet_ntop(socket.AF_INET6, ip6h[4])
            dst6 = socket.inet_ntop(socket.AF_INET6, ip6h[5])
            packet['sourceIp'] = src6
            packet['destinationIp'] = dst6
            packet['ttl'] = hop_limit
            packet['info'] = f"IPv6 NextHeader={next_header} HopLimit={hop_limit}"
        except Exception:
            packet['info'] = "IPv6 Datagram"

    # ARP (EtherType 0x0806 -> 2054)
    elif eth_type == 2054 and len(raw_data) >= 42:
        packet['protocol'] = 'ARP'
        arp_data = raw_data[14:42]
        arph = struct.unpack('!HHBBH6s4s6s4s', arp_data)
        op = arph[4]
        s_mac = mac_to_str(arph[5])
        s_ip = ip_to_str(arph[6])
        t_mac = mac_to_str(arph[7])
        t_ip = ip_to_str(arph[8])
        packet['sourceIp'] = s_ip
        packet['destinationIp'] = t_ip
        if op == 1:
            packet['info'] = f"Who has {t_ip}? Tell {s_ip}"
        else:
            packet['info'] = f"{s_ip} is at {s_mac}"

    return packet

def run_live_capture(interface="eth0", promiscuous=True):
    detector = ThreatDetector()
    raw_sock = None

    if hasattr(socket, 'AF_PACKET'):
        try:
            raw_sock = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(0x0003))
            if interface and interface != "all":
                try:
                    raw_sock.bind((interface, 0))
                except Exception as be:
                    sys.stderr.write(f"Warning: unable to bind directly to {interface}: {be}\n")
        except Exception as e:
            sys.stderr.write(f"RAW_SOCKET_UNAVAILABLE: AF_PACKET binding failed ({e})\n")
            sys.exit(2)
    elif os.name == 'nt':
        try:
            raw_sock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_IP)
            host = socket.gethostbyname(socket.gethostname())
            raw_sock.bind((host, 0))
            raw_sock.ioctl(socket.SIO_RCVALL, socket.RCVALL_ON)
        except Exception as we:
            sys.stderr.write(f"RAW_SOCKET_UNAVAILABLE: Windows raw IP socket requires Administrator privileges or Npcap ({we})\n")
            sys.exit(2)
    else:
        sys.stderr.write("RAW_SOCKET_UNAVAILABLE: Operating system raw socket access not supported in this environment.\n")
        sys.exit(2)

    packet_id = 0
    sys.stderr.write(f"Capture Engine ACTIVE on {interface} (Promiscuous={promiscuous})\n")
    sys.stderr.flush()

    while True:
        try:
            rlist, _, _ = select.select([raw_sock], [], [], 0.5)
            if not rlist:
                continue
            raw_data, _ = raw_sock.recvfrom(65535)
            if not raw_data:
                continue

            packet_id += 1
            pkt = decode_ethernet_frame(raw_data, packet_seq=packet_id)
            if pkt:
                alerts = detector.evaluate(pkt)
                if alerts:
                    pkt['isSuspicious'] = True
                    pkt['threatType'] = alerts[0]['type']
                    pkt['threatSeverity'] = alerts[0]['severity']
                    pkt['alerts'] = alerts

                # Output single JSON line to stdout
                sys.stdout.write(json.dumps(pkt) + "\n")
                sys.stdout.flush()

        except KeyboardInterrupt:
            break
        except Exception as ex:
            sys.stderr.write(f"Capture loop error: {ex}\n")
            time.sleep(0.1)

def parse_pcap_file(filepath):
    """Parses binary Libpcap (.pcap) and PCAPNG (.pcapng) format files into structured JSON."""
    if not os.path.exists(filepath):
        sys.stderr.write(f"File not found: {filepath}\n")
        return

    detector = ThreatDetector()
    packets = []
    try:
        with open(filepath, 'rb') as f:
            header_magic = f.read(4)
            if len(header_magic) < 4:
                sys.stderr.write("Invalid PCAP file length\n")
                return

            magic = struct.unpack('!I', header_magic)[0]

            # 1. PCAPNG Format (0x0A0D0D0A)
            if magic == 0x0A0D0D0A:
                f.seek(0)
                pkt_idx = 0
                while True:
                    hdr = f.read(8)
                    if len(hdr) < 8:
                        break
                    btype, blen = struct.unpack('<II', hdr)
                    if blen < 12:
                        break
                    body_len = blen - 12
                    body = f.read(body_len)
                    f.read(4) # trailing total length

                    # Enhanced Packet Block (EPB = 0x00000006)
                    if btype == 0x00000006 and len(body) >= 20:
                        iface_id, ts_high, ts_low, cap_len, orig_len = struct.unpack('<IIIII', body[:20])
                        pkt_data = body[20:20 + cap_len]
                        pkt_idx += 1
                        pkt = decode_ethernet_frame(pkt_data, packet_seq=pkt_idx)
                        if pkt:
                            ts_micro = ((ts_high << 32) | ts_low) // 1000000
                            pkt['timestamp'] = time.strftime('%H:%M:%S', time.localtime(ts_micro if ts_micro > 0 else time.time()))
                            alerts = detector.evaluate(pkt)
                            if alerts:
                                pkt['isSuspicious'] = True
                                pkt['threatType'] = alerts[0]['type']
                                pkt['threatSeverity'] = alerts[0]['severity']
                                pkt['alerts'] = alerts
                            packets.append(pkt)

            # 2. Standard Classic Libpcap Format
            else:
                f.seek(0)
                global_header = f.read(24)
                if len(global_header) < 24:
                    sys.stderr.write("Invalid PCAP file length\n")
                    return

                magic = struct.unpack('!I', global_header[:4])[0]
                is_big_endian = (magic == 0xa1b2c3d4)
                endian = '>' if is_big_endian else '<'

                pkt_idx = 0
                while True:
                    pkt_header = f.read(16)
                    if len(pkt_header) < 16:
                        break
                    ts_sec, ts_usec, incl_len, orig_len = struct.unpack(f'{endian}IIII', pkt_header)
                    pkt_data = f.read(incl_len)
                    if len(pkt_data) < incl_len:
                        break

                    pkt_idx += 1
                    pkt = decode_ethernet_frame(pkt_data, packet_seq=pkt_idx)
                    if pkt:
                        tm = time.strftime('%H:%M:%S', time.localtime(ts_sec)) + f".{ts_usec//1000:03d}"
                        pkt['timestamp'] = tm
                        alerts = detector.evaluate(pkt)
                        if alerts:
                            pkt['isSuspicious'] = True
                            pkt['threatType'] = alerts[0]['type']
                            pkt['threatSeverity'] = alerts[0]['severity']
                            pkt['alerts'] = alerts
                        packets.append(pkt)

        sys.stdout.write(json.dumps({'status': 'success', 'count': len(packets), 'packets': packets}) + "\n")
        sys.stdout.flush()
    except Exception as e:
        sys.stderr.write(f"PCAP parsing error: {e}\n")
        sys.exit(1)

if __name__ == '__main__':
    mode = 'live'
    iface = 'eth0'
    if len(sys.argv) > 1:
        mode = sys.argv[1]
    if len(sys.argv) > 2:
        iface = sys.argv[2]

    if mode == 'live':
        run_live_capture(interface=iface)
    elif mode == 'pcap' and len(sys.argv) > 2:
        parse_pcap_file(sys.argv[2])
    else:
        sys.stderr.write("Usage: capture_engine.py [live <interface>] | [pcap <filepath>]\n")
