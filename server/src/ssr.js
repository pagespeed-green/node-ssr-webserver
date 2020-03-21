const path = require('path');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { ChunkExtractor } = require('@loadable/server');
const ejs = require('ejs');
const { minify } = require('html-minifier');

const nodeStats = path.resolve(
  __dirname,
  '../dist/node/loadable-stats.json',
)

const webStats = path.resolve(
  __dirname,
  '../dist/web/loadable-stats.json',
)

const distPath = path.resolve(
  __dirname,
  '../dist/web',
)

function mockBrowser() {
  global.document = {
    addEventListener: () => {},
    getElementById: () => {},
    title: '',
    URL: 'pagespeed.green',
  };
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    location: {
      hostname: 'pagespeed.green',
      replace: () => {},
    },
  };
  global.navigator = {
    userAgent: 'node.js',
  };
  global.localStorage = {
    getItem: () => '',
    setItem: () => {},
  };
}

async function getServerHtmlByRoute(route) {
  process.env.NODE_ENV = 'production';
  mockBrowser();

  const nodeExtractor = new ChunkExtractor({ statsFile: nodeStats });
  const { default: App } = nodeExtractor.requireEntrypoint();

  const webExtractor = new ChunkExtractor({ statsFile: webStats });

  const jsx = webExtractor.collectChunks(React.createElement(App, { route }));
  const innerHtml = renderToString(jsx);
  const css = await webExtractor.getCssString();
  const data = {
    innerHtml,
    linkTags: webExtractor.getLinkTags(),
    styleTags: webExtractor.getStyleTags(),
    scriptTags: webExtractor.getScriptTags(),
    css,
  };

  const templateFile = path.resolve(__dirname, './index.ejs');

  const html = await ejs.renderFile(templateFile, data);
  const htmlMini = minify(html, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    decodeEntities: true,
    minifyCSS: true,
    minifyJS: true,
    processConditionalComments: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
  })

  return htmlMini;
}

module.exports = {
  getServerHtmlByRoute,
};
