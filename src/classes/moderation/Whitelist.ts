import Client from '@classes/Client';
import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, Guild } from 'discord.js';
import axios, { AxiosRequestConfig } from 'axios';

const { RAPID_API } = process.env;

export default class Whitelist {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async add(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        word: string,
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);

        dbGuild.words.push(word);

        await dbGuild.save();

        return interaction.reply({ content: `Added **${word}** to the Word Whitelist`, ephemeral: true });
    }

    async addMultiple(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        words: string[],
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);

        words.forEach(word => dbGuild.words.push(word));

        await dbGuild.save();

        return interaction.reply({ content: `Added **${this.client.util.list(words)}** to the Word whitelist`, ephemeral: true });
    }

    async check(
        word: string,
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);

        if (dbGuild.words.includes(word)) return true;
        return false;
    }

    async checkMultiple(
        words: string[],
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);

        const already: string[] = [];

        words.forEach(word => {
            if (dbGuild.words.some(dbWord => word === dbWord)) already.push(word);
        });

        return already;
    }

    async isToxic(
        word: string | string[],
    ) {
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
            if (!toxic) return false;
            return true;
        } catch (err) {
            console.error(err);
        }
    }

    async remove(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        word: string,
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);

        dbGuild.words = dbGuild.words.filter(dbWord => dbWord !== word);

        await dbGuild.save();

        return interaction.reply({ content: `Removed **${word}** from the Word Whitelist`, ephemeral: true });
    }

    async removeMultiple(
        interaction: CommandInteraction | ButtonInteraction | ContextMenuInteraction,
        words: string[],
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);

        words.forEach(word => {
            dbGuild.words = dbGuild.words.filter(dbWord => dbWord !== word);
        });

        await dbGuild.save();

        return interaction.reply({ content: `Removed **${this.client.util.list(words)}** from the Word Whitelist`, ephemeral: true });
    }
}