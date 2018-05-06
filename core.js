(function() {
	'use strict';
    
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
        
        if (src.startsWith(config.defaultSource)) {     
            fetch(src).then(response => {
                if (response.status !== 200) {
                    frame.src = src.replace(config.defaultSource, config.fallbackSource);
                }
            }); 
        }
    }
    
    function addRtkLinks(text) {		
		return text.replace(/([\u4e00-\u9faf])/g, `<a href='${config.defaultSource}$1'>$1</a>`);
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
    
    function setupBackground(img, tries) {
        if (!(config.backgroundCount > 0) || tries === 0) {
            img.remove();
            return;
        }
        
        img.onerror = event => setupBackground(img, tries - 1);
        img.src = "img/" + (Math.floor(Math.random() * config.backgroundCount) + 1) + ".png";
    }
	
	function onLoad(event) {
        const main = document.querySelector("#insert-target");
        const frame = document.querySelector("#kanji-info");

		new MutationObserver(records => onMutation(records, frame)).observe(main, {childList: true});
        document.querySelector("#clear").addEventListener("click", event => main.innerHTML = "");
        frame.addEventListener("load", maybeUseFallbackSource);
        frame.src = config.defaultSource;
        setupBackground(document.querySelector("#background"), 3);
	}
	
	document.addEventListener("DOMContentLoaded", onLoad);
}());
