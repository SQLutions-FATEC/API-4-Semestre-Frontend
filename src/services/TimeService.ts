import api from './api';

export interface TimeData {
  firstDate: string;
  lastDate: string;
  currentServerTime: string;
}

class TimeService {
  async getServerTime(): Promise<TimeData> {
    const response = await api.get('/time');
    const [firstDate, lastDate, currentServerTime] = response.data;

    return {
      firstDate,
      lastDate,
      currentServerTime
    };
  }

  getMinutesFromStartOfDay(serverTime: string): number {
    const currentTime = new Date(serverTime);
    const startOfDay = new Date(currentTime);
    startOfDay.setHours(0, 0, 0, 0);

    const diffInMs = currentTime.getTime() - startOfDay.getTime();
    return Math.floor(diffInMs / (1000 * 60));
  }

  get24HoursAgoTimestamp(serverTime: string): string {
    const dateTimePart = serverTime.split('T')[0];
    const timePart = serverTime.split('T')[1].split('.')[0];

    const currentDate = new Date(dateTimePart + 'T00:00:00Z');
    const previousDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));

    const previousDateStr = previousDate.toISOString().split('T')[0];

    return `${previousDateStr}T${timePart}`;
  }


  convertDateTimeToServerFormat(dateTime: string): string {
    const cleanDateTime = dateTime.replace(/[+-]\d{2}:\d{2}|Z$/g, '');

    return cleanDateTime.includes('T') ? cleanDateTime.slice(0, 19) : cleanDateTime;
  }
}

export default new TimeService();
