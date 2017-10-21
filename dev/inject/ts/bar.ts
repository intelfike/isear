function createBar(word:Word){
	var bar = document.createElement('iseardiv')
	var rate:number = (1/window.devicePixelRatio)
	// bar.id = 'isear-bar'
	bar.className = 'isear-bar'
	bar.style.backgroundColor = word.barColor
	if(words_nums[word.origin] == 0){
		bar.style.backgroundColor = 'grey'
	}
	bar.style.opacity = '0.9'
	bar.style.borderLeft = rate+'px solid black'
	bar.style.position = 'fixed'
	bar.style.width = barWidth * rate + 'px'
	bar.style.height = '100%'
	bar.style.top = '0'
	var right:number = (word.id-1) * (barWidth+1) * rate
	bar.style.right = right + 'px'
	bar.style.zIndex = '99999999'
	var bar_visible = true
	bar.onclick = (e) => {barClick(e, word)}
	bar.onmouseover = () => {createMbox(word.origin, word.bgColor, right + barWidth + 2)}
	bar.onmouseout = () => {removeMbox()}
	document.body.appendChild(bar)
}
function removeBar(){
	var barrm = document.getElementsByClassName('isear-bar')
	for(let n = barrm.length-1; n >= 0; n--){
		barrm[n].remove()

		var toprm = document.getElementsByClassName('isear-top-group-'+n)
		for(let m = toprm.length-1; m >= 0; m--){
			toprm[m].remove()
		}
	}	
}
function barClick(e:MouseEvent, word:Word){
	var key_event = <KeyboardEvent>(e||window.event)
	if(key_event.shiftKey){
		scrollFocusPrevWord(word.origin, hlClass, "itel-selected", word.regbool)
	}else{
		scrollFocusNextWord(word.origin, hlClass, "itel-selected", word.regbool)
	}
}
function createMbox(mes:string, color:string, right:number){
	var mbox = document.createElement('isearmbox')
	mbox.className = 'isear-mbox'
	mbox.innerHTML = mes
	mbox.style.fontSize = '16px'
	mbox.style.display = 'block'
	mbox.style.backgroundColor = color
	mbox.style.color = 'black'
	mbox.style.position = 'fixed'
	mbox.style.top = '0'
	mbox.style.right = right + 'px'
	mbox.style.padding = '0 8px'
	mbox.style.borderLeft = '1px solid black'
	mbox.style.borderBottom = '1px solid black'
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