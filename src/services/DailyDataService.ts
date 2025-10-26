import readingService, { type ReadingData } from './ReadingService';
import timeService from './TimeService';

export interface DailyData {
  totalReadings: number;
  averageSpeed: number;
  maxSpeed: number;
  maxSpeedLocation?: string;
  maxSpeedTime?: string;
}

export interface DailyComparison {
  today: DailyData;
  yesterday: DailyData;
  readingsChange: number;
  speedChange: number;
}

class DailyDataService {
  private calculateDailyStats(data: ReadingData[]): DailyData {
    if (!data || data.length === 0) {
      return {
        totalReadings: 0,
        averageSpeed: 0,
        maxSpeed: 0
      };
    }

    const totalReadings = data.reduce((sum, item) => sum + item.totalReadings, 0);

    let totalWeightedSpeed = 0;
    let totalReadingsForSpeed = 0;
    let maxSpeed = 0;

    data.forEach(item => {
      totalWeightedSpeed += item.averageSpeed * item.totalReadings;
      totalReadingsForSpeed += item.totalReadings;

      if (item.averageSpeed > maxSpeed) {
        maxSpeed = item.averageSpeed;
      }
    });

    const averageSpeed = totalReadingsForSpeed > 0
      ? Math.round((totalWeightedSpeed / totalReadingsForSpeed) * 100) / 100
      : 0;

    return {
      totalReadings,
      averageSpeed,
      maxSpeed: Math.round(maxSpeed * 100) / 100
    };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  async getDailyComparison(region: string = "São José dos Campos"): Promise<DailyComparison> {
    try {
      const serverTime = await timeService.getServerTime();
      const currentTime = serverTime.currentServerTime;

      const minutesFromStartOfDay = timeService.getMinutesFromStartOfDay(currentTime);

      // Timestamp de exatamente 24 horas atrás
      const twentyFourHoursAgoTimestamp = timeService.get24HoursAgoTimestamp(currentTime);

      return await this.fetchDailyDataWithServerTime(region, minutesFromStartOfDay, twentyFourHoursAgoTimestamp);
    } catch {
      return await this.fetchDailyDataFallback(region);
    }
  }

  private async fetchDailyDataWithServerTime(
    region: string,
    minutesFromStartOfDay: number,
    twentyFourHoursAgoTimestamp: string
  ): Promise<DailyComparison> {
    try {
      let todayData: ReadingData[];
      let yesterdayData: ReadingData[];

      if (region === "São José dos Campos") {
        // Dados da cidade toda
        const [todayResponse, yesterdayResponse] = await Promise.all([
          readingService.getCityData({ minutes: minutesFromStartOfDay }),
          readingService.getCityData({
            minutes: minutesFromStartOfDay,
            timestamp: twentyFourHoursAgoTimestamp
          })
        ]);

        todayData = todayResponse.data;
        yesterdayData = yesterdayResponse.data;
      } else {
        // Dados de região específica
        const [todayResponse, yesterdayResponse] = await Promise.all([
          readingService.getRegionData({
            regions: [region],
            minutes: minutesFromStartOfDay
          }),
          readingService.getRegionData({
            regions: [region],
            minutes: minutesFromStartOfDay,
            timestamp: twentyFourHoursAgoTimestamp
          })
        ]);

        todayData = todayResponse.data;
        yesterdayData = yesterdayResponse.data;
      }

      const today = this.calculateDailyStats(todayData);
      const yesterday = this.calculateDailyStats(yesterdayData);

      const readingsChange = this.calculatePercentageChange(today.totalReadings, yesterday.totalReadings);
      const speedChange = this.calculatePercentageChange(today.averageSpeed, yesterday.averageSpeed);

      return {
        today,
        yesterday,
        readingsChange,
        speedChange
      };
    } catch {
      return await this.fetchDailyDataFallback(region);
    }
  }

  private async fetchDailyDataFallback(region: string): Promise<DailyComparison> {
    let currentData: ReadingData[];

    if (region === "São José dos Campos") {
      const response = await readingService.getCityData({ minutes: 1440 });
      currentData = response.data;
    } else {
      const response = await readingService.getRegionData({
        regions: [region],
        minutes: 1440
      });
      currentData = response.data;
    }

    const today = this.calculateDailyStats(currentData);

    const yesterday: DailyData = {
      totalReadings: 0,
      averageSpeed: 0,
      maxSpeed: 0
    };

    return {
      today,
      yesterday,
      readingsChange: 0,
      speedChange: 0
    };
  }
}

export default new DailyDataService();
