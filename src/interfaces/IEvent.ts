import Client from "@classes/Client";

export default interface IEvent {
    readonly client: Client,
    name: string,
    once: boolean | undefined
    run: (...args: any) => any | Promise<any>;
}