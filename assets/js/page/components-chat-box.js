"use strict";

// Global WebSocket
let ws = null;

function chooseRoom(room) {
  cleanRoom(room);
  checkWSStateForClose();

  let username = prompt("Please enter your name", "");
  username = username ?? '';
  const room_info = new URLSearchParams({ username, room }).toString();

  let ws_protocol = "wss://";
  if (window.location.protocol == "http:") {
    ws_protocol = "ws://";
  }

  ws = new WebSocket(
    `${ws_protocol}${window.location.host}/ws?${room_info}`
  );

  addWSListener(username);
}

function cleanRoom(room) {
  var roomName = room.split(':');
  // room -> Room
  roomName[0] = `${roomName[0][0].toUpperCase()}${roomName[0].slice(1)}`;
  roomName = roomName.join(" ");
  log(`Clean Room ${roomName}`);
  $("#chat-room-name").text(roomName);
  $("#chat-content").empty();
}

function checkWSStateForClose() {
  // Check State and close if still have some lingering connection
  if (ws != null && ws.readyState == 1) {
    ws.close();
  }
}

function addWSListener(username) {
  // Listen for the connection open event then call the sendMessage function
  ws.onopen = function (e) {
    log(e);
    log("Connected");
  };

  // Listen for the close connection event
  ws.onclose = function (e) {
    log(e);
    log("Disconnected " + e.reason);
  };

  // Listen for connection errors
  ws.onerror = function (e) {
    log("Error " + e.reason);
  };

  ws.onmessage = function(e) {
    log(e);
    let data = JSON.parse(e.data);

    $.chatCtrl("#mychatbox", {
      text: data.msg,
      name: data.uname,
      type: data.type,
      picture:
        data.uname !== username
          ? "https://ui-avatars.com/api/?name=" + data.uname
          : "../assets/img/avatar/avatar-1.png",
      position: data.uname !== username ? "chat-left" : "chat-right",
    });

  }
}

function log(msg) {
  console.log(msg);
}

function urlToRoomMapping(url) {
  const url_length = url.length - 1;
  // Custom Splice
  // e.g. #room1 -> room:1
  return `${url.slice(1, url_length)}:${url.slice(url_length)}`;
}

$(document).ready(function () {
  alert("Please Choose a Room!");
});

$("#chat-form").submit(function() {
  var me = $(this);

  if(ws != null && me.find('input').val().trim().length > 0) {
    if (ws.readyState == 3) {
      log("Reconnect");
      chooseRoom(urlToRoomMapping($(location).attr("hash")));
    }
    if (ws.readyState == 1) {
      var msg = me.find("input").val();
      let data = { msg: msg };
      ws.send(JSON.stringify(data));
      me.find("input").val("");
      log("Message sent");
    }
    if (ws == null && msg.length) {
      log("Connection to room is required");
    }
    if (!msg.length) {
      log("Empty message");
    }
  }
  return false;
});

$("#room1").click(function () {
  log("room 1 clicked");
  chooseRoom("room:1");
});

$("#room2").click(function () {
  chooseRoom("room:2");
});

$("#room3").click(function () {
  chooseRoom("room:3");
});
