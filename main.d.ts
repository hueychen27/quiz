type content = {
    /**
     * Question description
     */
    title: string;
    /**
     * Answers in pattern a, b, c, and so on.
     */
    answers: Record<string, {
        /**
         * Answer description
         */
        answer: string;
        /**
         * The answer is correct?
         */
        correct: boolean;
    }>;
    /**
     * Multiselectable answers? (Choose as many answers as needed through checkboxes?)
     */
    multiSelect: boolean;
}

type data = Record<string, content>;

type mapData = Map<string, content>;

type entries = data[];

type options = {
    /**
     * Shuffle questions in quiz?
     */
    shuffleQuestions: boolean;
    /**
     * Shuffle answers in quiz?
     */
    shuffleAnswers: boolean;
}