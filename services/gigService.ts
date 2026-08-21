import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { Gig } from '../types/gig';

const GIGS_COLLECTION = 'gigs';

/**
 * Fetch all gigs that are currently 'open'.
 */
export async function fetchOpenGigs(): Promise<Gig[]> {
  try {
    const gigsRef = collection(db, GIGS_COLLECTION);
    // Attempt query with status == 'open'
    const q = query(
      gigsRef,
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const gigs: Gig[] = [];

    snapshot.forEach((docSnap) => {
      gigs.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Gig, 'id'>),
      });
    });

    return gigs;
  } catch (error: any) {
    // If composite index error occurs or sorting fails, fallback to simple where query
    console.warn('Fallback to basic query without orderBy:', error?.message);
    try {
      const gigsRef = collection(db, GIGS_COLLECTION);
      const q = query(gigsRef, where('status', '==', 'open'));
      const snapshot = await getDocs(q);
      const gigs: Gig[] = [];

      snapshot.forEach((docSnap) => {
        gigs.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Gig, 'id'>),
        });
      });

      // Sort client-side by createdAt if available
      return gigs.sort((a, b) => {
        const timeA = a.createdAt?.seconds ?? 0;
        const timeB = b.createdAt?.seconds ?? 0;
        return timeB - timeA;
      });
    } catch (fallbackError) {
      console.error('Error fetching open gigs:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Fetch a single gig by ID.
 */
export async function getGigById(id: string): Promise<Gig | null> {
  try {
    const docRef = doc(db, GIGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...(docSnap.data() as Omit<Gig, 'id'>),
    };
  } catch (error) {
    console.error(`Error fetching gig with id ${id}:`, error);
    throw error;
  }
}

/**
 * Apply for a gig.
 */
export async function applyForGig(
  gigId: string,
  applicantId: string,
  applicantName: string,
  applicantEmail: string,
  coverMessage: string
): Promise<void> {
  try {
    // 1. Add application record
    await addDoc(collection(db, 'applications'), {
      gigId,
      applicantId,
      applicantName,
      applicantEmail,
      coverMessage,
      status: 'pending',
      appliedAt: serverTimestamp(),
    });

    // 2. Increment applicant counter on the gig
    const gigRef = doc(db, GIGS_COLLECTION, gigId);
    await updateDoc(gigRef, {
      applicantsCount: increment(1),
    });
  } catch (error) {
    console.error('Error applying for gig:', error);
    throw error;
  }
}

/**
 * Helper to seed sample open gigs for testing and demonstration.
 */
export async function seedSampleGigs(): Promise<void> {
  const sampleGigs: Omit<Gig, 'id'>[] = [
    {
      title: 'Design a Modern Brand Logo & Social Kit',
      description:
        'Looking for a creative youth designer to create a vibrant, modern logo and 3 social media post templates for our eco-friendly apparel startup.',
      category: 'Design & Creative',
      budget: 150,
      budgetType: 'fixed',
      location: 'Remote',
      isRemote: true,
      clientName: 'GreenVibe Studio',
      clientId: 'client_sample_1',
      clientRating: 4.9,
      status: 'open',
      tags: ['Figma', 'Illustrator', 'Branding', 'Social Media'],
      deadline: '5 days left',
      duration: 'Est. 10 hours',
      applicantsCount: 3,
      createdAt: serverTimestamp(),
    },
    {
      title: 'Build Mobile Landing Page in React Native / Expo',
      description:
        'We need a clean, responsive landing screen built for our new student marketplace. Design provided in Figma with clear component hierarchy.',
      category: 'Tech & Coding',
      budget: 280,
      budgetType: 'fixed',
      location: 'Remote',
      isRemote: true,
      clientName: 'CampusHive Tech',
      clientId: 'client_sample_2',
      clientRating: 5.0,
      status: 'open',
      tags: ['React Native', 'Expo', 'TypeScript', 'Frontend'],
      deadline: '1 week left',
      duration: 'Est. 15 hours',
      applicantsCount: 5,
      createdAt: serverTimestamp(),
    },
    {
      title: 'Weekend Event Assistant & Registration Host',
      description:
        'Energetic youth needed to help manage attendee check-ins, distribute welcome badges, and assist speakers during a Saturday Tech Summit.',
      category: 'Events & Hospitality',
      budget: 25,
      budgetType: 'hourly',
      location: 'Downtown City Center',
      isRemote: false,
      clientName: 'Innovate Summit 2026',
      clientId: 'client_sample_3',
      clientRating: 4.8,
      status: 'open',
      tags: ['Event Host', 'Customer Service', 'On-Site', 'Weekend'],
      deadline: 'Starts this Saturday',
      duration: '8 hours',
      applicantsCount: 7,
      createdAt: serverTimestamp(),
    },
    {
      title: 'High School Math & Physics Tutor',
      description:
        'Seeking an enthusiastic tutor to help a Grade 11 student prepare for upcoming algebra and mechanics exams. 2 sessions per week via Zoom.',
      category: 'Tutoring & Teaching',
      budget: 30,
      budgetType: 'hourly',
      location: 'Remote / Online',
      isRemote: true,
      clientName: 'Sarah Jenkins',
      clientId: 'client_sample_4',
      clientRating: 4.95,
      status: 'open',
      tags: ['Math', 'Physics', 'Tutoring', 'Zoom'],
      deadline: 'Immediate start',
      duration: '2 hrs/week',
      applicantsCount: 2,
      createdAt: serverTimestamp(),
    },
    {
      title: 'TikTok & Reels Content Creator / Video Editor',
      description:
        'Help us shoot and edit 5 short-form TikTok/Reels showcasing cool student study hacks and productivity tips. Fun, fast-paced project!',
      category: 'Photo & Video',
      budget: 200,
      budgetType: 'fixed',
      location: 'Remote',
      isRemote: true,
      clientName: 'StudySpark Media',
      clientId: 'client_sample_5',
      clientRating: 4.7,
      status: 'open',
      tags: ['CapCut', 'Premiere', 'TikTok', 'Video Editing'],
      deadline: '3 days left',
      duration: 'Est. 8 hours',
      applicantsCount: 6,
      createdAt: serverTimestamp(),
    },
    {
      title: 'Write 4 SEO Blog Posts on Youth Career Tips',
      description:
        'Write engaging 800-word articles offering actionable interview and resume tips for young first-time job seekers.',
      category: 'Writing & Translation',
      budget: 120,
      budgetType: 'fixed',
      location: 'Remote',
      isRemote: true,
      clientName: 'YouthForward Blog',
      clientId: 'client_sample_6',
      clientRating: 5.0,
      status: 'open',
      tags: ['Copywriting', 'SEO', 'Blog', 'Career'],
      deadline: '4 days left',
      duration: 'Est. 6 hours',
      applicantsCount: 1,
      createdAt: serverTimestamp(),
    },
  ];

  const gigsRef = collection(db, GIGS_COLLECTION);
  for (const gigData of sampleGigs) {
    await addDoc(gigsRef, gigData);
  }
}
