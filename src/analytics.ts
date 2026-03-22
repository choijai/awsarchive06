// Analytics and tracking utilities for visitor count and paid purchases

const VISITOR_STORAGE_KEY = "aws-quiz-visitors";
const PURCHASE_STORAGE_KEY = "aws-quiz-purchases";

interface VisitorData {
  date: string; // YYYY-MM-DD
  count: number;
  visitors: string[]; // Array of visitor IDs
}

interface PurchaseData {
  date: string; // YYYY-MM-DD
  count: number;
  purchases: Array<{
    id: string;
    timestamp: number;
    amount?: number;
  }>;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

/**
 * Generate a unique visitor ID (combination of timestamp and random)
 */
function generateVisitorId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track today's visitor - returns today's visitor count
 */
export function trackVisitor(): number {
  const today = getTodayDate();
  const visitorId = generateVisitorId();

  // Check if this is a new session (visitor hasn't been tracked yet)
  const sessionKey = `aws-quiz-session-${today}`;
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, visitorId);

    // Retrieve all visitor data
    const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");

    // Get or create today's visitor data
    let todayData: VisitorData = allData[today] || {
      date: today,
      count: 0,
      visitors: [],
    };

    // Add new visitor
    todayData.visitors = todayData.visitors || [];
    if (!todayData.visitors.includes(visitorId)) {
      todayData.visitors.push(visitorId);
      todayData.count = todayData.visitors.length;
    }

    allData[today] = todayData;
    localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(allData));
  }

  // Return today's count
  const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
  const todayData = allData[today];
  return todayData ? todayData.count : 0;
}

/**
 * Get today's visitor count
 */
export function getTodayVisitorCount(): number {
  const today = getTodayDate();
  const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
  const todayData = allData[today];
  return todayData ? todayData.count : 0;
}

/**
 * Get total visitor count across all days
 */
export function getTotalVisitorCount(): number {
  const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
  return Object.values(allData).reduce((sum: number, day: any) => sum + (day.count || 0), 0);
}

/**
 * Record a paid purchase for today
 */
export function recordPaidPurchase(amount?: number): number {
  const today = getTodayDate();
  const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const allData = JSON.parse(localStorage.getItem(PURCHASE_STORAGE_KEY) || "{}");

  let todayData: PurchaseData = allData[today] || {
    date: today,
    count: 0,
    purchases: [],
  };

  todayData.purchases.push({
    id: purchaseId,
    timestamp: Date.now(),
    amount,
  });

  todayData.count = todayData.purchases.length;
  allData[today] = todayData;
  localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(allData));

  return todayData.count;
}

/**
 * Get today's paid purchase count
 */
export function getTodayPurchaseCount(): number {
  const today = getTodayDate();
  const allData = JSON.parse(localStorage.getItem(PURCHASE_STORAGE_KEY) || "{}");
  const todayData = allData[today];
  return todayData ? todayData.count : 0;
}

/**
 * Get all visitor history (for analytics)
 */
export function getVisitorHistory() {
  return JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
}

/**
 * Get all purchase history (for analytics)
 */
export function getPurchaseHistory() {
  return JSON.parse(localStorage.getItem(PURCHASE_STORAGE_KEY) || "{}");
}

/**
 * Clear all analytics data (for testing/reset)
 */
export function clearAnalyticsData() {
  localStorage.removeItem(VISITOR_STORAGE_KEY);
  localStorage.removeItem(PURCHASE_STORAGE_KEY);
  sessionStorage.removeItem(`aws-quiz-session-${getTodayDate()}`);
}

/**
 * 일별 방문자 데이터 (최근 30일)
 */
export function getDailyVisitors() {
  const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
  const result: Array<{ date: string; count: number }> = [];

  // 최근 30일의 데이터
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const count = allData[dateStr]?.count || 0;
    result.push({ date: (30 - i).toString(), count });
  }

  return result;
}

/**
 * 주별 방문자 데이터 (최근 12주)
 */
export function getWeeklyVisitors() {
  const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
  const result: Array<{ week: string; count: number }> = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * 7);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekStr = weekStart.toISOString().split("T")[0];

    let weekCount = 0;
    for (let j = 0; j < 7; j++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + j);
      const dayStr = dayDate.toISOString().split("T")[0];
      weekCount += allData[dayStr]?.count || 0;
    }

    result.push({ week: `W${i + 1}`, count: weekCount });
  }

  return result;
}

/**
 * 월별 방문자 데이터 (최근 12개월)
 */
export function getMonthlyVisitors() {
  const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
  const result: Array<{ month: string; count: number }> = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const monthStr = date.toISOString().slice(0, 7);
    const monthNum = new Date(monthStr + "-01").getMonth() + 1;

    let monthCount = 0;
    Object.keys(allData).forEach((key) => {
      if (key.startsWith(monthStr)) {
        monthCount += allData[key]?.count || 0;
      }
    });

    result.push({ month: `${monthNum}월`, count: monthCount });
  }

  return result;
}

/**
 * 특정 월의 일별 방문자 데이터
 */
export function getDailyVisitorsForMonth(monthOffset: number) {
  const allData = JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || "{}");
  const result: Array<{ date: string; count: number }> = [];

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() - monthOffset);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];
    const count = allData[dateStr]?.count || 0;
    result.push({ date: day.toString(), count });
  }

  return result;
}
