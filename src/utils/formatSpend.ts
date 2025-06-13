
export const formatSpend = (spend: number): string => {
  if (spend >= 1000000) {
    return `£${Math.round(spend / 1000000)}M`;
  } else if (spend >= 1000) {
    return `£${Math.round(spend / 1000)}K`;
  } else {
    return `£${Math.round(spend)}`;
  }
};
