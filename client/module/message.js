const Message = function(type, message) {
  if (typeof type !== 'string') throw new Error('type must be a string');
  // if (typeof message !== 'object') throw new Error('message must be an object');
  
  this.type = type;
  this.message = message;
}

module.exports = Message
// export default Message