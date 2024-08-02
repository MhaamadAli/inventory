"use client";

import { useState, useEffect } from "react";
import { firestore, signInWithGoogle, signOutUser, auth } from "../../firebase";
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
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Container,
} from "@mui/material";
import { User, onAuthStateChanged } from "firebase/auth";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";

interface InventoryItem {
  name: string;
  quantity?: number;
}

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        updateInventory();
      }
    });
    return () => unsubscribe();
  }, []);

  const updateInventory = async (): Promise<void> => {
    if (!user) return;

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
    if (!user) return;

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
    if (!user) return;

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

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName(""); // Reset item name when closing the modal
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Inventory Management
          </Typography>
          {!user ? (
            <Button color="inherit" onClick={signInWithGoogle}>
              Sign in with Google
            </Button>
          ) : (
            <Button color="inherit" onClick={signOutUser}>
              Sign Out
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        {user && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
              style={{ margin: "20px 0" }}
            >
              Add New Item
            </Button>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  padding: 2,
                  backgroundColor: "white",
                  borderRadius: 1,
                  maxWidth: 500,
                  margin: "auto",
                  marginTop: "20vh",
                }}
              >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Add Item
                </Typography>
                <Stack width="100%" direction="row" spacing={2}>
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(itemName);
                      handleClose();
                    }}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            </Modal>
            <Box border="1px solid #333" overflow="auto" marginTop={2}>
              <Box
                width="100%"
                height="100px"
                bgcolor="#ADD8E6"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Typography variant="h4" color="#333" textAlign="center">
                  Inventory Items
                </Typography>
              </Box>
              <Stack width="100%" spacing={2} padding={2}>
                {inventory.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    width="100%"
                    minHeight="100px"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    bgcolor="#f0f0f0"
                    paddingX={5}
                  >
                    <Typography variant="h6" color="#333" textAlign="center">
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="h6" color="#333" textAlign="center">
                      Quantity: {quantity}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => removeItem(name)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}
