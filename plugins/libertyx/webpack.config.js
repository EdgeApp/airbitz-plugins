// webpack.config.js
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const indexHtml = path.join(__dirname, "src", "index.html");
const DEVELOPMENT = process.env.NODE_ENV === 'development';

module.exports = {
    entry: ['./src/app/app.ts'],
    output: {
        path: __dirname,
        filename: DEVELOPMENT ? '[name].js' : '[name].[chunkhash].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.ts$/,
            loader: DEVELOPMENT ? 'awesome-typescript-loader' : 'strip-loader?strip[]=console.log!awesome-typescript-loader'
        }, {
            test: /\.scss$/,
            loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
        }, {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader']
        }, {
            test: /\.(png|jpg|jpeg|gif|svg|eot|woff|woff2|ttf)$/,
            loader: "url-loader"
        }, {
            test: indexHtml,
            loader: "html-loader?" + JSON.stringify({
                attrs: ["img:src", "link:href"],
                minimize: false
            })
        }, {
            test: /\.pug$/,
            loader: "ngtemplate-loader!html-loader!pug-html-loader?exports=false"
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
    ]
};