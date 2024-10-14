export function mapReplacer(_key, value) { // To use in JSON.stringify in second argument when stringifying Maps
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries())
        };
    } else {
        return value;
    }
} // https://stackoverflow.com/a/56150320

/**
 * Get length of an object
 * @param {object} obj 
 * @returns {number}
 */
export function getLength(obj) {
    return typeof obj === "object" ? Object.keys(obj).length : 0;
}

/**
 * Get entries of Map like an object
 * @param {Map} map 
 * @returns {[*, *][]}
 */
export function entriesOfMap(map) {
    const iterator = map.entries();
    const entries = [];
    for (const item of iterator) {
        entries.push(item);
    }
    return entries;
}

/**
 * Shuffles a Map randomly with Fisher-Yates algorithm
 * @param {Map} map 
 * @returns {Map}
 */
export function shuffleMap(map) {
    const entries = entriesOfMap(map);
    let newEntries = shuffleArray(entries);
    return new Map(newEntries);
} // This one is self-made.

/**
 * Shuffles an object randomly with Fisher-Yates algorithm
 * @param {object} obj 
 * @returns {object}
 */
export function shuffleObject(obj) {
    const entries = Object.entries(obj);
    for (let i = entries.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    return Object.fromEntries(entries);
} // Credit: https://www.geeksforgeeks.org/how-to-randomly-rearrange-an-object-in-javascript

/**
 * Shuffles an array randomly with Fisher-Yates algorithm
 * @param {array} arr 
 * @returns {array}
 */
export function shuffleArray(arr) {
    const newArr = structuredClone(arr);
    for (let i = newArr.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
} // Credit: https://stackoverflow.com/a/12646864

export function arrayCompare(_arr1, _arr2) {
    if (
        !Array.isArray(_arr1)
        || !Array.isArray(_arr2)
        || _arr1.length !== _arr2.length
    ) {
        return false;
    }

    const arr1 = _arr1.concat().sort();
    const arr2 = _arr2.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
} // Credit: https://stackoverflow.com/a/43478439

/**
 * Add "correct" class and remove "incorrect" class or do opposite
 * @param {HTMLElement} el 
 * @param {boolean} correct 
 */
export function addCorrectClass(el, correct) {
    el.classList.toggle("correct", correct);
    el.classList.toggle("incorrect", !correct);
}

/**
 * Get object from JSON file in local filesystem
 * @param {string} path Path to file in local file
 * @returns {Promise<object>}
 */
export async function getJSONFile(path) {
    const fetchData = await fetch(path);
    return await fetchData.json();
}

/**
 * Create loading element that can start and stop
 */
export class LoadingElement {
    /**
     * Parent element where loading element should be in as first child
     * @type {HTMLElement}
     */
    el;

    /**
     * Whether the loading element is enabled
     */
    enabled = false;

    /**
     * 
     * @param {HTMLElement} el Element where the loading element should be inserted as the first child
     */
    constructor (el) {
        this.el = el;
    }

    enable() {
        if (this.enabled) return false;
        this.enabled = true;
        const container = document.createElement("div");
        container.className = "loadingContainer";

        const loadingCircle = document.createElement("div");
        loadingCircle.className = "loadingCircle";

        const loadingText = document.createElement("p");
        loadingText.className = "loadingText";
        loadingText.textContent = "Loading quiz questions...";

        container.append(loadingCircle, loadingText);

        if (this.el.firstElementChild) this.el.insertBefore(container, this.el.firstElementChild);
        else this.el.append(container);
        return true;
    }
    disable() {
        if (!this.enabled) return false;
        this.enabled = false;
        this.el.firstElementChild.remove();
        return true;
    }
}

export class ValidationError extends Error {
    constructor (message) {
        super(message);
    }
}

/**
 * Comprehensive validation for object to fit the "data" type requisites
 * @param {data|object} obj A proper or improper object
 * @returns {boolean}
*/
export function validateObject(obj) {
    if (typeof obj !== "object") throw new ValidationError("\"obj\" parameter is not an object.");
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const objLength = getLength(obj);
    let key = 1;
    for (; key <= objLength; key++) {
        const value = obj[key.toString()];
        const objLength = getLength(value);
        if (objLength !== 3) throw new ValidationError("Object length in numerically named property's value is not equal to 3.");
        if (!Object.hasOwn(value, "title")) throw new ValidationError("Missing \"title\" property in numerically named object property name.");
        if (!Object.hasOwn(value, "answers")) throw new ValidationError("Missing \"answers\" property in numerically named object property name.");
        if (!Object.hasOwn(value, "multiSelect")) throw new ValidationError("Missing \"multiSelect\" property in numerically named object property name.");
        if (typeof value.title !== "string") throw new ValidationError("\"title\" property in numerically named object is not a string.");
        if (typeof value.answers !== "object") throw new ValidationError("\"answers\" property in numerically named object is not an object.");
        if (typeof value.multiSelect !== "boolean") throw new ValidationError("\"multiSelect\" property in numerically named object is not a boolean.");
        // Checks for the length of value to be 3 with only the title, answers, and multiSelect property present with types boolean, object, and boolean respectively.
        const answersValue = value.answers;
        const answersLength = getLength(answersValue);
        for (let answersKey = 0; answersKey < answersLength; answersKey++) {
            const letter = alphabet[answersKey];
            if (!Object.hasOwn(answersValue, letter)) throw new ValidationError("Missing alphabet letter in alphabetically named object property name or the name is not lowercase.");
            if (typeof answersValue[letter] !== "object") throw new ValidationError("Type of alphabetically named property's value is not an object.");
            // Ensure alphabet letter exists and is an object
            const answerValue = answersValue[letter];
            const answerLength = getLength(answerValue);
            if (answerLength !== 2) throw ValidationError("Length of the answer object in alphabetically named object is not equal to 2.");
            if (!Object.hasOwn(answerValue, "answer")) throw new ValidationError("Missing \"answer\" property in alphabetically named object.");
            if (!Object.hasOwn(answerValue, "correct")) throw new ValidationError("Missing \"correct\" property in alphabetically named object.");
            if (typeof answerValue.answer !== "string") throw new ValidationError("\"answer\" property in alphabetically named object is not a string.");
            if (typeof answerValue.correct !== "boolean") throw new ValidationError("\"correct\" property in alphabetically named object is not a boolean.");
            // Checks for the length of value to be 2 with only the answer and correct property present with types string and boolean respectively.
        }
    }
    if (objLength !== key - 1) throw new ValidationError("Length of keys in top level object is not equal to the properties with numerical names.") // Subtract one from key as the variable is incremented in the end even after there are no more valid or existent properties.
    return true;
}

/**
 * Make background of dialog element hide when clicked
 * @param {HTMLDialogElement} dialog Dialog element to add background event listener to
 */
export function makeDialogBackgroundClickable(dialog) {
    dialog.addEventListener(("mousedown"), (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.close();
        }
    }) // Credit: https://stackoverflow.com/a/72916231
}

/**
 * Alert the user like the alert() function but with a dialog element
 * @param {string?} message Message in alert
 * @param {string?} buttonText Button text in alert
 */
export function alertDialog(message = "", buttonText = "OK") {
    const dialog = document.createElement("dialog");
    dialog.className = "dialog";
    makeDialogBackgroundClickable(dialog);

    const dialogForm = document.createElement("form");
    dialogForm.className = "dialogForm";
    dialogForm.method = "dialog";

    const p = document.createElement("p");
    p.innerHTML = message;

    const button = document.createElement("button");
    button.textContent = buttonText;
    button.autofocus = true;

    dialogForm.append(p, button);

    dialog.append(dialogForm);

    document.body.append(dialog);
    dialog.showModal();
}

/**
 * Return text from file
 * @param {HTMLInputElement} fileEl Input element with type of file
 * @returns {Promise<string>} File content
 */
export async function fileHandler(fileEl) {
    return new Promise(async (resolve, reject) => {
        const files = fileEl.files;

        if (files.length === 0) reject("No file selected");
        if (files.length > 1) reject("Multiple files selected");

        const utf8Decoder = new TextDecoder("utf-8");
        /**
         * @type {File}
         */
        const file = files[0];
        const stream = file.stream();
        let receivedChars = 0;
        const reader = stream.getReader();
        let totalData = "";
        let { done: finished, value: data } = await reader.read();
        let newData;
        while (true) {
            if (finished) {
                return resolve(totalData);
            }
            receivedChars += data.length;
            totalData += utf8Decoder.decode(data);
            newData = await reader.read();
            finished = newData.done;
            data = newData.value;
        }
    })
}