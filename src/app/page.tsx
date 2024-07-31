"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  QuerySnapshot,
  DocumentData,
  deleteDoc,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Box, Typography } from "@mui/material";

interface InventoryItem {
  name: string;
  quantity?: number;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string[]>([]);

  const updateInventory = async (): Promise<void> => {
    try {
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(
        query(collection(firestore, "inventory"))
      );
      const inventoryList: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addItem = async (item: string): Promise<void> => {
    try {
      const docRef = doc(firestore, "inventory", item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const quantity = data?.quantity ?? 0;
        await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const removeItem = async (item: string): Promise<void> => {
    const docRef = doc(firestore, "inventory", item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const quantity = data?.quantity || 0;

      if (quantity <= 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { ...data, quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handlOpen = () => setOpen(true)
  const handlCloae = () => setOpen(false);
  
  return (
    <Box>
      <Typography variant="h1">Inventory Management</Typography>
      {inventory.map((item, index) => (
        <Box key={index}>
          <Typography variant="body1">{item.name}</Typography>
          <Typography variant="body2">{item.quantity}</Typography>
        </Box>
      ))}
    </Box>
  );
}
