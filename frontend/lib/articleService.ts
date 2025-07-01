import { db } from './firebase';
import { collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

export interface Article {
  id?: string;
  title: string;
  content: string;
  keywords: string;
  contentType: string;
  tone: string;
  targetAudience: string;
  createdAt: Timestamp;
}

export const saveArticle = async (article: Omit<Article, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'articles'), {
      ...article,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  }
};

export const getArticles = async (): Promise<Article[]> => {
  try {
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article));
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};