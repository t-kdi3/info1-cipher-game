window.Game = (() => {
    const DURATION_SECONDS = 40 * 60;
    const countedPuzzles = window.GAME_PUZZLES.filter((puzzle) => puzzle.counted);
    const ANSWER_FORMATS = {
        hiragana: {
            instruction: "ひらがなで入力してください。",
            pattern: /^[\u3041-\u3096ー]+$/
        },
        katakana: {
            instruction: "カタカナで入力してください。",
            pattern: /^[\u30a1-\u30faー]+$/
        },
        kanji: {
            instruction: "漢字で入力してください。",
            pattern: /^\p{Script=Han}+$/u
        },
        "kanji-katakana": {
            instruction: "漢字と全角カタカナの組み合わせで入力してください。",
            pattern: /^(?=.*\p{Script=Han})(?=.*[\u30a1-\u30fa])[\p{Script=Han}\u30a1-\u30faー]+$/u
        },
        "halfwidth-number": {
            instruction: "半角数字で入力してください。",
            pattern: /^[0-9]+(?:\.[0-9]+)?$/
        }
    };

    function readJson(key, fallback) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    }

    function start(className, studentNumber) {
        localStorage.setItem("className", className);
        localStorage.setItem("studentNumber", studentNumber);
        localStorage.setItem("startTime", String(Date.now()));
        localStorage.setItem("solvedPuzzles", "{}");
        localStorage.setItem("solvedPuzzleTimes", "{}");
        localStorage.removeItem("gameResult");
        localStorage.removeItem("scoreSent");
        location.href = "start.html";
    }

    function startedAt() {
        return Number(localStorage.getItem("startTime")) || 0;
    }

    function remainingSeconds() {
        const start = startedAt();
        return start
            ? Math.max(0, DURATION_SECONDS - Math.floor((Date.now() - start) / 1000))
            : 0;
    }

    function solvedMap() {
        return readJson("solvedPuzzles", {});
    }

    function solvedTimesMap() {
        return readJson("solvedPuzzleTimes", {});
    }

    function normalizeAnswer(value) {
        return String(value)
            .trim()
            .normalize("NFKC")
            .toLowerCase()
            .replace(/[\u30a1-\u30f6]/g, (character) =>
                String.fromCharCode(character.charCodeAt(0) - 0x60)
            );
    }

    function parseNumericAnswer(value) {
        const normalized = normalizeAnswer(value).replace(/\s/g, "");
        const match = normalized.match(
            /^((?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?)(?:km|きろめーとる|きろ)?$/
        );
        return match ? Number(match[1].replace(/,/g, "")) : null;
    }

    function solvedCount() {
        const solved = solvedMap();
        return countedPuzzles.filter((puzzle) => solved[puzzle.id]).length;
    }

    function formatSeconds(seconds) {
        const safeSeconds = Math.max(0, Number(seconds) || 0);
        const minutes = Math.floor(safeSeconds / 60);
        const remainder = safeSeconds % 60;
        return `${minutes}分${String(remainder).padStart(2, "0")}秒`;
    }

    function finish(status) {
        if (localStorage.getItem("gameResult")) {
            location.href = "result.html";
            return;
        }
        const start = startedAt();
        if (!start) {
            location.href = "index.html";
            return;
        }
        const now = Date.now();
        const result = {
            className: localStorage.getItem("className") || "",
            studentNumber: localStorage.getItem("studentNumber") || "",
            solvedCount: solvedCount(),
            puzzleTimes: solvedTimesMap(),
            totalCount: countedPuzzles.length,
            status,
            elapsedSeconds: Math.min(
                DURATION_SECONDS,
                Math.max(0, Math.floor((now - start) / 1000))
            ),
            startedAt: new Date(start).toISOString(),
            finishedAt: new Date(now).toISOString()
        };
        localStorage.setItem("gameResult", JSON.stringify(result));
        location.href = "result.html";
    }

    function guardSession() {
        if (!startedAt()) {
            location.href = "index.html";
            return false;
        }
        if (localStorage.getItem("gameResult")) {
            location.href = "result.html";
            return false;
        }
        if (remainingSeconds() <= 0) {
            finish("timeout");
            return false;
        }
        return true;
    }

    function startTimer(element) {
        let timerId;
        const update = () => {
            const remaining = remainingSeconds();
            element.textContent = `残り時間 ${formatSeconds(remaining)}`;
            if (remaining === 0) {
                clearInterval(timerId);
                finish("timeout");
            }
        };
        update();
        timerId = setInterval(update, 1000);
    }

    function renderProgress(element) {
        const solved = solvedMap();
        element.replaceChildren();
        countedPuzzles.forEach((puzzle) => {
            const row = document.createElement("div");
            row.className = "progress-row";
            const title = document.createElement("span");
            title.textContent = puzzle.title;
            const state = document.createElement("span");
            state.textContent = solved[puzzle.id] ? "正解" : "未クリア";
            if (solved[puzzle.id]) state.className = "solved";
            row.append(title, state);
            element.append(row);
        });
        const total = document.createElement("p");
        total.className = "progress-total";
        total.textContent = `正答数 ${solvedCount()}/${countedPuzzles.length}`;
        element.append(total);
    }

    function renderQuestionText(element, text) {
        element.replaceChildren();
        const sections = text.split(/^={3,}$/m);
        sections.forEach((section, index) => {
            if (section) element.append(document.createTextNode(section));
            if (index < sections.length - 1) {
                const separator = document.createElement("hr");
                separator.className = "question-separator";
                element.append(separator);
            }
        });
    }

    function renderChallenge() {
        const puzzleId = new URLSearchParams(location.search).get("id");
        const puzzle = window.GAME_PUZZLES.find((item) => item.id === puzzleId);
        const title = document.getElementById("challengeTitle");
        const question = document.getElementById("question");
        const status = document.getElementById("answerStatus");
        const form = document.getElementById("answerForm");
        const answerFieldContainer = document.getElementById("answerFields");
        const submitButton = document.getElementById("answerButton");

        if (!puzzle) {
            title.textContent = "課題が見つかりません";
            question.textContent = "課題一覧から選び直してください。";
            form.hidden = true;
            return;
        }

        title.textContent = puzzle.title;
        renderQuestionText(question, puzzle.question || "");
        const answerFields = Array.isArray(puzzle.answerFields)
            ? puzzle.answerFields
            : ["答え"];
        answerFieldContainer.replaceChildren();
        const answerFormat = ANSWER_FORMATS[puzzle.answerFormat];
        if (answerFormat) {
            const instruction = document.createElement("p");
            instruction.className = "notice answer-rule";
            instruction.textContent = answerFormat.instruction;
            answerFieldContainer.append(instruction);
        }
        answerFields.forEach((field, index) => {
            const inputId = `answer-${index + 1}`;
            const label = document.createElement("label");
            label.htmlFor = inputId;
            label.textContent = field;
            const input = document.createElement("input");
            input.id = inputId;
            input.name = "answer";
            input.autocomplete = "off";
            input.placeholder = `${field}を入力`;
            answerFieldContainer.append(label, input);
        });
        (puzzle.downloads || []).forEach((download) => {
            const link = document.createElement("a");
            link.className = "question-download";
            link.href = download.href;
            link.download = download.href.split("/").pop() || "download";
            link.textContent = download.label;
            question.append(link, document.createElement("br"));
        });
        if (puzzle.image) {
            const downloadLink = document.createElement("a");
            downloadLink.className = "question-download";
            downloadLink.href = puzzle.image;
            downloadLink.download = puzzle.image.split("/").pop() || "puzzle-image";
            downloadLink.textContent = "問題画像をダウンロード";

            const image = document.createElement("img");
            image.className = "question-image";
            image.src = puzzle.image;
            image.alt = puzzle.imageAlt || "問題の画像";
            question.append(downloadLink, image);
        }
        if (puzzle.encodedText) {
            const textFrame = document.createElement("iframe");
            textFrame.className = "question-text-frame";
            textFrame.src = puzzle.encodedText;
            textFrame.title = "文字化けした問題文";
            const openLink = document.createElement("a");
            openLink.className = "question-download";
            openLink.href = puzzle.encodedText;
            openLink.target = "_blank";
            openLink.rel = "noopener";
            openLink.textContent = "問題文を別タブで開く";
            question.append(textFrame, openLink);
        }
        const solved = solvedMap();
        if (solved[puzzle.id]) {
            status.textContent = "この課題は正解済みです。";
            form.hidden = true;
            return;
        }
        if (
            (!puzzle.question && !puzzle.image) ||
            answerFields.length === 0 ||
            !Array.isArray(puzzle.answers) ||
            !puzzle.answers.length ||
            (puzzle.answerFields &&
                (answerFields.length !== puzzle.answers.length ||
                    answerFields.length < 2))
        ) {
            status.textContent = "問題と正答は準備中です。設定後に挑戦できます。";
            answerFieldContainer.querySelectorAll("input").forEach((input) => {
                input.disabled = true;
            });
            submitButton.disabled = true;
            return;
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (!guardSession()) return;
            const enteredAnswers = Array.from(
                answerFieldContainer.querySelectorAll("input"),
                (input) => puzzle.answerFormat
                    ? input.value.trim()
                    : normalizeAnswer(input.value)
            );
            const answer = enteredAnswers[0];
            if (
                answerFormat &&
                enteredAnswers.some((value) => !answerFormat.pattern.test(value))
            ) {
                status.textContent = answerFormat.instruction;
                return;
            }
            const numericAnswer = puzzle.answerFormat === "halfwidth-number"
                ? Number(answer)
                : parseNumericAnswer(answer);
            const expectedAnswers = puzzle.answers
                .map((value) => puzzle.answerFormat ? value : normalizeAnswer(value))
                .sort();
            const correct = puzzle.answerTolerance !== undefined
                ? numericAnswer !== null &&
                    puzzle.answers.some((candidate) => {
                        const expected = Number(candidate);
                        return Number.isFinite(expected) &&
                            Math.abs(numericAnswer - expected) <= puzzle.answerTolerance;
                    })
                : puzzle.answerFields
                    ? enteredAnswers.length === puzzle.answers.length &&
                        enteredAnswers.slice().sort().every(
                            (value, index) => value === expectedAnswers[index]
                        )
                    : puzzle.answers.some((candidate) =>
                        answer === (
                            puzzle.answerFormat
                                ? candidate
                                : normalizeAnswer(candidate)
                        )
                    );
            if (!correct) {
                status.textContent = "不正解です。もう一度考えてみてください。";
                return;
            }
            solved[puzzle.id] = true;
            localStorage.setItem("solvedPuzzles", JSON.stringify(solved));
            const puzzleTimes = solvedTimesMap();
            puzzleTimes[puzzle.id] = Math.floor((Date.now() - startedAt()) / 1000);
            localStorage.setItem("solvedPuzzleTimes", JSON.stringify(puzzleTimes));
            if (solvedCount() === countedPuzzles.length) {
                finish("complete");
                return;
            }
            status.textContent = "正解です。課題一覧に戻って次の課題に挑戦してください。";
            form.hidden = true;
        });
    }

    async function submitResult(result, messageElement, button) {
        if (!window.GAME_API_URL) {
            messageElement.textContent =
                "記録APIが未設定です。GASのURLを設定してから送信してください。";
            return;
        }
        if (localStorage.getItem("scoreSent") === "true") {
            messageElement.textContent = "この結果は送信済みです。";
            return;
        }
        button.disabled = true;
        messageElement.textContent = "記録を送信しています...";
        try {
            const response = await fetch(window.GAME_API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ type: "result", ...result })
            });
            if (!response.ok) {
                throw new Error(`記録APIがHTTP ${response.status}を返しました。`);
            }
            const data = await response.json();
            if (data.ok !== true) {
                throw new Error(data.message || "保存完了を確認できませんでした。");
            }
            localStorage.setItem("scoreSent", "true");
            messageElement.textContent = "結果を共有ランキングへ送信しました。";
        } catch (error) {
            console.error("結果の送信に失敗しました。", error);
            messageElement.textContent = `送信に失敗しました。${error.message}`;
            button.disabled = false;
        }
    }

    return {
        DURATION_SECONDS,
        TOTAL_QUESTIONS: countedPuzzles.length,
        finish,
        formatSeconds,
        guardSession,
        renderChallenge,
        renderProgress,
        remainingSeconds,
        solvedCount,
        start,
        startTimer,
        submitResult
    };
})();
