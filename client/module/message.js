const Message = function(type, message) {
  if (typeof type !== 'string') throw new Error('type must be a string');
  this.type = type;
  this.message = message;
}

module.exports = Message
// export default Message