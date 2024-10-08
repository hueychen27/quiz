type content = {
    title: string;
    answers: Record<string, {
        answer: string;
        correct: boolean;
    }>;
    multiSelect: boolean;
}

type data = Record<string, content>;

type mapData = Map<string, content>;

type entries = data[];