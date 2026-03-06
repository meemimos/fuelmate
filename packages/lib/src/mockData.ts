export type FuelType = 'Unleaded' | 'Premium' | 'Diesel' | 'E10';

export type Station = {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  fuels: Record<FuelType, number>;
  city?: string;
};

export type CityCoordinates = {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  Sydney: {
    name: 'Sydney',
    region: 'NSW',
    latitude: -33.8688,
    longitude: 151.2093,
  },
  Canberra: {
    name: 'Canberra',
    region: 'ACT',
    latitude: -35.2809,
    longitude: 149.13,
  },
  Melbourne: {
    name: 'Melbourne',
    region: 'VIC',
    latitude: -37.8136,
    longitude: 144.9631,
  },
};

const SYDNEY_STATIONS: Station[] = [
  {
    id: 'station-1',
    name: '7-Eleven Surry Hills',
    address: '487 Crown St, Surry Hills',
    distanceKm: 0.9,
    fuels: { Unleaded: 158.9, Premium: 176.5, Diesel: 171.2, E10: 154.3 },
    city: 'Sydney',
  },
  {
    id: 'station-2',
    name: 'BP Broadway',
    address: '2-6 City Rd, Broadway',
    distanceKm: 1.4,
    fuels: { Unleaded: 162.4, Premium: 179.9, Diesel: 174.8, E10: 156.1 },
    city: 'Sydney',
  },
  {
    id: 'station-3',
    name: 'Ampol Alexandria',
    address: '150 Botany Rd, Alexandria',
    distanceKm: 2.2,
    fuels: { Unleaded: 160.2, Premium: 177.4, Diesel: 173.5, E10: 155.7 },
    city: 'Sydney',
  },
  {
    id: 'station-4',
    name: 'Shell Redfern',
    address: '301-307 Elizabeth St, Redfern',
    distanceKm: 1.1,
    fuels: { Unleaded: 164.8, Premium: 181.6, Diesel: 176.2, E10: 158.4 },
    city: 'Sydney',
  },
  {
    id: 'station-5',
    name: 'United Waterloo',
    address: '181 Botany Rd, Waterloo',
    distanceKm: 2.7,
    fuels: { Unleaded: 159.4, Premium: 178.7, Diesel: 172.1, E10: 154.9 },
    city: 'Sydney',
  },
  {
    id: 'station-6',
    name: 'Caltex Zetland',
    address: '10 Joynton Ave, Zetland',
    distanceKm: 3.3,
    fuels: { Unleaded: 165.2, Premium: 182.1, Diesel: 177.9, E10: 159.6 },
    city: 'Sydney',
  },
];

const CANBERRA_STATIONS: Station[] = [
  {
    id: 'station-c-1',
    name: '7-Eleven Civic',
    address: '55 Petrie Plaza, Civic',
    distanceKm: 0.6,
    fuels: { Unleaded: 157.2, Premium: 174.8, Diesel: 169.5, E10: 152.6 },
    city: 'Canberra',
  },
  {
    id: 'station-c-2',
    name: 'BP Braddon',
    address: '81 London Cct, Braddon',
    distanceKm: 1.2,
    fuels: { Unleaded: 160.1, Premium: 178.2, Diesel: 172.9, E10: 155.4 },
    city: 'Canberra',
  },
  {
    id: 'station-c-3',
    name: 'Ampol Dickson',
    address: '34 Dickson Pl, Dickson',
    distanceKm: 1.8,
    fuels: { Unleaded: 158.9, Premium: 176.1, Diesel: 171.2, E10: 154.1 },
    city: 'Canberra',
  },
  {
    id: 'station-c-4',
    name: 'Shell O\'Connor',
    address: '39 Archibald St, O\'Connor',
    distanceKm: 2.4,
    fuels: { Unleaded: 162.5, Premium: 179.6, Diesel: 174.8, E10: 156.9 },
    city: 'Canberra',
  },
  {
    id: 'station-c-5',
    name: 'Caltex Tuggeranong',
    address: 'Shop 27, Tuggeranong Hyperdome',
    distanceKm: 3.1,
    fuels: { Unleaded: 161.3, Premium: 177.9, Diesel: 173.5, E10: 155.7 },
    city: 'Canberra',
  },
];

const MELBOURNE_STATIONS: Station[] = [
  {
    id: 'station-m-1',
    name: '7-Eleven CBD',
    address: '127 Swanston St, Melbourne',
    distanceKm: 0.5,
    fuels: { Unleaded: 159.8, Premium: 177.2, Diesel: 172.1, E10: 155.3 },
    city: 'Melbourne',
  },
  {
    id: 'station-m-2',
    name: 'BP South Yarra',
    address: '19 Fawkner St, South Yarra',
    distanceKm: 1.3,
    fuels: { Unleaded: 161.5, Premium: 179.1, Diesel: 173.8, E10: 156.8 },
    city: 'Melbourne',
  },
  {
    id: 'station-m-3',
    name: 'Ampol Docklands',
    address: '21-29 Docklands Dr, Docklands',
    distanceKm: 2.1,
    fuels: { Unleaded: 160.2, Premium: 178.4, Diesel: 172.9, E10: 155.1 },
    city: 'Melbourne',
  },
  {
    id: 'station-m-4',
    name: 'Shell Fitzroy',
    address: '167 Brunswick St, Fitzroy',
    distanceKm: 1.9,
    fuels: { Unleaded: 163.1, Premium: 180.5, Diesel: 175.6, E10: 157.9 },
    city: 'Melbourne',
  },
];

export const MOCK_STATIONS_BY_CITY: Record<string, Station[]> = {
  Sydney: SYDNEY_STATIONS,
  Canberra: CANBERRA_STATIONS,
  Melbourne: MELBOURNE_STATIONS,
};

export const MOCK_STATIONS: Station[] = SYDNEY_STATIONS;
