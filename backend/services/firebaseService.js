import { db } from "../config/firebaseAdmin.js";
import { ApiError } from "../middleware/errorHandler.js";
import admin from "../config/firebaseAdmin.js";

function ensureDb() {
  if (!db) {
    throw new ApiError(500, "Internal Error", "Firestore is not configured on the server.");
  }
  return db;
}

const COLLECTIONS = {
  USERS: "users",
  WATCHLIST_ITEMS: "watchlistItems",
  REVIEWS: "reviews",
  FRIEND_CONNECTIONS: "friendConnections",
};

export const FirebaseService = {
  COLLECTIONS,

  // ---------- Users ----------
  async upsertUser(uid, { email, displayName }) {
    const database = ensureDb();
    const ref = database.collection(COLLECTIONS.USERS).doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        userId: uid,
        email,
        displayName: displayName || email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    return (await ref.get()).data();
  },

  // ---------- Watchlist ----------
  async getWatchlist(userId) {
    const database = ensureDb();
    const snap = await database
      .collection(COLLECTIONS.WATCHLIST_ITEMS)
      .where("userId", "==", userId)
      .orderBy("dateAdded", "desc")
      .get();
    return snap.docs.map((d) => ({ itemId: d.id, ...d.data() }));
  },

  async addWatchlistItem(userId, { movieId, status = "Plan to Watch" }) {
    const database = ensureDb();
    const ref = await database.collection(COLLECTIONS.WATCHLIST_ITEMS).add({
      userId,
      movieId,
      status,
      dateAdded: admin.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  },

  async updateWatchlistItem(userId, itemId, updates) {
    const database = ensureDb();
    const ref = database.collection(COLLECTIONS.WATCHLIST_ITEMS).doc(itemId);
    const snap = await ref.get();
    if (!snap.exists) throw new ApiError(404, "Not Found", "Watchlist item does not exist.");
    if (snap.data().userId !== userId) {
      throw new ApiError(401, "Unauthorized", "You may only modify your own watchlist.");
    }
    await ref.update(updates);
    return { itemId, ...snap.data(), ...updates };
  },

  async deleteWatchlistItem(userId, itemId) {
    const database = ensureDb();
    const ref = database.collection(COLLECTIONS.WATCHLIST_ITEMS).doc(itemId);
    const snap = await ref.get();
    if (!snap.exists) throw new ApiError(404, "Not Found", "Watchlist item does not exist.");
    if (snap.data().userId !== userId) {
      throw new ApiError(401, "Unauthorized", "You may only modify your own watchlist.");
    }
    await ref.delete();
  },

  // ---------- Reviews ----------
  async addReview(userId, { movieId, rating, comment }) {
    const database = ensureDb();
    const ref = await database.collection(COLLECTIONS.REVIEWS).add({
      userId,
      movieId,
      rating,
      comment,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  },

  async getUserReviews(userId) {
    const database = ensureDb();
    const snap = await database
      .collection(COLLECTIONS.REVIEWS)
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();
    return snap.docs.map((d) => ({ reviewId: d.id, ...d.data() }));
  },

  // ---------- Friend connections ----------
  async getFriendIds(userId) {
    const database = ensureDb();
    const [asOne, asTwo] = await Promise.all([
      database
        .collection(COLLECTIONS.FRIEND_CONNECTIONS)
        .where("userOneId", "==", userId)
        .where("status", "==", "Accepted")
        .get(),
      database
        .collection(COLLECTIONS.FRIEND_CONNECTIONS)
        .where("userTwoId", "==", userId)
        .where("status", "==", "Accepted")
        .get(),
    ]);
    const ids = new Set();
    asOne.docs.forEach((d) => ids.add(d.data().userTwoId));
    asTwo.docs.forEach((d) => ids.add(d.data().userOneId));
    return [...ids];
  },

  async requestFriend(userOneId, userTwoId) {
    const database = ensureDb();
    const ref = await database.collection(COLLECTIONS.FRIEND_CONNECTIONS).add({
      userOneId,
      userTwoId,
      status: "Pending",
    });
    return ref.id;
  },

  async respondToFriendRequest(connectionId, accept) {
    const database = ensureDb();
    const ref = database.collection(COLLECTIONS.FRIEND_CONNECTIONS).doc(connectionId);
    await ref.update({ status: accept ? "Accepted" : "Declined" });
  },

  // ---------- Social activity feed (recent-only, per design review) ----------
  async getRecentActivity(friendIds, sinceDate) {
    const database = ensureDb();
    if (friendIds.length === 0) return [];

    // Firestore 'in' queries are capped at 30 values; chunk if needed.
    const chunks = [];
    for (let i = 0; i < friendIds.length; i += 30) chunks.push(friendIds.slice(i, i + 30));

    const results = await Promise.all(
      chunks.map((chunk) =>
        database
          .collection(COLLECTIONS.REVIEWS)
          .where("userId", "in", chunk)
          .where("timestamp", ">=", sinceDate)
          .orderBy("timestamp", "desc")
          .get()
      )
    );

    return results.flatMap((snap) => snap.docs.map((d) => ({ activityId: d.id, actionType: "REVIEW_ADDED", ...d.data() })));
  },
};
