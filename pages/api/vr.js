const { CardFactory } = require('botbuilder');
const { ConnectorClient, MicrosoftAppCredentials } = require('botframework-connector');
const { createHmac } = require('crypto');

const VR_OPERATORS_CHANNEL_ID = '19:66597a4b8431452fac97dd00a83bd2be@thread.skype';
const VEHICLE_MOVEMENTS_CHANNEL_ID = '19:66597a4b8431452fac97dd00a83bd2be@thread.skype';

export default async (req, res) => {
  // Make sure we have a POST reqest.
  if (req.method.toUpperCase() !== 'POST') {
    res.status(400).end();
    return;
  }

  // TODO authenticate message

  const activity = req.body;

  // Make sure it's coming from the vehicle movements channel.
  if (activity.channelData.teamsChannelId != VEHICLE_MOVEMENTS_CHANNEL_ID) {
    res.status(200).end();
    return;
  }

  // Make a new post in the VR operators channel.
  MicrosoftAppCredentials.trustServiceUrl(process.env.BOT_SERVICE_URL);

  const credentials = new MicrosoftAppCredentials(process.env.BOT_APP_ID, process.env.BOT_APP_PASSWORD);
  const connector = new ConnectorClient(credentials, { baseUri: process.env.BOT_SERVICE_URL });

  const card = CardFactory.adaptiveCard({
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.0',
    body: [
      {
        type: 'TextBlock',
        text: activity.text.replace('<at>VR</at>', ''),
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'From', value: activity.from.name },
        ],
      },
    ],
  });

  await connector.conversations.createConversation({
    isGroup: true,
    channelData: { channel: { id: VR_OPERATORS_CHANNEL_ID } },
    activity: { type: 'message', attachments: [card] },
  });

  res.status(200).json({
    type: 'message',
    text: 'Thanks, I\'ll post this to the VR Operators channel.',
  });
}
