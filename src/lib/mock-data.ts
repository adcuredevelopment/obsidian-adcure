export type AccountStatus = "Active" | "Pending" | "Paused" | "Rejected";

export type AdAccount = {
  id: string;
  name: string;
  accountId: string;
  owner: { name: string; email: string; initials: string };
  status: AccountStatus;
  balance: number;
  spend: number;
  lastActivity: string;
  platform: "Meta" | "Google" | "TikTok" | "LinkedIn";
  viaMainSupplier: boolean;
  spendTrend: number[];
};

export const adAccounts: AdAccount[] = [
  {
    id: "1",
    name: "Northwind Performance",
    accountId: "act_8821390",
    owner: { name: "Sofia Martinez", email: "sofia@northwind.io", initials: "SM" },
    status: "Active",
    balance: 12480.5,
    spend: 4231.22,
    lastActivity: "2m ago",
    platform: "Meta",
  },
  {
    id: "2",
    name: "Helix Labs Growth",
    accountId: "act_7710291",
    owner: { name: "Daniel Kim", email: "dan@helixlabs.com", initials: "DK" },
    status: "Active",
    balance: 8420.0,
    spend: 1980.4,
    lastActivity: "12m ago",
    platform: "Google",
  },
  {
    id: "3",
    name: "Lumen Skincare",
    accountId: "act_6602114",
    owner: { name: "Priya Nair", email: "priya@lumen.co", initials: "PN" },
    status: "Pending",
    balance: 0,
    spend: 0,
    lastActivity: "1h ago",
    platform: "Meta",
  },
  {
    id: "4",
    name: "Atlas DTC — EU",
    accountId: "act_5544023",
    owner: { name: "Marco Rossi", email: "marco@atlasdtc.eu", initials: "MR" },
    status: "Active",
    balance: 24310.75,
    spend: 8821.5,
    lastActivity: "27m ago",
    platform: "TikTok",
  },
  {
    id: "5",
    name: "Quartz Finance",
    accountId: "act_4499182",
    owner: { name: "Alicia Brooks", email: "alicia@quartzfin.com", initials: "AB" },
    status: "Paused",
    balance: 530.0,
    spend: 110.25,
    lastActivity: "3h ago",
    platform: "LinkedIn",
  },
  {
    id: "6",
    name: "Nova Outdoor Co.",
    accountId: "act_3382910",
    owner: { name: "Jonas Weber", email: "jonas@novaoutdoor.com", initials: "JW" },
    status: "Active",
    balance: 6740.4,
    spend: 2104.15,
    lastActivity: "5h ago",
    platform: "Meta",
  },
  {
    id: "7",
    name: "Ember Coffee",
    accountId: "act_2271504",
    owner: { name: "Riley Chen", email: "riley@embercoffee.co", initials: "RC" },
    status: "Pending",
    balance: 0,
    spend: 0,
    lastActivity: "yesterday",
    platform: "Google",
  },
  {
    id: "8",
    name: "Tideline Apparel",
    accountId: "act_1187320",
    owner: { name: "Emma Hughes", email: "emma@tideline.com", initials: "EH" },
    status: "Rejected",
    balance: 0,
    spend: 0,
    lastActivity: "2d ago",
    platform: "Meta",
  },
];

export const revenueSeries = [
  { day: "Mon", revenue: 4200, spend: 2100 },
  { day: "Tue", revenue: 5180, spend: 2680 },
  { day: "Wed", revenue: 4720, spend: 2410 },
  { day: "Thu", revenue: 6210, spend: 3120 },
  { day: "Fri", revenue: 7430, spend: 3580 },
  { day: "Sat", revenue: 6890, spend: 3320 },
  { day: "Sun", revenue: 8210, spend: 3940 },
];

export const accountStatusBreakdown = [
  { name: "Active", value: 42, color: "var(--color-success)" },
  { name: "Pending", value: 8, color: "var(--color-warning)" },
  { name: "Paused", value: 5, color: "var(--color-muted-foreground)" },
  { name: "Rejected", value: 3, color: "var(--color-destructive)" },
];

export type ActivityItem = {
  id: string;
  type: "topup" | "request" | "approval" | "alert";
  title: string;
  meta: string;
  time: string;
};

export const recentActivity: ActivityItem[] = [
  { id: "a1", type: "topup", title: "Top-up of $2,500 approved", meta: "Northwind Performance", time: "2m" },
  { id: "a2", type: "request", title: "New ad account request", meta: "Ember Coffee · Google", time: "1h" },
  { id: "a3", type: "approval", title: "Account approved", meta: "Atlas DTC — EU · TikTok", time: "3h" },
  { id: "a4", type: "alert", title: "Spend threshold reached", meta: "Quartz Finance", time: "5h" },
  { id: "a5", type: "topup", title: "Top-up of $1,200 pending", meta: "Helix Labs Growth", time: "yesterday" },
];

export type Client = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Owner" | "Manager" | "Analyst";
  status: "Active" | "Invited" | "Suspended";
  accounts: number;
  walletBalance: number;
};

export const clients: Client[] = [
  { id: "u1", name: "Sofia Martinez", email: "sofia@northwind.io", initials: "SM", role: "Owner", status: "Active", accounts: 4, walletBalance: 18240 },
  { id: "u2", name: "Daniel Kim", email: "dan@helixlabs.com", initials: "DK", role: "Manager", status: "Active", accounts: 2, walletBalance: 9220 },
  { id: "u3", name: "Priya Nair", email: "priya@lumen.co", initials: "PN", role: "Owner", status: "Invited", accounts: 1, walletBalance: 0 },
  { id: "u4", name: "Marco Rossi", email: "marco@atlasdtc.eu", initials: "MR", role: "Owner", status: "Active", accounts: 6, walletBalance: 41020 },
  { id: "u5", name: "Alicia Brooks", email: "alicia@quartzfin.com", initials: "AB", role: "Analyst", status: "Suspended", accounts: 1, walletBalance: 530 },
  { id: "u6", name: "Jonas Weber", email: "jonas@novaoutdoor.com", initials: "JW", role: "Manager", status: "Active", accounts: 3, walletBalance: 6740 },
  { id: "u7", name: "Riley Chen", email: "riley@embercoffee.co", initials: "RC", role: "Owner", status: "Invited", accounts: 0, walletBalance: 0 },
  { id: "u8", name: "Emma Hughes", email: "emma@tideline.com", initials: "EH", role: "Owner", status: "Suspended", accounts: 2, walletBalance: 0 },
];
