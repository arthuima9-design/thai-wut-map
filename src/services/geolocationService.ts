/**
 * Device GPS & Geolocation Service
 * Accesses browser / phone native GPS with high accuracy and Thai status messages
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
}

export class GeolocationService {
  /**
   * Checks if Geolocation is supported by the current browser environment
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Request current device GPS coordinates
   */
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('เบราว์เซอร์หรืออุปกรณ์ของคุณไม่รองรับระบบระบุตำแหน่ง GPS'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let message = 'ไม่สามารถระบุตำแหน่ง GPS ได้';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'กรุณาอนุญาตการเข้าถึงตำแหน่ง GPS ในการตั้งค่าเบราว์เซอร์ของคุณ';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'ไม่พบสัญญาณดาวเทียม GPS หรือข้อมูลตำแหน่งในขณะนี้';
              break;
            case error.TIMEOUT:
              message = 'หมดเวลาการค้นหาสัญญาณ GPS กรุณาลองใหม่อีกครั้ง';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  }
}

export const geolocationService = new GeolocationService();
