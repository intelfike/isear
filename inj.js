
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
function scrollFocus(obj, idName){
	scrollToObj(obj)
	focusToObj(obj, idName)
}
function focusUnderCurrentScroll(className, idName){
	elems = document.getElementsByClassName(class258Name)
	for(let n = 0; n < elems.length; n++){
		elem = elems[n]
		if(getAbsTop(elem) > window.pageYOffset){
			sfcount = n
			focusToObj(elem, idName)
			break
		}
	}
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
function scrollFocusAuto(obj, className, idName){
	// var selected = document.getElementById(idName)
	// if(selected == null){
	// 	focusUnderCurrentScroll(className, idName)
	// 	return
	// }
	var abstop = getAbsTop(obj)
	if(abstop > window.innerHeight+window.pageYOffset ||
		abstop < window.pageYOffset
	){
		scrollToObj(obj)
	}
	focusToObj(obj, idName)
}
var sfcount = 0
// 探索するクラス名と、選択時に一時的につけるid
function scrollFocusNext(className, idName){
	init_sfcount(className, idName, -1)
	
	elems = document.getElementsByClassName(className)
	sfcount++
	sfcount %= elems.length
	scrollFocusAuto(elems[sfcount], className, idName)
}
function scrollFocusPrev(className, idName){
	init_sfcount(className, idName, 1)
	
	elems = document.getElementsByClassName(className)
	sfcount--
	if(sfcount == -1){
		sfcount = elems.length - 1
	}
	scrollFocusAuto(elems[sfcount], className, idName)
}
// 次のワードを辿る
function scrollFocusNextWord(word, className, idName, regbool){
	init_sfcount(className, idName, -1)
	
	elems = document.getElementsByClassName(className)
	last = sfcount - 1
	if(last == -1){
		last = elems.length - 1
	}
	word = unifyWord(word)
	while(sfcount != last){
		sfcount++
		sfcount %= elems.length
		let elem = elems[sfcount]
		if(regbool){
			var m = regMatch(elem.innerText, word)
			if(m != null){
				word = m[0]
			}
		}
		if(unifyWord(elem.innerText) == word){
			scrollFocusAuto(elem, className, idName)
			break
		}
	}
}
// 前のワードをたどる(上の関数の取り消し)
function scrollFocusPrevWord(word, className, idName, regbool){
	init_sfcount(className, idName, 1)

	elems = document.getElementsByClassName(className)
	last = sfcount + 1
	if(last == elems.length){
		last = 0
	}
	word = unifyWord(word)
	while(sfcount != last){
		sfcount--
		if(sfcount == -1){
			sfcount = elems.length - 1
		}
		let elem = elems[sfcount]
		if(regbool){
			var m = regMatch(elem.innerText, word)
			if(m != null){
				word = m[0]
			}
		}

		if(unifyWord(elem.innerText) == word){
			scrollFocusAuto(elem, className, idName)
			break
		}
	}
}
// pm補正 
function init_sfcount(className, idName, pm){
	var selected = document.getElementById(idName)
	if(selected == null){
		sfcount = getUnderCurrentElemNum(className)
		sfcount += pm
	}
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
	// console.log(str)
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
		replace_rec(document.body, words[n], 'itel-highlight', colors[n%colors.length], regbool)
	}
}
itel_main()