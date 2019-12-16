import { Reactant } from "./reactant";

export class Ingredient {
    private reactants: Reactant[] = [];
    private _leftoverIngredients = 0;
    private _totalRequested = 0;
    private _enforceScarcity = false;

    get totalRequested() {
        return this._totalRequested;
    }

    get leftoverIngredients() {
        return this._leftoverIngredients;
    }

    constructor(readonly name: string, private readonly amountProducedPerReaction: number) { }

    addReactant(reactant: Reactant) {
        this.reactants.push(reactant);
    }

    requestIngredient(requestAmount: number) {
        this._totalRequested += requestAmount;

        const reactionsNeeded = Math.ceil((requestAmount - this._leftoverIngredients) / this.amountProducedPerReaction),
            numberProduced = reactionsNeeded * this.amountProducedPerReaction;

        if (this._enforceScarcity && reactionsNeeded > 0) {
            throw new Error(`Unable to produce any more ${this.name} (${requestAmount} needed, but only ${this._leftoverIngredients} available)`);
        }
        this.reactants.forEach(reactant => reactant.ingredient.requestIngredient(reactant.count * reactionsNeeded));

        this._leftoverIngredients = this._leftoverIngredients + numberProduced - requestAmount;
    }

    addStockpile(amount: number) {
        this._leftoverIngredients += amount;
    }

    enforceScarcity(flag: boolean) {
        this._enforceScarcity = true;
    }
}
