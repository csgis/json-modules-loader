[![Build Status](https://travis-ci.org/csgis/json-modules-loader.svg?branch=master)](https://travis-ci.org/csgis/json-modules-loader) [![codecov](https://codecov.io/gh/csgis/json-modules-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/csgis/json-modules-loader) [![npm](https://img.shields.io/npm/v/@csgis/json-modules-loader.svg)](https://www.npmjs.com/package/@csgis/json-modules-loader) [![downloads](https://img.shields.io/npm/dt/@csgis/json-modules-loader.svg)](https://www.npmjs.com/package/@csgis/json-modules-loader)

# JSON Modules loader

A Webpack loader that loads a JSON object and resolves paths to actual modules.

It is useful to decouple your dependencies from your code. Just replace the dependencies in you JSON file with others that behave the same.

## Install

With npm:

```
npm install --save-dev @csgis/json-modules-loader
```

With yarn:

```
yarn add -D @csgis/json-modules-loader
```

## Usage

**webpack.config.js**

```js
{
   test: /app\.json$/,
   use: [ '@csgis/json-modules-loader' ]
}
```

**app.json**
```json
{
  "modules": {
    "x": "react",
    "y": "react-dom"
  }
}
```

**file.js**
```js
import app from './app.json';

app.modules.y.render(
  app.modules.x.createElement(Hello, {toWhat: 'World'}, null),
  document.getElementById('root')
);
```

## Options

| Name        | Type          | Default   | Description |
|-------------|---------------|-----------|-------------|
| key         | `{ String } ` | `modules` | Name of the property JSON property with paths to be resolved. |
| importName  | `{ String } ` | `default` | Name of the export to use as module value. |
