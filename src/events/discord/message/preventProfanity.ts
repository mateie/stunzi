import Client from '@classes/Client';
import Event from '@classes/Event';
import IEvent from '@interfaces/IEvent';

import axios, { AxiosRequestConfig } from 'axios';
import { Guild, Message } from 'discord.js';

const { RAPID_API } = process.env;

export default class PreventProfanityEvent extends Event implements IEvent {
    name: string;
    once: undefined;

    constructor(client: Client) {
        super(client);

        this.name = 'messageCreate';
    }

    async run(message: Message) {
        if (message.author.bot) return;

        const word = message.content;

        const isWhitelisted = await this.client.whitelist.check(word, <Guild>message.guild);
        if (isWhitelisted) return;

        const opts: AxiosRequestConfig = {
            method: 'GET',
            url: 'https://community-purgomalum.p.rapidapi.com/containsprofanity',
            params: {text: word},
            headers: {
                'X-RapidAPI-Host': 'community-purgomalum.p.rapidapi.com',
                'X-RapidAPI-Key': <string>RAPID_API
            }
        };

        try {
            const { data: toxic } = await axios.request(opts);
            if (!toxic) return;
            message.delete();
            await message.channel.send({ content: 'Ayo chill, stop being toxic ma man' }).then(msg => setTimeout(() => msg.delete(), 3000));
        } catch (err) {
            console.error(err);
        }
    }
}