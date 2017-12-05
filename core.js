(function() {
	'use strict';
		
	function isKanji(character) {	
		const codePoint = character.codePointAt(0);
		
		return codePoint >= 0x4e00 && codePoint <= 0x9faf;
	}

	function addRtkLinks(text) {		
		let html = "";
		
		for (let i = 0; i < text.length; i++) {
			const character = text[i];
			
			if (isKanji(character)) {
				html += `<a href="https://hochanh.github.io/rtk/${character}" target="rtk">${character}</a>`;
			} else {
				html += character;
			}
		}
		
		return html;
	}

	function processNode(node) {
		let anchor = null;

		node.innerHTML = addRtkLinks(node.textContent);
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
