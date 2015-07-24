module.exports = (function() {
	var config = {};
	config.labPath = "../";
	config.menuPath = config.labPath + "labMenu/";
	config.metaFilePath = config.menuPath + "meta.json";
	config.htmlPath = config.menuPath + "index.html";
	config.stylesheetName = "style.css";

	config.labEntryFolderName = ".labEntry/";
	config.labEntryName = "project.json";
	config.labEntryBannerName = "project.png";
	config.ignoreEntryName = "labIgnore.txt";

	config.labVersion = 4;

	config.default_meta = {
		title:"My Lab",
		labVersion: config.labVersion,
		created: makeTimestamp(new Date()),
		ignorePath:{
			"_portableLab": true,
			"node_modules": true
		}
	}

	config.makeTimestamp = makeTimestamp;
	function makeTimestamp(date){
		function zeroPad(a){
			if(a<10){
				return "0"+a;
			}else{
				return ""+a;
			}
		}
		return ""+
			date.getFullYear()+
			zeroPad(date.getMonth()+1)+
			zeroPad(date.getDate())+"_"+
			zeroPad(date.getHours())+
			zeroPad(date.getMinutes())+
			zeroPad(date.getSeconds());

	}
	return config;
}());
