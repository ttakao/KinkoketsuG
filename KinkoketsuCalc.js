/**
 * kinkoketsuCalc クラス
 * 金口訣の四位算出ロジックをカプセル化したライブラリ
 */
class kinkoketsuCalc {
    constructor(D, M, T, H, Night) {
        this.D = parseInt(D);
        this.M = parseInt(M);
        this.T = parseInt(T);
        this.H = parseInt(H);
        this.Night = (Night === "true" || Night === true);

        this.zodiacs = ["", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        this.tens = ["", "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
        this.tenShoNames = ["", "貴人", "騰蛇", "朱雀", "六合", "勾陳", "青龍", "天空", "白虎", "太常", "玄武", "太陰", "天后"];
        this.getShoNames = ["", "神后", "大登", "功曹", "太衝", "天罡", "太乙", "勝光", "小吉", "伝送", "従魁", "河魁", "登明"];
    }

    /**
     * 将神の算出
     */
    calcShoShin() {
        let res = (this.M - this.T + this.D + 12) % 12;
        let branchIdx = res === 0 ? 12 : res;
        return { name: this.getShoNames[branchIdx], branch: this.zodiacs[branchIdx] };
    }

    /**
     * 貴神の算出
     */
    calcKiShin() {
        let k;
        if ([1, 5, 7].includes(this.H)) k = this.Night ? 8 : 2; // 甲戊庚
        else if ([2, 6].includes(this.H)) k = this.Night ? 9 : 1; // 乙己
        else if ([3, 4].includes(this.H)) k = this.Night ? 10 : 12; // 丙丁
        else if (this.H === 8) k = this.Night ? 3 : 7; // 辛
        else if ([9, 10].includes(this.H)) k = this.Night ? 4 : 6; // 壬癸

        const direction = (k <= 5 || k === 12) ? 1 : -1;
        let idx = ((this.D - k) * direction + 12) % 12;
        const name = this.tenShoNames[idx + 1];
        
        const kanIdx = this.calcJinGen(this.D, this.H);
        return { name: name, branch: this.zodiacs[this.D], kan: this.tens[kanIdx] };
    }

    /**
     * 人元の算出 (五子元遁)
     */
    calcJinGen(diBunIdx, nichiKanIdx) {
        let startKan;
        if ([1, 6].includes(nichiKanIdx)) startKan = 1; // 甲己
        else if ([2, 7].includes(nichiKanIdx)) startKan = 3; // 乙庚
        else if ([3, 8].includes(nichiKanIdx)) startKan = 5; // 丙辛
        else if ([4, 9].includes(nichiKanIdx)) startKan = 7; // 丁壬
        else if ([5, 10].includes(nichiKanIdx)) startKan = 9; // 戊癸

        let res = (startKan + (diBunIdx - 1)) % 10;
        return res === 0 ? 10 : res;
    }

    /**
     * 四位の結果をまとめて取得
     */
    getResults() {
        const jin = this.calcJinGen(this.D, this.H);
        const sho = this.calcShoShin();
        const ki = this.calcKiShin();

        return {
            jinGen: this.tens[jin],
            kiShin: ki.kan + ki.branch + " (" + ki.name + ")",
            shoShin: sho.branch + " (" + sho.name + ")",
            diBun: this.zodiacs[this.D]
        };
    }
}