const path = require('path');

const express = require('express');

module.exports = {createLocalHtmlServer:function(){

	const app = express();

	app.use(express.static(path.join(__dirname,'..','public')));

	app.listen(58101);

}};