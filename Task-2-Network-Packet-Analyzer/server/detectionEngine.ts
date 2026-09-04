import { Packet, ThreatAlert, AlertSeverity, IOCItem, DetectionRule } from '../src/types';

export class DefensiveDetectionEngine {
  // State histories for correlation
  private synProbes: Map<string, Array<{ time: number; port: number; no: number }>> = new Map();
  private icmpEchoes: Map<string, Array<{ time: number; no: number }>> = new Map();
  private dnsQueries: Map<string, Array<{ time: number; query: string; no: number }>> = new Map();
  private egressConnections: Map<string, Array<{ time: number; dstIp: string; dstPort: number; no: number }>> = new Map();
  private arpBindings: Map<string, string> = new Map(); // ip -> mac
  private synFloods: Map<string, Array<{ time: number; no: number }>> = new Map();
  private udpBursts: Map<string, Array<{ time: number; no: number; port: number }>> = new Map();
  private authProbes: Map<string, Array<{ time: number; no: number; port: number }>> = new Map();
  
  // Active rules
  public rules: DetectionRule[] = [
    {
      id: 'RULE-001',
      name: 'SYN Port Sweep Detection',
      description: 'Multiple TCP SYN probes across distinct ports from single source host within short window.',
      severity: 'High',
      mitreId: 'T1046',
      mitreTechnique: 'Network Service Discovery',
      enabled: true,
      threshold: 4,
      windowSeconds: 5,
      category: 'Reconnaissance'
    },
    {
      id: 'RULE-002',
      name: 'ICMP Echo Flood',
      description: 'High frequency ICMP echo requests targeting network gateway or endpoint.',
      severity: 'Medium',
      mitreId: 'T1498',
      mitreTechnique: 'Network Denial of Service',
      enabled: true,
      threshold: 15,
      windowSeconds: 2,
      category: 'Denial of Service'
    },
    {
      id: 'RULE-003',
      name: 'Potential C2 Outbound Beaconing',
      description: 'Periodic outbound TCP/UDP beaconing to remote endpoint with regular interval.',
      severity: 'High',
      mitreId: 'T1071',
      mitreTechnique: 'Application Layer Protocol',
      enabled: true,
      threshold: 3,
      windowSeconds: 15,
      category: 'Command and Control'
    },
    {
      id: 'RULE-004',
      name: 'DNS Query Rate & Label Anomaly',
      description: 'Unusually high frequency DNS query burst or suspicious long domain label.',
      severity: 'Medium',
      mitreId: 'T1071.004',
      mitreTechnique: 'Application Layer Protocol: DNS',
      enabled: true,
      threshold: 6,
      windowSeconds: 3,
      category: 'Exfiltration / C2'
    },
    {
      id: 'RULE-005',
      name: 'Unusual Destination Port',
      description: 'Traffic targeting high-risk remote administrative or backdoor port (e.g. 4444, 31337, 6667).',
      severity: 'High',
      mitreId: 'T1571',
      mitreTechnique: 'Non-Standard Port',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Lateral Movement / C2'
    },
    {
      id: 'RULE-006',
      name: 'Broadcast Storm / Large Datagram',
      description: 'Oversized datagram directed to local layer 3 broadcast address.',
      severity: 'Low',
      mitreId: 'T1499',
      mitreTechnique: 'Endpoint Denial of Service',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Denial of Service'
    },
    {
      id: 'RULE-007',
      name: 'Abnormal TCP Flag Combination',
      description: 'TCP segment with illicit flag combinations (NULL scan, Xmas scan, or SYN+FIN).',
      severity: 'High',
      mitreId: 'T1046',
      mitreTechnique: 'Network Service Discovery',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Reconnaissance'
    },
    {
      id: 'RULE-008',
      name: 'ARP Spoofing / Duplicate IP Binding',
      description: 'Contradictory MAC address mapping for an established IPv4 host.',
      severity: 'Critical',
      mitreId: 'T1557.002',
      mitreTechnique: 'Adversary-in-the-Middle: ARP Poisoning',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Credential Access / MITM'
    },
    {
      id: 'RULE-009',
      name: 'Configured IOC Watchlist Match',
      description: 'Observed IP, domain, or port matches verified defensive IOC watchlist.',
      severity: 'High',
      mitreId: 'T1071',
      mitreTechnique: 'Application Layer Protocol',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Threat Intelligence'
    },
    {
      id: 'RULE-010',
      name: 'TCP SYN Flood / Rate Exhaustion',
      description: 'Excessive TCP SYN requests targeting endpoint without completing three-way handshake.',
      severity: 'High',
      mitreId: 'T1498',
      mitreTechnique: 'Network Denial of Service',
      enabled: true,
      threshold: 20,
      windowSeconds: 2,
      category: 'Denial of Service'
    },
    {
      id: 'RULE-011',
      name: 'UDP Volumetric Flood',
      description: 'High-volume UDP datagram burst directed against host ports.',
      severity: 'Medium',
      mitreId: 'T1498.001',
      mitreTechnique: 'Direct Network Flood',
      enabled: true,
      threshold: 25,
      windowSeconds: 2,
      category: 'Denial of Service'
    },
    {
      id: 'RULE-012',
      name: 'Brute Force Authentication Probing',
      description: 'Repeated sequential connection probes targeting administrative services (SSH, RDP, FTP).',
      severity: 'High',
      mitreId: 'T1110',
      mitreTechnique: 'Brute Force',
      enabled: true,
      threshold: 5,
      windowSeconds: 3,
      category: 'Credential Access'
    },
    {
      id: 'RULE-013',
      name: 'Lateral Movement / Internal SMB Probing',
      description: 'Internal east-west traffic targeting SMB/RPC services across private subnets.',
      severity: 'Medium',
      mitreId: 'T1021.002',
      mitreTechnique: 'Remote Services: SMB/Windows Admin Shares',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Lateral Movement'
    },
    {
      id: 'RULE-014',
      name: 'Clear-Text Credential Exposure',
      description: 'Unencrypted authentication exchange observed on unencrypted protocol (Telnet, FTP USER/PASS, HTTP Basic Auth).',
      severity: 'High',
      mitreId: 'T1552',
      mitreTechnique: 'Unsecured Credentials',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Credential Access'
    },
    {
      id: 'RULE-015',
      name: 'Oversized / Jumbo Exfiltration Anomaly',
      description: 'Anomalous jumbo frame or oversized single payload observed over egress path.',
      severity: 'Medium',
      mitreId: 'T1041',
      mitreTechnique: 'Exfiltration Over C2 Channel',
      enabled: true,
      threshold: 1,
      windowSeconds: 1,
      category: 'Exfiltration'
    }
  ];

  // Defensive IOC Watchlist
  public iocWatchlist: IOCItem[] = [
    {
      id: 'IOC-001',
      type: 'IP',
      value: '203.0.113.45',
      source: 'Internal Threat Intel',
      addedAt: '2026-08-15',
      notes: 'Confirmed Cobalt Strike C2 listener node',
      severity: 'High'
    },
    {
      id: 'IOC-002',
      type: 'IP',
      value: '198.51.100.23',
      source: 'Perimeter SOC Watchlist',
      addedAt: '2026-08-20',
      notes: 'Known scanning host / Shodan probe',
      severity: 'Medium'
    },
    {
      id: 'IOC-003',
      type: 'PORT',
      value: '4444',
      source: 'Baseline Security Policy',
      addedAt: '2026-08-01',
      notes: 'Default Metasploit payload listener port',
      severity: 'High'
    },
    {
      id: 'IOC-004',
      type: 'PORT',
      value: '31337',
      source: 'Baseline Security Policy',
      addedAt: '2026-08-01',
      notes: 'Historic BackOrifice backdoor port',
      severity: 'High'
    },
    {
      id: 'IOC-005',
      type: 'DOMAIN',
      value: 'c2-beacon.darkops.xyz',
      source: 'Threat Feed',
      addedAt: '2026-08-25',
      notes: 'Observed C2 domain',
      severity: 'Critical'
    }
  ];

  /**
   * Evaluates a single normalized packet against all enabled detection rules.
   * Returns an array of generated ThreatAlert objects (empty if clean).
   */
  public evaluatePacket(packet: Packet, customTimestamp?: number): ThreatAlert[] {
    const alerts: ThreatAlert[] = [];
    const now = customTimestamp || Date.now();
    const pktNo = packet.no || packet.id || 1;
    const srcIp = packet.sourceIp || '';
    const dstIp = packet.destinationIp || '';
    const srcPort = packet.sourcePort || 0;
    const dstPort = packet.destinationPort || 0;
    const proto = (packet.protocol || '').toUpperCase();
    const flags = packet.tcpFlags || {};
    const info = packet.info || '';

    // Rule 1: SYN Port Sweep (T1046)
    const synRule = this.rules.find(r => r.id === 'RULE-001' && r.enabled);
    if (synRule && proto === 'TCP' && flags.syn && !flags.ack) {
      if (!this.synProbes.has(srcIp)) {
        this.synProbes.set(srcIp, []);
      }
      const history = this.synProbes.get(srcIp)!;
      history.push({ time: now, port: dstPort, no: pktNo });
      // Prune window
      const valid = history.filter(h => (now - h.time) <= (synRule.windowSeconds * 1000));
      this.synProbes.set(srcIp, valid);

      const uniquePorts = new Set(valid.map(h => h.port));
      if (uniquePorts.size >= synRule.threshold) {
        alerts.push({
          id: `ALT-SYN-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'SYN Port Scan Detected',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `Source host ${srcIp} initiated sequential TCP SYN probes across ${uniquePorts.size} distinct ports within ${synRule.windowSeconds}s.`,
          severity: synRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: synRule.mitreId,
          mitreTechnique: `${synRule.mitreId} ${synRule.mitreTechnique}`,
          recommendedAction: `Apply rate-limiting or firewall drop rule for ${srcIp} on perimeter ingress.`
        });
      }
    }

    // Rule 2: ICMP Echo Flood (T1498)
    const icmpRule = this.rules.find(r => r.id === 'RULE-002' && r.enabled);
    if (icmpRule && proto === 'ICMP' && info.toLowerCase().includes('echo request')) {
      if (!this.icmpEchoes.has(srcIp)) {
        this.icmpEchoes.set(srcIp, []);
      }
      const history = this.icmpEchoes.get(srcIp)!;
      history.push({ time: now, no: pktNo });
      const valid = history.filter(h => (now - h.time) <= (icmpRule.windowSeconds * 1000));
      this.icmpEchoes.set(srcIp, valid);

      if (valid.length >= icmpRule.threshold) {
        alerts.push({
          id: `ALT-ICMP-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'ICMP Echo Flood Detected',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `High-frequency ICMP Echo burst: ${valid.length} requests observed in ${icmpRule.windowSeconds}s from ${srcIp}.`,
          severity: icmpRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: icmpRule.mitreId,
          mitreTechnique: `${icmpRule.mitreId} ${icmpRule.mitreTechnique}`,
          recommendedAction: 'Enable ICMP rate-limiting on perimeter interfaces and verify endpoint availability.'
        });
      }
    }

    // Rule 3: C2 Outbound Beaconing (T1071)
    const beaconRule = this.rules.find(r => r.id === 'RULE-003' && r.enabled);
    if (beaconRule && (proto === 'TCP' || proto === 'UDP') && dstPort > 1024) {
      const key = `${srcIp}->${dstIp}:${dstPort}`;
      if (!this.egressConnections.has(key)) {
        this.egressConnections.set(key, []);
      }
      const history = this.egressConnections.get(key)!;
      history.push({ time: now, dstIp, dstPort, no: pktNo });
      const valid = history.filter(h => (now - h.time) <= (beaconRule.windowSeconds * 1000));
      this.egressConnections.set(key, valid);

      if (valid.length >= beaconRule.threshold) {
        // Calculate intervals
        const deltas: number[] = [];
        for (let i = 1; i < valid.length; i++) {
          deltas.push(Math.abs(valid[i].time - valid[i - 1].time));
        }
        const meanDelta = deltas.reduce((a, b) => a + b, 0) / (deltas.length || 1);
        const variance = deltas.reduce((a, b) => a + Math.pow(b - meanDelta, 2), 0) / (deltas.length || 1);
        // Low variance implies rhythmic periodic beaconing
        if (variance < 2500000) { // low jitter
          alerts.push({
            id: `ALT-C2-${pktNo}-${Date.now().toString().slice(-4)}`,
            timestamp: packet.timestamp,
            alertType: 'Potential C2 Beaconing Detected',
            sourceIp: srcIp,
            destinationIp: dstIp,
            description: `Repetitive outbound connection interval (jitter < 1.5s) to ${dstIp}:${dstPort} across ${valid.length} sessions.`,
            severity: beaconRule.severity,
            status: 'New',
            packetNo: pktNo,
            mitreId: beaconRule.mitreId,
            mitreTechnique: `${beaconRule.mitreId} ${beaconRule.mitreTechnique}`,
            recommendedAction: `Inspect process initiating connections to ${dstIp} on endpoint ${srcIp} and sandbox traffic.`
          });
        }
      }
    }

    // Rule 4: DNS Query Anomaly & Long Label (T1071.004)
    const dnsRule = this.rules.find(r => r.id === 'RULE-004' && r.enabled);
    if (dnsRule && proto === 'DNS') {
      if (!this.dnsQueries.has(srcIp)) {
        this.dnsQueries.set(srcIp, []);
      }
      const history = this.dnsQueries.get(srcIp)!;
      history.push({ time: now, query: info, no: pktNo });
      const valid = history.filter(h => (now - h.time) <= (dnsRule.windowSeconds * 1000));
      this.dnsQueries.set(srcIp, valid);

      const isLongLabel = info.length > 55 || /[a-f0-9]{32,}/i.test(info);
      if (valid.length >= dnsRule.threshold || isLongLabel) {
        alerts.push({
          id: `ALT-DNS-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'Possible DNS Anomaly',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: isLongLabel
            ? `Suspiciously long or high-entropy DNS query string observed: "${info.slice(0, 45)}..."`
            : `High-frequency DNS query burst: ${valid.length} lookups within ${dnsRule.windowSeconds}s.`,
          severity: dnsRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: dnsRule.mitreId,
          mitreTechnique: `${dnsRule.mitreId} ${dnsRule.mitreTechnique}`,
          recommendedAction: 'Verify DNS server lookup history and examine endpoint query resolution cache.'
        });
      }
    }

    // Rule 5: Unusual Destination Ports (T1571)
    const portRule = this.rules.find(r => r.id === 'RULE-005' && r.enabled);
    const suspiciousPorts = [4444, 31337, 6667, 1337, 9999, 12345];
    if (portRule && (suspiciousPorts.includes(dstPort) || suspiciousPorts.includes(srcPort))) {
      const targetedPort = suspiciousPorts.includes(dstPort) ? dstPort : srcPort;
      alerts.push({
        id: `ALT-PORT-${pktNo}-${Date.now().toString().slice(-4)}`,
        timestamp: packet.timestamp,
        alertType: 'Unusual Destination Port Observed',
        sourceIp: srcIp,
        destinationIp: dstIp,
        description: `Traffic targeting known high-risk / backdoor port ${targetedPort} (${proto}).`,
        severity: portRule.severity,
        status: 'New',
        packetNo: pktNo,
        mitreId: portRule.mitreId,
        mitreTechnique: `${portRule.mitreId} ${portRule.mitreTechnique}`,
        recommendedAction: `Inspect network perimeter policy regarding port ${targetedPort} and isolate endpoint.`
      });
    }

    // Rule 6: Large Broadcast Flood (T1499)
    const bcastRule = this.rules.find(r => r.id === 'RULE-006' && r.enabled);
    if (bcastRule && (dstIp === '255.255.255.255' || dstIp.endsWith('.255')) && (packet.length || 0) > 1200) {
      alerts.push({
        id: `ALT-BCAST-${pktNo}-${Date.now().toString().slice(-4)}`,
        timestamp: packet.timestamp,
        alertType: 'Large Broadcast Datagram Flood',
        sourceIp: srcIp,
        destinationIp: dstIp,
        description: `Oversized datagram (${packet.length} bytes) transmitted to broadcast address ${dstIp}.`,
        severity: bcastRule.severity,
        status: 'New',
        packetNo: pktNo,
        mitreId: bcastRule.mitreId,
        mitreTechnique: `${bcastRule.mitreId} ${bcastRule.mitreTechnique}`,
        recommendedAction: 'Inspect local DHCP / mDNS broadcast storm and investigate source NIC.'
      });
    }

    // Rule 7: Abnormal TCP Flag Combinations (T1046)
    const flagRule = this.rules.find(r => r.id === 'RULE-007' && r.enabled);
    if (flagRule && proto === 'TCP') {
      const isNull = !flags.syn && !flags.ack && !flags.fin && !flags.rst && !flags.psh && !flags.urg;
      const isXmas = flags.fin && flags.psh && flags.urg;
      const isSynFin = flags.syn && flags.fin;

      if (isNull || isXmas || isSynFin) {
        const flagName = isNull ? 'NULL Scan (No Flags)' : (isXmas ? 'Xmas Tree Scan (FIN+PSH+URG)' : 'SYN+FIN Evasion Scan');
        alerts.push({
          id: `ALT-FLAGS-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'Abnormal TCP Flag Combination',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `Invalid TCP flag state: ${flagName} observed from ${srcIp}:${srcPort} targeting port ${dstPort}.`,
          severity: flagRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: flagRule.mitreId,
          mitreTechnique: `${flagRule.mitreId} ${flagRule.mitreTechnique}`,
          recommendedAction: 'Drop invalid TCP flag combinations at network perimeter and record probe origin.'
        });
      }
    }

    // Rule 8: ARP Spoofing / IP Conflict (T1557.002)
    const arpRule = this.rules.find(r => r.id === 'RULE-008' && r.enabled);
    if (arpRule && proto === 'ARP') {
      const mac = packet.macSource || '';
      if (srcIp && mac && mac !== '00:00:00:00:00:00' && mac !== 'ff:ff:ff:ff:ff:ff') {
        const existingMac = this.arpBindings.get(srcIp);
        if (existingMac && existingMac.toLowerCase() !== mac.toLowerCase()) {
          alerts.push({
            id: `ALT-ARP-${pktNo}-${Date.now().toString().slice(-4)}`,
            timestamp: packet.timestamp,
            alertType: 'ARP Poisoning / Duplicate IP Anomaly',
            sourceIp: srcIp,
            destinationIp: dstIp,
            description: `Host ${srcIp} previously bound to ${existingMac} now claimed by distinct MAC ${mac}.`,
            severity: arpRule.severity,
            status: 'New',
            packetNo: pktNo,
            mitreId: arpRule.mitreId,
            mitreTechnique: `${arpRule.mitreId} ${arpRule.mitreTechnique}`,
            recommendedAction: 'Inspect switch port security, verify static ARP mappings, and isolate rogue device.'
          });
        } else {
          this.arpBindings.set(srcIp, mac);
        }
      }
    }

    // Rule 9: Configured IOC Watchlist Match (T1071)
    const iocRule = this.rules.find(r => r.id === 'RULE-009' && r.enabled);
    if (iocRule && this.iocWatchlist.length > 0) {
      for (const ioc of this.iocWatchlist) {
        let matched = false;
        if (ioc.type === 'IP' && (srcIp === ioc.value || dstIp === ioc.value)) {
          matched = true;
        } else if (ioc.type === 'PORT' && (String(srcPort) === ioc.value || String(dstPort) === ioc.value)) {
          matched = true;
        } else if (ioc.type === 'DOMAIN' && info.toLowerCase().includes(ioc.value.toLowerCase())) {
          matched = true;
        }

        if (matched) {
          alerts.push({
            id: `ALT-IOC-${pktNo}-${Date.now().toString().slice(-4)}`,
            timestamp: packet.timestamp,
            alertType: `IOC Match: ${ioc.type} ${ioc.value}`,
            sourceIp: srcIp,
            destinationIp: dstIp,
            description: `Traffic matched verified defensive indicator of compromise: ${ioc.notes} (Source: ${ioc.source}).`,
            severity: ioc.severity,
            status: 'New',
            packetNo: pktNo,
            mitreId: iocRule.mitreId,
            mitreTechnique: `${iocRule.mitreId} ${iocRule.mitreTechnique}`,
            recommendedAction: `Quarantine affected host and consult CIRT playbook for ${ioc.value}.`
          });
        }
      }
    }

    // Rule 10: TCP SYN Flood / Rate Exhaustion (T1498)
    const synFloodRule = this.rules.find(r => r.id === 'RULE-010' && r.enabled);
    if (synFloodRule && proto === 'TCP' && flags.syn && !flags.ack) {
      if (!this.synFloods.has(srcIp)) this.synFloods.set(srcIp, []);
      const history = this.synFloods.get(srcIp)!;
      history.push({ time: now, no: pktNo });
      const valid = history.filter(h => (now - h.time) <= (synFloodRule.windowSeconds * 1000));
      this.synFloods.set(srcIp, valid);

      if (valid.length >= synFloodRule.threshold) {
        alerts.push({
          id: `ALT-SYNFLD-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'TCP SYN Flood Detected',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `Volumetric SYN flood: ${valid.length} unacknowledged SYN frames in ${synFloodRule.windowSeconds}s targeting ${dstIp}.`,
          severity: synFloodRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: synFloodRule.mitreId,
          mitreTechnique: `${synFloodRule.mitreId} ${synFloodRule.mitreTechnique}`,
          recommendedAction: 'Enable SYN cookies on gateway and throttle source IP address at upstream firewall.'
        });
      }
    }

    // Rule 11: UDP Volumetric Flood (T1498.001)
    const udpRule = this.rules.find(r => r.id === 'RULE-011' && r.enabled);
    if (udpRule && proto === 'UDP') {
      if (!this.udpBursts.has(srcIp)) this.udpBursts.set(srcIp, []);
      const history = this.udpBursts.get(srcIp)!;
      history.push({ time: now, no: pktNo, port: dstPort });
      const valid = history.filter(h => (now - h.time) <= (udpRule.windowSeconds * 1000));
      this.udpBursts.set(srcIp, valid);

      if (valid.length >= udpRule.threshold) {
        alerts.push({
          id: `ALT-UDPFLD-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'UDP Volumetric Flood Detected',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `High-frequency UDP datagram flood: ${valid.length} packets observed in ${udpRule.windowSeconds}s.`,
          severity: udpRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: udpRule.mitreId,
          mitreTechnique: `${udpRule.mitreId} ${udpRule.mitreTechnique}`,
          recommendedAction: 'Apply boundary rate-limiting for non-DNS UDP traffic.'
        });
      }
    }

    // Rule 12: Brute Force Authentication Probing (T1110)
    const bruteRule = this.rules.find(r => r.id === 'RULE-012' && r.enabled);
    const authPorts = [21, 22, 23, 3389];
    if (bruteRule && (authPorts.includes(dstPort) || authPorts.includes(srcPort)) && proto === 'TCP') {
      const targetedPort = authPorts.includes(dstPort) ? dstPort : srcPort;
      if (!this.authProbes.has(srcIp)) this.authProbes.set(srcIp, []);
      const history = this.authProbes.get(srcIp)!;
      history.push({ time: now, no: pktNo, port: targetedPort });
      const valid = history.filter(h => (now - h.time) <= (bruteRule.windowSeconds * 1000));
      this.authProbes.set(srcIp, valid);

      if (valid.length >= bruteRule.threshold) {
        alerts.push({
          id: `ALT-BRUTE-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'Brute Force Authentication Probing',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `Rapid authentication connection attempts (${valid.length} attempts in ${bruteRule.windowSeconds}s) targeting port ${targetedPort}.`,
          severity: bruteRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: bruteRule.mitreId,
          mitreTechnique: `${bruteRule.mitreId} ${bruteRule.mitreTechnique}`,
          recommendedAction: 'Trigger account lockout threshold, verify host authentication logs, and isolate source IP.'
        });
      }
    }

    // Rule 13: Lateral Movement / Internal SMB Probing (T1021.002)
    const lateralRule = this.rules.find(r => r.id === 'RULE-013' && r.enabled);
    const isPrivate = (ip: string) => ip.startsWith('192.168.') || ip.startsWith('10.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
    if (lateralRule && isPrivate(srcIp) && isPrivate(dstIp) && srcIp !== dstIp) {
      if (dstPort === 445 || dstPort === 135 || dstPort === 5985 || dstPort === 5986) {
        alerts.push({
          id: `ALT-LATERAL-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'Internal Lateral Movement / SMB Probing',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `East-West administrative connection detected between internal hosts (${srcIp} → ${dstIp}:${dstPort}).`,
          severity: lateralRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: lateralRule.mitreId,
          mitreTechnique: `${lateralRule.mitreId} ${lateralRule.mitreTechnique}`,
          recommendedAction: 'Verify authorized IT administration activity or isolate origin workstation.'
        });
      }
    }

    // Rule 14: Clear-Text Credential Exposure (T1552)
    const clearCredRule = this.rules.find(r => r.id === 'RULE-014' && r.enabled);
    if (clearCredRule) {
      const isTelnet = dstPort === 23 || srcPort === 23;
      const isFtpAuth = (dstPort === 21 || srcPort === 21) && (info.includes('USER') || info.includes('PASS'));
      const isHttpBasic = info.includes('Authorization: Basic') || (packet.payloadAscii && /Authorization:\s*Basic/i.test(packet.payloadAscii));

      if (isTelnet || isFtpAuth || isHttpBasic) {
        const protocolName = isTelnet ? 'Telnet' : (isFtpAuth ? 'FTP' : 'HTTP Basic Auth');
        alerts.push({
          id: `ALT-CREDS-${pktNo}-${Date.now().toString().slice(-4)}`,
          timestamp: packet.timestamp,
          alertType: 'Clear-Text Credential Transmission Exposed',
          sourceIp: srcIp,
          destinationIp: dstIp,
          description: `Unencrypted authentication credentials observed on wire via ${protocolName}.`,
          severity: clearCredRule.severity,
          status: 'New',
          packetNo: pktNo,
          mitreId: clearCredRule.mitreId,
          mitreTechnique: `${clearCredRule.mitreId} ${clearCredRule.mitreTechnique}`,
          recommendedAction: 'Enforce TLS encryption on transport and revoke exposed plaintext credentials.'
        });
      }
    }

    // Rule 15: Oversized / Jumbo Exfiltration Anomaly (T1041)
    const jumboRule = this.rules.find(r => r.id === 'RULE-015' && r.enabled);
    if (jumboRule && (packet.length > 8000 || (dstPort > 1024 && packet.length > 2500 && (packet.payloadHex?.length || 0) > 4000))) {
      alerts.push({
        id: `ALT-EXFIL-${pktNo}-${Date.now().toString().slice(-4)}`,
        timestamp: packet.timestamp,
        alertType: 'Oversized Payload / Exfiltration Anomaly',
        sourceIp: srcIp,
        destinationIp: dstIp,
        description: `Unusual single-frame data payload (${packet.length} bytes) transmitted to high port ${dstPort}.`,
        severity: jumboRule.severity,
        status: 'New',
        packetNo: pktNo,
        mitreId: jumboRule.mitreId,
        mitreTechnique: `${jumboRule.mitreId} ${jumboRule.mitreTechnique}`,
        recommendedAction: 'Inspect destination endpoint identity and examine application layer payload content.'
      });
    }

    return alerts;
  }

  public setRuleState(id: string, state: 'ENABLED' | 'DISABLED' | 'TESTING'): boolean {
    const rule = this.rules.find(r => r.id === id);
    if (!rule) return false;
    rule.state = state;
    rule.enabled = state !== 'DISABLED';
    return true;
  }

  public getRuleById(id: string): DetectionRule | undefined {
    return this.rules.find(r => r.id === id);
  }

  /**
   * Clears in-memory detection states (useful when starting fresh session or running isolated tests).
   */
  public resetState() {
    this.synProbes.clear();
    this.icmpEchoes.clear();
    this.dnsQueries.clear();
    this.egressConnections.clear();
    this.arpBindings.clear();
    this.synFloods.clear();
    this.udpBursts.clear();
    this.authProbes.clear();
  }
}

export const globalDetectionEngine = new DefensiveDetectionEngine();
