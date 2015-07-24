var fs = require('fs');
var path = require('path');
var open = require('open');
var DOMBuilder = require('DOMBuilder');

var config = require('./config');


(function() {
	'use strict';
	// create lab folder if not exist
	if(! fs.existsSync(config.menuPath)){
		fs.mkdirSync(config.menuPath);
	}
	// create metadata file if not exist
	if(! fs.existsSync(config.metaFilePath)){
		// create with default
		fs.writeFileSync(config.metaFilePath, JSON.stringify(config.default_meta, null, "\t"),{flag:"w"});
	}

	// read the meta file
	var meta = JSON.parse(fs.readFileSync(config.metaFilePath, {encoding: 'utf8'}));

	// upgrade meta if needed
	if(meta.labVersion < config.labVersion){
		meta = upgradeMeta(meta, meta.labVersion);
		fs.writeFileSync(config.metaFilePath, JSON.stringify(meta, null, "\t"),{flag:"w"});
	}

	for (var key in meta.ignorePath) {
		if (meta.ignorePath.hasOwnProperty(key)) {
			meta.ignorePath[config.labPath + key] = meta.ignorePath[key];
			delete meta.ignorePath[key];
		}
	}

	// get file list
	var dirFiles = fs.readdirSync(config.labPath);

	// labs array
	// {name, description, bannerPath, path, runCommand, likes, dislikes}
	var labs = [];
	// for all files here
	for (var i = 0; i < dirFiles.length; i++) {
		// if is folder
		if(fs.statSync(config.labPath + dirFiles[i]).isDirectory()){

			var labEntry = {
				"labVersion": config.labVersion,
				"created": config.makeTimestamp(new Date()),
				"name": "noname",
				"description": "description",
				"bannerPath": null,
				"path": config.labPath + dirFiles[i],
				"runCommand": "",
				likes: 0,
				dislikes: 0
			};
			labEntry.name = path.basename(labEntry.path);


			// ignore if wanted:
			// a. includes an ignore file
			if(fs.existsSync(labEntry.path + "/" + config.ignoreEntryName)) continue;
			// b. listed as ignored in meta
			if(meta.ignorePath[labEntry.path]) continue;

			var labEntryPath = labEntry.path + "/" + config.labEntryFolderName + "/" + config.labEntryName;

			// create labentry folder if not exists
			if(! fs.existsSync(labEntry.path + "/" + config.labEntryFolderName)){
				fs.mkdirSync(labEntry.path + "/" + config.labEntryFolderName);
			}

			// if entry file is not created
			if(! fs.existsSync(labEntryPath)){
				// create with default
				fs.writeFileSync(labEntryPath, JSON.stringify(labEntry, null, "\t"),{flag:"w"});
			}
			// read the entry file
			labEntry = JSON.parse(fs.readFileSync(labEntryPath, {encoding: 'utf8'}));

			console.log(labEntryPath);

			labs.push(labEntry);
		}
	}

	var menuPage = makeHTML(meta, labs);

	fs.writeFileSync(config.htmlPath, menuPage,{flag:"w"});

	open(config.htmlPath);

	//fs.createReadStream(config.stylesheetName).pipe(fs.createWriteStream(config.menuPath + config.stylesheetName));

	return 0;

	function newLabEntry(path, content){
		return fs.writeFileSync(path, content);
	}


	function upgradeMeta(refMeta, ver){
		return config.default_meta;
	}


	function makeHTML(meta, labs){
		return (function(e){
			var html = "<!DOCTYPE html>"+
			e.HTML({lang:"en"},
				e.HEAD(
					e.TITLE(meta.title),
					e.META({"http-equiv": "Content-Type", content: "text/html; charset=UTF-8"}),
					e.STYLE({type:"text/css"},
						"html { margin: 0; padding: 0; }\
						"
					),
					e.LINK({rel:"stylesheet", type:"text/css", href:"style.css"})
				),
				e.BODY(
					e.H1(meta.title),
					e.DIV({"id":"labs"},
						createTable(e,labs)
					)
				)
			);
			return html;
		})(DOMBuilder.elements);

		function createTable(e,labs) {
			// loop{index:number, first:bool, last:bool}
			/*
			 *  {
			 *  	"labVersion": config.labVersion,
			 *  	"created": config.makeTimestamp(new Date()),
			 *  	"name": "noname",
			 *  	"description": "description",
			 *  	"bannerPath": null,
			 *  	"path": dirFiles[i],
			 *  	"runCommand": "",
			 *  	likes: 0,
			 *  	dislikes: 0
			 *  };
			 */
			return e.DIV.map(labs, function(labEntry, attributes, loop) {
				return e.DIV({"class":"lab-entry" + (loop.index % 2 == 0 ? ' stripe1' : ' stripe2')},
					e.IMG({"src": labEntry.bannerPath}),
					e.DIV({"class":""},
						e.H2(labEntry.name),
						e.P(labEntry.likes + " / " + (labEntry.likes + labEntry.dislikes) + " likes"),
						e.P(DOMBuilder.html.markSafe(labEntry.description))
					)
				);
			});

		}
	}


}());
