const { Plugin } = require('powercord/entities');
const { channels, getModule } = require("powercord/webpack");

module.exports = class SendEmbeds extends Plugin {
  async startPlugin () {
    let MessageQueue = await getModule(m => m.enqueue, false);
    let MessageParser = await getModule(['createBotMessage'], false);
    powercord.api.commands.registerCommand({
      command: 'jsonembed',
      description: 'Send JSON embed',
      usage: '{c} [json data]',
      executor: (args) => {
        let discordEmbed = null

        // parse and clean json input
        try {
          discordEmbed = JSON.parse(args[0])
          if (discordEmbed.color !== undefined
              && discordEmbed.color.match !== undefined
              && discordEmbed.color.match(/^#?[0-9A-Z]{6}/gi) !== undefined) {
              discordEmbed.color = discordEmbed.color.replace(/#/g, "");
              discordEmbed.color = parseInt(discordEmbed.color, 16);
          }
        } catch (e) {
          return { send: false, result: `Failed to parse your input: ${e}` }
        }

        // send message
        try {
          let channelID = channels.getChannelId();
          let msg = MessageParser.createBotMessage(channelID, '');

          MessageQueue.enqueue({
            type: 0,
            message: {
              channelId: channelID,
              content: '',
              tts: false,
              nonce: msg.id,
              embed: discordEmbed
            }
          }, r => {
            if (r.ok !== true) {
              powercord.api.notices.sendToast('jsonembed', {
                header: `Failed to send the message: ${r.body.message}`
              })
            }
          })
        } catch (e) {
          return { send: false, result: `Failed to send the message: ${e}` }
        }

        return {send: false, result: null}
      }
    });
  }

  pluginWillUnload () {
    powercord.api.commands.unregisterCommand('jsonembed');
  }
};