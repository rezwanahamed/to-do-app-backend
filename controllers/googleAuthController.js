require("dotenv").config();
const { google } = require("googleapis");


// Set up Google OAuth2 client with credentials from environment variables
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URL
);

// Route to initiate Google OAuth2 flow

exports.googleAuth = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
  });
  res.redirect(url);
};

// Route to handle the OAuth2 callback
exports.googleAuthRedirect = (req, res) => {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error("Couldn't get token", err);
      res.send("Error");
      return;
    }
    oauth2Client.setCredentials(tokens);


    res.send("Successfully logged in");
  });
};
