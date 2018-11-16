function getSTRING() {
	var language = navigator.language
	if (!lang.hasOwnProperty(language)) {
		return lang['en']
	}
	return lang[language]
}