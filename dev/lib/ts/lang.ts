function getSTRING() {
	var language = navigator.language.substr(0, 2)
	if (!lang.hasOwnProperty(language)) {
		language = 'en'
	}
	return lang[language]
}