(function() {
	'use strict';
    
    const DEFAULT_SOURCE = "https://hochanh.github.io/rtk/";
    const FALLBACK_SOURCE = "https://kanji.koohii.com/study/kanji/";
	
    function customizeLinks(links, frame) {
        function handler(event) {
            event.preventDefault();
            frame.src = event.target.href;
        }
        
        for (let link of links) {
            link.addEventListener("click", handler);
        }
        
        if (links.length > 0) {
            links[links.length - 1].click();
        }
    }
    
    function maybeUseFallbackSource(event) {
        const frame = event.target;
        const src = frame.src;
        
        if (src.startsWith(DEFAULT_SOURCE)) {     
            fetch(src).then(response => {
                if (response.status !== 200) {
                    frame.src = src.replace(DEFAULT_SOURCE, FALLBACK_SOURCE);
                }
            }); 
        }
    }
    
    function addRtkLinks(text) {		
		return text.replace(/([\u4e00-\u9faf])/g, `<a href='${DEFAULT_SOURCE}$1'>$1</a>`);
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
    
	function onMutation(records, frame) {
		const target = records[0].target;
		
		records.forEach(record => record.addedNodes.forEach(node => {
            node.title = node.parentNode.childNodes.length + " - " + new Date().toTimeString();
            node.innerHTML = addRtkLinks(cleanText(node.textContent)) + "\n";
            customizeLinks(node.querySelectorAll("a"), frame);
        }));
		target.scrollTop = target.scrollTopMax;
	}
    
	
	function onLoad(event) {
        const main = document.querySelector("#insert-target");
        const frame = document.querySelector("#kanji-info");

		new MutationObserver(records => onMutation(records, frame)).observe(main, {childList: true});
        document.querySelector("#clear").addEventListener("click", event => main.innerHTML = "");
        frame.addEventListener("load", maybeUseFallbackSource);
        frame.src = DEFAULT_SOURCE;
	}
	
	document.addEventListener("DOMContentLoaded", onLoad);
}());
