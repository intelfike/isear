// ストレージに保存する時のキー
var latest_words = "latest_words"
var saveWordsPrefix = 'words_'
var saveNumPrefix = 'mum_'

// injectのデータ
var hlClass = 'itel-highlight'
var selectId = 'itel-selected'

// 検索結果のハイライトの色の表示順
const colors = ['#FF0', '#8F8', '#0FF', '#AAF', '#F8F', '#F88', '#FA0']
const regPrefix = '@RE:'

class Word{
	origin:  string
	unified: string
	color:   string
	regexp:  RegExp
	enabled: boolean
	count:   Count
	
	// regbool=trueで強制正規表現
	constructor(sword:string, regbool:boolean=false){
		this.enabled = false
		
		if(sword == 'OR'){
			return
		}
		if(sword.indexOf('-') == 0){
			return
		}
		
		// 正規表現の接頭語がついていたら外す
		if(sword.toUpperCase().indexOf(regPrefix) == 0){
			sword = sword.substr(regPrefix.length)
			regbool = true
		}
		if(regbool){
			try{
				this.regexp = new RegExp(sword, 'g')
			}catch(e){
				return
			}
		}else{
			// カッコは検索しない
			if(!/^"[^"]+"$|^'[^']+'$/g.test(sword)){
				sword = sword.replace(/[()]/g,'')
			}
			
			sword = sword.replace(/^"(.*)"$/g,'$1')
			sword = sword.replace(/^'(.*)'$/g,'$1')
		}
		if(sword == ''){
			return
		}
		this.enabled = true
		this.origin = sword
		this.unified = unifyWord(sword)
		this.count = new Count()
	}
}
class Words{
	array: Word[] = []
	map:   {[key:string]:Word;} = {}
	
	constructor(swords:string){
		swords = swords.trim()
		if(swords == ''){
			return
		}
		var unique:{[key: string]: boolean;} = {}
		swords = shiftLeftChars(swords, '"', '”')
		swords = shiftLeftChars(swords, "'", "’")
		swords = shiftLeftChars(swords, "(", "（")
		swords = shiftLeftChars(swords, ")", "）")
		var ws:string[] = swords.match(/-?"[^"]*"|-?'[^']+'|[^\s\t　"']+/g)
		var regbool:boolean = false
		var colorcnt:number = 0
		for(let n = 0; n < ws.length; n++){
			let sword:string = ws[n]
			if(sword.toUpperCase() == regPrefix){
				regbool = true
				continue
			}

			let word:Word = new Word(sword, regbool)
			if(word.origin == undefined){
				continue
			}

			// 文字の重複を無くす
			if(unique[word.unified] == true){
				continue
			}
			unique[word.unified] = true
			
			word.regexp = undefined
			word.color = colors[colorcnt]
			colorcnt++
			colorcnt %= colors.length
			this.array.push(word)
			this.map[word.origin] = word
		}
	}
	
	getList(key:string):any{
		var result:any[] = []
		for(let n = 0; n < this.array.length; n++){
			let word = this.array[n]
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
	
	constructor(){
		this.enabled = false
		this.num = 0
		this.cur = 0
	}
}


// 文字に融通を聞かせる為
function shiftLeftCode(code:number, leftCode:number, rightCode:number, range:number):number{
	if(rightCode <= code && code <= rightCode+range){
		code = code - rightCode + leftCode
	}
	return code
}
function shiftLeftChar(char:string, leftChar:string, rightChar:string, range:number):string{
	var code = char.charCodeAt(0)
	var leftCode = leftChar.charCodeAt(0)
	var rightCode = rightChar.charCodeAt(0)
	code = shiftLeftCode(code, leftCode, rightCode, range)
	return String.fromCharCode(code)
}
// 半角/全角、ひらがな/カタカナを柔軟に検索させるため
function shiftLeftChars(str:string, leftChar:string, rightChar:string, range:number = 1):string{
	var chars = []
	for(let n = 0; n < str.length; n++){
		chars[n] = shiftLeftChar(str[n], leftChar, rightChar, range)
	}
	return chars.join('')
}
// 大文字/小文字、半角/全角、ひらがな/カタカナを柔軟に検索させるため
function unifyWord(word){
	word = shiftLeftChars(word, '!', '！', '~'.charCodeAt(0)-'!'.charCodeAt(0))
	word = shiftLeftChars(word, 'ぁ', 'ァ', 'ゔ'.charCodeAt(0)-'ぁ'.charCodeAt(0))
	word = shiftLeftChars(word, ' ', '　')
	word = word.toUpperCase()
	return word
}