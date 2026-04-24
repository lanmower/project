import { db } from '../firebase';
import { collection, doc, query, QueryConstraint, onSnapshot } from 'firebase/firestore';
import { EventEmitter } from 'events';

export class BaseService<T extends { id: string }> extends EventEmitter {
  protected collectionName: string;

  constructor(collectionName: string) {
    super();
    this.collectionName = collectionName;
  }

  protected createQuery(constraints: QueryConstraint[] = []) {
    return query(collection(db, this.collectionName), ...constraints);
  }

  protected mapDocumentData<D>(doc: FirebaseFirestore.DocumentSnapshot): D {
    return {
      id: doc.id,
      ...doc.data()
    } as D;
  }

  public subscribe(callback: (items: T[]) => void, constraints: QueryConstraint[] = []) {
    const q = this.createQuery(constraints);
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => this.mapDocumentData<T>(doc));
      callback(items);
    });
  }

  public subscribeToOne(id: string, callback: (item: T | null) => void) {
    return onSnapshot(doc(db, this.collectionName, id), (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      callback(this.mapDocumentData<T>(snapshot));
    });
  }

  // Add more common CRUD operations
}
