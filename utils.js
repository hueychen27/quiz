export function mapReplacer(key, value) { // To use in JSON.stringify in second argument when stringifying Maps
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
    return Object.keys(obj).length;
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
    try {
        let { default: data } = await import(path, { with: { type: "json" } });
        // Dynamic JSON imports are not supported everywhere like Firefox...
        return data;
    } catch {
        const fetchData = await fetch(path); // Resort to fetch
        return await fetchData.json();
    }
}

/**
 * Create loading element that can start and stop
 */
export class LoadingElement {
    /**
     * @type {HTMLElement} Parent element where loading element should be in as first child
     */
    el;

    /**
     * 
     * @param {HTMLElement} el Element where the loading element should be inserted as the first child
     */
    constructor (el) {
        this.el = el;
    }

    add() {
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
    }
    remove() {
        this.el.firstElementChild.remove();
    }
}