import firebaseAdmin from "src/firebaseAdmin";

// Utilities
import { mapEvent } from "src/utilities/event";
import { mapUser } from "src/utilities/user";

// Constants
import { DEFAULT_USERS_LIST_PAGE_SIZE } from "src/constants/other";
import { COLLECTIONS } from "src/constants/firebase";

export const getEventDetails = async (id) => {
  let event = null;

  try {
    const eventDoc = await firebaseAdmin
      .firestore()
      .collection("events")
      .doc(id)
      .get();

    if (eventDoc.exists) {
      const data = eventDoc.data();
      event = mapEvent({ id: eventDoc.id, ...data }, eventDoc);
    }

    return { event };
  } catch (error) {
    return { event, error };
  }
};

export const getEventUsers = async (
  id,
  limit = DEFAULT_USERS_LIST_PAGE_SIZE,
  page = 0
) => {
  let users = [];

  try {
    const eventDocRef = firebaseAdmin.firestore().collection("events").doc(id);

    let query = firebaseAdmin
      .firestore()
      .collection("event-responses")
      .where("event.ref", "==", eventDocRef)
      .where("response", "==", "YES");

    if (page > 0) {
      if (!pages[page]) {
        query = query.startAfter(pages[page - 1].last);
      } else {
        query = query.startAt(pages[page].first);
      }
    }

    const eventUsersSnapshot = await query.limit(limit).get();

    if (!eventUsersSnapshot.empty) {
      eventUsersSnapshot.forEach((doc) => {
        const data = doc.data();
        const user = mapUser({ id: data.user.id, ...data.user });
        users.push(user);
      });
    }

    return { users };
  } catch (error) {
    return { users, error };
  }
};

export const incrementEventPageViews = async (id) => {
  const eventRef = firebaseAdmin
    .firestore()
    .collection(COLLECTIONS.EVENTS)
    .doc(id);

  try {
    await eventRef.set(
      { pageViews: firebaseAdmin.firestore.FieldValue.increment(1) },
      { merge: true }
    );

    return { status: "success" };
  } catch (error) {
    return { status: "error", error };
  }
};
