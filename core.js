(function() {
	'use strict';
		
	function addRtkLinks(text) {		
		const exp = /([\u4e00-\u9faf])/g;
		const rep = "<a href='https://hochanh.github.io/rtk/$1' target='rtk'>$1</a>";
		
		return text.replace(exp, rep);
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
	
	function nodeTitle(node) {
		return node.parentNode.childNodes.length + " - " + new Date().toLocaleString();
	}

	function processNode(node) {
		let anchor = null;

		node.title = nodeTitle(node);
		node.innerHTML = addRtkLinks(cleanText(node.textContent)) + "\n";
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
    
    function clearContent(element) {
        element.innerHTML = "";
    }
	
	function onLoad(event) {
        const main = document.querySelector("main");
        
		new MutationObserver(onMutation).observe(main, {
			childList: true
		});
        
        document.querySelector("h1 img").addEventListener("click", function() {
            clearContent(main);
        });
	}
	
	document.addEventListener("DOMContentLoaded", onLoad);
}());
