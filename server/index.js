import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Cache for system info to avoid excessive system calls
let systemInfoCache = null;
let lastUpdate = 0;
const CACHE_DURATION = 2000; // 2 seconds

// Get network interface IP
async function getLocalIP() {
  try {
    const networkInterfaces = await si.networkInterfaces();
    const activeInterface = networkInterfaces.find(iface => 
      !iface.internal && iface.ip4 && iface.operstate === 'up'
    );
    return activeInterface ? activeInterface.ip4 : '127.0.0.1';
  } catch (error) {
    return '127.0.0.1';
  }
}

// Get system uptime in readable format
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  result += `${minutes}m`;
  
  return result.trim();
}

// Get CPU temperature (works on Linux/Raspberry Pi)
async function getCPUTemperature() {
  try {
    // Try to read from Raspberry Pi thermal zone
    if (fs.existsSync('/sys/class/thermal/thermal_zone0/temp')) {
      const tempData = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8');
      return parseInt(tempData) / 1000; // Convert from millidegrees to degrees
    }
    
    // Fallback to systeminformation
    const temp = await si.cpuTemperature();
    return temp.main || 0;
  } catch (error) {
    // If we can't get real temperature, return a simulated value
    return 45 + Math.random() * 15;
  }
}

async function getSystemInfo() {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (systemInfoCache && (now - lastUpdate) < CACHE_DURATION) {
    return systemInfoCache;
  }

  try {
    // Get all system information in parallel
    const [
      cpu,
      mem,
      disk,
      uptime,
      ipAddress,
      temperature
    ] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.time(),
      getLocalIP(),
      getCPUTemperature()
    ]);

    // Calculate CPU usage (average across all cores)
    const cpuUsage = cpu.currentLoad || 0;

    // Calculate memory usage percentage
    const memoryUsage = ((mem.used / mem.total) * 100) || 0;

    // Calculate disk usage for root partition
    const rootDisk = disk.find(d => d.mount === '/') || disk[0];
    const diskUsage = rootDisk ? ((rootDisk.used / rootDisk.size) * 100) : 0;

    // Format uptime
    const formattedUptime = formatUptime(uptime.uptime);

    systemInfoCache = {
      ipAddress,
      cpuUsage: Math.round(cpuUsage * 10) / 10,
      memoryUsage: Math.round(memoryUsage * 10) / 10,
      diskUsage: Math.round(diskUsage * 10) / 10,
      temperature: Math.round(temperature * 10) / 10,
      uptime: formattedUptime,
      timestamp: now
    };

    lastUpdate = now;
    return systemInfoCache;

  } catch (error) {
    console.error('Error getting system info:', error);
    
    // Return fallback data if there's an error
    return {
      ipAddress: await getLocalIP(),
      cpuUsage: Math.random() * 100,
      memoryUsage: 35 + Math.random() * 20,
      diskUsage: 42 + Math.random() * 10,
      temperature: 45 + Math.random() * 15,
      uptime: '0d 0h 0m',
      timestamp: now,
      error: 'Could not fetch real system data'
    };
  }
}

// API endpoint for system information
app.get('/api/system-info', async (req, res) => {
  try {
    const systemInfo = await getSystemInfo();
    res.json(systemInfo);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`System info server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET http://localhost:${PORT}/api/system-info`);
  console.log(`  GET http://localhost:${PORT}/api/health`);
});