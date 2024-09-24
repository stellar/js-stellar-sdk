module.exports = {
    useAxios: process.env.USE_AXIOS !== 'false',
    useEventSource: process.env.USE_EVENTSOURCE !== 'false',
  };