var showBars:boolean
function createBarToggler(length:number){
	var rate:number = (1/window.devicePixelRatio)
	var tog = document.createElement('iseartoggler')
	// 定義の設定
	tog.id = 'isear-toggler'
	// テキストの設定
	var text = '>'
	var right:number = (length) * (barWidth+1) * rate
	if(!showBars){
		text = '<'
		right = 0
	}
	tog.innerText = text

	tog.style.fontSize = (16 * rate)+'px'
	tog.style.lineHeight = (16 * rate)+'px'
	// 配置の設定
	tog.style.width = (barWidth * rate) + 'px'
	tog.style.height = (16 * rate) + 'px'
	tog.style.top = '0'
	tog.style.right = right + 'px'
	// 動作の設定
	tog.onclick = () => {
		// 切り替えボタンの表示を切り替える
		showBars = tog.innerText == '<'
		// ハイライトバーの表示を切り替える
		barsVisible(length, showBars, true)
		// ローカルストレージに記録
		// 未実装
	}
	document.body.appendChild(tog)
}
function barsVisible(length:number, show:boolean, updateStorage:boolean=false){
	var rate:number = (1/window.devicePixelRatio)
	var tog = document.getElementById('isear-toggler')
	if(tog == null){
		return
	}
	var bars = document.getElementsByClassName('isear-bar')
	for (let i = bars.length - 1; i >= 0; i--) {
		barVisible(i, show)
	}
	if(show){
		tog.innerText = '>'
		var right:number = (length) * (barWidth+1) * rate
		tog.style.right = right + 'px'
		rightSpace((barWidth+1)*length)
	}else{
		tog.innerText = '<'
		tog.style.right = '0'
		rightSpace(0)
	}

	if (updateStorage) {
		globalStorage.setItem('bar-visible', show)
	}
}

function removeBarToggler(){
	var tog = document.getElementById('isear-toggler')
	if(tog == null){
		return
	}
	tog.remove()
}

function createBar(word:Word, location:number, range:number){
	var rate:number = (1/window.devicePixelRatio)
	var bar = document.createElement('iseardiv')
	bar.id = 'isear-bar-' + (location-1)
	bar.className = 'isear-bar'
	bar.style.backgroundColor = word.barColor

	// bar.style.opacity = '0.9'
	bar.style.borderLeft = rate+'px solid black'
	bar.style.width = barWidth * rate + 'px'
	bar.style.height = '100%'
	bar.style.top = '0'
	var right:number = (range - location) * (barWidth+1) * rate
	bar.style.right = right + 'px'
	var visibility = 'visible'
	if(!showBars){
		visibility = 'hidden'
	}
	bar.style.visibility = visibility
	
	bar.onclick = (e) => {barClick(e, word)}
	bar.addEventListener('wheel', e => {
		e.preventDefault()
		barWheel(e, word)
	})
	bar.onmouseover = () => {
		createMbox(word.origin, word.bgColor, right + (barWidth*rate))
	}
	bar.onmouseout = () => {
		removeMbox()
	}
	document.body.appendChild(bar)
}
function barClick(e:MouseEvent, word:Word){
	var key_event = <KeyboardEvent>(e||window.event)
	if(key_event.shiftKey){
		scrollFocusPrevWord(word.origin, hlClass, selected, word.regbool)
	}else{
		scrollFocusNextWord(word.origin, hlClass, selected, word.regbool)
	}
}
function barWheel(e:WheelEvent, word:Word){
	if (e.deltaY != 0) {
		if (e.deltaY <= 1) {
			// 上スクロール
			scrollFocusPrevWord(word.origin, hlClass, selected, word.regbool)
		} else {
			// 下スクロール
			scrollFocusNextWord(word.origin, hlClass, selected, word.regbool)
		}
	}
}

function removeBar(){
	var bars = document.getElementsByClassName('isear-bar')
	for(let n = bars.length-1; n >= 0; n--){
		bars[n].remove()

		var tops = document.getElementsByClassName('isear-top-group-'+n)
		for(let m = tops.length-1; m >= 0; m--){
			tops[m].remove()
		}
	}
}
function barVisible(n:number, bool:boolean){
	var bar = document.getElementById('isear-bar-'+n)
	if(bar == null){
		return
	}
	if(bool){
		bar.style.visibility = 'visible'
	}else{
		bar.style.visibility = 'hidden'
	}

	var tops = document.getElementsByClassName('isear-top-group-'+n)
	for(let m = tops.length-1; m >= 0; m--){
		let top = <HTMLElement>tops[m]
		if(bool){
			top.style.visibility = 'visible'
		}else{
			top.style.visibility = 'hidden'
		}
	}
}

function reloadBar() {

}

function createMbox(mes:string, color:string, right:number){
	var rate:number = (1/window.devicePixelRatio)
	var mbox = document.createElement('isearmbox')
	mbox.className = 'isear-mbox'
	mbox.innerText = mes
	mbox.style.fontSize = (16*rate)+'px'
	mbox.style.backgroundColor = color
	mbox.style.top = '0'
	mbox.style.right = right + 'px'
	mbox.style.padding = '0 '+(8*rate)+'px'
	mbox.style.borderLeft = rate+'px solid black'
	mbox.style.borderBottom = rate+'px solid black'
	document.body.appendChild(mbox)
}
function removeMbox(){
	var mboxs = document.getElementsByClassName('isear-mbox')
	for (var n = mboxs.length - 1; n >= 0; n--) {
		mboxs[n].remove()
	}
}
function createTops(word:Word, location:number, range:number){
	var topsContainer = document.createElement('isearcont')
	topsContainer.id = 'isear-tops-container'
	var df = document.createDocumentFragment();
	for (let n = word.elems.length - 1; n >= 0; n--) {
		let obj = word.elems[n]
		
		var objtop = obj.getBoundingClientRect().top + window.pageYOffset
		
		var d = document.createElement('iteldiv')
		var rate:number = (1/window.devicePixelRatio)
		d.className = 'isear-top'
		d.className += ' isear-top-'+obj.classList[1]
		d.className += ' isear-top-group-'+(location-1)
		d.style.borderTop = rate+'px solid ' + word.barColor
		d.style.borderBottom = rate+'px solid ' + word.barColor
		var arrowHeight = 16 * rate
		d.style.top = (objtop/document.body.scrollHeight*(window.innerHeight-arrowHeight*2))+arrowHeight+'px'
		d.style.right = (range - location) * (barWidth+1) * rate + 'px'
		d.style.height = 3 * rate + 'px'
		d.style.width = barWidth * rate + 'px'
		var visibility = 'visible'
		if(!showBars){
			visibility = 'hidden'
		}
		d.style.visibility = visibility
		df.appendChild(d)
	}
	topsContainer.appendChild(df)
	document.body.appendChild(topsContainer)
}
function removeTops(){
	let con = document.getElementById('isear-tops-container')
	if (con) {
		con.remove()
	}
}