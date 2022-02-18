const { createVehicleMovementCard } = require('./cards');
const { channels } = require('./config');
const { CardFactory } = require('botbuilder');
const { ConnectorClient, MicrosoftAppCredentials } = require('botframework-connector');

async function handleVrVehicleMessage(req, connector, channelId, channelName) {
  const { conversation, text, from } = req.body;
  const card = CardFactory.adaptiveCard(createVehicleMovementCard(from.name, text));

  await connector.conversations.createConversation({
    isGroup: true,
    channelData: { channel: { id: channelId } },
    activity: {
      type: 'message',
      summary: text,
      attachments: [card],
    },
  });

  await connector.conversations.sendToConversation(conversation.id, {
    type: 'message',
    text: `Thanks, I'll post this to the ${channelName} channel.`,
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
  // vehicle movement, so re-post it to the VR Operators channel. We do the same vice-versa
  // for posts to the VR operators channel.
  if (channelData.teamsChannelId === channels.WOL.VEHICLE_MOVEMENTS) {
    await handleVrVehicleMessage(req, connector, channels.NIC.VR_OPERATORS, 'VR Operators');
  } else if (channelData.teamsChannelId === channels.NIC.VR_OPERATORS) {
    await handleVrVehicleMessage(req, connector, channels.WOL.VEHICLE_MOVEMENTS, 'WOL Vehicle Movements');
  } else if (channelData.teamsChannelId === channels.NIC.TESTBED) {
    await handleVrVehicleMessage(req, connector, channels.NIC.TESTBED, 'Technology Testbed');
  }

  res.status(200).end();
};
