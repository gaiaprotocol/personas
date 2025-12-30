const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './index.ts',
  output: {
    filename: 'firebase-messaging-sw.js',
    path: path.resolve(__dirname,
      process.env.NODE_ENV === 'production' ? '../public' : (
        process.env.NODE_ENV === 'testnet' ? '../public-testnet' : '../public-dev'
      )
    )
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.json',
          }
        },
        exclude: /node_modules/
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new webpack.DefinePlugin({
      GAIA_API_BASE_URI: JSON.stringify(
        process.env.NODE_ENV === 'production'
          ? 'https://api.gaia.cc'
          : (
            process.env.NODE_ENV === 'testnet'
              ? 'https://testnet.api.gaia.cc'
              : 'http://localhost:8080'
          )
      )
    })
  ],
  mode: 'development'
};
