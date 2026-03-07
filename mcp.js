const { spawn } = require('child_process');

const mcpProcess = spawn('npx.cmd', ['-y', '@masonator/coolify-mcp'], {
  shell: true,
  env: {
    ...process.env,
    COOLIFY_ACCESS_TOKEN: '2|KCazxCrh4sagLag4yH5asgVkGFhKYo4Mkjmfw8Jj55b47ddf',
    COOLIFY_BASE_URL: 'http://72.61.130.244:8000'
  }
});

let msgId = 1;
let buffer = '';
mcpProcess.stdout.on('data', (data) => {
  buffer += data.toString();
  let parts = buffer.split('\n');
  buffer = parts.pop();
  for (const part of parts) {
      if (part.trim()) console.log('RECV:', part);
  }
});

mcpProcess.stderr.on('data', (data) => {
  console.log('ERR:', data.toString());
});

mcpProcess.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: msgId++,
  method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'cli', version: '1.0' } }
}) + '\n');

setTimeout(() => {
    mcpProcess.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      method: "notifications/initialized"
    }) + '\n');

    mcpProcess.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: msgId++,
      method: 'tools/call',
      params: {
        name: 'deploy',
        arguments: {
          tag_or_uuid: 'fw8w8s8w4o0c8co88g40kk8w',
          force: true
        }
      }
    }) + '\n');
}, 2000);

setTimeout(() => {
    mcpProcess.kill();
}, 8000);
