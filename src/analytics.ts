// Analytics and tracking utilities for visitor count and paid purchases
import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const VISITOR_COLLECTION = "analytics/visitors/daily";
const PURCHASE_COLLECTION = "analytics/purchases/daily";

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
export async function trackVisitor(): Promise<number> {
  try {
    const today = getTodayDate();
    const visitorId = generateVisitorId();

    // Check if this is a new session (visitor hasn't been tracked yet)
    const sessionKey = `aws-quiz-session-${today}`;
    if (!localStorage.getItem(sessionKey)) {
      localStorage.setItem(sessionKey, visitorId);

      const docRef = doc(db, VISITOR_COLLECTION, today);
      const docSnap = await getDoc(docRef);

      let todayData: VisitorData;
      if (docSnap.exists()) {
        todayData = docSnap.data() as VisitorData;
        if (!todayData.visitors.includes(visitorId)) {
          todayData.visitors.push(visitorId);
          todayData.count = todayData.visitors.length;
        }
      } else {
        todayData = {
          date: today,
          count: 1,
          visitors: [visitorId],
        };
      }

      await setDoc(docRef, todayData);
    }

    // Return today's count
    const docRef = doc(db, VISITOR_COLLECTION, today);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as VisitorData).count : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Get today's visitor count
 */
export async function getTodayVisitorCount(): Promise<number> {
  try {
    const today = getTodayDate();
    const docRef = doc(db, VISITOR_COLLECTION, today);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as VisitorData).count : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Get total visitor count across all days
 */
export async function getTotalVisitorCount(): Promise<number> {
  try {
    const collectionRef = collection(db, VISITOR_COLLECTION);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.reduce((sum, doc) => sum + ((doc.data() as VisitorData).count || 0), 0);
  } catch (error) {
    return 0;
  }
}

/**
 * Record a paid purchase for today
 */
export async function recordPaidPurchase(amount?: number): Promise<number> {
  try {
    const today = getTodayDate();
    const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const docRef = doc(db, PURCHASE_COLLECTION, today);
    const docSnap = await getDoc(docRef);

    let todayData: PurchaseData;
    if (docSnap.exists()) {
      todayData = docSnap.data() as PurchaseData;
    } else {
      todayData = {
        date: today,
        count: 0,
        purchases: [],
      };
    }

    todayData.purchases.push({
      id: purchaseId,
      timestamp: Date.now(),
      amount,
    });

    todayData.count = todayData.purchases.length;
    await setDoc(docRef, todayData);

    return todayData.count;
  } catch (error) {
    return 0;
  }
}

/**
 * Get today's paid purchase count
 */
export async function getTodayPurchaseCount(): Promise<number> {
  try {
    const today = getTodayDate();
    const docRef = doc(db, PURCHASE_COLLECTION, today);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as PurchaseData).count : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Get all visitor history (for analytics)
 */
export async function getVisitorHistory() {
  try {
    const collectionRef = collection(db, VISITOR_COLLECTION);
    const snapshot = await getDocs(collectionRef);
    const data: Record<string, VisitorData> = {};
    snapshot.docs.forEach((doc) => {
      data[doc.id] = doc.data() as VisitorData;
    });
    return data;
  } catch (error) {
    return {};
  }
}

/**
 * Get all purchase history (for analytics)
 */
export async function getPurchaseHistory() {
  try {
    const collectionRef = collection(db, PURCHASE_COLLECTION);
    const snapshot = await getDocs(collectionRef);
    const data: Record<string, PurchaseData> = {};
    snapshot.docs.forEach((doc) => {
      data[doc.id] = doc.data() as PurchaseData;
    });
    return data;
  } catch (error) {
    return {};
  }
}

/**
 * Clear all analytics data (for testing/reset)
 */
export function clearAnalyticsData() {
  sessionStorage.removeItem(`aws-quiz-session-${getTodayDate()}`);
}

/**
 * 일별 방문자 데이터 (최근 30일)
 */
export async function getDailyVisitors() {
  try {
    const allData = await getVisitorHistory();
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
  } catch (error) {
    return [];
  }
}

/**
 * 주별 방문자 데이터 (최근 12주)
 */
export async function getWeeklyVisitors() {
  try {
    const allData = await getVisitorHistory();
    const result: Array<{ week: string; count: number }> = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (11 - i) * 7);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());

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
  } catch (error) {
    return [];
  }
}

/**
 * 월별 방문자 데이터 (올해 1월 ~ 12월)
 */
export async function getMonthlyVisitors() {
  try {
    const allData = await getVisitorHistory();
    const result: Array<{ month: string; count: number }> = [];
    const currentYear = new Date().getFullYear();

    for (let month = 0; month < 12; month++) {
      const monthStr = `${currentYear}-${String(month + 1).padStart(2, "0")}`;

      let monthCount = 0;
      Object.keys(allData).forEach((key) => {
        if (key.startsWith(monthStr)) {
          monthCount += allData[key]?.count || 0;
        }
      });

      result.push({ month: `${month + 1}월`, count: monthCount });
    }

    return result;
  } catch (error) {
    return [];
  }
}

/**
 * 특정 월의 일별 방문자 데이터
 */
export async function getDailyVisitorsForMonth(monthOffset: number) {
  try {
    const allData = await getVisitorHistory();
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
  } catch (error) {
    return [];
  }
}

/**
 * 특정 월의 주별 방문자 데이터
 */
export async function getWeeklyVisitorsForMonth(monthOffset: number) {
  try {
    const allData = await getVisitorHistory();
    const result: Array<{ week: string; count: number }> = [];

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let weekCount = 1;
    let currentDate = new Date(firstDay);

    // 첫 주의 시작일 (월요일부터)
    const firstDayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    currentDate = new Date(startDate);

    while (currentDate <= lastDay) {
      let count = 0;

      // 7일간 데이터 합산
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        count += allData[dateStr]?.count || 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 현재 월에 속하는 주만 표시
      if (weekCount <= 6) {
        result.push({ week: `W${weekCount}`, count });
        weekCount++;
      }
    }

    return result;
  } catch (error) {
    return [];
  }
}

/**
 * 특정 월의 특정 주의 일별 방문자 데이터 (weekIndex: 0~5)
 */
export async function getDailyVisitorsForWeek(monthOffset: number, weekIndex: number) {
  try {
    const allData = await getVisitorHistory();
    const result: Array<{ date: string; count: number }> = [];

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    // 요청된 주의 시작일
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(weekStartDate.getDate() + weekIndex * 7);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];
      const count = allData[dateStr]?.count || 0;
      const dayName = dayNames[currentDate.getDay()];

      result.push({ date: dayName, count });
    }

    return result;
  } catch (error) {
    return [];
  }
}
