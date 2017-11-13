const barWidth:number = 16

// 呼び出し元に返す値(callback)
var words_nums = {}
// 再帰的にテキストノードを書き換えるため
var icnt = 0
function replace_auto(word:Word, className:string){
	//word.id, document.body, word.origin, className, word.bgColor, word.regbool, word.barColor
	textNode_req(document.body, className, (obj:Text)=>{
		var tmpword = word.origin
		// 置換処理
		var text = obj.data
		if(text.trim() == ''){
			return
		}

		if(word.regbool){
			var m = regMatch(obj.data, word.origin)
			if(m == null){
				return
			}
			tmpword = m[0]
		}
		if(tmpword == ''){
			return
		}
		var start = unifyWord(obj.data).indexOf(unifyWord(tmpword))
		if(start == -1){
			return
		}
		words_nums[word.origin]++
		
		var newGroup = document.createElement('esspan') // 複数のノードをまとめる
		var parentClassName = className + '-parent'
		newGroup.className = parentClassName
		
		var newObj = document.createElement('esspan')
		newObj.id = 'isear-'+icnt
		newObj.className = className + ' ' + icnt
		newObj.style.backgroundColor = word.bgColor
		newObj.style.color = 'black'
		
		var prefix = text.substr(0, start)
		newGroup.appendChild(document.createTextNode(prefix))
		
		var middle = text.substr(start, tmpword.length)
		newObj.innerText = middle
		newGroup.appendChild(newObj)
		
		var suffix = text.substr(start+tmpword.length)
		newGroup.appendChild(document.createTextNode(suffix))
		
		obj.parentNode.replaceChild(newGroup, obj)
		newGroup.outerHTML = newGroup.innerHTML
		
		// ハイライト位置くん
		newObj = document.getElementById('isear-'+icnt)
		if(newObj == null){
			return
		}
		word.elems.push(newObj)

		icnt++
	})
}

// id:number, obj:any, word:string, className:string, bgcolor:string, regbool:boolean, barcolor:string
function textNode_req(obj:any, className:string, callback:(obj:Text)=>void){
	if(obj.nodeType == 3){ // テキストノードなら
		callback(obj)
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
		textNode_req(child, className, callback)
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
function focusToObj(obj){
	// 過去のIDを削除する
	var s = document.getElementById(selected)
	if(s != null){
		s.removeAttribute('id')
	}	
	var s = document.getElementById(top_selected)
	if(s != null){
		s.removeAttribute('id')
	}	
	
	if(obj == null || obj == undefined){
		return
	}
	obj.id = selected

	var clist = obj.classList
	var top = document.getElementsByClassName('isear-top-'+clist[1])[0]
	if(top == null){
		return
	}
	top.id += top_selected
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
function scrollFocusAuto(obj:Element){
	if(obj == undefined || obj == null){
		return
	}
	obj.scrollIntoViewIfNeeded()
	focusToObj(obj)
}
function scrollFocusAutoNum(className:string, num:number){
	var elems = document.getElementsByClassName(className)
	scrollFocusAuto(elems[num])
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
	scrollFocusAuto(elems[sfcount])
}
function scrollFocusPrev(className, idName){
	init_sfcount(className, idName, 1)
	
	var elems = document.getElementsByClassName(className)
	sfcount = sfcountPrev(sfcount, elems.length)
	scrollFocusAuto(elems[sfcount])
}
// 次のワードを辿る
function scrollFocusNextWord(word, className, idName, regbool){
	init_sfcount(className, idName, -1)
	
	var elems = document.getElementsByClassName(className)
	sfcount = sfcountNextWord(sfcount, className, word, regbool)
	scrollFocusAuto(elems[sfcount])
}
// 前のワードをたどる(上の関数の取り消し)
function scrollFocusPrevWord(word, className, idName, regbool){
	init_sfcount(className, idName, 1)

	var elems = document.getElementsByClassName(className)
	sfcount = sfcountPrevWord(sfcount, className, word, regbool)
	scrollFocusAuto(elems[sfcount])
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

function rightSpace(i:number):void{
	if(i == 0){
		document.body.style.width = ''
		return
	}
	var rate:number = (1/window.devicePixelRatio)
	document.body.style.width = (window.innerWidth-(i*rate)) + 'px'
}

var enabled:boolean
var search_words:string
// 検索結果をハイライトする処理
function itel_main(){
	// 全消し
	offElementByClassName('itel-highlight')
	
	removeBar()
	removeMbox()
	removeBarToggler()

	rightSpace(0)
	// window.onresize = ()=>{
	// 	rightSpace(0)
	// }
	if(!enabled){
		return
	}
	
	var words:Words = new Words(search_words)
	if(words.array.length == 0){
		enabled = false
		return
	}

	createBarToggler(words)
	
	for(let n = 0; n < words.array.length; n++){
		let word = words.array[n]
		words_nums[word.origin] = 0
		replace_auto(word, hlClass)
		// ハイライト位置くん
		createBar(word)
		createTops(word)
	}

	rightSpace((barWidth+1)*words.array.length)
	window.onresize = ()=>{
		if(!enabled){
			return
		}
		whereTimeout(()=>{
			rightSpace((barWidth+1)*words.array.length)

			removeBar()
			removeMbox()
			removeBarToggler()

			if(words.array.length == 0){
				return
			}
			createBarToggler(words)
			for(let n = 0; n < words.array.length; n++){
				let word = words.array[n]
				createBar(word)
				createTops(word)
			}
			toggleBars(words)
		}, 100)
	}
	return words_nums
}
