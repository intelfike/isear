
// 再帰的にテキストノードを書き換えるため
var rep_sw = true
function replace_rec(obj, word, className, bgcolor){
	word = word.toUpperCase()
	if(obj.nodeType == 3){ // テキストノードなら
		// 置換処理
		var text = obj.data
		if(text.trim(' 　	') == ''){
			return
		}
		var parentClassName = className + '-parent'

		
		var start = obj.data.toUpperCase().indexOf(word)
		if(start == -1){
			return
		}
		
		newGroup = document.createElement('span') // 複数のノードをまとめる
		newGroup.className = parentClassName
		
		newObj = document.createElement('span')
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
		obj.tagName == 'STYLE' || 
		obj.tagName == 'SCRIPT' || 
		new RegExp(className,'g').test(obj.className)
	){
		return
	}
	for(let n = 0; n < obj.childNodes.length; n++){
		let child = obj.childNodes[n]
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

function scrollFocus(obj, idName){
	// 過去のIDを削除する
	var s = document.getElementById(idName)
	if(s != null){
		s.removeAttribute('id')
	}
	
	if(obj == null){
		return
	}
	obj.id = idName
	var rect = obj.getBoundingClientRect()
	var abstop = rect.top + window.pageYOffset
	scrollTo(0, abstop-(window.innerHeight/2))
}
var sfcount = 0
// 探索するクラス名と、選択時に一時的につけるid
function scrollFocusNext(className, idName){
	elems = document.getElementsByClassName(className)
	sfcount++
	sfcount %= elems.length
	scrollFocus(elems[sfcount], idName)
}
function scrollFocusPrev(className, idName){
	elems = document.getElementsByClassName(className)
	sfcount--
	if(sfcount == -1){
		sfcount = elems.length - 1
	}
	scrollFocus(elems[sfcount], idName)
}
function scrollFocusNextWord(word, className, idName){
	word = word.toUpperCase()
	elems = document.getElementsByClassName(className)
	last = sfcount - 1
	if(last == -1){
		last = elems.length - 1
	}
	while(sfcount != last){
		console.log(word, elems[sfcount].innerText.toUpperCase())
		sfcount++
		sfcount %= elems.length
		if(elems[sfcount].innerText.toUpperCase() == word){
			scrollFocus(elems[sfcount], idName)
			break
		}
	}	
}
// function scrollFocusPrevWord(word, className, idName){

// }


// 検索結果をハイライトする処理
function itel_main(){
	offElementByClassName('itel-highlight')

	var words = search_words
	if(words.length == 0){
		return
	}
	
	for(let n = 0; n < words.length; n++){
		replace_rec(document.body, words[n], 'itel-highlight', colors[n])
	}
}
itel_main()