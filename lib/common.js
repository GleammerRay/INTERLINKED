const dmUsers = (rest, userIDs, message) => {
  if (userIDs.length == 0) return;
  rest.createDMMessage(userIDs[0], message);
  return setTimeout(() => dmUsers(rest, userIDs.slice(1), message), 500);
}

const defaultPlayerQueue = [ { startTime: null, recount: 0, players: {} }, { startTime: null, recount: 0, players: {} }, { startTime: null, recount: 0, players: {} } ];

export { dmUsers, defaultPlayerQueue };
