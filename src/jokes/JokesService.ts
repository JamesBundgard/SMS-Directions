import jokes from './jokes';

export default class JokesService {
    public static getJoke(): string {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        return `${joke.setup}\n${joke.punchline}`;
    }
}
