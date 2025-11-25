import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
    arrayUnion,
    Timestamp,
} from 'firebase/firestore';
import { firestore } from '../firebase';
import type { Announcement, AnnouncementView } from '../types';
import { formatAnnouncementDate } from '../utils/dateHelpers';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

export const createAnnouncement = async (
    title: string,
    content: string,
    author: string,
    authorPhotoURL?: string | null
): Promise<void> => {
    await addDoc(collection(firestore, ANNOUNCEMENTS_COLLECTION), {
        title,
        content,
        author,
        authorPhotoURL: authorPhotoURL || null,
        date: formatAnnouncementDate(new Date()),
        createdAt: Date.now(), // Using timestamp for expiration logic
        views: [],
    });
};

export const listenToAnnouncements = (
    callback: (announcements: Announcement[]) => void
) => {
    // 48 hours ago in milliseconds
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;

    const q = query(
        collection(firestore, ANNOUNCEMENTS_COLLECTION),
        where('createdAt', '>', fortyEightHoursAgo),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const announcements = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Announcement[];
        callback(announcements);
    });
};

export const addAnnouncementView = async (
    announcementId: string,
    view: AnnouncementView
): Promise<void> => {
    const announcementRef = doc(firestore, ANNOUNCEMENTS_COLLECTION, announcementId);
    await updateDoc(announcementRef, {
        views: arrayUnion(view),
    });
};