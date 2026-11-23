
export interface EVTariff {
  id: string;
  supplier: string;
  name: string;
  dayRate: number;
  nightRate: number;
  hours: string;
  offPeakHours: number;
  tariffType: string;
  eligibility: string;
  exitFee: string;
  url: string;
  checked: string;
  notes?: string;
}

// Rates are indicative published comparison figures, not guaranteed
// quotations. Regional prices and availability can differ.
// Recheck supplier websites before updating this database.

export const EV_TARIFFS: EVTariff[] = [
  {
    id: "edf-goelectric",
    supplier: "EDF Energy",
    name: "GoElectric",
    dayRate: 32.99,
    nightRate: 6.66,
    hours: "11pm – 6am",
    offPeakHours: 7,
    tariffType: "Fixed",
    eligibility: "Smart meter and home EV charging",
    exitFee: "£75",
    url: "https://www.edfenergy.com/electric-cars/ev-tariffs/goelectric",
    checked: "November 2026",
    notes: "Seven-hour overnight window. Available with compatible smart meter."
  },
  {
    id: "eon-smart",
    supplier: "E.ON Next",
    name: "Next Drive Smart",
    dayRate: 34.32,
    nightRate: 6.5,
    hours: "Midnight – 6am",
    offPeakHours: 6,
    tariffType: "Fixed",
    eligibility: "Smart charging compatibility",
    exitFee: "Check supplier",
    url: "https://www.eonnext.com/",
    checked: "November 2026"
  },
  {
    id: "octopus-go",
    supplier: "Octopus Energy",
    name: "Octopus Go",
    dayRate: 34.2,
    nightRate: 9.4,
    hours: "12:30am – 5:30am",
    offPeakHours: 5,
    tariffType: "Fixed",
    eligibility: "Smart meter and home EV charging",
    exitFee: "Check supplier",
    url: "https://octopus.energy/smart/go/",
    checked: "November 2026"
  },
  {
    id: "octopus-intelligent",
    supplier: "Octopus Energy",
    name: "Intelligent Octopus Go",
    dayRate: 33.9,
    nightRate: 9.9,
    hours: "11:30pm – 5:30am",
    offPeakHours: 6,
    tariffType: "Fixed",
    eligibility: "Compatible EV or charger",
    exitFee: "Check supplier",
    url: "https://octopus.energy/smart/intelligent-octopus-go/",
    checked: "November 2026"
  },
  {
    id: "utility-warehouse",
    supplier: "Utility Warehouse",
    name: "Variable EV Tariff",
    dayRate: 36.41,
    nightRate: 9,
    hours: "Midnight – 5am",
    offPeakHours: 5,
    tariffType: "Variable",
    eligibility: "Check supplier",
    exitFee: "None listed",
    url: "https://uw.co.uk/",
    checked: "November 2026"
  },
  {
    id: "scottish-power",
    supplier: "ScottishPower",
    name: "EV Saver",
    dayRate: 37.75,
    nightRate: 8.5,
    hours: "2am – 5am",
    offPeakHours: 3,
    tariffType: "Fixed",
    eligibility: "Check supplier",
    exitFee: "Check supplier",
    url: "https://www.scottishpower.co.uk/",
    checked: "November 2026"
  },
  {
    id: "eon-fixed",
    supplier: "E.ON Next",
    name: "Next Drive Fixed",
    dayRate: 35.17,
    nightRate: 8.5,
    hours: "Midnight – 6am",
    offPeakHours: 6,
    tariffType: "Fixed",
    eligibility: "Check supplier",
    exitFee: "None listed",
    url: "https://www.eonnext.com/",
    checked: "November 2026"
  },
  {
    id: "british-gas",
    supplier: "British Gas",
    name: "EV Power",
    dayRate: 38.49,
    nightRate: 9.5,
    hours: "Midnight – 5am",
    offPeakHours: 5,
    tariffType: "Fixed",
    eligibility: "Smart meter and home EV charging",
    exitFee: "Check supplier",
    url: "https://www.britishgas.co.uk/energy/electric-vehicles.html",
    checked: "November 2026",
    notes: "Confirm your personalised daytime rate before switching."
  },
  {
    id: "so-energy",
    supplier: "So Energy",
    name: "So EV",
    dayRate: 41.76,
    nightRate: 7.14,
    hours: "Midnight – 5am",
    offPeakHours: 5,
    tariffType: "Fixed",
    eligibility: "Check supplier",
    exitFee: "Check supplier",
    url: "https://www.so.energy/",
    checked: "November 2026"
  }
];
