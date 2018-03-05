const barWidth:number = 16
var auto_update = false
var enabled_bar = true
var regbool = false

var def_option = {
	childList: true,
	characterData: true,
	subtree: true,
}

function highlight_all(dest:any, words:Words){
	for(let n = 0; n < words.array.length; n++){
		let word = words.array[n]
		if(!regbool){
			word.regbool = false
			word.regexp = undefined
		}
		word.bgColor = bgColors[n%bgColors.length]
		word.barColor = word.bgColor
		words_nums[word.origin] = 0
		replace_auto(dest, word, hlClass)
	}
}

// 呼び出し元に返す値(callback)
var words_nums = {}
// 再帰的にテキストノードを書き換えるため
var icnt = 0
function replace_auto(dest:any, word:Word, className:string){
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

		var prefix = text.substr(0, start)
		var middle = text.substr(start, tmpword.length)
		var suffix = text.substr(start+tmpword.length)

		var prefix_tn = document.createTextNode(prefix)
		var middle_tn = document.createTextNode(middle)
		var suffix_tn = document.createTextNode(suffix)

		var newObj = document.createElement('esspan')
		newObj.id = 'isear-'+icnt
		newObj.className = className + ' ' + icnt
		newObj.style.backgroundColor = word.bgColor
		newObj.style.color = 'black'
		newObj.appendChild(middle_tn)

		var parent = obj.parentNode
		parent.replaceChild(suffix_tn, obj)
		parent.insertBefore(prefix_tn, suffix_tn)
		parent.insertBefore(newObj, suffix_tn)

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

function offElementsByClassName(className:string){
	// 過去の検索結果のハイライトを削除するため
	// えいち・える・えす
	var hls = document.getElementsByClassName(className)
	for(let n = hls.length-1; n >= 0 ; n--){
		let hl = <HTMLElement> hls[n]
		var tn = document.createTextNode(hl.innerText)
		hl.parentNode.replaceChild(tn, hl)
		tn.parentNode.normalize()
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
function scrollToObj(obj){
	var abstop = getAbsTop(obj)
	scrollTo(0, abstop-(window.innerHeight/2))
}
function scrollFocusAuto(obj:Element){
	if(obj == undefined || obj == null){
		return
	}
	if(browser_type == 'chrome'){
		obj.scrollIntoViewIfNeeded()
	}else if(browser_type == 'firefox'){
		var abstop = getAbsTop(obj)
		// 画面外ならスクロールする
		if(abstop > window.innerHeight+window.pageYOffset || abstop < window.pageYOffset){
			obj.scrollIntoView()
			scrollToObj(obj)
		}
	}
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

	sfcount = sfcountNextWord(sfcount, className, word, regbool)
	var elems = document.getElementsByClassName(className)
	scrollFocusAuto(elems[sfcount])
}
// 前のワードをたどる(上の関数の取り消し)
function scrollFocusPrevWord(word, className, idName, regbool){
	init_sfcount(className, idName, 1)

	sfcount = sfcountPrevWord(sfcount, className, word, regbool)
	var elems = document.getElementsByClassName(className)
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

function rightSpace(i:number):void{}

// 一時的に無効
// 画面がガタつくので正直いらない子
function ESC_rightSpace(i:number):void{
	if(i == 0){
		document.body.style.width = ''
		return
	}
	var rate:number = (1/window.devicePixelRatio)
	document.body.style.width = (window.innerWidth-(i*rate)) + 'px'
}

// 検索結果をハイライトする処理
var itel_inject_flag = false
function itel_main(search_words:string, enabled:boolean){
	global_enabled = enabled
	var words:Words = new Words(search_words)
	if(words.array.length == 0){
		enabled = false
	}
	return parsed_main(words, enabled)
}

var global_enabled:boolean
function parsed_main(words:Words, enabled:boolean){
	// 全部リセット
	reset_all()

	if(!enabled){
		return
	}

	silentRun(function(){
		highlight_all(document.body, words)
	})

	if(enabled_bar){
		createBarToggler(words.array.length)
		barsVisible(words.array.length, showBars)
	}

	defineEvents(words, enabled)

	window.onresize(null)

	return words_nums
}

var already_event = false
var global_words:Words
function defineEvents(words:Words, enabled:boolean){
	global_words = words
	if(already_event){
		return
	}
	already_event = true
	document.body.onkeydown = (e)=>{bodyKeydownEvent(e, global_words)}

	window.onresize = ()=>{
		if(!enabled){
			return
		}
		whereTimeout('ハイライトバーを更新', ()=>{
			if(!enabled_bar){
				return
			}
			silentRun(function(){

				removeBar()
				removeTops()
				removeMbox()
				removeBarToggler()

				if(global_words.array.length == 0){
					return
				}
				createBarToggler(global_words.array.length)

				for(let n = 0; n < global_words.array.length; n++){
					let word = global_words.array[n]
					createBar(word)
					createTops(word)
				}
				barsVisible(global_words.array.length, showBars)
			})
		}, 100)
	}

	if(auto_update){
		observer = new MutationObserver(function (MutationRecords, MutationObserver) {
			var mutation = MutationRecords[0]

			if (mutation.type=="childList" && mutation.addedNodes.length != 0) {
				mutation.addedNodes.forEach(function(node) {
					whereTimeout('ハイライト更新', ()=>{
						if (node.nodeType == 1){
							if(node.className.indexOf('itel') != -1 ||
								node.className.indexOf('isear') != -1 ||
								node.id.indexOf('itel') != -1 ||
								node.id.indexOf('isear') != -1){
								return
							}
						}
						silentRun(function(){
							highlight_all(node, global_words)
							window.onresize(null)
						})
					}, 1000)
				});
			};
		});
		observer.observe(document.body, def_option);
	}
}
// オブザーバーに検知されないDOM操作
var observer = null
function silentRun(f){
	if(observer != null){
		observer.disconnect()
	}
	f()
	if(observer != null){
		observer.observe(document.body, def_option)
	}
}

function reset_all(){
	// 全消し
	offElementsByClassName('itel-highlight')

	removeBar()
	removeMbox()
	removeBarToggler()

	rightSpace(0)
}