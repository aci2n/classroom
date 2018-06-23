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

	function updateStats(stats, insertTarget) {
		const nodes = insertTarget.childNodes.length;
		let mins = 0;
		let cpm = 0;

		if (nodes > 0) {
			if (nodes === 1) {
				stats.dataset.startTime = Date.now();
			}

			mins = (Date.now() - stats.dataset.startTime) / 1000 / 60;

			if (mins > 0) {
				cpm = insertTarget.textContent.replace(/[^「」『』|！？ー―-。….、,\s\n]/g, "").length / mins;
			}
		}

		const data = { "🕓": mins.toFixed(2), "💬": cpm.toFixed(2) };

		stats.innerHTML = Object.keys(data).reduce((accum, key) => {
			return accum + `<dd>${key}</dd><dt>${data[key]}</dt>`;
		}, "");
	}
    
	function onMutation(records, kanjiInfo, insertTarget, stats, defaultSource) {
		const target = records[0].target;
		
		records.forEach(record => record.addedNodes.forEach(node => {
			node.title = insertTarget.childNodes.length;
			node.innerHTML = addRtkLinks(cleanText(node.textContent), defaultSource) + "\n";
			customizeLinks(node.querySelectorAll("a"), kanjiInfo);
		}));
		updateStats(stats, insertTarget);
		target.scrollTop = target.scrollTopMax;
	}
    
	function clearElement(element) {
		element.innerHTML = "";
	}
    
	function initInsertTargetObserver(insertTarget, kanjiInfo, stats, defaultSource) {
		new MutationObserver(mutation => onMutation(mutation, kanjiInfo, insertTarget, stats, defaultSource))
			.observe(insertTarget, {childList: true});
	}
    
	function initClearButton(clear, insertTarget) {
		clear.addEventListener("click", () => clearElement(insertTarget));
	}
    
	function initKanjiInfo(kanjiInfo, defaultSource, fallbackSource) {
		if (fallbackSource) {
			kanjiInfo.addEventListener("load", () => maybeUseFallbackSource(kanjiInfo, defaultSource, fallbackSource));
		}
		
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
			r: event => {
				if (event.target === document.body) {
					initBackground(background, backgroundCount, backgroundTemplate);
				}
			}
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

	function initManualInsert(textarea, insertTarget) {
		textarea.addEventListener("input", () => {
			const value = textarea.value;
			const last = value.length - 1;

			if (value[last] === "\n") {
				textarea.value = "";

				if (value.length > 1)  {
					const node = document.createElement("p");
					node.textContent = value.substring(0, last);
					insertTarget.appendChild(node);
				}
			}
		});
	}
    
	function initClassroom(dom, config) {
		initInsertTargetObserver(dom.insertTarget, dom.kanjiInfo, dom.stats, config.defaultSource);
		initClearButton(dom.clear, dom.insertTarget);
		initKanjiInfo(dom.kanjiInfo, config.defaultSource, config.fallbackSource);
		initBackground(dom.background, config.backgroundCount, config.backgroundTemplate);
		initKeybinds(dom.background, config.backgroundCount, config.backgroundTemplate);
		initTitle(dom.title, config.title);
		initManualInsert(dom.manualInsert, dom.insertTarget);
		updateStats(dom.stats, dom.insertTarget);
	}

	window.classroom = initClassroom;
}(window));
