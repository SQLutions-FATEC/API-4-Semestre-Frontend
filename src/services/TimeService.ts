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

  getSameTimeYesterdayTimestamp(serverTime: string): string {
    const currentTime = new Date(serverTime);
    const yesterdaySameTime = new Date(currentTime);
    yesterdaySameTime.setDate(yesterdaySameTime.getDate() - 1);

    // Manter exatamente o mesmo horário de ontem
    return yesterdaySameTime.toISOString().slice(0, 19);
  }

  getPreviousDayEndTimestamp(serverTime: string): string {
    const currentTime = new Date(serverTime);
    const previousDay = new Date(currentTime);
    previousDay.setDate(previousDay.getDate() - 1);
    previousDay.setHours(23, 59, 59, 0);

    return previousDay.toISOString().slice(0, 19);
  }

  getPreviousDayStartTimestamp(serverTime: string): string {
    const currentTime = new Date(serverTime);
    const previousDay = new Date(currentTime);
    previousDay.setDate(previousDay.getDate() - 1);
    previousDay.setHours(0, 0, 0, 0);

    return previousDay.toISOString();
  }
}

export default new TimeService();
