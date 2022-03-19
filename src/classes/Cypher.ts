import Cryptr from 'cryptr';
import Client from './Client';

const { SECRET } = process.env;

export default class Cypher {
    client: Client;
    crypt: Cryptr;

    constructor(client: Client) {
        this.client = client;

        this.crypt = new Cryptr(SECRET ? SECRET : '');
    }

    encrypt(str: string): string {
        return this.crypt.encrypt(str);
    }

    decrypt(str: string): string {
        return this.crypt.decrypt(str);
    }
}