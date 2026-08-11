import { auth } from "../config/firebaseAdmin.js";
import { ApiError } from "./errorHandler.js";

/**
 * Verifies the Firebase ID token sent in the Authorization header:
 *   Authorization: Bearer <FIREBASE_ID_TOKEN>
 * On success, attaches req.user = { uid, email, name, picture }
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Unauthorized", "Missing or malformed Authorization header.");
    }

    if (!auth) {
      throw new ApiError(500, "Internal Error", "Firebase Admin SDK is not configured on the server.");
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, "Unauthorized", "Firebase authentication token has expired or is invalid."));
  }
}

/**
 * Authorization helper: ensures the authenticated user owns the resource
 * identified by `resourceUserId` (e.g. a document's userId field).
 */
export function assertOwnsResource(req, resourceUserId) {
  if (!req.user || req.user.uid !== resourceUserId) {
    throw new ApiError(401, "Unauthorized", "You do not have permission to access this resource.");
  }
}
