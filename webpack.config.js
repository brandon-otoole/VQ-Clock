module.exports = {
    entry: {
        main: "./src/main.js",
        vendor: "./src/vendor.js",
    },
    output: {
        path: __dirname + '/dist/ui',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.html$/,
                use: ["html-loader"],
            },
        ]
    },
    plugins: [
    ],
}
