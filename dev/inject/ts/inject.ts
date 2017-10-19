var barWidth = '8px'

// 呼び出し元に返す値(callback)
var words_nums = {}
// 再帰的にテキストノードを書き換えるため
var icnt = 0
function replace_rec(obj:any, word:string, className:string, bgcolor:string, regbool:boolean){
	var escword:string = word
	if(obj.nodeType == 3){ // テキストノードなら
		// 置換処理
		var text = obj.data
		if(text.trim() == ''){
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
		if(word == ''){
			return
		}
		var start = unifyWord(obj.data).indexOf(unifyWord(word))
		if(start == -1){
			return
		}
		words_nums[escword]++
		
		var newGroup = document.createElement('esspan') // 複数のノードをまとめる
		newGroup.className = parentClassName
		
		var newObj = document.createElement('esspan')
		newObj.id = 'isear-'+icnt
		newObj.className = className
		newObj.style.backgroundColor = bgcolor
		newObj.style.color = 'black'
		
		var prefix = text.substr(0, start)
		newGroup.appendChild(document.createTextNode(prefix))
		
		var middle = text.substr(start, word.length)
		newObj.innerText = middle
		newGroup.appendChild(newObj)
		
		var suffix = text.substr(start+word.length)
		newGroup.appendChild(document.createTextNode(suffix))
		
		obj.parentNode.replaceChild(newGroup, obj)
		newGroup.outerHTML = newGroup.innerHTML
		
		// ハイライト位置くん
		newObj = document.getElementById('isear-'+icnt)
		if(newObj == null){
			return
		}
		icnt++
		var objtop = newObj.getBoundingClientRect().top + window.pageYOffset
		var d = document.createElement('iteldiv')
		d.className = 'itel-top'
		d.style.backgroundColor = bgcolor
		d.style.borderTop = '1px solid #AAA'
		d.style.borderBottom = '1px solid #AAA'
		d.style.position = 'fixed'
		var scrollPad = 16 * (1/window.devicePixelRatio)
		d.style.top = (objtop/document.body.scrollHeight*(window.innerHeight-scrollPad*2))+scrollPad+'px'
		d.style.right = '0'
		d.style.height = '3px';
		d.style.display = 'block';
		d.style.width = barWidth;
		d.style.zIndex = '999999999';
		document.body.appendChild(d)

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
function wordMatch(str:string, word:string, regbool:boolean):boolean{
	if(regbool){
		var m:string[] = regMatch(str, word)
		if(m != null){
			for(let n = 0; n < m.length; n++){
				if(m[n] == str){
					return true
				}
			}
			return false
		}
	}
	return unifyWord(str) == unifyWord(word)
}
function regMatch(str:string, regstr:string):string[]{
	var m:string[] = null
	try{
		m = str.match(new RegExp(regstr, 'g'))
	}catch(e){
		return null
	}
	if(m == null){
		return null
	}
	// プログラムの停止(無限ループ？)を回避する
	var result:string[] = []
	for(let n = 0; n < m.length; n++){
		if(m[n] == ''){
			continue
		}
		result.push(m[n])
	}
	return result
}

function offElementByClassName(className:string){
	// 過去の検索結果のハイライトを削除するため
	// えいち・える・えす
	var hls = document.getElementsByClassName(className)
	for(let n = hls.length-1; n >= 0 ; n--){
		let hl = <HTMLElement> hls[n]
		hl.outerHTML = hl.innerHTML
	}
}

function getAbsTop(obj:Element){
	if(obj == null || obj == undefined){
		return null
	}
	var rect = obj.getBoundingClientRect()
	var abstop = rect.top + window.pageYOffset
	return abstop
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
function getUnderCurrentElemNum(className:string){
	var elems = document.getElementsByClassName(className)
	for(let n = 0; n < elems.length; n++){
		let elem = elems[n]
		if(getAbsTop(elem) > window.pageYOffset){
			return n
		}
	}
	return 0
}
function scrollFocusAuto(obj:Element, idName:string){
	if(obj == undefined || obj == null){
		return
	}
	obj.scrollIntoViewIfNeeded()
	focusToObj(obj, idName)
}
function scrollFocusAutoNum(className:string, num:number, idName:string){
	var elems = document.getElementsByClassName(className)
	scrollFocusAuto(elems[num], idName)
}
var sfcount:number = 0
// 次の位置を返す
function sfcountNext(sfcount:number, max:number):number{
	sfcount++
	sfcount %= max
	return sfcount
}
function sfcountPrev(sfcount:number, max:number):number{
	sfcount--
	if(sfcount == -1){
		sfcount = max - 1
	}
	return sfcount
}
// 次のワードの位置を返す
function sfcountNextWord(count:number, className:string, word:string, regbool=false):number{
	var elems = document.getElementsByClassName(className)
	var last:number = sfcountPrev(count, elems.length)
	while(count != last){
		count = sfcountNext(count, elems.length)
		let elem = <HTMLElement> elems[count]
		if(wordMatch(elem.innerText, word, regbool)){
			return count
		}
	}
	return -1
}
function sfcountPrevWord(count:number, className:string, word:string, regbool=false):number{
	var elems = document.getElementsByClassName(className)
	var last:number = sfcountNext(count, elems.length)
	while(count != last){
		count = sfcountPrev(count, elems.length)
		let elem = <HTMLElement> elems[count]
		if(wordMatch(elem.innerText, word, regbool)){
			return count
		}
	}
	return -1
}
// 探索するクラス名と、選択時に一時的につけるid
function scrollFocusNext(className, idName){
	init_sfcount(className, idName, -1)
	
	var elems = document.getElementsByClassName(className)
	sfcount = sfcountNext(sfcount, elems.length)
	scrollFocusAuto(elems[sfcount], idName)
}
function scrollFocusPrev(className, idName){
	init_sfcount(className, idName, 1)
	
	var elems = document.getElementsByClassName(className)
	sfcount = sfcountPrev(sfcount, elems.length)
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
		var elem = <HTMLElement> elems[i]
		if(wordMatch(elem.innerText, word, regbool)){
			count++
		}
	}
	return count
}
function countAllWords(word, className, regbool){
	var elems = document.getElementsByClassName(className)
	var count = 0
	for (var i = elems.length-1; i >= 0; i--) {
		var elem = <HTMLElement> elems[i]
		if(wordMatch(elem.innerText, word, regbool)){
			count++
		}
	}
	return count
}

var enabled:boolean
var search_words:string
// 検索結果をハイライトする処理
function itel_main(){
	// 全消し
	offElementByClassName('itel-highlight')
	
	var barrm = document.getElementById('itel-bar')
	if(barrm != undefined){
		barrm.remove()
	}
	
	var toprm = document.getElementsByClassName('itel-top')
	for(let n = toprm.length-1; n >= 0; n--){
		toprm[n].remove()
	}

	if(!enabled){
		return
	}

	// ハイライト位置くん
	var bar = document.createElement('iseardiv')
	bar.id = 'itel-bar'
	bar.style.backgroundColor = '#EFEFEF'
	bar.style.position = 'fixed'
	bar.style.width = barWidth
	bar.style.height = '100%'
	bar.style.top = '0'
	bar.style.right = '0'
	bar.style.zIndex = '99999999'
	document.body.appendChild(bar)

	var words:Words = new Words(search_words)
	
	if(words.array.length == 0){
		return
	}
	
	for(let n = 0; n < words.array.length; n++){
		let word = words.array[n]
		words_nums[word.origin] = 0
		replace_rec(document.body, word.origin, 'itel-highlight', word.color, word.regexp!=undefined)
	}
	return words_nums
}
window.onresize = ()=>{itel_main()}
// itel_main(true)
