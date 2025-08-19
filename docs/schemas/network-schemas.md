# Network Schemas

The network schemas module provides comprehensive validation for network addresses including IPv4, IPv6, MAC addresses, and CIDR blocks with support for various network formats and configurations.

## Overview

This module offers robust network address validation using Zod's built-in IP validation combined with custom regex patterns for MAC addresses. It supports both individual addresses and network ranges (CIDR blocks), making it suitable for network configuration, device management, and infrastructure applications.

## Usage Patterns

### String Parameter Overloads (v1.5+)

Starting in v1.5, all network schemas support simplified string parameter usage for basic field name specification:

```typescript
// Traditional options object
const serverIpTraditional = pz.IPv4Required({ msg: "Server IP" });

// Simplified string parameter (equivalent)
const serverIpSimple = pz.IPv4Required("Server IP");

// Both produce the same validation behavior
serverIpTraditional.parse("192.168.1.100"); // ✅ "192.168.1.100"
serverIpSimple.parse("192.168.1.100");      // ✅ "192.168.1.100"

// Error messages are identical
serverIpTraditional.parse("invalid"); // ❌ "Server IP must be a valid IPv4 address"
serverIpSimple.parse("invalid");      // ❌ "Server IP must be a valid IPv4 address"
```

**When to use string parameters:**
- Basic field name specification only
- Default validation behavior is sufficient
- Cleaner, more concise code

**When to use options objects:**
- IP version constraints needed (`version` parameter)
- Custom message types (`MsgType.Message`)
- Advanced localization configurations

## Available Schemas

### IP Address Schemas

- **`IPv4Required(options?)`** - Validates required IPv4 addresses
- **`IPv4Optional(options?)`** - Validates optional IPv4 addresses (accepts undefined)
- **`IPv6Required(options?)`** - Validates required IPv6 addresses
- **`IPv6Optional(options?)`** - Validates optional IPv6 addresses (accepts undefined)

### CIDR Block Schemas

- **`IPv4CIDRRequired(options?)`** - Validates required IPv4 CIDR blocks
- **`IPv4CIDROptional(options?)`** - Validates optional IPv4 CIDR blocks
- **`IPv6CIDRRequired(options?)`** - Validates required IPv6 CIDR blocks
- **`IPv6CIDROptional(options?)`** - Validates optional IPv6 CIDR blocks
- **`CIDRGeneric(options?)`** - Validates IPv4 or IPv6 CIDR blocks

### MAC Address Schemas

- **`Macpz.AddressRequired(options?)`** - Validates required MAC addresses
- **`Macpz.AddressOptional(options?)`** - Validates optional MAC addresses

### Generic Network Schemas

- **`IPAddressGeneric(options?)`** - Validates any IP address (IPv4 or IPv6)
- **`NetworkAddressGeneric(options?)`** - Validates any network address (IP or MAC)

## Schema Options

All network schemas accept a `NetworkSchemaOptions` configuration object:

```typescript
interface NetworkSchemaOptions {
  msg?: string;       // Custom field name or error message
  msgType?: MsgType;  // Whether msg is field name or complete message
  version?: "v4" | "v6"; // Optional IP version constraint (for generic schemas)
}
```

## Supported Formats

### IPv4 Addresses

```typescript
// Valid IPv4 formats
"192.168.1.1"     // Private network
"10.0.0.1"        // Class A private
"172.16.0.1"      // Class B private  
"8.8.8.8"         // Public DNS
"127.0.0.1"       // Localhost
"0.0.0.0"         // Any address
```

### IPv6 Addresses

```typescript
// Valid IPv6 formats
"2001:db8::1"                    // Documentation address
"::1"                            // Localhost
"fe80::1"                        // Link-local
"2001:0db8:85a3::8a2e:0370:7334" // Full format
"::"                             // Any address
"::ffff:192.0.2.1"              // IPv4-mapped IPv6
```

### MAC Addresses

```typescript
// Valid MAC address formats
"00:1A:2B:3C:4D:5E"  // Colon-separated (most common)
"00-1A-2B-3C-4D-5E"  // Hyphen-separated
"001A2B3C4D5E"       // No separators
```

### CIDR Blocks

```typescript
// IPv4 CIDR blocks
"192.168.1.0/24"    // /24 subnet (256 addresses)
"10.0.0.0/8"        // /8 subnet (16M addresses)
"172.16.0.0/12"     // /12 subnet (1M addresses)
"0.0.0.0/0"         // Default route (all addresses)

// IPv6 CIDR blocks
"2001:db8::/32"     // /32 prefix
"fe80::/10"         // Link-local prefix
"::1/128"           // Single host
"::/0"              // Default route
```

## Examples

### Basic IP Address Validation

```typescript
import { pz } from 'phantom-zod';

// IPv4 validation
const ipv4Schema = pz.IPv4Required();
ipv4Schema.parse("192.168.1.1");  // ✓ Valid
ipv4Schema.parse("10.0.0.1");     // ✓ Valid
ipv4Schema.parse("256.1.1.1");    // ✗ Error: Invalid IPv4
ipv4Schema.parse("192.168.1");    // ✗ Error: Incomplete

// IPv6 validation
const ipv6Schema = pz.IPv6Required();
ipv6Schema.parse("2001:db8::1");   // ✓ Valid
ipv6Schema.parse("::1");           // ✓ Valid
ipv6Schema.parse("invalid:::");    // ✗ Error: Invalid IPv6

// Optional IP address
const optionalIpSchema = pz.IPv4Optional();
optionalIpSchema.parse("192.168.1.1"); // ✓ Valid
optionalIpSchema.parse(undefined);      // ✓ Valid
```

### MAC Address Validation

```typescript
import { pz } from 'phantom-zod';

const macSchema = pz.Macpz.AddressRequired();

// Valid MAC address formats
macSchema.parse("00:1A:2B:3C:4D:5E"); // ✓ Valid (colon format)
macSchema.parse("00-1A-2B-3C-4D-5E"); // ✓ Valid (hyphen format)
macSchema.parse("001A2B3C4D5E");      // ✓ Valid (no separators)

// Invalid formats
macSchema.parse("00:1A:2B:3C:4D");    // ✗ Error: Too short
macSchema.parse("ZZ:1A:2B:3C:4D:5E"); // ✗ Error: Invalid hex
macSchema.parse("00:1A:2B:3C:4D:5E:FF"); // ✗ Error: Too long

// Optional MAC address
const optionalMacSchema = Macpz.AddressOptional();
optionalMacSchema.parse(undefined); // ✓ Valid
```

### CIDR Block Validation

```typescript
import { pz } from 'phantom-zod';

// IPv4 CIDR validation
const ipv4CidrSchema = pz.IPv4CIDRRequired();
ipv4CidrSchema.parse("192.168.1.0/24");  // ✓ Valid
ipv4CidrSchema.parse("10.0.0.0/8");      // ✓ Valid
ipv4CidrSchema.parse("0.0.0.0/0");       // ✓ Valid (default route)
ipv4CidrSchema.parse("192.168.1.1");     // ✗ Error: Missing /prefix
ipv4CidrSchema.parse("192.168.1.0/33");  // ✗ Error: Invalid prefix

// IPv6 CIDR validation
const ipv6CidrSchema = pz.IPv6CIDRRequired();
ipv6CidrSchema.parse("2001:db8::/32");   // ✓ Valid
ipv6CidrSchema.parse("fe80::/10");       // ✓ Valid
ipv6CidrSchema.parse("::1/128");         // ✓ Valid
ipv6CidrSchema.parse("2001:db8::/129");  // ✗ Error: Invalid prefix

// Generic CIDR (IPv4 or IPv6)
const genericCidrSchema = CIDRGeneric();
genericCidrSchema.parse("192.168.1.0/24"); // ✓ Valid IPv4 CIDR
genericCidrSchema.parse("2001:db8::/32");   // ✓ Valid IPv6 CIDR
```

### Generic Network Address Validation

```typescript
import { pz } from 'phantom-zod';

// Accept any IP address (IPv4 or IPv6)
const anyIpSchema = IPAddressGeneric();
anyIpSchema.parse("192.168.1.1");   // ✓ Valid IPv4
anyIpSchema.parse("2001:db8::1");    // ✓ Valid IPv6
anyIpSchema.parse("00:1A:2B:3C:4D:5E"); // ✗ Error: MAC not allowed

// Accept any network address (IP or MAC)
const anyNetworkSchema = NetworkAddressGeneric();
anyNetworkSchema.parse("192.168.1.1");      // ✓ Valid IPv4
anyNetworkSchema.parse("2001:db8::1");       // ✓ Valid IPv6
anyNetworkSchema.parse("00:1A:2B:3C:4D:5E"); // ✓ Valid MAC
anyNetworkSchema.parse("invalid-address");   // ✗ Error: Invalid format
```

### Custom Error Messages

```typescript
import { pz } from 'phantom-zod';

// Custom field names
const serverIpSchema = pz.IPv4Required({ msg: 'Server IP Address' });
const deviceMacSchema = Macpz.AddressRequired({ msg: 'Device MAC Address' });

// Complete custom messages
const customIpSchema = pz.IPv4Required({
  msg: 'Please enter a valid IPv4 address',
  msgType: MsgType.Message
});
```

### Network Configuration Examples

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Network interface configuration
const networkInterfaceSchema = z.object({
  name: z.string(),
  ipAddress: pz.IPv4Required({ msg: 'IP Address' }),
  subnetMask: pz.IPv4Required({ msg: 'Subnet Mask' }),
  gateway: pz.IPv4Required({ msg: 'Gateway' }),
  macAddress: Macpz.AddressRequired({ msg: 'MAC Address' }),
  enabled: z.boolean()
});

// Routing table entry
const routeSchema = z.object({
  destination: IPv4CIDRRequired({ msg: 'Destination Network' }),
  gateway: pz.IPv4Required({ msg: 'Gateway IP' }),
  interface: z.string(),
  metric: z.number().int().positive()
});

// DHCP scope configuration
const dhcpScopeSchema = z.object({
  network: IPv4CIDRRequired({ msg: 'DHCP Network' }),
  startAddress: pz.IPv4Required({ msg: 'Start IP' }),
  endAddress: pz.IPv4Required({ msg: 'End IP' }),
  gateway: pz.IPv4Required({ msg: 'Default Gateway' }),
  dnsServers: z.array(IPv4Required({ msg: 'DNS Server' })),
  leaseTime: z.number().positive()
});
```

## Error Messages

The network schemas provide specific error messages for validation failures:

- **Required field**: "Network Address is required"
- **Invalid IPv4**: "Network Address must be a valid IPv4 address"
- **Invalid IPv6**: "Network Address must be a valid IPv6 address"
- **Invalid MAC**: "Network Address must be a valid MAC address"
- **Invalid format**: "Network Address is invalid"

## TypeScript Types

```typescript
// Basic address types
type IPv4Address = string;
type IPv6Address = string;
type MacAddress = string;
type IPAddress = string;        // IPv4 or IPv6
type NetworkAddress = string;   // IPv4, IPv6, or MAC

// CIDR block types
type IPv4CIDR = string;
type IPv6CIDR = string;
type CIDRBlock = string;        // IPv4 or IPv6 CIDR

// Schema configuration
interface NetworkSchemaOptions {
  msg?: string;
  msgType?: MsgType;
  version?: "v4" | "v6";
}

// Usage with schemas
const schema = pz.IPv4Required();
type InferredType = z.infer<typeof schema>; // string
```

## Best Practices

### Network Infrastructure

```typescript
import { pz } from 'phantom-zod';

// Router configuration
const routerConfigSchema = z.object({
  hostname: z.string(),
  managementIp: pz.IPv4Required({ msg: 'Management IP' }),
  interfaces: z.array(z.object({
    name: z.string(),
    ipAddress: pz.IPv4Required({ msg: 'Interface IP' }),
    subnetMask: pz.IPv4Required({ msg: 'Subnet Mask' }),
    enabled: z.boolean()
  })),
  routes: z.array(z.object({
    destination: IPv4CIDRRequired({ msg: 'Route Destination' }),
    nextHop: pz.IPv4Required({ msg: 'Next Hop' }),
    adminDistance: z.number().int().min(1).max(255)
  }))
});

// Switch port configuration
const switchPortSchema = z.object({
  portId: z.string(),
  vlan: z.number().int().min(1).max(4094),
  macAddress: Macpz.AddressRequired({ msg: 'Port MAC' }).optional(),
  speed: z.enum(['10', '100', '1000', '10000']),
  duplex: z.enum(['half', 'full', 'auto'])
});
```

### Device Management

```typescript
import { pz } from 'phantom-zod';

// Device inventory
const deviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['server', 'switch', 'router', 'firewall', 'ap']),
  macAddress: Macpz.AddressRequired({ msg: 'Device MAC' }),
  ipAddress: pz.IPv4Optional({ msg: 'Device IP' }),
  location: z.string(),
  status: z.enum(['online', 'offline', 'maintenance'])
});

// Network scan result
const scanResultSchema = z.object({
  target: NetworkAddressGeneric({ msg: 'Scan Target' }),
  discovered: z.array(z.object({
    address: NetworkAddressGeneric({ msg: 'Discovered Address' }),
    hostname: z.string().optional(),
    ports: z.array(z.number().int().min(1).max(65535)),
    macAddress: Macpz.AddressRequired({ msg: 'MAC Address' }).optional()
  })),
  scanTime: z.date()
});
```

### Security and Monitoring

```typescript
import { pz } from 'phantom-zod';

// Firewall rule
const firewallRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  action: z.enum(['allow', 'deny', 'log']),
  protocol: z.enum(['tcp', 'udp', 'icmp', 'any']),
  sourceNetwork: CIDRGeneric({ msg: 'Source Network' }),
  destinationNetwork: CIDRGeneric({ msg: 'Destination Network' }),
  sourcePort: z.number().int().min(1).max(65535).optional(),
  destinationPort: z.number().int().min(1).max(65535).optional(),
  enabled: z.boolean()
});

// Network monitoring alert
const alertSchema = z.object({
  id: z.string().uuid(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  source: pz.IPv4Required({ msg: 'Source IP' }),
  destination: pz.IPv4Optional({ msg: 'Destination IP' }),
  message: z.string(),
  timestamp: z.date(),
  acknowledged: z.boolean()
});
```

### Cloud and Virtualization

```typescript
import { pz } from 'phantom-zod';

// VPC configuration
const vpcSchema = z.object({
  id: z.string(),
  name: z.string(),
  cidrBlock: IPv4CIDRRequired({ msg: 'VPC CIDR Block' }),
  ipv6CidrBlock: IPv6CIDRRequired({ msg: 'IPv6 CIDR Block' }).optional(),
  region: z.string(),
  subnets: z.array(z.object({
    id: z.string(),
    cidrBlock: IPv4CIDRRequired({ msg: 'Subnet CIDR Block' }),
    availabilityZone: z.string()
  }))
});

// Container network configuration
const containerNetworkSchema = z.object({
  name: z.string(),
  driver: z.enum(['bridge', 'overlay', 'macvlan', 'none']),
  subnet: IPv4CIDRRequired({ msg: 'Container Subnet' }),
  gateway: pz.IPv4Required({ msg: 'Container Gateway' }),
  ipRange: IPv4CIDRRequired({ msg: 'IP Range' }).optional(),
  attachable: z.boolean()
});
```

## Integration Examples

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const networkConfigSchema = z.object({
  deviceName: z.string().min(1, 'Device name is required'),
  ipAddress: pz.IPv4Required({ msg: 'IP Address' }),
  macAddress: Macpz.AddressRequired({ msg: 'MAC Address' }),
  subnet: IPv4CIDROptional({ msg: 'Subnet CIDR' }),
  dhcpEnabled: z.boolean()
});

function NetworkConfigForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(networkConfigSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('deviceName')} placeholder="Device Name" />
      
      <input 
        {...register('ipAddress')} 
        placeholder="IP Address (e.g., 192.168.1.1)" 
        pattern="^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$"
      />
      
      <input 
        {...register('macAddress')} 
        placeholder="MAC Address (e.g., 00:1A:2B:3C:4D:5E)"
        pattern="^[0-9A-Fa-f]{2}[:-]?[0-9A-Fa-f]{2}[:-]?[0-9A-Fa-f]{2}[:-]?[0-9A-Fa-f]{2}[:-]?[0-9A-Fa-f]{2}[:-]?[0-9A-Fa-f]{2}$"
      />
      
      <input 
        {...register('subnet')} 
        placeholder="Subnet CIDR (e.g., 192.168.1.0/24)"
      />
      
      <label>
        <input type="checkbox" {...register('dhcpEnabled')} />
        Enable DHCP
      </label>

      {errors.ipAddress && <span>{errors.ipAddress.message}</span>}
      {errors.macAddress && <span>{errors.macAddress.message}</span>}
      {errors.subnet && <span>{errors.subnet.message}</span>}

      <button type="submit">Configure Network</button>
    </form>
  );
}
```

### Express.js API

```typescript
import express from 'express';
import { z } from 'zod';
import { pz } from 'phantom-zod';

const app = express();

// Network device registration
const deviceRegistrationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['server', 'router', 'switch', 'firewall']),
  ipAddress: pz.IPv4Required({ msg: 'IP Address' }),
  macAddress: Macpz.AddressRequired({ msg: 'MAC Address' }),
  location: z.string(),
  description: z.string().optional()
});

app.post('/api/devices', (req, res) => {
  try {
    const device = deviceRegistrationSchema.parse(req.body);
    // Register device in network inventory
    res.json({ success: true, device });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid device data',
      details: error.errors 
    });
  }
});

// Subnet management
const subnetSchema = z.object({
  name: z.string(),
  cidrBlock: IPv4CIDRRequired({ msg: 'CIDR Block' }),
  gateway: pz.IPv4Required({ msg: 'Gateway IP' }),
  dnsServers: z.array(IPv4Required({ msg: 'DNS Server' })),
  vlanId: z.number().int().min(1).max(4094)
});

app.post('/api/subnets', (req, res) => {
  try {
    const subnet = subnetSchema.parse(req.body);
    // Create subnet configuration
    res.json({ success: true, subnet });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid subnet configuration',
      details: error.errors 
    });
  }
});

// IP address allocation
const ipAllocationSchema = z.object({
  subnet: IPv4CIDRRequired({ msg: 'Subnet' }),
  requestedIp: pz.IPv4Required({ msg: 'Requested IP' }).optional(),
  deviceMac: Macpz.AddressRequired({ msg: 'Device MAC' }),
  hostname: z.string().optional()
});

app.post('/api/ip-allocation', (req, res) => {
  try {
    const allocation = ipAllocationSchema.parse(req.body);
    // Allocate IP address
    const assignedIp = allocateIpAddress(allocation);
    res.json({ success: true, assignedIp });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid IP allocation request',
      details: error.errors 
    });
  }
});
```

### Database Models

```typescript
import { z } from 'zod';
import { pz } from 'phantom-zod';

// Network device model
export const NetworkDeviceModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['server', 'router', 'switch', 'firewall', 'ap']),
  ipAddress: pz.IPv4Required({ msg: 'IP Address' }),
  ipv6Address: IPv6Optional({ msg: 'IPv6 Address' }),
  macAddress: Macpz.AddressRequired({ msg: 'MAC Address' }),
  subnet: IPv4CIDRRequired({ msg: 'Subnet' }),
  vlan: z.number().int().min(1).max(4094),
  location: z.string(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  lastSeen: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Network interface model
export const NetworkInterfaceModel = z.object({
  id: z.string().uuid(),
  deviceId: z.string().uuid(),
  name: z.string(),
  type: z.enum(['ethernet', 'wireless', 'loopback', 'tunnel']),
  ipAddress: pz.IPv4Required({ msg: 'Interface IP' }),
  netmask: pz.IPv4Required({ msg: 'Netmask' }),
  macAddress: Macpz.AddressRequired({ msg: 'Interface MAC' }),
  mtu: z.number().int().min(68).max(65535),
  speed: z.number().int().positive(),
  duplex: z.enum(['half', 'full']),
  enabled: z.boolean()
});

// Firewall rule model
export const FirewallRuleModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  enabled: z.boolean(),
  priority: z.number().int().positive(),
  action: z.enum(['allow', 'deny', 'log']),
  protocol: z.enum(['tcp', 'udp', 'icmp', 'esp', 'ah', 'any']),
  sourceNetwork: IPv4CIDRRequired({ msg: 'Source Network' }),
  destinationNetwork: IPv4CIDRRequired({ msg: 'Destination Network' }),
  sourcePortStart: z.number().int().min(1).max(65535).optional(),
  sourcePortEnd: z.number().int().min(1).max(65535).optional(),
  destinationPortStart: z.number().int().min(1).max(65535).optional(),
  destinationPortEnd: z.number().int().min(1).max(65535).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
```

### Network Utilities

```typescript
import { pz } from 'phantom-zod';

class NetworkUtils {
  // Validate and parse network addresses
  validateNetworkAddress(address: string, type: 'ipv4' | 'mac' | 'cidr') {
    const schemas = {
      ipv4: pz.IPv4Required({ msg: 'IPv4 Address' }),
      mac: Macpz.AddressRequired({ msg: 'MAC Address' }),
      cidr: IPv4CIDRRequired({ msg: 'CIDR Block' })
    };
    
    return schemas[type].safeParse(address);
  }

  // Calculate network information from CIDR
  calculateNetworkInfo(cidr: string) {
    const cidrSchema = pz.IPv4CIDRRequired({ msg: 'CIDR Block' });
    const validCidr = cidrSchema.parse(cidr);
    
    const [network, prefixLength] = validCidr.split('/');
    const prefix = parseInt(prefixLength);
    
    // Calculate subnet mask, network size, etc.
    const subnetMask = this.prefixToSubnetMask(prefix);
    const networkSize = Math.pow(2, 32 - prefix);
    const broadcastAddress = this.calculateBroadcastAddress(network, prefix);
    
    return {
      network,
      subnetMask,
      prefixLength: prefix,
      networkSize,
      broadcastAddress,
      firstUsableIp: this.getFirstUsableIp(network),
      lastUsableIp: this.getLastUsableIp(broadcastAddress)
    };
  }

  // Check if IP is in subnet
  isIpInSubnet(ip: string, cidr: string): boolean {
    const ipSchema = pz.IPv4Required({ msg: 'IP Address' });
    const cidrSchema = pz.IPv4CIDRRequired({ msg: 'CIDR Block' });
    
    ipSchema.parse(ip);
    cidrSchema.parse(cidr);
    
    // Implementation would convert to binary and compare
    return true; // Placeholder
  }

  // Normalize MAC address format
  normalizeMacAddress(mac: string): string {
    const macSchema = Macpz.AddressRequired({ msg: 'MAC Address' });
    const validMac = macSchema.parse(mac);
    
    // Convert to standard colon format
    return validMac
      .replace(/[-:.]/g, '')
      .replace(/(.{2})/g, '$1:')
      .slice(0, -1)
      .toUpperCase();
  }

  private prefixToSubnetMask(prefix: number): string {
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    return [
      (mask >>> 24) & 0xff,
      (mask >>> 16) & 0xff,
      (mask >>> 8) & 0xff,
      mask & 0xff
    ].join('.');
  }

  private calculateBroadcastAddress(network: string, prefix: number): string {
    // Implementation would calculate broadcast address
    return "192.168.1.255"; // Placeholder
  }

  private getFirstUsableIp(network: string): string {
    // Implementation would calculate first usable IP
    return "192.168.1.1"; // Placeholder
  }

  private getLastUsableIp(broadcast: string): string {
    // Implementation would calculate last usable IP
    return "192.168.1.254"; // Placeholder
  }
}

const networkUtils = new NetworkUtils();
export { networkUtils };
```

## Advanced Use Cases

### IPv6 Support

```typescript
import { pz } from 'phantom-zod';

// Dual-stack network configuration
const dualStackConfigSchema = z.object({
  ipv4Network: IPv4CIDRRequired({ msg: 'IPv4 Network' }),
  ipv6Network: IPv6CIDRRequired({ msg: 'IPv6 Network' }),
  ipv4Gateway: pz.IPv4Required({ msg: 'IPv4 Gateway' }),
  ipv6Gateway: pz.IPv6Required({ msg: 'IPv6 Gateway' }),
  dnsServers: z.array(z.union([
    IPv4Required({ msg: 'DNS Server' }),
    IPv6Required({ msg: 'DNS Server' })
  ]))
});

// IPv6 address types validation
const ipv6TypesSchema = z.object({
  linkLocal: pz.IPv6Required({ msg: 'Link-Local Address' })
    .refine(addr => addr.startsWith('fe80:'), 'Must be link-local address'),
  globalUnicast: pz.IPv6Required({ msg: 'Global Unicast Address' })
    .refine(addr => !addr.startsWith('fe80:'), 'Must be global unicast address'),
  multicast: pz.IPv6Required({ msg: 'Multicast Address' })
    .refine(addr => addr.startsWith('ff'), 'Must be multicast address')
});
```

### Network Security Validation

```typescript
import { pz } from 'phantom-zod';

// Security group rule
const securityRuleSchema = z.object({
  direction: z.enum(['inbound', 'outbound']),
  protocol: z.enum(['tcp', 'udp', 'icmp', 'any']),
  sourceType: z.enum(['ip', 'cidr', 'security_group']),
  source: z.union([
    IPv4Required({ msg: 'Source IP' }),
    IPv4CIDRRequired({ msg: 'Source CIDR' }),
    z.string() // Security group ID
  ]),
  destinationType: z.enum(['ip', 'cidr', 'security_group']),
  destination: z.union([
    IPv4Required({ msg: 'Destination IP' }),
    IPv4CIDRRequired({ msg: 'Destination CIDR' }),
    z.string() // Security group ID
  ]),
  portRange: z.object({
    start: z.number().int().min(1).max(65535),
    end: z.number().int().min(1).max(65535)
  }).optional(),
  action: z.enum(['allow', 'deny'])
});
```

### Helper Functions

```typescript
import { pz } from 'phantom-zod';

// Get example formats for user guidance
const examples = getNetworkAddressExamples();
console.log(examples.ipv4);      // "192.168.1.1"
console.log(examples.ipv6);      // "2001:db8::1"
console.log(examples.mac);       // "00:1A:2B:3C:4D:5E"
console.log(examples.ipv4Cidr);  // "192.168.1.0/24"
console.log(examples.ipv6Cidr);  // "2001:db8::/32"

// Use in form placeholders or validation messages
const networkFormHelp = {
  ipv4: `Enter IPv4 address (example: ${examples.ipv4})`,
  ipv6: `Enter IPv6 address (example: ${examples.ipv6})`,
  mac: `Enter MAC address (example: ${examples.mac})`,
  cidr: `Enter CIDR block (example: ${examples.ipv4Cidr})`
};
```

## See Also

- [String Schemas](./string-schemas.md) - Basic string validation patterns
- [Array Schemas](./array-schemas.md) - For validating arrays of network addresses
- [Object Validation Guide](../guides/object-validation.md) - Complex object validation patterns
- [URL Schemas](./url-schemas.md) - For URL and hostname validation
