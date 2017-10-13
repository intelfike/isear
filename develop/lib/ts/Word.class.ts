const regPrefix = '@RE:'

class Word{
	origin:  string
	word:    string
	unified: string
	regexp:  boolean
	enabled: boolean
	count:   Count
	
	// regbool=trueで強制正規表現
	constructor(sword:string, regbool:boolean=false){
		this.enabled = false
		this.regexp = false
		
		if(sword == 'OR'){
			return undefined
		}
		if(sword.indexOf('-') == 0){
			return undefined
		}
		
		// 正規表現の接頭語がついていたら外す
		if(sword.toUpperCase().indexOf(regPrefix) == 0){
			sword = sword.substr(regPrefix.length)
			regbool = true
		}
		if(regbool){
			try{
				new RegExp(sword, 'g')
				this.regexp = true
			}catch(e){
				this.enabled = false
			}
		}else{
			// カッコは検索しない
			sword = sword.replace(/[()]/g,'')
			sword = sword.replace(/^['"](.*)['"]$/g,'$1')
		}
		if(sword == ''){
			return undefined
		}
		this.origin = sword
		this.word = sword
	}
}
class Words{
	words: Word[] = []
	
	constructor(swords: string){
		swords = swords.trim()
		if(swords == ''){
			return
		}
		var unique: {[key: string]: boolean;} = {}
		var ws: string[] = swords.match(/-?"[^"]*"|-?'[^']+'|[^\s\t　]+/g)
		var regbool: boolean = false
		for(let n = 0; n < ws.length; n++){
			let sword:string = ws[n]
			// 文字の重複を無くす
			if(unique[sword] == true){
				continue
			}
			unique[sword] = true
			
			if(sword.toUpperCase() == regPrefix){
				regbool = true
				continue
			}

			let word:Word = new Word(sword, regbool)
			if(word == undefined){
				continue
			}
			this.words.push(word)
		}
	}
	
	getList(key:string):any{
		var result:any[] = []
		for(let n = 0; n < this.words.length; n++){
			let word = this.words[n]
			let w = word[key]
			if(w == undefined){
				continue
			}
			result.push(w)
		}
		return result
	}
}

class Count{
	enabled: boolean
	num:     number
	cur:     number
}
