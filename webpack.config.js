//
// faB: I don't know why the "dev" / "build" aliases in package.json stopped working, so
//      use the following instead:
//
//   Development build:
//
//   $ export NODE_ENV=development && webpack --hide-modules
//
//
//   Production build:
//
//   $ export NODE_ENV=production && webpack --progress --hide-modules
//
//

const webpack = require("webpack");

const isProduction = (process.env.NODE_ENV === 'production');

// Extract all the processed CSS in all Vue components into a single CSS file:
//  https://vue-loader.vuejs.org/en/configurations/extract-css.html
//  https://github.com/webpack/extract-text-webpack-plugin
var ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  
  // The base directory (absolute path!) for resolving the entry option.
  // Note: __dirname refers to the root of your project.
  //context: __dirname + "/src",

  // Here the application starts executing and webpack starts bundling
  entry: './lib/front/vue/vue-bundle.js',

  output: {

    // Webpack bundles everything to the output.path folder...
    path: __dirname + '/web/build/pack',

    // The publicPath specifies the public URL address of the output files when referenced in a browser
    publicPath: "/build/pack/",

    // ...naming it using the output.filename naming template
    filename:  isProduction ? "vue-bundle.min.js" : "vue-bundle.raw.js",
  },

  module: {

    // module.rules is the same as module.loaders in 1.x
    rules: [
      {
        test:    /\.vue$/,
        loader:  "vue-loader",
        // vue-loader options goes here
        options: {
          loaders: {

            css: ExtractTextPlugin.extract({
              loader: "css-loader",
              fallbackLoader: "vue-style-loader" // <- this is a dep of vue-loader, so no need to explicitly install if using npm3
            }),

            js: "babel-loader"
          }
        }
      },

      {
        // Ask webpack to check: If this file ends with .js, then apply some transforms
        test:    /\.js$/,
        loader:  "babel-loader",
        exclude: /node_modules/,

        // Options are in .babelrc 
        //options: { presets: ["es2015"] }
      },

      /* FIXME : only in production + work with .vue files
      {
        // strip debug code
        test:    /\.js$/,
        loader:  "strip-loader?strip[]=core.log,strip[]=console.log",
        exclude: /node_modules/,
      },
      */

      {
        test:    /\.(png|jpg|gif|svg)$/,
        loader:  'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },

  plugins: [
    // web/build/pack/app-vue.css
    new ExtractTextPlugin("app-vue.css"),

    // remove all debug code (including Vue.js warnings) in production
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: isProduction ? '"production"' : '"development"'
      }
    })
  ],

  resolve: {
    // aliases used in lib/front/vue/vue-bundle.js
    alias: {
      vue:     'vue/dist/vue.common.js'
      // coreJS:  '/lib/front/vue/lib'
    }
  },

  performance: {
    // turn off asset size warnings in development build
    // webpack 2.3.2 "npm run build" chokes on this...
    //hints: isProduction
  }
}

if (process.env.NODE_ENV === 'production')
{

  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.optimize.UglifyJsPlugin({
      //fab-- sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
