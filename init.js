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
			background: {
				count: 0,
				template: index => `img/${index}.png`
			},
			sources: [
				{
					name: "RTK Search",
					template: kanji => `https://hochanh.github.io/rtk/${kanji}`,
					test: src => fetch(src).then(response => response.status === 200),
					start: "https://hochanh.github.io/rtk/"
				},
				{
					name: "Koohii",
					template: kanji => `https://kanji.koohii.com/study/kanji/${kanji}`,
					start: "https://kanji.koohii.com/study/"
				},
				{
					name: "Jishoo",
					template: kanji => `https://jisho.org/search/${kanji}#kanji`,
					start: "https://jisho.org/"
				}
			]
		}, window.classroomConfig);
	}

	document.addEventListener("DOMContentLoaded", () => window.classroom(getDom(), getConfig()));
}(window));