import os from "os";

export function getPythonBinary(): string {
  // Use 'python' on Windows where python3 alias usually fails, 'python3' on Linux/macOS
  return process.platform === 'win32' ? 'python' : 'python3';
}

export function decodeRawEthernetFrame(raw: Buffer, seq: number): any {
  if (!raw || raw.length < 14) return null;
  const etherType = raw.readUInt16BE(12);

  // IPv4 Decapsulation
  if (etherType === 0x0800 && raw.length >= 34) {
    const ipHeaderLen = (raw[14] & 0x0f) * 4;
    const protocolNum = raw[23];
    const srcIp = `${raw[26]}.${raw[27]}.${raw[28]}.${raw[29]}`;
    const dstIp = `${raw[30]}.${raw[31]}.${raw[32]}.${raw[33]}`;
    const l4Offset = 14 + ipHeaderLen;

    let protocol = 'IPv4';
    let srcPort = 0;
    let dstPort = 0;
    let flags: Record<string, boolean> = {};
    let info = `${srcIp} > ${dstIp}`;

    if (protocolNum === 6 && raw.length >= l4Offset + 20) {
      protocol = 'TCP';
      srcPort = raw.readUInt16BE(l4Offset);
      dstPort = raw.readUInt16BE(l4Offset + 2);
      const flagByte = raw[l4Offset + 13];
      flags = {
        syn: Boolean(flagByte & 0x02),
        ack: Boolean(flagByte & 0x10),
        fin: Boolean(flagByte & 0x01),
        rst: Boolean(flagByte & 0x04),
        psh: Boolean(flagByte & 0x08),
        urg: Boolean(flagByte & 0x20)
      };
      const flagNames = Object.entries(flags).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ');
      info = `${srcPort} > ${dstPort} [${flagNames || 'ACK'}] Len=${raw.length - l4Offset}`;
    } else if (protocolNum === 17 && raw.length >= l4Offset + 8) {
      protocol = 'UDP';
      srcPort = raw.readUInt16BE(l4Offset);
      dstPort = raw.readUInt16BE(l4Offset + 2);
      info = `${srcPort} > ${dstPort} Len=${raw.length - l4Offset}`;
      if (srcPort === 53 || dstPort === 53) protocol = 'DNS';
      if (srcPort === 67 || dstPort === 67 || srcPort === 68 || dstPort === 68) protocol = 'DHCP';
    } else if (protocolNum === 1 && raw.length >= l4Offset + 4) {
      protocol = 'ICMP';
      const icmpType = raw[l4Offset];
      info = icmpType === 8 ? 'Echo (ping) request' : (icmpType === 0 ? 'Echo (ping) reply' : `ICMP type ${icmpType}`);
    }

    return {
      id: seq,
      no: seq,
      timestamp: new Date().toTimeString().substring(0, 8),
      sourceIp: srcIp,
      destinationIp: dstIp,
      sourcePort: srcPort,
      destinationPort: dstPort,
      protocol,
      length: raw.length,
      ttl: raw[22],
      flags: Object.entries(flags).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', '),
      tcpFlags: flags,
      info,
      payloadHex: raw.toString('hex'),
      captureSource: 'PCAP_INGESTION'
    };
  }

  // ARP Decapsulation
  if (etherType === 0x0806 && raw.length >= 42) {
    const srcIp = `${raw[28]}.${raw[29]}.${raw[30]}.${raw[31]}`;
    const dstIp = `${raw[38]}.${raw[39]}.${raw[40]}.${raw[41]}`;
    return {
      id: seq,
      no: seq,
      timestamp: new Date().toTimeString().substring(0, 8),
      sourceIp: srcIp,
      destinationIp: dstIp,
      sourcePort: 0,
      destinationPort: 0,
      protocol: 'ARP',
      length: raw.length,
      info: `Who has ${dstIp}? Tell ${srcIp}`,
      payloadHex: raw.toString('hex'),
      captureSource: 'PCAP_INGESTION'
    };
  }

  return null;
}

export function parsePcapInMemory(fileBuffer: Buffer): { status: string; packets: any[] } {
  const packets: any[] = [];
  if (!fileBuffer || fileBuffer.length < 24) {
    return { status: 'error', packets: [] };
  }

  const magic = fileBuffer.readUInt32BE(0);

  // PCAPNG Format (0x0A0D0D0A)
  if (magic === 0x0A0D0D0A) {
    let offset = 0;
    let pktIdx = 0;
    while (offset + 12 <= fileBuffer.length) {
      const btype = fileBuffer.readUInt32LE(offset);
      const blen = fileBuffer.readUInt32LE(offset + 4);
      if (blen < 12 || offset + blen > fileBuffer.length) break;

      // Enhanced Packet Block (0x00000006)
      if (btype === 0x00000006 && blen >= 32) {
        const capLen = fileBuffer.readUInt32LE(offset + 20);
        const dataOffset = offset + 28;
        if (dataOffset + capLen <= fileBuffer.length) {
          pktIdx++;
          const raw = fileBuffer.subarray(dataOffset, dataOffset + capLen);
          const pkt = decodeRawEthernetFrame(raw, pktIdx);
          if (pkt) packets.push(pkt);
        }
      }
      offset += blen;
    }
    return { status: 'success', packets };
  }

  // Classic Libpcap Format (Big Endian: 0xa1b2c3d4, Little Endian: 0xd4c3b2a1)
  const isBigEndian = (magic === 0xa1b2c3d4);
  const isLittleEndian = (magic === 0xd4c3b2a1);
  if (!isBigEndian && !isLittleEndian) {
    return { status: 'error', packets: [] };
  }

  const isBE = isBigEndian;
  let offset = 24;
  let pktIdx = 0;

  while (offset + 16 <= fileBuffer.length) {
    const tsSec = isBE ? fileBuffer.readUInt32BE(offset) : fileBuffer.readUInt32LE(offset);
    const tsUsec = isBE ? fileBuffer.readUInt32BE(offset + 4) : fileBuffer.readUInt32LE(offset + 4);
    const inclLen = isBE ? fileBuffer.readUInt32BE(offset + 8) : fileBuffer.readUInt32LE(offset + 8);

    offset += 16;
    if (offset + inclLen > fileBuffer.length) break;

    pktIdx++;
    const raw = fileBuffer.subarray(offset, offset + inclLen);
    const pkt = decodeRawEthernetFrame(raw, pktIdx);
    if (pkt) {
      const date = new Date(tsSec * 1000);
      const ms = String(Math.floor(tsUsec / 1000)).padStart(3, '0');
      pkt.timestamp = `${date.toTimeString().substring(0, 8)}.${ms}`;
      packets.push(pkt);
    }
    offset += inclLen;
  }

  return { status: 'success', packets };
}
