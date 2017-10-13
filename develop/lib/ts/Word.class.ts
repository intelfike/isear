class Word{
	origin:  string
	word:    string
	regexp:  boolean
	enabled: boolean
	count:   Count
}
class Words{
	words: Word[]
	
	constructor(swords: string){
		swords = swords.trim()
		if(swords == ''){
			return []
		}
		var unique: {[key: string]: boolean;} = {}
		var ws: string[] = swords.match(/-?"[^"]*"|-?'[^']+'|[^\s\t　]+/g)
		var regbool: boolean = false
		for(let n = 0; n < ws.length; n++){
			let sword:string = ws[n]
			let word:Word = new Word()
			word.enabled = false
			// 文字の重複を無くす
			if(unique[sword] == true){
				continue
			}
			unique[sword] = true
			
			if(sword.toUpperCase() == regPrefix){
				regbool = true
				continue
			}
			if(sword == 'OR'){
				continue
			}
			if(sword.indexOf('-') == 0){
				continue
			}
			
			if(regbool && sword.indexOf(regPrefix) != 0){
				try{
					new RegExp(sword, 'g')
					word.regexp = true
				}catch(e){
					word.enabled = false
				}
			}
			// コンパイル失敗した正規表現は削除
			if(regbool){
			}else{
				// カッコは検索しない
				sword = sword.replace(/[()]/g,'')
				sword = sword.replace(/^['"](.*)['"]$/g,'$1')
			}
			if(sword == ''){
				continue
			}
			word.origin = sword
			word.word = sword

			this.words.push(word)
		}
	}
}

class Count{
	enabled: boolean
	num:     number
	cur:     number
}
