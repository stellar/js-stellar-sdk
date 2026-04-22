module.exports = {
    useAxios: process.env.USE_AXIOS === 'true',
    useEventSource: process.env.USE_EVENTSOURCE !== 'false',
  };
