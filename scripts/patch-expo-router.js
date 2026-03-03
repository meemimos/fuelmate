const fs = require('fs');
const path = require('path');

const root = process.cwd();
const searchPaths = [
  root,
  path.join(root, 'apps', 'mobile'),
  path.join(root, 'apps'),
  path.join(root, 'packages'),
];

const resolveRouterPackage = () => {
  for (const searchPath of searchPaths) {
    try {
      return require.resolve('expo-router/package.json', {
        paths: [searchPath],
      });
    } catch {
      // Keep trying other workspace locations.
    }
  }

  return null;
};

const collectRouterRoots = () => {
  const routerRoots = new Set();
  const resolvedPackage = resolveRouterPackage();

  if (resolvedPackage) {
    routerRoots.add(path.dirname(resolvedPackage));
  }

  const pnpmStore = path.join(root, 'node_modules', '.pnpm');

  if (fs.existsSync(pnpmStore)) {
    const entries = fs.readdirSync(pnpmStore, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (!entry.name.startsWith('expo-router@')) {
        continue;
      }

      const candidate = path.join(
        pnpmStore,
        entry.name,
        'node_modules',
        'expo-router'
      );

      if (fs.existsSync(candidate)) {
        routerRoots.add(candidate);
      }
    }
  }

  return Array.from(routerRoots);
};

const routerRoots = collectRouterRoots();

if (routerRoots.length === 0) {
  process.exit(0);
}

const ensureRootSymlink = () => {
  const resolvedPackage = resolveRouterPackage();

  if (!resolvedPackage) {
    return;
  }

  const primaryRoot = path.dirname(resolvedPackage);
  const rootNodeModules = path.join(root, 'node_modules');
  const rootLink = path.join(rootNodeModules, 'expo-router');

  if (!fs.existsSync(rootNodeModules)) {
    return;
  }

  try {
    const stat = fs.lstatSync(rootLink);

    if (stat.isSymbolicLink()) {
      return;
    }

    if (stat.isDirectory()) {
      return;
    }
  } catch {
    // Root link does not exist; create a symlink.
  }

  try {
    fs.symlinkSync(primaryRoot, rootLink, 'dir');
  } catch {
    // If we cannot create the symlink, continue with patched copies.
  }
};

ensureRootSymlink();

for (const routerRoot of routerRoots) {
  const internalDir = path.join(routerRoot, 'internal');
  const routingJs = path.join(internalDir, 'routing.js');
  const routingDts = path.join(internalDir, 'routing.d.ts');

  if (!fs.existsSync(internalDir)) {
    fs.mkdirSync(internalDir, { recursive: true });
  }

const jsContents = `const routes = require('../build/getRoutesCore');

module.exports = {
  getRoutesCore: routes.getRoutes,
  generateDynamic: routes.generateDynamic,
  extrapolateGroups: routes.extrapolateGroups,
  getIgnoreList: routes.getIgnoreList,
};
`;

const dtsContents = `export {
  getRoutes as getRoutesCore,
  generateDynamic,
  extrapolateGroups,
  getIgnoreList,
} from '../build/getRoutesCore';
`;

  fs.writeFileSync(routingJs, jsContents);
  fs.writeFileSync(routingDts, dtsContents);
}
