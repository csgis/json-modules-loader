const EXPORT_NAME = 'bricjs';

export default function (source) {
  let json = JSON.parse(source);
  let modules = JSON.parse(source).modules;
  let names = Object.keys(modules);
  delete json.modules;
  delete json.deps;

  let strImports = names.map(n => `import { ${EXPORT_NAME} as ${n} } from '${modules[n]}';`).join('\n');
  let strModules = `{ ${names.join(', ')} }`;
  let key = this && this.options && this.options.key ? this.options.key : 'modules';

  return `
${strImports}

let json = ${JSON.stringify(json)};
json['${key}'] = ${strModules};

export default json;
`;
}
