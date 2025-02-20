const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const nodePolyFillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  devServer: {
    // hot: true,
    historyApiFallback: true,
    port: 8080,
    static: [
      {
        directory: path.join(__dirname, 'build'),
        publicPath: '/',
      },
    ],
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },

  entry: path.join(__dirname, 'index.js'),
  devtool: 'eval-source-map', // added to resolve the dev tool error in chrome console

  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js',
  },

  mode: process.env.NODE_ENV,

  plugins: [
    new htmlWebpackPlugin({ template: './index.html' }),
    new nodePolyFillPlugin(),
  ],

  module: {
    rules: [
      // for TSX files
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        // for JS & JSX files
        test: /.(js|jsx)$/,
        exclude: path.resolve(__dirname, 'node_modules'), // there was a typo here (node-modules)
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        ],
      },
      {
        // for CSS/SASS files
        test: /.(css|scss)$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },

      { test: /\\.(png|jp(e*)g|svg|gif)$/, use: ['file-loader'] },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
