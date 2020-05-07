const { createVehicleMovementCard } = require('./cards');
const { channels } = require('./config');
const { CardFactory } = require('botbuilder');
const { ConnectorClient, MicrosoftAppCredentials } = require('botframework-connector');

async function handleVrVehicleMessage(req, res, connector) {
  const { conversation, text, from } = req.body;
  const card = CardFactory.adaptiveCard(createVehicleMovementCard(from.name, text));

  await connector.conversations.createConversation({
    isGroup: true,
    channelData: { channel: { id: channels.NIC.VR_OPERATORS } },
    activity: { type: 'message', attachments: [card] },
  });

  await connector.conversations.sendToConversation(conversation.id, {
    type: 'message',
    text: 'Thanks, I\'ll post this to the VR Operators channel.',
  });
}

export default async (req, res) => {
  if (req.method.toUpperCase() !== 'POST') {
    res.status(400).end();
    return;
  }

  // TODO verify the authorisation.

  const { channelData, conversation, recipient } = req.body;

  // Ignore direct messages.
  if (conversation.conversationType !== 'channel') {
    res.status(200).end();
    return;
  }

  MicrosoftAppCredentials.trustServiceUrl(process.env.BOT_SERVICE_URL);

  const credentials = new MicrosoftAppCredentials(process.env.BOT_APP_ID, process.env.BOT_APP_PASSWORD);
  const connector = new ConnectorClient(credentials, { baseUri: process.env.BOT_SERVICE_URL });

  // We assume that any messages tagging is in the WOL vehicle movements channels are a VR
  // vehicle movement, so re-post it to the VR Operators channel.
  if (recipient.name === 'VR' && channelData.teamsChannelId === channels.WOL.VEHICLE_MOVEMENTS) {
    await handleVrVehicleMessage(req, res, connector);
  }

  res.status(200).end();
};
