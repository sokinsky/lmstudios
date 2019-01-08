var path = require('path');

module.exports = {
	watch:true,
	entry: "./src/main.ts",
	resolve: {
		extensions: [".ts", ".js", ".tsx", "jsx"]
	},
	output: {
		path: path.resolve(__dirname, 'wwwroot'),
		filename: 'resources/bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [ "awesome-typescript-loader", "angular2-template-loader" ]
			},
			{
				test: /\.html$/,
				use: "html-loader"
			},
			{
				test: /\.css$/,
				use: ['raw-loader']
			}
		]
	},
	devtool: "eval"
};