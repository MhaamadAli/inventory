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
} from "firebase/firestore";
import { Box, Typography } from "@mui/material";

interface InventoryItem {
  name: string;
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

  useEffect(() => {
    updateInventory();
  }, []);
  return (
    <Box>
      <Typography variant="h1">Inventory Management</Typography>
    </Box>
  );
}
