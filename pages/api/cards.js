const striptags = require('striptags');

export const createVehicleMovementCard = (name, text) => ({
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
      "text": `${name}: ${striptags(text)}`,
      "stretch": true
    }
  ],
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json"
});
