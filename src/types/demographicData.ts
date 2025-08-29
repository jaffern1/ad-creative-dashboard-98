// Demographic data interfaces
export interface CountrySpendData {
  day: string;
  country: string;
  spend: number;
}

export interface AgeGenderSpendData {
  day: string;
  age: string;
  gender: string;
  spend: number;
}

// Processed demographic data for charts
export interface DemographicChartData {
  name: string;
  spend: number;
  percentage: number;
  color?: string;
}