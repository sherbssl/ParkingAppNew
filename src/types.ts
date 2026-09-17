export type ScreenTab = 'explore' | 'calculator' | 'saved' | 'profile';

export type LotCategory = 'all' | 'building' | 'street' | 'ev';

export interface ParkingRate {
  blockMinutes: number;
  blockRate: number;
  firstHourRate?: number;
  subsequentHalfHourRate?: number;
  allDayCap?: number;
  currency: string;
  tariffType: 'commercial' | 'ura_coupon' | 'hdb';
  pricingNote: string;
}

export interface ParkingSpot {
  id: string;
  name: string;
  shortName: string;
  address: string;
  subTitle: string;
  category: 'building' | 'street';
  isVerified: boolean;
  isCheapest?: boolean;
  walkingDistanceM: number;
  walkingTimeMin: number;
  totalLots: number;
  availableLots: number;
  lotStatus: 'Plentiful' | 'Filling Fast' | 'Limited' | 'Full';
  levelInfo: string;
  hourlyRate: number;
  rate: ParkingRate;
  features: string[];
  maxHeightM?: number;
  evChargers?: {
    total: number;
    open: number;
    kw: number;
  };
  isCovered: boolean;
  paymentMethod: string;
  mapCoords: {
    topPercent: number;
    leftPercent: number;
  };
  gantryEntrance: string;
  weekdayDayRate: string;
  eveningRate: string;
  weekendRate: string;
  lat?: number;
  lng?: number;
  areaGroup?: string;
  rawTariff?: {
    weekday_1: string;
    weekday_2: string;
    sat: string;
    sun_ph: string;
  };
}

export interface ActiveParkingSession {
  lotId: string;
  lotName: string;
  level: string;
  pillar: string;
  vehiclePlate: string;
  startTime: string;
  durationMinutes: number;
  costSoFar: number;
  targetEndTime: string;
  notes?: string;
}
