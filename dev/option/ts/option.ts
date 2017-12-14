const enabled_sync = <HTMLInputElement> document.getElementById('enabled_sync')
enabled_sync.onchange = async () => {
	var enable = enabled_sync.checked
	await storageSet('sync', enable)
	location.reload()
}

const google_words = <HTMLInputElement> document.getElementById('google_words')
google_words.onchange = () => {
	var enable = google_words.checked
	storageSet('google_words', enable, true)
}

const regbool = <HTMLInputElement> document.getElementById('regbool')
regbool.onchange = () => {
	var enable = regbool.checked
	storageSet('regbool', enable, true)
}

const enabled_bar = <HTMLInputElement> document.getElementById('enabled_bar')
enabled_bar.onchange = () => {
	var enable = enabled_bar.checked
	storageSet('enabled_bar', enable, true)
}

const show_bar = <HTMLInputElement> document.getElementById('show_bar')
show_bar.onchange = () => {
	var enable = show_bar.checked
	storageSet('show_bar', enable, true)
}

const prefix = <HTMLInputElement> document.getElementById('prefix')
prefix.onchange = () => {
	var pf = prefix.value
	storageSet('prefix', pf, true)
}
prefix.onkeydown = prefix.onchange


document.body.onload = async () => {
	var sync = await storageGet('sync', false)
	enabled_sync.checked = sync

	var gw = await storageGet('google_words', true, true)
	google_words.checked = gw

	var rb = await storageGet('regbool', false, true)
	regbool.checked = rb

	var sb = await storageGet('enabled_bar', true, true)
	enabled_bar.checked = sb

	var sb = await storageGet('show_bar', true, true)
	show_bar.checked = sb

	var pf = await storageGet('prefix', '', true)
	prefix.value = pf

	// 色の設定
	const cols = document.getElementById('colors')
	bgColors = await storageGet('bgColors', bgColors, true)
	// 色の初期化
	var start
	for (let i = 0; i < bgColors.length; i++) {
		let color = bgColors[i]
		let col = <HTMLInputElement>document.createElement('input')
		col.type = 'color'
		col.className = 'colors'
		col.id = 'color' + i
		col.value = color

		// カラーピッカーのイベント設定
		col.onchange = ()=>{
			bgColors[i] = col.value
			storageSet('bgColors', bgColors, true)
		}

		// ドラッグ＆ドロップで移動
		col.draggable = true
		col.ondragstart = (e)=>{
			start = col
		}
		col.ondrop = (e)=>{
			if(start == col){
				return
			}
			var tmp = start.value
			start.value = col.value
			col.value = tmp
			start.onchange(null)
			col.onchange(null)
			start = undefined
		}

		col.ondragover = (e)=>{e.preventDefault()}
		col.ondragenter = (e)=>{e.preventDefault()}
		cols.appendChild(col)
	}
}
