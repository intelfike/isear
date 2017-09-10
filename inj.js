// 検索結果のハイライトの色の表示順
var colors = ['#FF0', '#5FF', '#F8F', '#8F8', '#FA0']
var hlcolors = ['#880', '#388', '#848']
var colornum = 0

// 検索結果をハイライトするための関数
var rep_sw = true

// 再帰的にテキストノードを書き換えるため
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
	for(let n = 0; n < hls.length; n++){
		let hl = hls[0]
		hl.outerHTML = hl.innerHTML
	}
}

function scrollFocus(obj, idName){
	// 過去のIDを削除する
	var s = document.getElementById(idName)
	if(s != null){
		s.removeAttribute('id')
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
	sfcount %= elems.length-1
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


// 検索結果をハイライトする処理
function main(){
	offElementByClassName('itel-highlight')

	var words = search_words
	if(words.length == 0){
		return
	}
	
	for(let n = 0; n < words.length; n++){
		replace_rec(document.body, words[n], 'itel-highlight', colors[n])
	}
}
main()