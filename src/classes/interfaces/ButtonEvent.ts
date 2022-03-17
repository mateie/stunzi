import { ButtonInteraction } from "discord.js";
import Client from "../Client";

export default interface ButtonEvent {
    client: Client
    run: (interaction: ButtonInteraction) => void | Promise<void>
};