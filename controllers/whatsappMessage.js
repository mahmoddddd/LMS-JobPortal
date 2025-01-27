var https = require("follow-redirects").https;
var fs = require("fs");
const sendWhatsAppMessage = async (user, email) => {
  const token = await user.createPasswordResetToken(); //
  const resetLink = `http://localhost:4000/api/user/reset-password/${token}`;

  var options = {
    method: "POST",
    hostname: process.env.INFOBIP_BASE_URL, // from infoBip Website
    path: "/whatsapp/1/message/template",
    headers: {
      Authorization: process.env.INFOBIP_API_KEY, // from infoBip Website
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    maxRedirects: 20,
  };

  var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log("Response Status Code:", res.statusCode); //  log the response status code
      console.log("Response Body:", body.toString()); // log the response body
      if (res.statusCode !== 200) {
        console.error(
          "Failed to send WhatsApp message. Response:",
          body.toString()
        );
      } else {
        console.log("WhatsApp message sent successfully.");
      }
    });

    res.on("error", function (error) {
      console.error("Error in request:", error);
    });
  });

  // message data information
  var postData = JSON.stringify({
    messages: [
      {
        from: "447860099299", // sender number
        to: process.env.WHATSAPP_To_NUMBER, // reciever number > sure that it is a number with country code
        messageId: "da96630a-539e-43cb-aaf4-a44fc61b2f58", // message id
        content: {
          templateName: "test_whatsapp_template_en", // name of the template in infobip
          templateData: {
            body: {
              placeholders: ["محمود"],
            },
          },
          language: "en",
        },
      },
    ],
  });

  req.write(postData);

  req.end();
};

module.exports = { sendWhatsAppMessage };
