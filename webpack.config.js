var path = require('path');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

var webpackConfig = {
    entry: path.join(__dirname, 'js/init.js'),
    output: { path: path.join(__dirname, 'public'), filename: 'app.js' },
    externals: { 'google': 'google' },
    module: {
        rules: [
            {
                test: /\.js$/, exclude: [/node_modules/], use: ['babel-loader'] },
            {
                test: /\.styl$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "stylus-loader",
                ],
            },
            { test: /\.svg$/, use: ['raw-loader'] },
            { test: /\.brf$/, use: ['raw-loader'] },
            { test: /\.brfc$/, use: ['./web_loaders/profile.loader.js'] },
        ]
    },
    node: {
        // prevent webpack from injecting useless setImmediate polyfill because$
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    optimization: {
        minimizer: [
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "app.css",
        })
    ],
};


module.exports = webpackConfig;
