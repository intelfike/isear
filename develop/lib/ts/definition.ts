// ストレージに保存する時のキー
var latest_words = "latest_words"
var saveWordsPrefix = 'words_'
var saveNumPrefix = 'mum_'

// 検索結果のハイライトの色の表示順
const colors = ['#FF0', '#4FF', '#F8F', '#8F8', '#FA0']
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
				// this.enabled = false
				return undefined
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
		this.unified = unifyWord(sword)
		this.count = new Count()
	}
}
class Words{
	array: Word[] = []
	map:   {[key:string]:Word;} = {}
	
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
			this.array.push(word)
			this.map[sword] = word
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
function shiftLeftCode(code, leftCode, rightCode, range){
	if(rightCode <= code && code <= rightCode+range){
		code = code - rightCode + leftCode
	}
	return code
}
function shiftLeftChar(char, leftChar, rightChar, range){
	var code = char.charCodeAt()
	var leftCode = leftChar.charCodeAt()
	var rightCode = rightChar.charCodeAt()
	code = shiftLeftCode(code, leftCode, rightCode, range)
	return String.fromCharCode(code)
}
// 半角/全角、ひらがな/カタカナを柔軟に検索させるため
function shiftLeftChars(str, leftChar, rightChar, range){
	var chars = []
	for(let n = 0; n < str.length; n++){
		chars[n] = shiftLeftChar(str[n], leftChar, rightChar, range)
	}
	return chars.join('')
}
// 大文字/小文字、半角/全角、ひらがな/カタカナを柔軟に検索させるため
function unifyWord(word){
	word = shiftLeftChars(word, '0', '０', 9)
	word = shiftLeftChars(word, 'A', 'Ａ', 'Z'.charCodeAt(0)-'A'.charCodeAt(0))
	word = shiftLeftChars(word, 'a', 'ａ', 'z'.charCodeAt(0)-'a'.charCodeAt(0))
	word = shiftLeftChars(word, 'ぁ', 'ァ', 'ゔ'.charCodeAt(0)-'ぁ'.charCodeAt(0))
	word = word.toUpperCase()
	return word
}