const getCampaigns = async () => {
  try {
    const zeffyAPI = ZeffyAPI.newZeffyAPI();
    const campaigns = await zeffyAPI.getEntities('campaigns', { limit: 100 });
    return campaigns;
  } catch (e) {
    return { error: e.message };
  }
};

const getEvents = () => {
  try {
    const zeffyAPI = ZeffyAPI.newZeffyAPI();
    const filter = { field: 'category', operator: 'equals', value: 'Event' };
    return zeffyAPI.getEntitiesByFilter('campaigns', { limit: 100 }, filter)
      .catch(e => ({ error: e.message }));
  } catch (e) {
    return Promise.resolve({ error: e.message });
  }
};