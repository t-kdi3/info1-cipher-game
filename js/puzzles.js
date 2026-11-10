window.GAME_PUZZLES = [
    {
        id: "example",
        title: "0：例題",
        section: "例題",
        counted: false,
        question: "",
        image: "assets/example-puzzle.png",
        imageAlt: "こけしとたぬきの絵を使った例題",
        answerFormat: "hiragana",
        answers: ["るーるをきめる"]
    },
    {
        id: "acrostic",
        title: "1：折句",
        section: "課題",
        counted: true,
        question: "何を言いたい？\n==========\nあくびがでるわ\nいやけがさすわ\nしにたいくらい\nてんでたいくつ\nまぬけなあなた\nすべってころべ\n==========",
        answerFormat: "hiragana",
        answers: ["あいしてます"]
    },
    {
        id: "caesar",
        title: "2：シーザー暗号",
        section: "課題",
        counted: true,
        question: "これに登場する地名が答え\n==========\nOljb txp klq yrfiq fk x axv.\n\nXii olxap ibxa ql Oljb.\n==========",
        answerFormat: "katakana",
        answers: ["ローマ"]
    },
    {
        id: "unicode",
        title: "3：UNICODE",
        section: "課題",
        counted: true,
        question: "これに登場する2種類の動物は？\n==========\nオスゲヌクュ\n\nユセユセクュレクュスヷレ\nタクエヒオヅハギモガミネ\nウリャヒヒヱエユヒビノエ\nネオセナチヷノハヒヱエヒク\n\nノヷヌギデセョワオスゲスヷ\nチヷノロギモガヌクサコロポ\nヤシオヒシヨモヒベユヌモニ\nネヅログスケハクサトコク\n\nネヷノハクュグエチエニユ\nネオタピヷモニククワツヱオ\nシシロニヅルデヌブヌパヤヮ\nゴㅠゴㅠゴㅠゴㅠゴㅠゴㅠゴㅠ\n\nシヰビパソゲッセコゼデッ\nヘルヷヘルヷヘルヷヘルヷヘル\nウヷモヮギチエオスゲスヷ\nスデケヒゼモヷビネオセッヒ\n==========",
        answerFormat: "hiragana",
        answerFields: ["動物名 1", "動物名 2"],
        answers: ["うさぎ", "かめ"]
    },
    {
        id: "exif",
        title: "4：EXIF",
        section: "課題",
        counted: true,
        question: "写真を端末にダウンロードして確認してください。",
        answerFormat: "kanji",
        image: "assets/exif-photo.jpg",
        answers: ["写真"]
    },
    {
        id: "encoding",
        title: "5：エンコード",
        section: "課題",
        counted: true,
        question: "この作品のタイトルに出てくる動物は？",
        answerFormat: "katakana",
        encodedText: "assets/encoding-error.html",
        answers: ["カニ"]
    },
    {
        id: "cryptography",
        title: "6：クリプトグラフィ",
        section: "課題",
        counted: true,
        question: "最後を調べてね。",
        answerFormat: "kanji-katakana",
        image: "assets/hidden-message.jpg",
        downloads: [
            { href: "tools/binary-viewer.html", label: "ファイルを調べるツール" }
        ],
        answers: ["情報ハイディング"]
    },
    {
        id: "spartan",
        title: "7-1：スパルタ",
        section: "ソーシャルエンジニアリング",
        counted: true,
        question: "添付画像を参考にして、答えを入力してください。",
        answerFormat: "halfwidth-number",
        image: "assets/spartan-cylinder.jpg",
        answers: ["583"]
    },
    {
        id: "vigenere",
        title: "7-2：ヴィジュネル方陣",
        section: "ソーシャルエンジニアリング",
        counted: true,
        question: "次の暗号文をヴィジュネル方陣で解読してください。\n誤差を認めるので、このくらいという数値を入力してください。\n\nUMZHMZEPX UEXCQ ZHAR VW CPLFPVXJLZ PIVHM BCEP US ECOPZE EQ APOE",
        answerFormat: "halfwidth-number",
        image: "assets/vigenere-square.png",
        answers: ["6283"],
        answerTolerance: 100
    }
];
