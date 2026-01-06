import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Scan Backend Routes
function scanBackend() {
  const routes = new Set();
  const dir = path.join(__dirname, 'routes');

  // Hardcoded index.js routes
  routes.add('POST /api/upload');
  routes.add('GET /api/ai/command');

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');

      // Determine base path? Usually logic is complex, assuming standard mapping.
      // But let's scan for router.get('/path'...)
      let basePath = '';
      if (file.includes('auth')) basePath = '/api'; // Login/Register are direct on /api often? Check index.js mounting
      if (file.includes('services')) basePath = '/api/services';
      if (file.includes('appointments')) basePath = '/api/appointments';
      if (file.includes('users')) basePath = '/api'; // clients/barbers

      // Better heuristic: Scan index.js to see mounts? Assuming standard for now based on files.

      const regex = /router\.(get|post|put|delete|patch)\(['"`](.*?)['"`]/gi;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        let rPath = match[2];
        if (rPath === '/') rPath = '';

        // Fix auth which might be /login not /api/login/login if mounting is /api
        // Index.js says: app.use('/api', authRoutes); -> So /login becomes /api/login

        const fullRoute = `${method} ${basePath}${rPath}`;
        routes.add(fullRoute);
      }
    });
  }
  return routes;
}

// 2. Scan Frontend for API Calls
function scanFrontend() {
  const calls = new Set();
  const srcDir = path.join(__dirname, '../src'); // Adjust path to root/src

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Look for fetch('/api...' or axios.get('/api...') or simply strings starting with /api
        // Heuristic: Strings "/api/..."
        const regex = /['"`](\/api\/.*?)['"`]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          // Don't know method easily without parsing AST, but capture the path
          calls.add(match[1]);
        }
      }
    });
  }
  walk(srcDir);
  return calls;
}

console.log('--- AUDITORIA DE ROTAS ---');
const definedRoutes = Array.from(scanBackend());
const calledRoutes = Array.from(scanFrontend());

console.log(`Backend define ${definedRoutes.length} rotas.`);
console.log(`Frontend chama ${calledRoutes.length} endpoints distintos.`);

// Check for Frontend usage of undefined routes
const issues = [];
calledRoutes.forEach(call => {
  // Remove query params
  const cleanCall = call.split('?')[0];

  // Check if any defined route matches this (ignoring :id params for now very basic)
  // We treat :id as matching anything
  const matched = definedRoutes.some(def => {
    const defPath = def.split(' ')[1]; // "GET /api/foo" -> "/api/foo"

    // Regexify definition: /api/clients/:id -> /api/clients/[^/]+
    const regexStr = '^' + defPath.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$';
    const regex = new RegExp(regexStr);
    return regex.test(cleanCall);
  });

  if (!matched) {
    // Filter some false positives or dynamic constructions
    if (!cleanCall.includes('${')) {
      issues.push(cleanCall);
    }
  }
});

if (issues.length > 0) {
  console.log('\n⚠️ Rotas chamadas no Frontend que parecem NÃO existir no Backend:');
  issues.forEach(i => console.log(`  - ${i}`));
} else {
  console.log('✅ Parece que o Frontend só chama rotas existentes.');
}
