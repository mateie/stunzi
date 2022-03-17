import Client from "../Client";

export default interface Event {
    client: Client,
    name: string,
    run: (...args: any) => void | Promise<void>;
}