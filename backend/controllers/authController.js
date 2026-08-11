import { FirebaseService } from "../services/firebaseService.js";

/**
 * Called after a client signs in with Firebase Authentication (Google SSO).
 * Ensures a corresponding Users document exists (first-time login = profile creation).
 */
export async function syncProfile(req, res, next) {
  try {
    const { uid, email, name } = req.user;
    const profile = await FirebaseService.upsertUser(uid, { email, displayName: name });
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.status(200).json({ user: req.user });
}
