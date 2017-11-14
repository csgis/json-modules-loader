let fs = require('fs');
let UglifyJS = require('uglify-js');

const EXPORT_NAME = 'bricjs';
const UGLIFY_OPTS = {
  parse: {},
  compress: false,
  mangle: false,
  output: {
    ast: true,
    code: false
  }
};

export function load(app, config, modules, moduleDeps) {
  let allPromises = [];

  function process(env) {
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
  }

  if (config instanceof Array) {
    config.forEach(process);
  } else if (config instanceof Object) {
    process(config);
  } else {
    throw new Error(`Invalid config: ${config}`);
  }

  return Promise.all(allPromises);
}

class Visitor {
  visit(node) {
    let found = node instanceof UglifyJS.AST_Lambda &&
      node.name &&
      node.name.name === EXPORT_NAME;
    if (found) this.args = node.argnames.map(a => a.name).splice(1);
    return found;
  }
}

function getModuleDeps(loader, modules) {
  let visitor = new Visitor();
  let walker = new UglifyJS.TreeWalker(visitor.visit.bind(visitor));
  let promises = [];

  Object.keys(modules).forEach(function (name) {
    let promise = new Promise(function (resolve, reject) {
      loader.resolve(loader.context, modules[name], function (err, result) {
        if (err) reject(err);

        let contents = fs.readFileSync(result, 'UTF-8');
        UglifyJS.minify(contents, UGLIFY_OPTS).ast.walk(walker);
        resolve({
          [name]: visitor.args
        });
      });
    });
    promises.push(promise);
  });

  return Promise.all(promises).then(values => Object.assign({}, ...values));
}

export default function (source) {
  let modules = JSON.parse(source).modules;
  let names = Object.keys(modules);
  let imports = names.map(n => `import { ${EXPORT_NAME} as ${n} } from '${modules[n]}';`).join('\n');

  let callback = this.async();
  let code = deps => `
${imports}
const DEPS = ${JSON.stringify(deps)};
${load.toString()}
export default config => load(${source}, config, { ${names.join(',')} }, DEPS);`;

  getModuleDeps(this, modules)
    .then(deps => callback(null, code(deps)))
    .catch(err => callback(err));
}
