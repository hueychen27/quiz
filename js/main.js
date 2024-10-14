import * as utils from "./utils.js";

/**
 * @type {data}
 */
let data;
// Serves as base data object
/* In the form of:
data = {
    "1": {
        title: string;
        answers: {
            a: {
                answer: string;
                correct: boolean;
            };
            b: {
                answer: string;
                correct: boolean;
            };
            so on with c, d, etc.
        };
        multiSelect: boolean;
    };
    so on with 2, 3, etc.
}
* See main.d.ts for more type information.
*/

/**
 * @type {HTMLFormElement}
 */
const main = document.getElementById("content");

/**
 * Initialize quiz questions and answers on website page
 * @param {data} data 
 * @param {options} options Options to modify quiz behavior
 */
function initiateQuiz(data, options) {
    const mapData = new Map(Object.entries(data)); // Create Map to retain order

    while (main.lastElementChild) {
        main.removeChild(main.lastElementChild);
    }

    const buttonGroup = document.createElement("div");

    buttonGroup.id = "buttonGroup";

    const resetButton = document.createElement("button");

    resetButton.id = "formReset";
    resetButton.type = "button";
    resetButton.textContent = "Reset all answers";
    resetButton.addEventListener("click", (e) => {
        e.preventDefault();
        /**
         * @type {HTMLDialogElement}
         */
        const dialog = document.getElementById("resetConfirmation");
        dialog.showModal();
    });

    const submitButton = document.createElement("button");

    submitButton.id = "formSubmit";
    submitButton.textContent = "Submit for review";

    buttonGroup.append(resetButton, submitButton);

    /**
     * @type {mapData}
     */
    const shuffled = options.shuffleQuestions ? utils.shuffleMap(mapData) : mapData;
    /**
     * @type {entries}
     */
    const entries = utils.entriesOfMap(shuffled);
    const dataLength = shuffled.size;
    for (let i = 0; i < dataLength; i++) {
        const innerData = entries[i];
        const id = "q" + innerData[0];
        const realData = innerData[1];
        const { title, answers: unshuffledAnswers, multiSelect } = realData;
        /**
         * @type {unshuffledAnswers}
         */
        const answers = options.shuffleAnswers ? utils.shuffleObject(unshuffledAnswers) : unshuffledAnswers;

        const fieldset = document.createElement("fieldset"); // Make <fieldset> container
        fieldset.id = id;
        fieldset.className = "questions";
        fieldset.name = id;

        const legend = document.createElement("legend"); // Make <legend> (title)
        legend.className = "title";
        legend.textContent = title;

        const answersLength = utils.getLength(answers);

        const labelArray = [];
        for (let j = 0; j < answersLength; j++) {
            const label = document.createElement("label"); // Make <label>

            const input = document.createElement("input"); // Make <input>
            const letter = Object.keys(answers)[j];
            input.className = letter; // Set class to answer label like a, b, or c for answer checking
            input.value = letter; // Also, value should be letter for answer checking
            input.type = multiSelect ? "checkbox" : "radio"; // If multiselectable, then use checkboxes which allow zero answers to be clicked on.
            if (j === 0 && !multiSelect) input.required = true;
            input.name = id; // Group inputs in parent <fieldset> element with id

            const answerDescription = Object.values(answers)[j].answer;
            const textNode = document.createTextNode(answerDescription); // To make: Example answer

            label.append(input, textNode); // To make: <label><input class="a" type="radio" name="q1" required>Example answer</label>

            labelArray.push(label);
        }


        fieldset.append(legend, ...labelArray);
        main.append(fieldset, buttonGroup);
        /** In the form of:
        <fieldset id="q1" class="questions">
            <legend class="title">Example question</legend>
            <label><input class="a" type="radio" name="q1" required>Example answer</label>
            <label><input class="b" type="radio" name="q1">2</label>
            <label><input class="c" type="radio" name="q1">3</label>
        </fieldset>
         */
    }
}

/**
 * Check answers and mark as correct.
 * @param {data} data 
 */
function checkAnswers(data) {
    const mapData = new Map(Object.entries(data)); // Create Map to retain order

    const length = main.children.length - 1;
    for (let i = 0; i < length /** Exclude legend and button group */; i++) {
        /**
         * @type {HTMLFieldSetElement}
         */
        const child = main.children[i];
        const id = child.id.slice(1);
        const item = data[id].answers;
        const { multiSelect, answers } = data[id];
        const answerEntries = Object.entries(answers);
        const correctAnswers = answerEntries.filter((value) => value[1].correct);
        const correctAnswerLetters = correctAnswers.map((value) => value[0]);

        const values = [];
        if (multiSelect) {
            const inputs = document.querySelectorAll(`input[name="${child.id}"]:checked`);
            inputs.forEach((element) => {
                values.push(element.value);
            })
        } else {
            const id = child.id;
            values.push(main.elements[id].value);
        }
        const compare = utils.arrayCompare(correctAnswerLetters, values)
        utils.addCorrectClass(child, compare);
    }
}

document.getElementById("content").addEventListener("submit", (e) => {
    e.preventDefault();
    checkAnswers(data);
    e.submitter.textContent = "Resubmit answers for review"
    return false;
})

document.querySelectorAll("dialog").forEach((el) => {
    utils.makeDialogBackgroundClickable(el);
})

document.getElementById("resetConfirmation-yes").addEventListener("click", () => {
    main.reset();
})

/**
 * @type {HTMLSelectElement}
 */
const selectionModeEl = document.getElementById("selectionMode");

selectionModeEl.addEventListener("change", (e) => {
    document.getElementById("quizSelectionContainer").style.display = e.target.value === "custom" ? "none" : "block";
    document.getElementById("fileInputContainer").style.display = e.target.value === "predefined" ? "none" : "block";
})

document.getElementById("submitChoice").addEventListener("click", async () => {
    const loadingEl = new utils.LoadingElement(main);
    loadingEl.enable();

    /**
     * @type {HTMLInputElement}
     */
    const fileInput = document.getElementById("fileInput");
    /**
     * @type {string?}
     */
    let file;
    if (selectionModeEl.value === "custom") {
        try {
            file = await utils.fileHandler(fileInput);
        } catch (e) {
            utils.alertDialog(e);
            main.style.display = "";
            return;
        }
    }

    if (selectionModeEl.value === "predefined") {
        /**
         * @type {data}
         */
        data = await utils.getJSONFile("./data/" + document.getElementById("quizSelection").value);
    } else {
        try {
            data = JSON.parse(file);
        } catch (e) {
            if (!(e instanceof SyntaxError)) throw e;
            utils.alertDialog("Error in JSON file while parsing it:\n" + "<pre style='margin: 10px 0;'>" + e.message + "</pre>");
            main.style.display = "";
            loadingEl.disable();
            return;
        }
    }

    try {
        utils.validateObject(data);
    } catch (e) {
        if (!(e instanceof utils.ValidationError)) throw e;
        utils.alertDialog("Error in JSON file while validating it:\n" + "<pre style='margin: 10px 0;'>" + e.message + "</pre>");
        main.style.display = "";
        return;
    } finally {
        loadingEl.disable();
    }

    /**
     * @type {HTMLSelectElement}
     */
    const shuffleQuestions = document.getElementById("shuffleQuestions");
    /**
     * @type {HTMLSelectElement}
     */
    const shuffleAnswers = document.getElementById("shuffleAnswers");

    /**
     * @type {options}
     */
    const options = {
        shuffleQuestions: +shuffleQuestions.value,
        shuffleAnswers: +shuffleAnswers.value
    }

    initiateQuiz(data, options);

    main.style.display = "block";
})