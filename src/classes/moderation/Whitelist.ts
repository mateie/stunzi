import Client from '@classes/Client';
import { ButtonInteraction, CommandInteraction, Guild } from 'discord.js';

export default class Whitelist {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async add(
        interaction: CommandInteraction | ButtonInteraction,
        word: string,
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);
        
        dbGuild.words.push(word);

        await dbGuild.save();

        return interaction.reply({ content: `Added word **${word}** to the whitelist`, ephemeral: true });
    }

    async check(
        word: string,
        guild: Guild
    ) {
        const dbGuild = await this.client.database.get.guild(guild);

        if (dbGuild.words.includes(word)) return true;
        return false;
    }
}