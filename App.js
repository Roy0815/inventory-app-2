import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StatusBar,
  StyleSheet,
  Appearance,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MatIcons from "react-native-vector-icons/MaterialCommunityIcons";

//Toast notifications
import { RootSiblingParent } from "react-native-root-siblings";
import Toast from "react-native-root-toast";

const colorScheme = Appearance.getColorScheme();

const Item = ({ name, inventory, onInventoryChange, onDelete }) => {
  return (
    <View style={styles.item}>
      <View style={styles.itemViewText}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemInventory}>Inventory: {inventory}</Text>
      </View>
      <View style={styles.itemViewButtons}>
        <MatIcons.Button
          name="delete-outline"
          onPress={onDelete}
          style={styles.deleteItemButton}
        >
          Delete item
        </MatIcons.Button>
        <View style={styles.inventoryButtonView}>
          <MatIcons.Button
            name="minus-thick"
            onPress={() => onInventoryChange(-1)}
            //backgroundColor="black"
            style={styles.inventoryButton}
            iconStyle={styles.inventoryButtonIcon}
          />
          <MatIcons.Button
            name="plus-thick"
            onPress={() => onInventoryChange(1)}
            backgroundColor="black"
            style={styles.inventoryButton}
            iconStyle={styles.inventoryButtonIcon}
          />
        </View>
      </View>
    </View>
  );
};

const App = () => {
  //----------------------------------------------------------------//
  //CODE
  //----------------------------------------------------------------//
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [sorted, setSorted] = useState({ name: "initial" });
  const sortOptions = [
    { idx: 0, name: "unsorted" },
    { idx: 1, name: "ascending" },
    { idx: 2, name: "descending" },
  ];

  const displayItems = useMemo(() => {
    //unsorted
    let tmpDisplayItems = [...items];

    //sorted items
    if (sorted.name != "unsorted") {
      tmpDisplayItems.sort((a, b) => {
        if (a.inventory == b.inventory) return a.name < b.name ? -1 : 1;
        else
          return sorted.name == "ascending"
            ? a.inventory - b.inventory
            : b.inventory - a.inventory;
      });
    }

    //filter
    if (itemName != "")
      tmpDisplayItems = tmpDisplayItems.filter((item) =>
        item.name.toLowerCase().includes(itemName.toLocaleLowerCase())
      );

    return tmpDisplayItems;
  }, [sorted, itemName, items.length]);

  //----------------------------------------------------------------//
  //FUNCTIONS
  //----------------------------------------------------------------//
  async function loadItems() {
    try {
      const storedItems = await AsyncStorage.getItem("items");
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      //set sorted to initialize items
      setSorted({ idx: 0, name: "unsorted" });
    } catch (error) {
      console.log(error);
    }
  }

  async function saveItems(itemArr) {
    setItems(itemArr);
    try {
      await AsyncStorage.setItem("items", JSON.stringify(itemArr));
    } catch (error) {
      console.log(error);
    }
  }

  function handleInventoryChange(index, change) {
    const updatedItems = [...items];

    let idx = updatedItems.findIndex(
      (element) => element.name == displayItems[index].name
    );

    if (idx != -1) {
      updatedItems[idx].inventory += change;
      if (updatedItems[idx].inventory < 0) updatedItems[idx].inventory = 0;
    }

    saveItems(updatedItems);
  }

  function handleAddItem() {
    if (itemName == "") {
      Toast.show("Enter item name");
      return;
    }
    setSorted(sortOptions[0]);
    const updatedItems = [...items, { name: itemName, inventory: 0 }];
    updatedItems.sort((a, b) => (a.name < b.name ? -1 : 1));
    setItemName("");
    saveItems(updatedItems);
  }

  function handleDeleteItem(index) {
    const updatedItems = [...items];

    let idx = updatedItems.findIndex(
      (element) => element.name == displayItems[index].name
    );
    updatedItems.splice(idx, 1);

    saveItems(updatedItems);
  }

  function handleSort() {
    let newSortIndex = sorted.idx == 2 ? 0 : sorted.idx + 1;
    setSorted(sortOptions[newSortIndex]);
    setItemName("");
  }

  //----------------------------------------------------------------//
  //APP
  //----------------------------------------------------------------//
  React.useEffect(() => {
    loadItems();
  }, []);

  return (
    <RootSiblingParent>
      <View style={styles.homeView}>
        <StatusBar backgroundColor="black" />
        <View style={styles.inputView}>
          <TextInput
            value={itemName}
            onChangeText={(text) => setItemName(text)}
            placeholder="Filter / new Item"
            placeholderTextColor="#b8b8b8"
            style={styles.newItemInput}
          />
          <MatIcons.Button
            name={
              sorted.name == "unsorted"
                ? "sort-reverse-variant"
                : sorted.name == "ascending"
                ? "sort-ascending"
                : "sort-descending"
            }
            onPress={handleSort}
            backgroundColor="black"
            color="#b8b8b8"
            style={styles.headerButtons}
            iconStyle={{ marginRight: 1 }}
          />
          <MatIcons.Button
            name="basket-plus"
            onPress={handleAddItem}
            backgroundColor="black"
            color="#b8b8b8"
            style={styles.headerButtons}
          >
            Add
          </MatIcons.Button>
        </View>
        <FlatList
          data={displayItems}
          renderItem={({ item, index }) => (
            <Item
              name={item.name}
              inventory={item.inventory}
              onInventoryChange={(change) =>
                handleInventoryChange(index, change)
              }
              onDelete={() => handleDeleteItem(index)}
            />
          )}
          keyExtractor={(item) => item.name}
        />
      </View>
    </RootSiblingParent>
  );
};

export default App;

const styles = StyleSheet.create({
  homeView: {
    backgroundColor: "black", //colorScheme === "dark" ? "#b8b8b8" : "green",
    flex: 1,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  newItemInput: {
    height: 40,
    width: "60%",
    marginVertical: 10,
    borderWidth: 2,
    borderColor: "#b8b8b8",
    paddingHorizontal: 10,
    backgroundColor: "black",
    borderRadius: 4,
  },
  headerButtons: {
    height: 40,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "#b8b8b8",
  },
  item: {
    backgroundColor: "grey",
    padding: 10,
    marginVertical: 3,
    marginHorizontal: 10,
    flex: 1,
    borderRadius: 10,
  },
  itemViewText: {
    flexDirection: "row",
    marginTop: 5,
    justifyContent: "space-around",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  itemInventory: {
    textAlign: "center",
    flex: 1,
  },
  itemViewButtons: {
    flexDirection: "row",
    marginTop: 5,
    justifyContent: "space-around",
  },
  deleteItemButton: {
    height: 35,
    backgroundColor: "red",
  },
  inventoryButtonView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "40%",
  },
  inventoryButton: {
    height: 35,
    backgroundColor: "black",
  },
  inventoryButtonIcon: {
    marginRight: 1,
  },
});
