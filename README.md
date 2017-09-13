# JavaScript Boilerplate

Simple JavaScript project with ESLint and configured testing, including:

* [Karma 1.x](https://karma-runner.github.io/1.0/index.html) + [Mocha 3.x](https://mochajs.org/) + [Webpack 3.x](https://webpack.js.org/) + [Babel 6.x](https://babeljs.io/) + [ChromeHeadless](https://developers.google.com/web/updates/2017/06/headless-karma-mocha-chai) for browser testing (`yarn test:browser`).
* [Mocha 3.x](https://mochajs.org/) + [Babel 6.x](https://babeljs.io/) for server testing (`yarn test`).
* [Istanbul 11.x](https://istanbul.js.org/) + [codecov](https://codecov.io/) for coverage.
* Debugging with Chrome (`yarn test:debug`)
* Configured Travis CI.

To use:

```bash
git clone -o template git@github.com:victorzinho/js-boilerplate <your_project>
cd <your_project>
git remote add origin <your_repo>
(start working)
```
