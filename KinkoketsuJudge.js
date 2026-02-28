/**
 * kinkoketsuJudge クラス (Final v1.4.0)
 * 五動、旺相、神煞を統合し、最終的な有力数字(取数)を算出する
 */
class kinkoketsuJudge {
    constructor(results, getShoIdx, nichiKanIdx, nichiShiIdx) {
        this.results = results;
        this.getShoIdx = parseInt(getShoIdx);
        this.nichiKanIdx = parseInt(nichiKanIdx);
        this.nichiShiIdx = parseInt(nichiShiIdx);

        this.elementMap = {
            "甲": 1, "乙": 1, "寅": 1, "卯": 1,
            "丙": 2, "丁": 2, "巳": 2, "午": 2,
            "戊": 3, "己": 3, "辰": 3, "戌": 3, "丑": 3, "未": 3,
            "庚": 4, "辛": 4, "申": 4, "酉": 4,
            "壬": 5, "癸": 5, "亥": 5, "子": 5
        };

        this.elementNames = ["", "木", "火", "土", "金", "水"];
        this.statusNames = { 2: "旺", 1.5: "相", 1: "休", 0.5: "囚", 0: "死" };
        this.senTenSu = ["", "3, 8", "2, 7", "5, 10", "4, 9", "1, 6"]; // 木(1), 火(2), 土(3), 金(4), 水(5)

        this.elements = {
            jinGen: this.getElem(results.jinGen),
            kiShin: this.getElem(results.kiShin.match(/[子丑寅卯辰巳午未申酉戌亥]/)[0]),
            shoShin: this.getElem(results.shoShin.match(/[子丑寅卯辰巳午未申酉戌亥]/)[0]),
            diBun: this.getElem(results.diBun)
        };

        this.seasonElem = this.getElemByBranch(this.getShoIdx);
    }

    getElem(str) { return this.elementMap[str] || 0; }
    getElemByBranch(idx) {
        const zodiacs = ["", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        return this.getElem(zodiacs[idx]);
    }

    isKoku(a, b) { return (a === 1 && b === 3) || (a === 3 && b === 5) || (a === 5 && b === 2) || (a === 2 && b === 4) || (a === 4 && b === 1); }
    isSho(a, b) { return (a === 1 && b === 2) || (a === 2 && b === 3) || (a === 3 && b === 4) || (a === 4 && b === 5) || (a === 5 && b === 1); }

    getPower(target) {
        if (target === this.seasonElem) return 2.0;
        if (this.isSho(this.seasonElem, target)) return 1.5;
        if (this.isSho(target, this.seasonElem)) return 1.0;
        if (this.isKoku(target, this.seasonElem)) return 0.5;
        if (this.isKoku(this.seasonElem, target)) return 0.0;
        return 1.0;
    }

    getShinSatsu() {
        const shinSatsu = { jinGen: [], kiShin: [], shoShin: [], diBun: [] };
        let diff = (this.nichiShiIdx - this.nichiKanIdx + 12) % 12;
        const kuuBouMap = { 0: ["戌", "亥"], 10: ["申", "酉"], 8: ["午", "未"], 6: ["辰", "巳"], 4: ["寅", "卯"], 2: ["子", "丑"] };
        const kb = kuuBouMap[diff] || [];
        const tenMaMap = { 3: "申", 7: "申", 11: "申", 1: "寅", 5: "寅", 9: "寅", 12: "巳", 4: "巳", 8: "巳", 6: "亥", 10: "亥", 2: "亥" };
        const tm = tenMaMap[this.nichiShiIdx];

        ["jinGen", "kiShin", "shoShin", "diBun"].forEach(key => {
            const branchMatch = this.results[key].match(/[子丑寅卯辰巳午未申酉戌亥]/);
            if (!branchMatch) return;
            const b = branchMatch[0];
            if (kb.includes(b)) shinSatsu[key].push("空亡");
            if (b === tm) shinSatsu[key].push("天馬");
        });
        return shinSatsu;
    }

    getFiveMoves() {
        const moves = [];
        const { jinGen: J, kiShin: K, shoShin: S, diBun: D } = this.elements;
        if (this.isKoku(J, K)) moves.push({ name: "妻動", type: "J" });
        if (this.isKoku(K, S)) moves.push({ name: "官動", type: "K" });
        if (this.isKoku(S, D)) moves.push({ name: "財動", type: "S" });
        if (this.isKoku(D, S)) moves.push({ name: "賊動", type: "D" });
        if (this.isKoku(K, J)) moves.push({ name: "鬼動", type: "K" });
        return moves;
    }

    /**
     * 取数アルゴリズム: 各五行のスコアを算出し最強の数字を導き出す
     */
    getLuckyNumbers() {
        let scores = [0, 0, 0, 0, 0, 0]; // インデックス1-5を使用
        const satsu = this.getShinSatsu();
        const moves = this.getFiveMoves();

        ["jinGen", "kiShin", "shoShin", "diBun"].forEach(key => {
            const elem = this.elements[key];
            let p = this.getPower(elem);
            // 空亡ならスコアをゼロにする
            if (satsu[key].includes("空亡")) p = 0;
            // 天馬なら加点
            if (satsu[key].includes("天馬")) p += 0.5;
            scores[elem] += p;
        });

        // 五動ボーナス (動いている要素に加点)
        moves.forEach(m => {
            if (m.name === "財動") scores[this.elements.shoShin] += 1.0;
            if (m.name === "官動") scores[this.elements.kiShin] += 1.0;
        });

        // 最大スコアの五行を特定
        let maxScore = -1;
        let bestElem = 1;
        for (let i = 1; i <= 5; i++) {
            if (scores[i] > maxScore) {
                maxScore = scores[i];
                bestElem = i;
            }
        }

        return {
            elemName: this.elementNames[bestElem],
            numbers: this.senTenSu[bestElem],
            score: maxScore.toFixed(1)
        };
    }
}