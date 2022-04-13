/* eslint-disable semi */
import Client from '@classes/Client';

export default interface IEvent {
    readonly client: Client;
    name: string;
    once: boolean | null;
    process: boolean | null;
    run: (...args: any) => any | Promise<any>;
}