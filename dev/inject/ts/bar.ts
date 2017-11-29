var showBars:boolean
setInterval(()=>{console.log(showBars)}, 1000)
function createBarToggler(words:Words){
	var rate:number = (1/window.devicePixelRatio)
	var tog = document.createElement('iseartoggler')
	// 定義の設定
	tog.id = 'isear-toggler'
	// 要素全体の設定
	tog.style.backgroundColor = 'black'
	tog.style.opacity = '0.9'
	tog.style.zIndex = '99999999'
	// テキストの設定
	tog.innerText = '>'
	tog.style.color = 'white'
	tog.style.fontWeight = 'bold'
	tog.style.fontSize = (16 * rate)+'px'
	tog.style.lineHeight = (16 * rate)+'px'
	tog.style.textAlign = 'center'
	tog.style.userSelect = 'none'
	// 配置の設定
	tog.style.position = 'fixed'
	tog.style.width = (barWidth * rate) + 'px'
	tog.style.height = (16 * rate) + 'px'
	tog.style.top = '0'
	var right:number = (words.array.length) * (barWidth+1) * rate
	tog.style.right = right + 'px'
	// 動作の設定
	tog.onclick = () => {
		showBars = tog.innerText == '<'
		toggleBars(words)
	}
	document.body.appendChild(tog)
}
function toggleBars(words:Words){
	var rate:number = (1/window.devicePixelRatio)
	var tog = document.getElementById('isear-toggler')
	if(tog == null){
		return
	}
	var bars = document.getElementsByClassName('isear-bar')
	for (let i = bars.length - 1; i >= 0; i--) {
		barVisible(i, showBars)
	}
	if(showBars){
		tog.innerText = '>'
		var right:number = (words.array.length) * (barWidth+1) * rate
		tog.style.right = right + 'px'
		rightSpace((barWidth+1)*words.array.length)
	}else{
		tog.innerText = '<'
		tog.style.right = '0'
		rightSpace(0)
	}
}

function removeBarToggler(){
	var tog = document.getElementById('isear-toggler')
	if(tog == null){
		return
	}
	tog.remove()
}

function createBar(word:Word){
	var rate:number = (1/window.devicePixelRatio)
	var bar = document.createElement('iseardiv')
	bar.id = 'isear-bar-' + (word.id-1)
	bar.className = 'isear-bar'
	bar.style.backgroundColor = word.barColor
	if(words_nums[word.origin] == 0){
		bar.style.backgroundColor = 'grey'
	}
	// bar.style.opacity = '0.9'
	bar.style.boxSizing = 'content-box'
	bar.style.borderLeft = rate+'px solid black'
	bar.style.position = 'fixed'
	bar.style.width = barWidth * rate + 'px'
	bar.style.height = '100%'
	bar.style.top = '0'
	var right:number = (word.id-1) * (barWidth+1) * rate
	bar.style.right = right + 'px'
	bar.style.zIndex = '99999999'
	
	bar.onclick = (e) => {barClick(e, word)}
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
		scrollFocusPrevWord(word.origin, hlClass, "itel-selected", word.regbool)
	}else{
		scrollFocusNextWord(word.origin, hlClass, "itel-selected", word.regbool)
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
function createMbox(mes:string, color:string, right:number){
	var rate:number = (1/window.devicePixelRatio)
	var mbox = document.createElement('isearmbox')
	mbox.className = 'isear-mbox'
	mbox.innerHTML = mes
	mbox.style.fontSize = (16*rate)+'px'
	mbox.style.display = 'block'
	mbox.style.backgroundColor = color
	mbox.style.color = 'black'
	mbox.style.position = 'fixed'
	mbox.style.top = '0'
	mbox.style.right = right + 'px'
	mbox.style.padding = '0 '+(8*rate)+'px'
	mbox.style.borderLeft = rate+'px solid black'
	mbox.style.borderBottom = rate+'px solid black'
	mbox.style.zIndex = '9999999999'
	document.body.appendChild(mbox)
}
function removeMbox(){
	var mboxs = document.getElementsByClassName('isear-mbox')
	for (var n = mboxs	.length - 1; n >= 0; n--) {
		mboxs[n].remove()
	}
}
function createTops(word:Word){
	for (let n = word.elems.length - 1; n >= 0; n--) {
		let obj = word.elems[n]
		
		var objtop = obj.getBoundingClientRect().top + window.pageYOffset
		
		var d = document.createElement('iteldiv')
		var rate:number = (1/window.devicePixelRatio)
		d.className = 'isear-top'
		d.className += ' isear-top-'+obj.classList[1]
		d.className += ' isear-top-group-'+(word.id-1)
		d.style.display = 'block'
		d.style.backgroundColor = '#000'
		d.style.boxSizing = 'content-box'
		d.style.borderTop = rate+'px solid ' + word.barColor
		d.style.borderBottom = rate+'px solid ' + word.barColor
		d.style.position = 'fixed'
		var arrowHeight = 16 * rate
		d.style.top = (objtop/document.body.scrollHeight*(window.innerHeight-arrowHeight*2))+arrowHeight+'px'
		d.style.right = (word.id-1) * (barWidth+1) * rate + 'px'
		d.style.height = 3 * rate + 'px'
		d.style.width = barWidth * rate + 'px'
		d.style.zIndex = '999999999'
		d.style.pointerEvents = 'none'
		document.body.appendChild(d)
	}
}