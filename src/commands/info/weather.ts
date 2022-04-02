import { CommandInteraction } from 'discord.js';
import Client from '@classes/Client';
import Command from '@classes/Command';
import ICommand from '@interfaces/ICommand';

import Weather from 'weather-js';

export default class WeatherCommand extends Command implements ICommand {
    constructor(client: Client) {
        super(client);

        this.data
            .setName('weather')
            .setDescription('Check Weather Forecast')
            .addStringOption(option =>
                option
                    .setName('location')
                    .setDescription('Location to check the forecast for')
                    .setRequired(true)
            );
    }

    async run(interaction: CommandInteraction) {
        const location = interaction.options.getString('location');

        try {
            Weather.find({ search: location, degreeType: 'F' }, (err: any, result: any) => {
                if (err) return interaction.reply({ content: 'Could not fetch weather', ephemeral: true });

                const place = result[0];

                const embed = this.client.util.embed()
                    .setTitle(`${place.location.name}`)
                    .setThumbnail(place.current.imageUrl)
                    .addField("Temperature: ", place.current.temperature + "°F", true)
                    .addField("Wind Speed: ", place.current.winddisplay, true)
                    .addField("Humidity: ", `${place.current.humidity}%`, true)
                    .addField("Timezone: ", `UTC${place.location.timezone}`, true);

                interaction.reply({ embeds: [embed] });
            });
        } catch {
            interaction.reply({ content: 'Could not fetch weather', ephemeral: true });
        }
    }
}