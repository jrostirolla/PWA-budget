const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const config = {
    mode: "production",
    entry: {
        index: "/public/index.js",
    },
    output: {
        path: __dirname + "/public/dist",
        filename: "[name].bundle.js",
        publicPath: '',
    },
    plugins: [
        new WebpackPwaManifest({
        //configuration
            // filename: "manifest.json",
            inject: false,
            fingerprints: false,
        //contents
            name:"PWA-Budget-Tracker",
            short_name: "budgetTracker",
            description: "An Offline / online budget tracker",
            theme_color: "#ffffff",
            background_color: "#ffffff",
            start_url:"/",
            // display: "standalone",
        //icon setup
            icons: [
                {
                    src: path.resolve("public/icons/icon-192x192.png"),
                    size: [192, 512],
                    destination: path.join("icons")
                }]
        })
    ],
    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"]
              }
            }
          }
        ]
      }
    };

module.exports = config;