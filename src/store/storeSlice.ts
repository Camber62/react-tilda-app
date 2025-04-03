import {createSlice} from "@reduxjs/toolkit";

// Типы данных
type Question = {
    id: string;
    name: string;
    percentage: number;
};

type Indicator = {
    id: string;
    name: string;
    percentage: number;
    questions: Question[];
};

type Competency = {
    id: string;
    name: string;
    percentage: number;
    indicators: Indicator[];
};

// Начальное состояние с данными
const initialState: Competency[] = [
    {
        id: "1",
        name: "Коммуникация",
        percentage: 70,
        indicators: [
            {
                id: "1-1",
                name: "Умение слушать",
                percentage: 80,
                questions: [
                    {id: "1-1-1", name: "Слушаете ли вы других?", percentage: 90},
                    {id: "1-1-2", name: "Перефразируете ли вы услышанное?", percentage: 70},
                ],
            },
            {
                id: "1-2",
                name: "Умение убеждать",
                percentage: 60,
                questions: [
                    {id: "1-2-1", name: "Можете ли вы аргументировать свою позицию?", percentage: 60},
                ],
            },
        ],
    },
];

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        // Добавляем пустой редьюсер, чтобы избежать предупреждения
        noop: (state) => state
    }
});

export const {noop} = appSlice.actions;

export default appSlice.reducer;