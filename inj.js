// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#0FF', '#F0F']
var hlcolors = ['#990', '#099', '#909']
var colornum = 0

// 検索結果をハイライトするための関数
var rep_sw = true
// function Replacer( str, offset, s ){
// 	// scriptとstyleを避けるため
// 	if(
// 		str == '<script>' ||
// 		str == '<SCRIPT>' ||
// 		str == '<style>' ||
// 		str == '<STYLE>'
// 	){
// 		rep_sw = false
// 	}
// 	else if(
// 		str == '</script>' ||
// 		str == '</SCRIPT>' ||
// 		str == '</style>' ||
// 		str == '</STYLE>'
// 	){
// 		rep_sw = true
// 	}
// 	if( !rep_sw || str[0] == "<" ){
// 		// 置換しない
// 		return str;
// 	}
// 	return '<span class="itel-search-hightlight" style=\"background-color:'+colors[colornum]+'\">' + str +'</span>';
// }
function Replacer( str, offset, s ){
	// scriptとstyleを避けるため
	if(
		str == '<script>' ||
		str == '<SCRIPT>' ||
		str == '<style>' ||
		str == '<STYLE>'
	){
		rep_sw = false
	}
	else if(
		str == '</script>' ||
		str == '</SCRIPT>' ||
		str == '</style>' ||
		str == '</STYLE>'
	){
		rep_sw = true
	}
	if( !rep_sw || str[0] == "<" ){
		// 置換しない
		return str;
	}
	return '<span class="itel-search-hightlight" style=\"background-color:'+colors[colornum]+'\">' + str +'</span>';
}
function main(){
	// 過去の検索結果を削除するため
	// えいち・える・えす
	var hls = document.getElementsByClassName('itel-search-hightlight')
	console.log(hls)
	for(let n = 0; n < hls.length; n++){
		let hl = hls[0]
		hl.outerHTML = hl.innerHTML
	}

	// 検索結果をハイライト
	var words = search_words
	if(words.length == 0){
		return
	}
	var text = document.body.innerHTML
	for(let n = 0; n < words.length; n++){
		let word = words[n]
		// 置換処理
		var reg = new RegExp('<[^>]+>|'+word, 'g')
		text = text.replace(reg, Replacer)
		colornum++
		colornum %= colors.length
	}
	document.body.innerHTML = text
}
main()