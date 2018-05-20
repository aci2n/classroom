(function(window) {
	"use strict";
    
	function getDom() {
		const selectors = {
			background: "#background",
			kanjiInfo: "#kanji-info",
			insertTarget: "#insert-target",
			clear: "#clear",
			title: "#title"
		};
            
		return Object.keys(selectors).reduce((map, key) => {
			map[key] = document.querySelector(selectors[key]);
			return map;
		}, {});
	}
    
	function getConfig() {
		return Object.assign({
			title: "i2nの教室",
			backgroundCount: 0,
			backgroundTemplate: index => `img/${index}.png`,
			defaultSource: "https://hochanh.github.io/rtk/",
			fallbackSource: "https://kanji.koohii.com/study/kanji/"
		}, window.classroomConfig);
	}

	document.addEventListener("DOMContentLoaded", () => window.classroom(getDom(), getConfig()));
}(window));