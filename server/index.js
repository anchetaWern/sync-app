const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

const Pusher = require('pusher');

const Chatkit = require("@pusher/chatkit-server");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const chatkit = new Chatkit.default({
  instanceLocator: process.env.CHATKIT_INSTANCE_LOCATOR_ID,
  key: process.env.CHATKIT_SECRET_KEY
});

app.get("/", (req, res) => {
  res.send("all green!");
});

app.post('/pusher/auth', function(req, res) {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});


app.post('/chatkit/login', async (req, res) => {
  const { username, roomID } = req.body;
  try {
    const users = await chatkit.getUsers();
    let user = users.find((usr) => usr.name == username);
    if (!user) {
      user = await chatkit.createUser({
        id: username,
        name: username,
      });
    }

    const rooms = await chatkit.getRooms({});
    let room = rooms.find((r) => r.id == roomID);
    if (!room) {
      room = await chatkit.createRoom({
        id: roomID,
        creatorId: username,
        name: `${username}_room`
      });
    }

    const user_rooms = await chatkit.getUserRooms({
      userId: username,
    });

    const user_room = user_rooms.find((r) => r.id == roomID);
    if (!user_room) {
      const res = await chatkit.addUsersToRoom({
        roomId: roomID,
        userIds: [username]
      });
    }

    res.send({ user });
  } catch (get_user_err) {
    console.log("error getting user: ", get_user_err);
  }
});



const PORT = 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Running on ports ${PORT}`);
  }
});