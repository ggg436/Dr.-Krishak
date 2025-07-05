import { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type Item = {
  id: string;
  text: string;
  createdAt: any;
};

export default function FirestoreDemo() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");
  const [editItem, setEditItem] = useState<{ id: string, text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      
      const itemsQuery = query(collection(db, "items"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(itemsQuery);
      
      const fetchedItems: Item[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as Item);
      });
      
      setItems(fetchedItems);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    
    try {
      setError("");
      const docRef = await addDoc(collection(db, "items"), {
        text: newItem,
        createdAt: new Date()
      });
      
      setItems([{ id: docRef.id, text: newItem, createdAt: new Date() }, ...items]);
      setNewItem("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const startEdit = (item: Item) => {
    setEditItem({ id: item.id, text: item.text });
  };

  const cancelEdit = () => {
    setEditItem(null);
  };

  const saveEdit = async () => {
    if (!editItem || !editItem.text.trim()) return;
    
    try {
      setError("");
      const docRef = doc(db, "items", editItem.id);
      await updateDoc(docRef, {
        text: editItem.text
      });
      
      setItems(items.map(item => 
        item.id === editItem.id ? { ...item, text: editItem.text } : item
      ));
      
      setEditItem(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setError("");
      await deleteDoc(doc(db, "items", id));
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Firestore CRUD Demo</CardTitle>
        <CardDescription>Add, edit and delete items from Firestore database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter new item" 
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem}>Add</Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-red-500 py-4">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-4">No items yet. Add some!</div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
                {editItem && editItem.id === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      value={editItem.text} 
                      onChange={(e) => setEditItem({...editItem, text: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <Button size="sm" onClick={saveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1">{item.text}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>Delete</Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
} 