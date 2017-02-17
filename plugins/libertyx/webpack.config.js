// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const indexHtml = path.join(__dirname, "src", "index.html");
const DEVELOPMENT = process.env.NODE_ENV == 'development';

module.exports = {
    entry: ['./src/app/app.ts'],
    output: {
        path: __dirname,
        filename: DEVELOPMENT ? '[name].js' : '[name].[chunkhash].js'
    },
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js', '.jsx']
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.ts$/,
            loader: DEVELOPMENT ? 'awesome-typescript-loader' : 'strip-loader?strip[]=console.log!awesome-typescript-loader'
        }, {
            test: /\.scss$/,
            loaders: ['style', 'css', 'postcss', 'sass']
        }, {
            test: /\.css$/,
            loaders: ['style', 'css']
        }, {
            test: /\.(png|jpg|jpeg|gif|svg|eot|woff|woff2|ttf)$/,
            loader: "url"
        }, {
            test: indexHtml,
            loader: "html?" + JSON.stringify({
                attrs: ["img:src", "link:href"],
                minimize: false
            })
        }, {
            test: /\.pug$/,
            loader: "ngtemplate!html!pug-html?exports=false"
        }]
    },
    devServer: {
        proxy: {
            '/wallet-api/v1': {
                target: 'https://libertyx.com',
                secure: true,
                changeOrigin: true
            }
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            DEVELOPMENT: DEVELOPMENT
        }),
        new HtmlWebpackPlugin({
            template: indexHtml,
            inject: 'head',
            minify: false
        })
    ],
    postcss: function () {
        return [autoprefixer];
    }
};