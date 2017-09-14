
// 再帰的にテキストノードを書き換えるため
var rep_sw = true
function replace_rec(obj, word, className, bgcolor){
	if(obj.nodeType == 3){ // テキストノードなら
		// 置換処理
		var text = obj.data
		if(text.trim(' 　	') == ''){
			return
		}
		var parentClassName = className + '-parent'

		
		var start = unifyWord(obj.data).indexOf(unifyWord(word))
		if(start == -1){
			return
		}
		
		newGroup = document.createElement('esspan') // 複数のノードをまとめる
		newGroup.className = parentClassName
		
		newObj = document.createElement('esspan')
		newObj.className = className
		newObj.style.backgroundColor = bgcolor
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
		replace_rec(child, word, className, bgcolor)
	}
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
	elems = document.getElementsByClassName(className)
	for(let n = 0; n < elems.length; n++){
		elem = elems[n]
		if(getAbsTop(elem) > window.pageYOffset){
			sfcount = n
			focusToObj(elem, idName)
			break
		}
	}
}
function scrollFocusAuto(obj, className, idName){
	var selected = document.getElementById(idName)
	if(selected == null){
		focusUnderCurrentScroll(className, idName)
		return
	}
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
	elems = document.getElementsByClassName(className)
	sfcount++
	sfcount %= elems.length
	scrollFocusAuto(elems[sfcount], className, idName)
}
function scrollFocusPrev(className, idName){
	elems = document.getElementsByClassName(className)
	sfcount--
	if(sfcount == -1){
		sfcount = elems.length - 1
	}
	scrollFocusAuto(elems[sfcount], className, idName)
}
function scrollFocusNextWord(word, className, idName){
	elems = document.getElementsByClassName(className)
	last = sfcount - 1
	if(last == -1){
		last = elems.length - 1
	}
	word = unifyWord(word)
	while(sfcount != last){
		sfcount++
		sfcount %= elems.length
		if(unifyWord(elems[sfcount].innerText) == word){
			scrollFocusAuto(elems[sfcount], className, idName)
			break
		}
	}	
}

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

function shiftLeftChars(str, leftChar, rightChar, range){
	var chars = []
	for(let n = 0; n < str.length; n++){
		chars[n] = shiftLeftChar(str[n], leftChar, rightChar, range)
	}
	// console.log(str)
	return chars.join('')
}
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
		replace_rec(document.body, words[n], 'itel-highlight', colors[n])
	}
}
itel_main()