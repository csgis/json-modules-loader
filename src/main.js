const EXPORT_NAME = 'gl';

let fs = require('fs');
let UglifyJS = require('uglify-js');

export function load(app, config, modules, moduleDeps) {
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
      let deps = [];
      if (app.deps && app.deps[name]) {
        deps = app.deps[name];
      } else {
        deps = moduleDeps[name] || [];
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

class Visitor {
  visit(node) {
    let found = node instanceof UglifyJS.AST_Lambda && node.name.name === 'gl';
    if (found) this.args = node.argnames.map(a => a.name).splice(1);
    return found;
  }
}

function getModuleDeps(loader, modules) {
  let names = Object.keys(modules);
  let visitor = new Visitor();
  let walker = new UglifyJS.TreeWalker(visitor.visit.bind(visitor));
  let uglifyOpts = {
    parse: {},
    compress: false,
    mangle: false,
    output: {
      ast: true,
      code: false
    }
  };

  let promises = [];

  function createPromise(name) {
    promises.push(new Promise(function (resolve, reject) {
      loader.resolve(loader.context, modules[name], function (err, result) {
        if (err) reject(err);

        let contents = fs.readFileSync(result, 'UTF-8');
        UglifyJS.minify(contents, uglifyOpts).ast.walk(walker);
        let obj = {};
        obj[name] = visitor.args;
        resolve(obj);
      });
    }));
  }

  names.forEach(createPromise);
  return Promise.all(promises).then(values => Object.assign({}, ...values));
}

export default function (source) {
  let modules = JSON.parse(source).modules;
  let names = Object.keys(modules);
  let imports = names.map(n => `import { ${EXPORT_NAME} as ${n} } from '${modules[n]}';`).join('\n');

  let cb = this.async();
  getModuleDeps(this, modules).then(deps => {
    cb(null, `
      ${imports}
      const DEPS = ${JSON.stringify(deps)};
      ${load.toString()}
      export default config => load(${source}, config, { ${names.join(',')} }, DEPS);
    `);
  }).catch(err => cb(err));
}
