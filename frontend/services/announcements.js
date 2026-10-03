import api from './api';

export const announcementsService = {
  getAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },
};

export default announcementsService;
