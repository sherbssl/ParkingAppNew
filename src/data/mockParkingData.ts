import { ParkingSpot } from '../types';
import { ALL_SINGAPORE_CARPARKS } from './singaporeCarparkDatabase';

// Default primary Marina Bay spots matching the user's initial screen
const PRIMARY_MARINA_BAY_SPOTS: ParkingSpot[] = [
  {
    id: 'mbfc',
    name: 'Marina Bay Financial Centre',
    shortName: 'MBFC',
    address: '8 Marina Boulevard, Singapore 018981',
    subTitle: 'Tower 1 & 2 • Subterranean P1-P4',
    category: 'building',
    isVerified: true,
    isCheapest: false,
    walkingDistanceM: 180,
    walkingTimeMin: 3,
    totalLots: 450,
    availableLots: 142,
    lotStatus: 'Plentiful',
    levelInfo: 'Plentiful • Level P2',
    hourlyRate: 5.0,
    rate: {
      blockMinutes: 30,
      blockRate: 2.5,
      firstHourRate: 5.0,
      subsequentHalfHourRate: 2.5,
      allDayCap: 38.0,
      currency: 'SGD',
      tariffType: 'commercial',
      pricingNote: '$2.50 / 30 mins block',
    },
    features: ['EV 50kW (8 open)', 'Max Height 2.1m', '24/7 Monitored', 'CCTV & Security', 'CashCard / EPS'],
    maxHeightM: 2.1,
    evChargers: {
      total: 12,
      open: 8,
      kw: 50,
    },
    isCovered: true,
    paymentMethod: 'EPS Auto / CashCard',
    mapCoords: {
      topPercent: 32,
      leftPercent: 28,
    },
    gantryEntrance: 'Marina Way Entrance Gantry A',
    weekdayDayRate: '$2.50 per 30 mins (07:00 - 17:00)',
    eveningRate: '$3.50 per entry after 17:00',
    weekendRate: '$3.50 for 1st 4 hours, $1.50/subsequent hr',
    lat: 1.2796,
    lng: 103.8542,
    areaGroup: 'South & CBD',
    rawTariff: {
      weekday_1: '6am-6pm: $1.07 per 10 mins',
      weekday_2: 'Aft 6pm: $3.21 for 1st 4hrs; $0.27 for sub. 10 mins',
      sat: '$3.21 for 1st 4hrs; $0.27 for sub. 10 mins',
      sun_ph: 'Same as Saturday',
    },
  },
  {
    id: 'street',
    name: 'Marina Blvd Kerbside',
    shortName: 'Street',
    address: 'Marina Boulevard Bayfront St, Singapore 018972',
    subTitle: 'URA Street Lots 44 - 68',
    category: 'street',
    isVerified: false,
    isCheapest: true,
    walkingDistanceM: 340,
    walkingTimeMin: 5,
    totalLots: 24,
    availableLots: 4,
    lotStatus: 'Filling Fast',
    levelInfo: 'Filling Fast',
    hourlyRate: 2.4,
    rate: {
      blockMinutes: 30,
      blockRate: 1.2,
      firstHourRate: 2.4,
      subsequentHalfHourRate: 1.2,
      currency: 'SGD',
      tariffType: 'ura_coupon',
      pricingNote: '$1.20 / 30m URA coupon',
    },
    features: ['Uncovered', 'Pay via Parking.sg', '10 Min Grace Period', 'Loading Bay Nearby'],
    isCovered: false,
    paymentMethod: 'Parking.sg Mobile App',
    mapCoords: {
      topPercent: 68,
      leftPercent: 36,
    },
    gantryEntrance: 'Street Kerbside Bay 44',
    weekdayDayRate: '$1.20 per 30 mins (08:30 - 17:00)',
    eveningRate: '$0.60 per 30 mins (17:00 - 22:30)',
    weekendRate: 'Free on Sundays & Public Holidays',
    lat: 1.2805,
    lng: 103.8558,
    areaGroup: 'South & CBD',
    rawTariff: {
      weekday_1: 'Daily: 0830-1700: $1.20 / 30 mins URA coupon',
      weekday_2: '1700-2230: $0.60 / 30 mins',
      sat: 'Same as weekdays',
      sun_ph: 'Free on Sundays & Public Holidays',
    },
  },
  {
    id: 'shoppes',
    name: 'The Shoppes at Marina Bay Sands',
    shortName: 'Shoppes',
    address: '10 Bayfront Ave, Singapore 018956',
    subTitle: 'MBS Basement 3 & 4 Car Park',
    category: 'building',
    isVerified: true,
    isCheapest: false,
    walkingDistanceM: 90,
    walkingTimeMin: 1,
    totalLots: 1200,
    availableLots: 28,
    lotStatus: 'Limited',
    levelInfo: 'Limited • Basement 3',
    hourlyRate: 4.0,
    rate: {
      blockMinutes: 60,
      blockRate: 4.0,
      firstHourRate: 4.0,
      subsequentHalfHourRate: 1.5,
      allDayCap: 35.0,
      currency: 'SGD',
      tariffType: 'commercial',
      pricingNote: '$4.00 1st hr, $1.50/subsequent 30m',
    },
    features: ['Valet Service', 'EV Supercharger (4 open)', 'Max Height 2.0m', 'Direct Mall Lift Access'],
    maxHeightM: 2.0,
    evChargers: {
      total: 8,
      open: 4,
      kw: 150,
    },
    isCovered: true,
    paymentMethod: 'EPS Auto / Sands Rewards Rebate',
    mapCoords: {
      topPercent: 58,
      leftPercent: 78,
    },
    gantryEntrance: 'Bayfront Link Carpark Entrance',
    weekdayDayRate: '$4.00 for 1st hr, $1.50/subsequent 30 mins (07:00 - 19:00)',
    eveningRate: '$8.50 per entry after 19:00',
    weekendRate: '$4.50 for 1st hr, $1.80/subsequent 30 mins',
    lat: 1.2838,
    lng: 103.8591,
    areaGroup: 'South & CBD',
    rawTariff: {
      weekday_1: '7am-7pm: $7 for 1st hr; $1 for sub. ½ hr',
      weekday_2: 'Aft 7pm: $7 per entry',
      sat: 'Sat, Sun: 7am-7pm: $8 for 1st hr',
      sun_ph: 'Same as Saturday',
    },
  },
  {
    id: 'orq',
    name: 'One Raffles Quay (ORQ)',
    shortName: 'ORQ',
    address: '1 Raffles Quay, Singapore 048583',
    subTitle: 'North & South Tower Parking',
    category: 'building',
    isVerified: true,
    isCheapest: false,
    walkingDistanceM: 290,
    walkingTimeMin: 4,
    totalLots: 320,
    availableLots: 65,
    lotStatus: 'Plentiful',
    levelInfo: 'Moderate • Basement 2',
    hourlyRate: 4.5,
    rate: {
      blockMinutes: 30,
      blockRate: 2.2,
      firstHourRate: 4.4,
      subsequentHalfHourRate: 2.2,
      currency: 'SGD',
      tariffType: 'commercial',
      pricingNote: '$2.20 / 30 mins block',
    },
    features: ['EV 22kW (3 open)', 'Max Height 2.15m', 'Automated Barrier', 'Direct MRT Underpass'],
    maxHeightM: 2.15,
    evChargers: {
      total: 6,
      open: 3,
      kw: 22,
    },
    isCovered: true,
    paymentMethod: 'CashCard / NETS FlashPay',
    mapCoords: {
      topPercent: 42,
      leftPercent: 22,
    },
    gantryEntrance: 'Raffles Quay Main Slip Road',
    weekdayDayRate: '$2.20 per 30 mins (07:00 - 18:00)',
    eveningRate: '$3.00 per entry after 18:00',
    weekendRate: '$3.00 for first 3 hours, $1.20/subsequent',
    lat: 1.2818,
    lng: 103.8519,
    areaGroup: 'South & CBD',
    rawTariff: {
      weekday_1: '6am-6pm: $1.07 per 10mins',
      weekday_2: 'Aft 6pm: $3.21 for 1st 4hrs',
      sat: '$3.21 for 1st 4hrs',
      sun_ph: 'Same as Saturday',
    },
  },
];

// Transform dataset items into full ParkingSpots
const DATA_GOV_SPOTS: ParkingSpot[] = ALL_SINGAPORE_CARPARKS
  .filter((c) => !PRIMARY_MARINA_BAY_SPOTS.some((p) => p.id === c.id))
  .map((c) => {
    const isStreet = c.name.toLowerCase().includes('off-street') || c.name.toLowerCase().includes('kerbside') || c.category.includes('Street');
    const hourly = c.approxHourlyRate || 1.8;
    const halfHourRate = Number((hourly / 2).toFixed(2));
    const randomLots = Math.floor(Math.random() * (c.totalLots * 0.6)) + 8;
    const isCheapest = hourly <= 1.2;

    return {
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      address: `${c.name}, Singapore`,
      subTitle: `${c.category} • Official URA/Operator`,
      category: isStreet ? 'street' : 'building',
      isVerified: true,
      isCheapest,
      walkingDistanceM: 500, // will be dynamically recomputed based on searched destination
      walkingTimeMin: 6,
      totalLots: c.totalLots,
      availableLots: Math.min(c.totalLots, randomLots),
      lotStatus: randomLots > 30 ? 'Plentiful' : randomLots > 10 ? 'Limited' : 'Filling Fast',
      levelInfo: isStreet ? 'Street Level' : 'Available • Multi-storey',
      hourlyRate: hourly,
      rate: {
        blockMinutes: 30,
        blockRate: halfHourRate,
        firstHourRate: hourly,
        subsequentHalfHourRate: halfHourRate,
        currency: 'SGD',
        tariffType: isStreet ? 'ura_coupon' : 'commercial',
        pricingNote: `${c.weekdays_rate_1}`,
      },
      features: [
        c.isCovered ? 'Covered' : 'Uncovered',
        c.hasEv ? 'EV Charging' : 'Standard Bays',
        c.maxHeight ? `Max Height ${c.maxHeight}m` : 'Standard Height 2.1m',
        'EPS / CashCard',
      ],
      maxHeightM: c.maxHeight || 2.1,
      evChargers: c.hasEv
        ? {
            total: 4,
            open: 2,
            kw: 22,
          }
        : undefined,
      isCovered: c.isCovered,
      paymentMethod: isStreet ? 'Parking.sg Mobile App' : 'EPS Electronic Parking System',
      mapCoords: {
        topPercent: 50,
        leftPercent: 50,
      },
      gantryEntrance: `${c.name} Main Access`,
      weekdayDayRate: c.weekdays_rate_1,
      eveningRate: c.weekdays_rate_2,
      weekendRate: c.sunday_publicholiday_rate,
      lat: c.lat,
      lng: c.lng,
      areaGroup: c.areaGroup,
      rawTariff: {
        weekday_1: c.weekdays_rate_1,
        weekday_2: c.weekdays_rate_2,
        sat: c.saturday_rate,
        sun_ph: c.sunday_publicholiday_rate,
      },
    };
  });

export const INITIAL_PARKING_SPOTS: ParkingSpot[] = [
  ...PRIMARY_MARINA_BAY_SPOTS,
  ...DATA_GOV_SPOTS,
];

export interface DestinationItem {
  name: string;
  label: string;
  lat: number;
  lng: number;
  postal?: string;
  badge: string;
}

export const POPULAR_DESTINATIONS: DestinationItem[] = [
  { name: 'Marina Bay Sands, 018972', label: 'Marina Bay Sands', lat: 1.2838, lng: 103.8591, postal: '018972', badge: 'MBS' },
  { name: 'Raffles Place CBD, 048616', label: 'Raffles Place CBD', lat: 1.2840, lng: 103.8515, postal: '048616', badge: 'CBD' },
  { name: 'ION Orchard, 238801', label: 'Orchard Road', lat: 1.3040, lng: 103.8318, postal: '238801', badge: 'Orchard' },
  { name: 'Suntec City Mall, 038983', label: 'Suntec City', lat: 1.2935, lng: 103.8572, postal: '038983', badge: 'Suntec' },
  { name: 'Bugis Junction, 188021', label: 'Bugis', lat: 1.3002, lng: 103.8553, postal: '188021', badge: 'Bugis' },
  { name: 'Nex Mall Serangoon, 556083', label: 'Serangoon NEX', lat: 1.3507, lng: 103.8724, postal: '556083', badge: 'Nex' },
  { name: 'Toa Payoh HDB Hub, 310480', label: 'Toa Payoh Central', lat: 1.3323, lng: 103.8488, postal: '310480', badge: 'Toa Payoh' },
  { name: 'Jurong Point, 648886', label: 'Jurong West', lat: 1.3402, lng: 103.7061, postal: '648886', badge: 'Jurong' },
  { name: 'VivoCity Harbourfront, 098585', label: 'VivoCity & Sentosa', lat: 1.2644, lng: 103.8222, postal: '098585', badge: 'Harbourfront' },
  { name: 'Changi Airport T1, 819642', label: 'Changi Airport', lat: 1.3644, lng: 103.9915, postal: '819642', badge: 'Changi' },
  { name: 'Tampines Mall, 529510', label: 'Tampines Central', lat: 1.3533, lng: 103.9452, postal: '529510', badge: 'Tampines' },
  { name: 'Ang Mo Kio Hub, 569933', label: 'Ang Mo Kio', lat: 1.3691, lng: 103.8483, postal: '569933', badge: 'AMK' },
  { name: 'Causeway Point Woodlands, 738099', label: 'Woodlands', lat: 1.4361, lng: 103.7858, postal: '738099', badge: 'Woodlands' },
  { name: 'Resorts World Sentosa, 098269', label: 'Sentosa USS', lat: 1.2562, lng: 103.8208, postal: '098269', badge: 'Sentosa' },
  { name: 'IMM Building Jurong East, 609601', label: 'Jurong East', lat: 1.3348, lng: 103.7468, postal: '609601', badge: 'IMM' },
];

export const DEFAULT_VEHICLE = {
  plate: 'SLL 1234 X',
  model: 'Toyota Prius Hybrid (Dark Slate)',
  iuNumber: '52490184',
  vehicleType: 'Car',
  isEv: false,
  parkingSgConnected: true,
  erpAutoSync: true,
};
