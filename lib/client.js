var debug = require('debug');
var log = debug('line-messaging-api:log');
var error = debug('line-messaging-api:error');

var rp = require('request-promise');

module.exports.init = function(conf) {
  var client = {};
  var ACCESS_TOKEN = conf.channelAccessToken;

  client.replyText = function(replyToken, text) {
    var body = {
      "replyToken": replyToken,
      "messages":[textMessageBuilder(text)]
    };
    return this.callReplyAPI(body);
  };

  client.replyImage = function(replyToken, oriUrl, previewUrl) {
    var body = {
      "replyToken": replyToken,
      "messages": [imageMessageBuilder(oriUrl, previewUrl)]
    };
    return this.callReplyAPI(body);
  };

  client.replyVideo = function(replyToken, oriUrl, previewUrl) {
    var body = {
      "replyToken": replyToken,
      "messages": [videoMessageBuilder(oriUrl, previewUrl)]
    };
    return this.callReplyAPI(body);
  };

  client.replyAudio = function(replyToken, oriUrl, durationInMilliSec) {
    var body = {
      "replyToken": replyToken,
      "messages": [audioMessageBuilder(oriUrl, durationInMilliSec)]
    };
    return this.callReplyAPI(body);
  };

  client.replyLocation = function(replyToken, title, address, latitude, longitude) {
    var body = {
      "replyToken": replyToken,
      "messages": [locationMessageBuilder(title, address, latitude, longitude)]
    };
    return this.callReplyAPI(body);
  };

  client.replySticker = function(replyToken, packageId, stickerId) {
    var body = {
      "replyToken": replyToken,
      "messages": [
        {
          "type": "sticker",
          "packageId": packageId,
          "stickerId": stickerId
        }
      ]
    };
    return this.callReplyAPI(body);
  };

  /*
   * {
   *   "type": "imagemap",
   *   "baseUrl": "https://example.com/bot/images/rm001",
   *   "altText": "this is an imagemap",
   *   "baseSize": {
   *       "height": 1040,
   *       "width": 1040
   *   },
   *   "actions": [
   *       {
   *           "type": "uri",
   *           "linkUri": "https://example.com/",
   *           "area": {
   *               "x": 0,
   *               "y": 0,
   *               "width": 520,
   *               "height": 1040
   *           }
   *       },
   *       {
   *           "type": "message",
   *           "text": "hello",
   *           "area": {
   *               "x": 520,
   *               "y": 0,
   *               "width": 520,
   *               "height": 1040
   *           }
   *       }
   *   ]
   * }
   */
  client.replyImagemap = function(replyToken, baseUrl, altText, baseHeight, actions) {
    var body = {
      "replyToken": replyToken,
      "messages": [imagemapMessageBuilder(baseUrl, altText, baseHeight, actions)]
    };
    return this.callReplyAPI(body);
  };

  /*
   * thumbnailImageUrl : String => Image URL(HTTPS), JPEG or PNG, Aspect ratio: 1:1.51, Max width: 1024px, Max: 1 MB
   * title             : String => max 40 chacacters
   * text              : String => max 160 characters with no image/title, max 60 characters with image or title
   * actions           : Array  => max 4 template actions
   */
  client.replyTemplateButton = function(replyToken, altText, thumbnailImageUrl, title, text, actions) {
    var body = {
      "replyToken": replyToken,
      "messages": [templateButtonMessageBuilder(altText, thumbnailImageUrl, title, text, actions)]
    };
    return this.callReplyAPI(body);
  };

  /*
   * text    : String => max 240 characters
   * actions : Array  => max 2 template actions
   */
  client.replyTemplateConfirm = function(replyToken, altText, text, actions) {
    var body = {
      "replyToken": replyToken,
      "messages": [templateConfirmMessageBuilder(altText, text, actions)]
    };
    return this.callReplyAPI(body);
  };

  /*
   * columns : Array  => max 5 columns
   */
  client.replyTemplateCarousel = function(replyToken, altText, columns) {
    var body = {
      "replyToken": replyToken,
      "messages": [templateCarouselMessageBuilder(altText, columns)]
    };
    return this.callReplyAPI(body);
  };

  /// push message
  client.pushText = function(to, text) {
    var body = {
      "to": to,
      "messages":[textMessageBuilder(text)]
    };
    return this.callPushAPI(body);
  };

  client.pushImage = function(to, oriUrl, previewUrl) {
    var body = {
      "to": to,
      "messages": imageMessageBuilder(oriUrl, previewUrl)
    };
    return this.callPushAPI(body);
  };

  /// messaging API
  client.callReplyAPI = function(body) {
    return this.callMessagingAPI('https://api.line.me/v2/bot/message/reply', body);
  };

  client.callPushAPI = function(body) {
    return this.callMessagingAPI('https://api.line.me/v2/bot/message/push', body);
  };

  client.callMessagingAPI = function(uri, body) {
    var options = {
      method: 'POST',
      uri: uri,
      headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN
      },
      body: body,
      json: true // Automatically stringifies the body to JSON
    };

    return rp(options).then(function(res) {
      log(res);
    }).catch(function(err) {
      error(err);
    });
  };

  /// message builder
  function textMessageBuilder(text) {
    var message = {
      "type": "text",
      "text": text
    };
    return message;
  }

  function imageMessageBuilder(oriUrl, previewUrl) {
    var message = {
      "type": "image",
      "originalContentUrl": oriUrl,
      "previewImageUrl": previewUrl
    };
    return message;
  }

  function videoMessageBuilder(oriUrl, previewUrl) {
    var message = {
      "type": "video",
      "originalContentUrl": oriUrl,
      "previewImageUrl": previewUrl
    };
    return message;
  }

  function audioMessageBuilder(oriUrl, durationInMilliSec) {
    var message = {
      "type": "audio",
      "originalContentUrl": oriUrl,
      "duration": durationInMilliSec
    };
    return message;
  }

  function locationMessageBuilder(title, address, latitude, longitude) {
    var message = {
      "type": "location",
      "title": title,
      "address": address,
      "latitude": latitude,
      "longitude": longitude
    };
    return message;
  }

  function stickerMessageBuilder(packageId, stickerId) {
    var message = {
      "type": "sticker",
      "package": packageId,
      "sticker": stickerId
    };
    return message;
  }

  function imagemapMessageBuilder(baseUrl, altText, baseHeight, actions) {
    var message = {
      "type": "imagemap",
      "baseUrl": baseUrl,
      "altText": altText,
      "baseSize": {
        "height": baseHeight,
        "width": 1040
      },
      "actions": actions
    };
    return message;
  }

  function templateButtonMessageBuilder(altText, thumbnailImageUrl, title, text, actions) {
    var message = {
      "type": "template",
      "altText": altText,
      "template": {
        "type": "buttons",
        "thumbnailImageUrl": thumbnailImageUrl,
        "title": title,
        "text": text,
        "actions": actions
      }
    };
    return message;
  }

  function templateConfirmMessageBuilder(altText, text, actions) {
    var message = {
      "type": "template",
      "altText": altText,
      "template": {
        "type": "confirm",
        "text": text,
        "actions": actions
      }
    };
    return message;
  }

  function templateCarouselMessageBuilder(altText, columns) {
    var message = {
      "type": "template",
      "altText": altText,
      "template": {
          "type": "carousel",
          "columns": columns
      }
    };
    return message;
  }

  /// action builder
  client.imagemapAreaBuilder = function(x, y, width, height) {
    var area = {
      "x": x,
      "y": y,
      "width": width,
      "height": height
    };
    return area;
  };

  client.imagemapActionUriBuilder = function(uri, area) {
    var action = {
      "type": "uri",
      "linkUri": uri,
      "area": area
    };
    return action;
  };

  client.imagemapActionMessageBuilder = function(text, area) {
    var action = {
      "type": "message",
      "text": text,
      "area": area
    };
    return action;
  };

  client.templateActionPostbackBuilder = function(label, data) {
    var action = {
      "type": "postback",
      "label": label,
      "data": data
    };
    return action;
  };

  client.templateActionMessageBuilder = function(label, text) {
    var action = {
      "type": "message",
      "label": label,
      "text": text
    };
    return action;
  };

  client.templateActionUriBuilder = function(label, uri) {
    var action = {
      "type": "uri",
      "label": label,
      "uri": uri
    };
    return action;
  };

  client.templateCarouselColumnBuilder = function(thumbnailImageUrl, title, text, actions) {
    var column = {
      "thumbnailImageUrl": thumbnailImageUrl,
      "title": title,
      "text": text,
      "actions": actions
    };
    return column;
  };


  return client;
};
