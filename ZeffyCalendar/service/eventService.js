const getEventManager = () => {
  const factory = ZeffyAPI.newZeffyAPIFactory();
  return factory.eventManager();
};

const toJsonString = (response) => {
  if (response && typeof response.toObject === 'function') {
    return JSON.stringify(response.toObject());
  }
  return JSON.stringify(response);
};

const getCampaigns = () => {
  try {
    return getEventManager()
      .getAll({ page: { pageSize: 100 } })
      .then((response) => toJsonString(response))
      .catch((e) => JSON.stringify({ error: e.message }));
  } catch (e) {
    return Promise.resolve(JSON.stringify({ error: e.message }));
  }
};

const getEvents = () => {
  try {
    return getEventManager()
      .getAll({ page: { pageSize: 100 } })
      .then((response) => toJsonString(response))
      .catch((e) => JSON.stringify({ error: e.message }));
  } catch (e) {
    return Promise.resolve(JSON.stringify({ error: e.message }));
  }
};