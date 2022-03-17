import { CommandInteraction } from "discord.js";
import Client from "../Client";

export default interface CommandEvent {
    client: Client
    run: (interaction: CommandInteraction) => void | Promise<void>
};