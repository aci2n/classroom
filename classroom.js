(function(window) {
	"use strict";
    
	function customizeLinks(links, kanjiInfo) {
		function handler(event) {
			event.preventDefault();
			kanjiInfo.dataset.kanji = event.target.dataset.kanji;
			kanjiInfo.dataset.sourceIndex = kanjiInfo.dataset.defaultSourceIndex;
			refreshKanjiInfoSrc(kanjiInfo);
		}
        
		for (let link of links) {
			link.addEventListener("click", handler);
		}
        
		if (links.length > 0) {
			links[links.length - 1].click();
		}
	}
    
	function maybeUseFallbackSources(kanjiInfo, sources) {
		const index = parseInt(kanjiInfo.dataset.sourceIndex);
		const source = sources[index];

		if (index === sources.length - 1 || !source || !source.test) {
			return;
		}

		source.test(kanjiInfo.src).then(success => {
			if (!success) {
				kanjiInfo.dataset.sourceIndex = index + 1;
			}
		});
	}
    
	function addRtkLinks(text, defaultSourceTemplate) {
		return text.replace(/([\u4e00-\u9faf])/g, kanji => `<a href="${defaultSourceTemplate(kanji)}" data-kanji="${kanji}">${kanji}</a>`);
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
    
	function onTextInserted(records, kanjiInfo, defaultSourceTemplate) {
		const target = records[0].target;
		
		records.forEach(record => record.addedNodes.forEach(node => {
			node.title = node.parentNode.childNodes.length + " - " + new Date().toTimeString();
			node.innerHTML = addRtkLinks(cleanText(node.textContent), defaultSourceTemplate) + "\n";
			customizeLinks(node.querySelectorAll("a"), kanjiInfo);
		}));
		target.scrollTop = target.scrollTopMax;
	}
    
	function clearElement(element) {
		element.innerHTML = "";
	}
    
	function initInsertTargetObserver(insertTarget, kanjiInfo, defaultSourceTemplate) {
		new MutationObserver(records => onTextInserted(records, kanjiInfo, defaultSourceTemplate))
			.observe(insertTarget, {childList: true});
	}
    
	function initClearButton(clear, insertTarget) {
		clear.addEventListener("click", () => clearElement(insertTarget));
	}

	function refreshKanjiInfoSrc(kanjiInfo, sources) {
		const source = sources[parseInt(kanjiInfo.dataset.sourceIndex)];
		const kanji = kanjiInfo.dataset.kanji;

		if (source && kanji) {
			kanjiInfo.src = source.template(kanji);
		}
	}
    
	function initKanjiInfo(kanjiInfo, sources) {
		kanjiInfo.addEventListener("load", () => maybeUseFallbackSources(kanjiInfo, sources));
		kanjiInfo.src = sources[0].start;
		kanjiInfo.dataset.defaultSourceIndex = 0;
		initKanjiInfoAttributesObserver(kanjiInfo, sources);
	}
    
	function initBackground(element, config, tries = 3) {     
		if (config.count > 0 && tries > 0) {
			element.onerror = () => initBackground(element, config, tries - 1);
			element.src = config.template(Math.floor(Math.random() * config.count) + 1);
		} else {
			element.remove();
		}
	}
    
	function initKeybinds(backgroundElement, backgroundConfig) {
		const handlers = {
			r: () => initBackground(backgroundElement, backgroundConfig)
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
		initInsertTargetObserver(dom.insertTarget, dom.kanjiInfo, config.sources[0].template);
		initClearButton(dom.clear, dom.insertTarget);
		initKanjiInfo(dom.kanjiInfo, config.sources);
		initBackground(dom.background, config.background);
		initKeybinds(dom.background, config.background);
		initTitle(dom.title, config.title);
	}

	window.classroom = initClassroom;
}(window));
