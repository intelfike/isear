var language = browser.i18n.getUILanguage().substr(0, 2)
function getSTRING() {
	if (!lang.hasOwnProperty(language)) {
		language = 'en'
	}
	return lang[language]
}

function lang_set(key, lang_data) {
	return lang_set_attr(key, 'innerText', lang_data)
}
function lang_set_attr(key, attr, lang_data) {
	let objs = document.querySelectorAll('[lang-set="' + key + '"]')
	if (objs == null || objs.length == 0) {
		return false
	}
	for (let n in objs) {
		let obj = <HTMLElement>objs[n]
		obj[attr] = lang_data[language]
	}
	return true
}