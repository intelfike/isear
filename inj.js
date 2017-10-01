// 呼び出し元に返す値(callback)
var words_nums = {}
// 再帰的にテキストノードを書き換えるため
var rep_sw = true
function replace_rec(obj, word, className, bgcolor, regbool){
	if(obj.nodeType == 3){ // テキストノードなら
		// 置換処理
		var text = obj.data
		if(text.trim(' 　	') == ''){
			return
		}
		var parentClassName = className + '-parent'

		if(regbool){
			var m = regMatch(obj.data, word)
			if(m == null){
				return
			}
			word = m[0]
		}
		var start = unifyWord(obj.data).indexOf(unifyWord(word))
		if(start == -1){
			return
		}
		words_nums[word]++
		
		newGroup = document.createElement('esspan') // 複数のノードをまとめる
		newGroup.className = parentClassName
		
		newObj = document.createElement('esspan')
		newObj.className = className
		newObj.style.backgroundColor = bgcolor
		newObj.style.color = "black"
		var middle = text.substr(start, word.length)
		newObj.innerText = middle
		newGroup.append(newObj)
		
		var prefix = text.substr(0, start)
		newGroup.prepend(prefix)
		
		var suffix = text.substr(start+word.length)
		newGroup.append(suffix)
		
		obj.parentNode.replaceChild(newGroup, obj)
		newGroup.outerHTML = newGroup.innerHTML
		return
	}
	if(obj.nodeType != 1 || 
		new RegExp(className,'g').test(obj.className)){
		return
	}
	for(let n = 0; n < obj.childNodes.length; n++){
		let child = obj.childNodes[n]
		if(child.nodeType == 1){	
			if(child.style.display == 'none' ||
				child.style.visibility == 'hidden' ||
				child.tagName == 'STYLE' ||
				child.tagName == 'SCRIPT' ||
				child.tagName == 'TEXTAREA'
				){
				continue
			}
		}
		replace_rec(child, word, className, bgcolor, regbool)
	}
}
function wordMatch(str, word, regbool){
	if(regbool){
		var m = regMatch(elem.innerText, word)
		if(m != null){
			word = m[0]
		}
	}
	return unifyWord(str) == unifyWord(word)
}
function regMatch(str, regstr){
	var m = null
	try{
		m = unifyWord(str).match(new RegExp(unifyWord(regstr), 'g'))
	}catch(e){
		return null
	}
	if(m == null){
		return null
	}
	// プログラムの停止(無限ループ？)を回避する
	var result = []
	for(let n = 0; n < m.length; n++){
		if(m[n] == ''){
			continue
		}
		result.push(m[n])
	}
	return result
}

function offElementByClassName(c){
	// 過去の検索結果を削除するため
	// えいち・える・えす
	var hls = document.getElementsByClassName(c)
	for(let n = hls.length-1; n >= 0 ; n--){
		let hl = hls[n]
		hl.outerHTML = hl.innerHTML
	}
}

function getAbsTop(obj){
	if(obj == null || obj == undefined){
		return null
	}
	var rect = obj.getBoundingClientRect()
	var abstop = rect.top + window.pageYOffset
	return abstop
}
function scrollToObj(obj){
	var abstop = getAbsTop(obj)
	scrollTo(0, abstop-(window.innerHeight/2))
}
function focusToObj(obj, idName){
	// 過去のIDを削除する
	var s = document.getElementById(idName)
	if(s != null){
		s.removeAttribute('id')
	}
	
	if(obj == null){
		return
	}
	obj.id = idName
}
function getUnderCurrentElemNum(className){
	elems = document.getElementsByClassName(className)
	for(let n = 0; n < elems.length; n++){
		elem = elems[n]
		if(getAbsTop(elem) > window.pageYOffset){
			return n
		}
	}
	return 0
}
function scrollFocusAuto(obj, idName){
	var abstop = getAbsTop(obj)
	// 画面外ならスクロールする
	if(abstop > window.innerHeight+window.pageYOffset ||
		abstop < window.pageYOffset
	){
		scrollToObj(obj)
	}
	focusToObj(obj, idName)
}
function scrollFocusAutoNum(className, num, idName){
	var elems = document.getElementsByClassName(className)
	scrollFocusAuto(elems[num], idName)
}
var sfcount = 0
// 次の位置を返す
function sfcountNext(sfcount){
	sfcount++
	sfcount %= elems.length
	return sfcount
}
function sfcountPrev(sfcount){
	sfcount--
	if(sfcount == -1){
		sfcount = elems.length - 1
	}
	return sfcount
}
// 次のワードの位置を返す
function sfcountNextWord(sfcount, className, word, regbool=false){
	word = unifyWord(word)
	var elems = document.getElementsByClassName(className)
	var last = sfcountPrev(sfcount)
	while(sfcount != last){
		sfcount = sfcountNext(sfcount)
		let elem = elems[sfcount]
		if(wordMatch(elem.innerText, word, regbool)){
			return sfcount
		}
	}
	return -1
}
function sfcountPrevWord(sfcount, className, word, regbool=false){
	word = unifyWord(word)
	var elems = document.getElementsByClassName(className)
	var last = sfcountNext(sfcount)
	while(sfcount != last){
		sfcount = sfcountPrev(sfcount)
		let elem = elems[sfcount]
		if(wordMatch(elem.innerText, word, regbool)){
			return sfcount
		}
	}
	return -1
}
// 探索するクラス名と、選択時に一時的につけるid
function scrollFocusNext(className, idName){
	init_sfcount(className, idName, -1)
	
	elems = document.getElementsByClassName(className)
	sfcount = sfcountNext(sfcount)
	scrollFocusAuto(elems[sfcount], idName)
}
function scrollFocusPrev(className, idName){
	init_sfcount(className, idName, 1)
	
	elems = document.getElementsByClassName(className)
	sfcount = sfcountPrev(sfcount)
	scrollFocusAuto(elems[sfcount], idName)
}
// 次のワードを辿る
function scrollFocusNextWord(word, className, idName, regbool){
	init_sfcount(className, idName, -1)
	
	var elems = document.getElementsByClassName(className)
	sfcount = sfcountNextWord(sfcount, className, word, regbool)
	scrollFocusAuto(elems[sfcount], idName)
}
// 前のワードをたどる(上の関数の取り消し)
function scrollFocusPrevWord(word, className, idName, regbool){
	init_sfcount(className, idName, 1)

	var elems = document.getElementsByClassName(className)
	sfcount = sfcountPrevWord(sfcount, className, word, regbool)
	scrollFocusAuto(elems[sfcount], idName)
}
// pm:補正 
function init_sfcount(className, idName, pm){
	var selected = document.getElementById(idName)
	if(selected == null){
		sfcount = getUnderCurrentElemNum(className)
		sfcount += pm
	}
}
// フォーカス位置より前のワード数+1をカウント
function countBeforeWords(word, className, regbool){
	var elems = document.getElementsByClassName(className)
	var count = 0
	for (var i = sfcount; i >= 0; i--) {
		var elem = elems[i]
		if(wordMatch(elem.innerText, word, regbool)){
			count++
		}
	}
	return count
}


// 文字に融通を聞かせる為
function shiftLeftCode(code, leftCode, rightCode, range){
	if(rightCode <= code && code <= rightCode+range){
		code = code - rightCode + leftCode
	}
	return code
}
function shiftLeftChar(char, leftChar, rightChar, range){
	var code = char.charCodeAt()
	var leftCode = leftChar.charCodeAt()
	var rightCode = rightChar.charCodeAt()
	code = shiftLeftCode(code, leftCode, rightCode, range)
	return String.fromCharCode(code)
}
// 半角/全角、ひらがな/カタカナを柔軟に検索させるため
function shiftLeftChars(str, leftChar, rightChar, range){
	var chars = []
	for(let n = 0; n < str.length; n++){
		chars[n] = shiftLeftChar(str[n], leftChar, rightChar, range)
	}
	return chars.join('')
}
// 大文字/小文字、半角/全角、ひらがな/カタカナを柔軟に検索させるため
function unifyWord(word){
	word = shiftLeftChars(word, '0', '０', 9)
	word = shiftLeftChars(word, 'A', 'Ａ', 'Z'.charCodeAt()-'A'.charCodeAt())
	word = shiftLeftChars(word, 'a', 'ａ', 'z'.charCodeAt()-'a'.charCodeAt())
	word = shiftLeftChars(word, 'ぁ', 'ァ', 'ゔ'.charCodeAt()-'ぁ'.charCodeAt())
	word = word.toUpperCase()
	return word
}

// 検索結果をハイライトする処理
function itel_main(bool){
	offElementByClassName('itel-highlight')

	if(!enabled){
		return
	}

	var words = search_words
	if(words.length == 0){
		return
	}
	
	for(let n = 0; n < words.length; n++){
		var regbool = false
		if(words[n].toUpperCase().indexOf(regPrefix) == 0){
			words[n] = words[n].substr(regPrefix.length)
			regbool = true
		}
		words_nums[words[n]] = 0
		replace_rec(document.body, words[n], 'itel-highlight', colors[n%colors.length], regbool)
	}
	return words_nums
}
itel_main()
