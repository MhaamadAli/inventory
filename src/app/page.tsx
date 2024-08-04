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
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { User, onAuthStateChanged } from "firebase/auth";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";

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
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

interface InventoryItem {
  name: string;
  quantity?: number;
  dateAdded?: string;
  photoURL?: string;
  description?: string;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [open, setOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemPhotoURL, setItemPhotoURL] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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
      setFilteredInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addItem = async (
    item: string,
    description: string,
    photoURL: string
  ): Promise<void> => {
    if (!user) return;

    try {
      const docRef = doc(firestore, "inventory", item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const quantity = data?.quantity ?? 0;
        await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
      } else {
        const dateAdded = new Date().toISOString();
        await setDoc(docRef, { quantity: 1, description, photoURL, dateAdded });
      }

      await updateInventory();
      setItemDescription('');
      setItemName('');
      setItemPhotoURL('');
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
    setItemName("");
    setItemDescription("");
    setItemPhotoURL("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredInventory(filtered);
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setOpen(true);
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
            <Stack direction="row" spacing={2} marginTop={2}>
              <TextField
                variant="outlined"
                placeholder="Search items..."
                fullWidth
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />,
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpen}
              >
                Add New Item
              </Button>
            </Stack>
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
                {selectedItem ? (
                  <>
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h2"
                    >
                      {selectedItem.name}
                    </Typography>
                    <Typography>
                      Date Added: {selectedItem.dateAdded}
                    </Typography>
                    {selectedItem.photoURL && (
                      <img
                        src={selectedItem.photoURL}
                        alt={selectedItem.name}
                        style={{ maxWidth: "100%" }}
                      />
                    )}
                    <Typography>{selectedItem.description}</Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h2"
                    >
                      Add Item
                    </Typography>
                    <Stack width="100%" direction="column" spacing={2}>
                      <TextField
                        id="outlined-basic"
                        label="Item"
                        variant="outlined"
                        fullWidth
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                      />
                      <TextField
                        id="outlined-basic"
                        label="Description"
                        variant="outlined"
                        fullWidth
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                      />
                      <TextField
                        id="outlined-basic"
                        label="Photo URL"
                        variant="outlined"
                        fullWidth
                        value={itemPhotoURL}
                        onChange={(e) => setItemPhotoURL(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        onClick={() => {
                          addItem(itemName, itemDescription, itemPhotoURL);
                          handleClose();
                        }}
                      >
                        Add
                      </Button>
                    </Stack>
                  </>
                )}
              </Box>
            </Modal>
            <Box marginTop={2}>
              <Box
                width="100%"
                height="100px"
                bgcolor="#ADD8E6"
                display="flex"
                justifyContent="center"
                alignItems="center"
                borderRadius={1}
                boxShadow={3}
              >
                <Typography variant="h4" color="#333" textAlign="center">
                  Inventory Items
                </Typography>
              </Box>
              <Stack width="100%" spacing={2} padding={2}>
                {filteredInventory.map(
                  ({ name, quantity, dateAdded, photoURL, description }) => (
                    <Card
                      key={name}
                      variant="outlined"
                      sx={{ minWidth: 275, boxShadow: 3, borderRadius: 2 }}
                    >
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {name}
                        </Typography>
                        <Typography color="textSecondary">
                          Quantity: {quantity ?? 0}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<RemoveIcon />}
                          onClick={() => removeItem(name)}
                        >
                          Remove
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          startIcon={<DescriptionIcon />}
                          onClick={() =>
                            handleViewItem({
                              name,
                              quantity,
                              dateAdded,
                              photoURL,
                              description,
                            })
                          }
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  )
                )}
              </Stack>
            </Box>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}
