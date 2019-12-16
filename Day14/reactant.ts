import { Ingredient } from "./ingredient";

export interface Reactant {
    readonly ingredient: Ingredient;
    readonly count: number;
}
