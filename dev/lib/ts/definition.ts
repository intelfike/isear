// ストレージに保存する時のキー
const latest_words = "latest_words"
const saveWordsPrefix = 'words_'
const saveNumPrefix = 'mum_'

// injectのデータ
const hlClass = 'itel-highlight'
const selected = 'itel-selected'
const top_selected = 'isear-top-selected'

const regPrefix = '@RE:'

// 検索結果のハイライトの色の表示順
var bgColors = [
	'#FFFF00',
	'#88FF88',
	'#00FFFF',
	'#CCDDFF',
	'#FF88FF',
	'#FF8888',
	'#FFAA00',
]
var barColors = bgColors

class Word{
	id:       number
	origin:   string
	unified:  string
	bgColor:  string
	barColor: string
	regexp:   RegExp
	regbool:  boolean
	enabled:  boolean
	count:    Count
	elems:    HTMLElement[]
	
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
				this.regbool = true
				this.unified = sword
			}catch(e){
				return
			}
		}else{
			if(!/^"[^"]+"$|^'[^']+'$/g.test(sword)){
				sword = sword.replace(/[()]/g,'')
			}
			
			sword = sword.replace(/^"(.*)"$/g,'$1')
			sword = sword.replace(/^'(.*)'$/g,'$1')
			this.unified = unifyWord(sword)
		}
		if(sword == ''){
			return
		}
		this.enabled = true
		this.origin = sword
		this.count = new Count()
		this.elems = []
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
		var regunique:{[key: string]: boolean;} = {}
		swords = shiftLeftChars(swords, '"', '”')
		swords = shiftLeftChars(swords, "'", "’")
		swords = shiftLeftChars(swords, "(", "（")
		swords = shiftLeftChars(swords, ")", "）")
		var ws:string[] = swords.match(/-?"[^"]*"|-?'[^']+'|[^\s\t　"']+/g)
		var regbool:boolean = false
		var cnt:number = 0
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
			let uq = unique
			if(word.regbool){
				uq = regunique
			}
			if(uq[word.unified] == true){
				continue
			}
			uq[word.unified] = true
			
			word.bgColor = bgColors[cnt%bgColors.length]
			word.barColor = barColors[cnt%barColors.length]
			cnt++
			word.id = cnt
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