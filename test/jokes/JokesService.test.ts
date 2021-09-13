import JokesService from "../../src/jokes/JokesService";
import jokes from "../../src/jokes/jokes";

describe("JokesService", () => {
    test("get a joke", () => {
        const joke = JokesService.getJoke();

        expect(jokes.map(x => `${x.setup}\n${x.punchline}`)).toContain(joke);
    });

    test("length of jokes array", () => {
        expect(jokes.length).toBe(378);
    });
});
