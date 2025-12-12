$(document).ready(function() {
  var $chats = $('#chats');
  var $usernameInput = $('input#username');
  var $chatInput = $('input#newChat');
  var $button = $('button');

  var socket = io.connect('');

  // Accepts the initial list of chats,
  // then removes itself as a listener
  var handleInitialChats = function(data) {
    var chats = data.data;
    for (var i=0; i<chats.length; i++) {
      displayChat(chats[i]);
    }
    // Only needs this listener at the very beginning
    socket.removeListener('chats', handleInitialChats);
  };

  // Accepts any new chats after a connection has
  // been established
  var handleNewChats = function(data) {
    var chat = data.data;
    displayChat(chat);
  };

  // Adds event listeners
  socket.on('chats', handleInitialChats);
  socket.on('newChat', handleNewChats);

  var displayChat = function(chat) {
    var str = chat.username + ': ' + chat.message;
    $('<li>').addClass('chat').appendTo($chats).text(str);
  };

  var submitChat = function() {
    // Create a chat object
    var chat = {
      message: $chatInput.val(),
      username: $usernameInput.val()
    };

    // Send the chat to the server
    socket.emit('submit', {
      data: chat
    });

    // Clear chat after submitting
    $chatInput.val('');
  }

  $button.click(submitChat);

});
