(function() {
	'use strict';
		
	function isKanji(character) {	
		const codePoint = character.codePointAt(0);
		
		return codePoint >= 0x4e00 && codePoint <= 0x9faf;
	}

	function addRtkLinks(text) {		
		let html = "";
		
		for (const character of text) {		
			if (isKanji(character)) {
				html += `<a href="https://hochanh.github.io/rtk/${character}" target="rtk">${character}</a>`;
			} else {
				html += character;
			}
		}
		
		return html;
	}
	
	function cleanText(text) {
		const filters = [
			{exp: /\u3000/g, rep: ""},  // weird line breaks
			{exp: /】[^「]+「/g, rep: "】「"} // file paths
		];
		
		for (const filter of filters) {
			text = text.replace(filter.exp, filter.rep);
		}
		
		return text;
	}

	function processNode(node) {
		let anchor = null;

		node.innerHTML = addRtkLinks(cleanText(node.textContent));
		
		anchor = node.querySelector("a:last-child");
		
		if (anchor) {
			document.querySelector("iframe[name='rtk']").src = anchor.href;
		}
	}
	
	function processRecord(record) {
		record.addedNodes.forEach(processNode);
	}
	
	function onMutation(records) {
		const target = records[0].target;
		
		records.forEach(processRecord);
		target.scrollTop = target.scrollTopMax;
	}
	
	function onLoad(event) {
		new MutationObserver(onMutation).observe(document.querySelector("main"), {
			childList: true
		});
	}
	
	document.addEventListener("DOMContentLoaded", onLoad);
}());
