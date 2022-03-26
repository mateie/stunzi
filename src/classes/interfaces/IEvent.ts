import Client from "../Client";

export default interface IEvent {
    client: Client,
    name: string,
    once: boolean | undefined
    run: (...args: any) => void | Promise<void>;
}