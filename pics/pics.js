"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var jsonPath = path.join(path.resolve(__dirname, 'pics.json'));
var jsonData = {};
var newImageList = [];
fs.readFile(jsonPath, { encoding: 'utf-8' }, function (err, data) {
    if (err) {
        console.error(err);
        throw err;
    }
    try {
        var jsonData_1 = JSON.parse(data);
        var arrayInQuestion = jsonData_1[1];
        var urls = arrayInQuestion.map(function (item, index) { return ({
            src: item.download_url,
            alt: "sample alt text_".concat(index)
        }); });
        newImageList.push.apply(newImageList, urls);
        console.log('Image urls: ', newImageList);
    }
    catch (error) {
        console.error('Error: ', error);
    }
});
