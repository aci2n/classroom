(function(window) {
	"use strict";
    
	function customizeLinks(links, kanjiInfo) {
		function handler(event) {
			event.preventDefault();
			kanjiInfo.src = event.target.href;
		}
        
		for (let link of links) {
			link.addEventListener("click", handler);
		}
        
		if (links.length > 0) {
			links[links.length - 1].click();
		}
	}
    
	function maybeUseFallbackSource(kanjiInfo, defaultSource, fallbackSource) {
		const src = kanjiInfo.src;
        
		if (src.startsWith(defaultSource)) {     
			fetch(src).then(response => {
				if (response.status !== 200) {
					kanjiInfo.src = src.replace(defaultSource, fallbackSource);
				}
			}); 
		}
	}
    
	function addRtkLinks(text, defaultSource) {		
		return text.replace(/([\u4e00-\u9faf])/g, `<a href='${defaultSource}$1'>$1</a>`);
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
    
	function onMutation(records, kanjiInfo, defaultSource) {
		const target = records[0].target;
		
		records.forEach(record => record.addedNodes.forEach(node => {
			node.title = node.parentNode.childNodes.length + " - " + new Date().toTimeString();
			node.innerHTML = addRtkLinks(cleanText(node.textContent), defaultSource) + "\n";
			customizeLinks(node.querySelectorAll("a"), kanjiInfo);
		}));
		target.scrollTop = target.scrollTopMax;
	}
    
	function clearElement(element) {
		element.innerHTML = "";
	}
    
	function initInsertTargetObserver(insertTarget, kanjiInfo, defaultSource) {
		new MutationObserver(mutation => onMutation(mutation, kanjiInfo, defaultSource))
			.observe(insertTarget, {childList: true});
	}
    
	function initClearButton(clear, insertTarget) {
		clear.addEventListener("click", () => clearElement(insertTarget));
	}
    
	function initKanjiInfo(kanjiInfo, defaultSource, fallbackSource) {
		kanjiInfo.addEventListener("load", () => maybeUseFallbackSource(kanjiInfo, defaultSource, fallbackSource));
		kanjiInfo.src = defaultSource;
	}
    
	function initBackground(background, count, template, tries = 3) {     
		if (count > 0 && tries > 0) {
			background.onerror = () => initBackground(background, count, template, tries - 1);
			background.src = template(Math.floor(Math.random() * count) + 1);
		} else {
			background.remove();
		}
	}
    
	function initKeybinds(background, backgroundCount, backgroundTemplate) {
		const handlers = {
			r: () => initBackground(background, backgroundCount, backgroundTemplate)
		};

		document.addEventListener("keydown", event => {
			const key = event.key.toLowerCase();
            
			if (handlers[key]) {
				handlers[key](event);
			}
		});
	}

	function initTitle(element, text) {
		element.textContent = text;
	}
    
	function initClassroom(dom, config) {
		initInsertTargetObserver(dom.insertTarget, dom.kanjiInfo, config.defaultSource);
		initClearButton(dom.clear, dom.insertTarget);
		initKanjiInfo(dom.kanjiInfo, config.defaultSource, config.fallbackSource);
		initBackground(dom.background, config.backgroundCount, config.backgroundTemplate);
		initKeybinds(dom.background, config.backgroundCount, config.backgroundTemplate);
		initTitle(dom.title, config.title);
	}

	window.classroom = initClassroom;
}(window));
