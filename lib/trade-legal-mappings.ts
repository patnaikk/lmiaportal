// Seed data: known trade name → legal name mappings
// Sources: IRCC non-compliant employer data + verified government records
// These are the 25 confirmed mappings from the build spec

export interface TradeMapping {
  tradeName: string
  legalName: string
  province: string
}

export const TRADE_LEGAL_MAPPINGS: TradeMapping[] = [
  { tradeName: 'Red Robin', legalName: 'Infinity RRGB Ventures Inc.', province: 'BC' },
  { tradeName: 'Barcelos Flame Grilled Chicken', legalName: 'SHK Holdings Ltd.', province: 'AB' },
  { tradeName: 'CEFA Systems ULC', legalName: '1545854 B.C. Unlimited Liability Company', province: 'BC' },
  { tradeName: 'Fraser River Lodge', legalName: 'Eurocan Management Ltd.', province: 'BC' },
  { tradeName: 'Little Town Restaurant', legalName: 'Admirals Steakhouse Inc.', province: 'SK' },
  { tradeName: 'Burger Factory', legalName: '2771482 Ontario Inc.', province: 'ON' },
  { tradeName: 'Franklin Education Group', legalName: '2740215 Ontario Ltd.', province: 'ON' },
  { tradeName: 'Goldmine Farms', legalName: 'Goldmine Properties Ltd.', province: 'BC' },
  { tradeName: 'Kanwar Walia Farms', legalName: '1254586 BC Ltd.', province: 'BC' },
  { tradeName: 'Stone Mill Estates Retirement Residence', legalName: '2652366 Ontario Inc.', province: 'ON' },
  { tradeName: 'Beseda Kitchen', legalName: '2316870 Alberta Ltd.', province: 'AB' },
  { tradeName: 'Fresh Produce Farm', legalName: '1339772 BC Ltd.', province: 'BC' },
  { tradeName: 'The Snack', legalName: '5514 Nunavut Inc.', province: 'NU' },
  { tradeName: 'Arora Technologies', legalName: 'Arora Comfortechs Ltd.', province: 'BC' },
  { tradeName: 'Versailles Modernscape Ltd.', legalName: '2410193 Alberta Ltd.', province: 'AB' },
  { tradeName: 'Tim Hortons', legalName: '9363-2891 Québec Inc.', province: 'QC' },
  { tradeName: 'Power Kitchen', legalName: 'District 28 Company Ltd.', province: 'ON' },
  { tradeName: "Anna's Cleaning Services", legalName: 'Anna Ordon', province: 'ON' },
  { tradeName: 'Onoway Petro Canada', legalName: '1877413 Alberta Ltd.', province: 'AB' },
  { tradeName: 'The New Sun Design Group', legalName: 'The New Sun Design Group Ltd.', province: 'BC' },
  { tradeName: 'African Grill', legalName: '2648197 Ontario Inc.', province: 'ON' },
  { tradeName: 'BlackLab Computers', legalName: 'BlackLab Computers Ltd.', province: 'BC' },
  { tradeName: 'Emmanuel Villa Personal Care Home', legalName: 'Goshen Professional Care Inc.', province: 'SK' },
  { tradeName: "Freddie's Pizza", legalName: 'Amherst Pizza and Donair Limited', province: 'NS' },
  { tradeName: 'Résidence Le Coulongeois', legalName: '9003-4729 Québec Inc.', province: 'QC' },
]
