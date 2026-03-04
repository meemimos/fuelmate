export type FuelType = 'Unleaded' | 'Premium' | 'Diesel' | 'E10';

export type Station = {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  fuels: Record<FuelType, number>;
};

export const MOCK_STATIONS: Station[] = [
  {
    id: 'station-1',
    name: '7-Eleven Surry Hills',
    address: '487 Crown St, Surry Hills',
    distanceKm: 0.9,
    fuels: { Unleaded: 158.9, Premium: 176.5, Diesel: 171.2, E10: 154.3 },
  },
  {
    id: 'station-2',
    name: 'BP Broadway',
    address: '2-6 City Rd, Broadway',
    distanceKm: 1.4,
    fuels: { Unleaded: 162.4, Premium: 179.9, Diesel: 174.8, E10: 156.1 },
  },
  {
    id: 'station-3',
    name: 'Ampol Alexandria',
    address: '150 Botany Rd, Alexandria',
    distanceKm: 2.2,
    fuels: { Unleaded: 160.2, Premium: 177.4, Diesel: 173.5, E10: 155.7 },
  },
  {
    id: 'station-4',
    name: 'Shell Redfern',
    address: '301-307 Elizabeth St, Redfern',
    distanceKm: 1.1,
    fuels: { Unleaded: 164.8, Premium: 181.6, Diesel: 176.2, E10: 158.4 },
  },
  {
    id: 'station-5',
    name: 'United Waterloo',
    address: '181 Botany Rd, Waterloo',
    distanceKm: 2.7,
    fuels: { Unleaded: 159.4, Premium: 178.7, Diesel: 172.1, E10: 154.9 },
  },
  {
    id: 'station-6',
    name: 'Caltex Zetland',
    address: '10 Joynton Ave, Zetland',
    distanceKm: 3.3,
    fuels: { Unleaded: 165.2, Premium: 182.1, Diesel: 177.9, E10: 159.6 },
  },
];
