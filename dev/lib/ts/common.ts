// 一定時間呼ばれなければ実行する
// キーボードイベントで一定時間操作しなければ実行 など
var timeouter = {}
function whereTimeout(group, f, time){
	clearTimeout(timeouter[group])
	timeouter[group] = setTimeout(f, time)
}

// 特定の長さになるまで左側を埋める
function leftfill(str, char, len){
	while(str.length < len){
		str = char + str
	}
	return str
}

