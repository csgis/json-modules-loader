const EXPORT_NAME = 'gl';

let getArguments = require('es-arguments');

export function load(app, config, modules) {
  let allPromises = [];

  config.forEach(env => {
    let promises = {};
    let resolves = {};

    let isEnabled = name => !env[name] || env[name].enabled !== false;
    let enabledModules = Object.keys(modules).filter(isEnabled);

    // Create promises for all active modules
    enabledModules.forEach(name => {
      let p = new Promise(resolve => { resolves[name] = resolve; });
      promises[name] = p;
      allPromises.push(p);
    });

    // Load modules and resolve them
    enabledModules.forEach(name => {
      let callback = modules[name];
      let opts = env[name];
      let deps;
      if (app.deps && app.deps[name]) {
        deps = app.deps[name];
      } else {
        // Splice 1 to remove 'opts'
        deps = getArguments(callback).splice(1);
      }

      let modulePromises = deps
        .map(d => promises[d])
        .filter(p => p instanceof Promise);

      Promise.all(modulePromises).then(values => {
        values.unshift(opts);
        resolves[name](callback.apply(null, values));
      });
    });
  });

  return Promise.all(allPromises);
}

export default function (source) {
  let modules = JSON.parse(source).modules;
  let names = Object.keys(modules);
  let imports = names.map(n => `import { ${EXPORT_NAME} as ${n} } from '${modules[n]}';`).join('\n');

  return `
  ${imports}
  import getArguments from 'es-arguments';
  ${load.toString()}
  export default config => load(${source}, config, { ${names.join(',')} });`;
}
