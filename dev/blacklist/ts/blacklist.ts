// ==============================
//  ハイライトのブラックリスト
// ==============================
var hl = document.getElementById('hl')
async function run(table_obj, storage_key) {
	var list:{[key:string]:boolean;} = await storageGet(storage_key, {}, true)
	for (let key in list) {
		// ブラックリスト有効・無効の状態表示を定義
		let enabled_td = <HTMLElement>document.createElement('td')
		enabled_td.className = 'enabled'
		let checkbox = <HTMLInputElement>document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.checked = !list[key]
		enabled_td.appendChild(checkbox)
		// サイト名の表示を定義
		let site_td = <HTMLElement>document.createElement('td')
		site_td.className = 'site'
		let text = <HTMLInputElement>document.createElement('input')
		text.type = 'text'
		text.value = key
		site_td.appendChild(text)
		// 機能を定義
		let func_td = <HTMLElement>document.createElement('td')
		func_td.className = 'func'
		let button = document.createElement('button')
		button.innerText = '削除'
		func_td.appendChild(button)
		// 行を定義
		let rec_tr = <HTMLElement>document.createElement('tr')
		rec_tr.appendChild(enabled_td)
		rec_tr.appendChild(site_td)
		rec_tr.appendChild(func_td)
		// 行を追加
		table_obj.appendChild(rec_tr)
		
		// イベントを定義
		checkbox.onchange = async () => {
			list[key] = !list[key]
			await storageSet(storage_key, list, true)
		}
		text.onkeydown = async () => {
			list[text.value] = false
			delete list[key]
			await storageSet(storage_key, list, true)
		}
		button.onclick = async () => {
			delete list[key]
			await storageSet(storage_key, list, true)
			rec_tr.style = 'display: none;'
		}
	}
}
run(hl, 'hl_blacklist')

// ==============================
//  ハイライトバー表示のブラックリスト
// ==============================
var hlbar = document.getElementById('hlbar')
run(hlbar, 'hlbar_blacklist')