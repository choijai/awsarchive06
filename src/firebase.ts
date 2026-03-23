import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getBytes
} from "firebase/storage";

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 관리자 UID (환경변수에서 가져오기)
export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "";

// 로컬 저장소에 세션 유지
setPersistence(auth, browserLocalPersistence);

// ===== 인증 함수 =====

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUp(email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error("로그아웃에 실패했습니다");
  }
}

/**
 * 현재 로그인 사용자 가져오기
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * 인증 상태 감시
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Google로 로그인/회원가입
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
}

/**
 * Firebase 에러 메시지 한글화
 */
function getErrorMessage(errorCode: string): string {
  const errors: Record<string, string> = {
    "auth/email-already-in-use": "이미 가입된 이메일입니다",
    "auth/invalid-email": "유효하지 않은 이메일입니다",
    "auth/weak-password": "비밀번호는 6자 이상이어야 합니다",
    "auth/user-not-found": "등록되지 않은 이메일입니다",
    "auth/wrong-password": "비밀번호가 잘못되었습니다",
    "auth/invalid-login-credentials": "이메일 또는 비밀번호가 잘못되었습니다",
    "auth/too-many-requests": "너무 많은 시도가 있었습니다. 나중에 다시 시도해주세요",
  };

  return errors[errorCode] || "인증에 실패했습니다. 다시 시도해주세요";
}

// ===== Firestore 함수 =====

/**
 * 사용자의 연속 방문 일수를 Firestore에서 가져오기 및 업데이트
 */
export async function updateStreakInFirebase(userStatus: string = "guest"): Promise<number> {
  try {
    // 최대 3초까지 auth.currentUser가 설정될 때까지 기다리기
    let user = auth.currentUser;
    let retries = 0;
    while (!user && retries < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      user = auth.currentUser;
      retries++;
    }

    if (!user) throw new Error("사용자가 로그인하지 않았습니다");

    const userId = user.uid;
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    const today = new Date().toISOString().split("T")[0];
    const lastVisitDate = userDoc.exists() ? userDoc.data()?.lastVisitDate : null;
    let streak = userDoc.exists() ? (userDoc.data()?.streak || 0) : 0;

    if (lastVisitDate === today) {
      // 오늘 이미 방문함 - streak 유지
      return streak;
    }

    if (lastVisitDate) {
      const lastDate = new Date(lastVisitDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 어제 방문했으므로 카운트 증가
        streak += 1;
      } else if (diffDays > 1) {
        // 2일 이상 지났으므로 리셋
        streak = 1;
      }
    } else {
      // 첫 방문
      streak = 1;
    }

    // Firestore에 업데이트
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        streak,
        lastVisitDate: today,
        userStatus,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
        streak,
        lastVisitDate: today,
        userStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return streak;
  } catch (error) {
    console.error("연속 방문 일수 업데이트 실패:", error);
    return 0;
  }
}

/**
 * 사용자의 연속 방문 일수를 Firestore에서 가져오기
 */
export async function getStreakFromFirebase(userId: string): Promise<number> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data()?.streak || 0) : 0;
  } catch (error) {
    console.error("연속 방문 일수 조회 실패:", error);
    return 0;
  }
}

/**
 * 관리자 통계: 사용자 상태별 집계
 */
export async function getAdminStats(): Promise<{
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
}> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    let paidCount = 0;
    let freeCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const status = data.userStatus || "guest";
      if (status === "paid") {
        paidCount++;
      } else if (status === "loggedIn") {
        freeCount++;
      }
    });

    return {
      totalUsers: snapshot.size,
      paidUsers: paidCount,
      freeUsers: freeCount
    };
  } catch (error) {
    console.error("관리자 통계 조회 실패:", error);
    return {
      totalUsers: 0,
      paidUsers: 0,
      freeUsers: 0
    };
  }
}

// ===== 퀴즈 통계 함수 =====

/**
 * 퀴즈 결과 저장 (전체 문제 객체 포함)
 */
export async function recordQuizResult(
  userId: string,
  problem: any,
  selectedAnswer: string,
  difficulty: "medium" | "hard" | "challenge"
): Promise<string> {
  try {
    const isCorrect = selectedAnswer === problem.answer;
    const resultsRef = collection(db, "users", userId, "quizResults");
    const sessionId = `${Date.now()}`; // 생성 세션 ID

    const docRef = await addDoc(resultsRef, {
      sessionId, // 같은 시간대 생성 문제들 그룹화
      fullProblem: problem, // 전체 문제 객체 저장
      question: problem.question,
      correctAnswer: problem.answer,
      selectedAnswer,
      isCorrect,
      difficulty,
      createdAt: new Date().toISOString(),
      timestamp: new Date().getTime()
    });

    return sessionId;
  } catch (error) {
    console.error("퀴즈 결과 저장 실패:", error);
    throw error;
  }
}

/**
 * 사용자의 퀴즈 통계 조회
 */
export async function getUserQuizStats(userId: string): Promise<{
  totalAttempts: number;
  correctCount: number;
  accuracy: number;
  byDifficulty: {
    medium: { total: number; correct: number; accuracy: number };
    hard: { total: number; correct: number; accuracy: number };
    challenge: { total: number; correct: number; accuracy: number };
  };
}> {
  try {
    const resultsRef = collection(db, "users", userId, "quizResults");
    const snapshot = await getDocs(resultsRef);

    let totalAttempts = 0;
    let correctCount = 0;
    const byDifficulty = {
      medium: { total: 0, correct: 0, accuracy: 0 },
      hard: { total: 0, correct: 0, accuracy: 0 },
      challenge: { total: 0, correct: 0, accuracy: 0 }
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      const difficulty = data.difficulty as "medium" | "hard" | "challenge";
      const isCorrect = data.isCorrect === true;

      totalAttempts++;
      if (isCorrect) correctCount++;

      byDifficulty[difficulty].total++;
      if (isCorrect) byDifficulty[difficulty].correct++;
    });

    // 정확도 계산
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    byDifficulty.medium.accuracy = byDifficulty.medium.total > 0
      ? Math.round((byDifficulty.medium.correct / byDifficulty.medium.total) * 100)
      : 0;
    byDifficulty.hard.accuracy = byDifficulty.hard.total > 0
      ? Math.round((byDifficulty.hard.correct / byDifficulty.hard.total) * 100)
      : 0;
    byDifficulty.challenge.accuracy = byDifficulty.challenge.total > 0
      ? Math.round((byDifficulty.challenge.correct / byDifficulty.challenge.total) * 100)
      : 0;

    return {
      totalAttempts,
      correctCount,
      accuracy,
      byDifficulty
    };
  } catch (error) {
    console.error("퀴즈 통계 조회 실패:", error);
    return {
      totalAttempts: 0,
      correctCount: 0,
      accuracy: 0,
      byDifficulty: {
        medium: { total: 0, correct: 0, accuracy: 0 },
        hard: { total: 0, correct: 0, accuracy: 0 },
        challenge: { total: 0, correct: 0, accuracy: 0 }
      }
    };
  }
}

/**
 * 사용자의 생성 세션별 문제 목록 조회
 */
export async function getUserProblemSessions(userId: string): Promise<Array<{
  date: string;
  time: string;
  problemCount: number;
  difficulty: string;
  problems: any[];
  sessionTimestamp: number;
}>> {
  try {
    const resultsRef = collection(db, "users", userId, "quizResults");
    const snapshot = await getDocs(resultsRef);

    // sessionId별로 그룹화
    const sessionMap = new Map<string, any[]>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const sessionId = data.sessionId;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, []);
      }
      sessionMap.get(sessionId)!.push({
        ...data,
        docId: doc.id
      });
    });

    // 날짜/시간별로 포맷
    const sessions = Array.from(sessionMap.entries()).map(([sessionId, problems]) => {
      const timestamp = problems[0].timestamp;
      const date = new Date(timestamp);
      const dateStr = date.toLocaleDateString("ko-KR");
      const timeStr = date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

      return {
        date: dateStr,
        time: timeStr,
        problemCount: problems.length,
        difficulty: problems[0].difficulty,
        problems: problems.map(p => p.fullProblem),
        sessionTimestamp: timestamp
      };
    });

    // 최신순 정렬
    return sessions.sort((a, b) => b.sessionTimestamp - a.sessionTimestamp);
  } catch (error) {
    console.error("세션 조회 실패:", error);
    return [];
  }
}

/**
 * PDF 파일을 Cloud Storage에 업로드
 */
export async function uploadPDFToStorage(
  userId: string,
  pdfBlob: Blob,
  sessionDate: string,
  sessionTime: string
): Promise<string> {
  try {
    const fileName = `${sessionDate.replace(/\//g, '-')}_${sessionTime.replace(/:/g, '-')}.pdf`;
    const filePath = `users/${userId}/pdfs/${fileName}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, pdfBlob);
    return filePath;
  } catch (error) {
    console.error("PDF 업로드 실패:", error);
    throw error;
  }
}
