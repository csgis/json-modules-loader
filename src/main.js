import loaderUtils from 'loader-utils';

const DEFAULT_OPTS = {
  importName: 'default',
  key: 'modules'
};

export default function (source) {
  const opts = Object.assign({}, DEFAULT_OPTS, loaderUtils.getOptions(this));

  let json = JSON.parse(source);
  let modules = json[opts.key];
  let names = Object.keys(modules);
  delete json[opts.key];

  let strImports;
  if (opts.importName === 'default') {
    strImports = names.map(n => `import ${n} from '${modules[n]}';`).join('\n');
  } else {
    strImports = names.map(n => `import { ${opts.importName} as ${n} } from '${modules[n]}';`).join('\n');
  }
  return `
${strImports}

let json = ${JSON.stringify(json)};
json['${opts.key}'] = { ${names.join(', ')} };

export default json;
`;
}
