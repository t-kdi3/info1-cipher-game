window.GAME_PUZZLES = [
    {
        id: "example",
        title: "0：例題",
        section: "例題",
        counted: false,
        question: "たるーころをたきこめる\n\n左の絵：こけし\n右の絵：たぬき",
        answers: ["るーるをきめる", "ルールを決める"]
    },
    {
        id: "acrostic",
        title: "1：折句",
        section: "課題",
        counted: true,
        question: "何を言いたい？\n==========\nあくびがでるわ\nいやけがさすわ\nしにたいくらい\nてんでたいくつ\nまぬけなあなた\nすべってころべ\n==========",
        answers: ["あいしてます", "愛してます"]
    },
    {
        id: "caesar",
        title: "2：シーザー暗号",
        section: "課題",
        counted: true,
        question: "これに登場する地名が答え\n==========\nOljb txp klq yrfiq fk x axv.\n\nXii olxap ibxa ql Oljb.\n==========",
        answers: ["Rome", "ローマ"]
    },
    {
        id: "unicode",
        title: "3：UNICODE",
        section: "課題",
        counted: true,
        question: "これに登場する2種類の動物は？\n==========\nオスゲヌクュ\n\nユセユセクュレクュスヷレ\nタクエヒオヅハギモガミネ\nウリャヒヒヱエユヒビノエ\nネオセナチヷノハヒヱエヒク\n\nノヷヌギデセョワオスゲスヷ\nチヷノロギモガヌクサコロポ\nヤシオヒシヨモヒベユヌモニ\nネヅログスケハクサトコク\n\nネヷノハクュグエチエニユ\nネオタピヷモニククワツヱオ\nシシロニヅルデヌブヌパヤヮ\nゴㅠゴㅠゴㅠゴㅠゴㅠゴㅠゴㅠ\n\nシヰビパソゲッセコゼデッ\nヘルヷヘルヷヘルヷヘルヷヘル\nウヷモヮギチエオスゲスヷ\nスデケヒゼモヷビネオセッヒ\n==========",
        answers: ["うさぎとかめ", "兎と亀", "うさぎと亀"]
    },
    {
        id: "exif",
        title: "4：EXIF",
        section: "課題",
        counted: true,
        question: "写真を端末にダウンロードし、EXIF情報のコメントを確認してください。",
        image: "assets/exif-photo.jpg",
        answers: ["写真", "しゃしん"]
    },
    {
        id: "encoding",
        title: "5：エンコード",
        section: "課題",
        counted: true,
        question: "これが表す果物は？\n==========\n鮟�濶ｲ縺�譛医ｒ邨槭ｋ縺ｨ縲�驟ｸ縺｣縺ｱ縺�縺励★縺上′逧ｿ縺ｫ雕翫ｋ縲るｦ吶ｊ縺ｲ縺ｨ縺輔§縲∝､上�ｮ鬚ｨ縲�\n==========",
        answers: ["レモン", "Lemon"]
    },
    {
        id: "cryptography",
        title: "6：クリプトグラフィ",
        section: "課題",
        counted: true,
        question: "画像ファイルをダウンロードし、バイナリエディタでファイルの最後を確認してください。",
        image: "assets/hidden-message.jpg",
        downloads: [
            { href: "tools/binary-viewer.html", label: "バイナリエディタ（閲覧用）をダウンロード" }
        ],
        answers: ["情報ハイディング"]
    },
    {
        id: "spartan",
        title: "7-1：スパルタ",
        section: "ソーシャルエンジニアリング",
        counted: true,
        question: "添付画像を参考にして、答えを入力してください。",
        image: "assets/spartan-cylinder.jpg",
        answers: ["583"]
    },
    {
        id: "vigenere",
        title: "7-2：ヴィジュネル方陣",
        section: "ソーシャルエンジニアリング",
        counted: true,
        question: "次の暗号文をヴィジュネル方陣で解読し、文が表す川の長さの差をkmで答えてください。距離には諸説があるため、おおよその値も正解とします。\n\nUMZHMZEPX UEXCQ ZHAR VW CPLFPVXJLZ PIVHM BCEP US ECOPZE EQ APOE",
        image: "assets/vigenere-square.png",
        answers: ["6283"],
        answerTolerance: 100
    }
];
