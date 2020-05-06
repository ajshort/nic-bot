const { CardFactory } = require('botbuilder');
const { channels } = require('./channels');
const { ConnectorClient, MicrosoftAppCredentials } = require('botframework-connector');
const striptags = require('striptags');

async function handleVrVehicleMessage(req, res, connector) {
  const { conversation, text, from } = req.body;

  const card = CardFactory.adaptiveCard({
    "type": "AdaptiveCard",
    "version": "1.0",
    "body": [
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "width": "auto",
            "items": [
              {
                "type": "Image",
                "altText": "",
                "width": "32px",
                "url": "https://nic-bot.now.sh/images/vehicle.png",
                "height": "32px"
              }
            ]
          },
          {
            "type": "Column",
            "width": "stretch",
            "items": [
              {
                "type": "TextBlock",
                "text": "VR Vehicle Movement",
                "weight": "Bolder",
                "size": "Medium"
              }
            ],
            "verticalContentAlignment": "Center"
          }
        ]
      },
      {
        "type": "TextBlock",
        "text": `${from.name}: ${striptags(text)}`,
        "stretch": true
      }
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
  });

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

  // Ignore direct messages.
  if (req.body.conversation.conversationType !== 'channel') {
    res.status(200).end();
    return;
  }

  MicrosoftAppCredentials.trustServiceUrl(process.env.BOT_SERVICE_URL);

  const credentials = new MicrosoftAppCredentials(process.env.BOT_APP_ID, process.env.BOT_APP_PASSWORD);
  const connector = new ConnectorClient(credentials, { baseUri: process.env.BOT_SERVICE_URL });

  // We assume that any messages tagging is in the WOL vehicle movements channels are a VR
  // vehicle movement, so re-post it to the VR Operators channel.
  const { channel } = req.body.channelData;

  if (channel.id === channels.WOL.VEHICLE_MOVEMENTS) {
    await handleVrVehicleMessage(req, res, connector);
  }

  res.status(200).end();
};
