import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, FlatList, Pressable, } from "react-native";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, remove, } from "firebase/database";


const firebaseConfig = {

  apiKey: "AIzaSyBKTE0pc2nyZKU8P4-LIadOO7v7391wLMw",

  authDomain: "fir-7ebce.firebaseapp.com",

  projectId: "fir-7ebce",

  storageBucket: "fir-7ebce.firebasestorage.app",

  messagingSenderId: "444103084219",

  appId: "1:444103084219:web:67363e02e9afca662a019e"

};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function App() {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);


  useEffect(() => {
    const itemsRef = ref(db, "shopping");

    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setItems([]);
        return;
      }

      const list = Object.entries(data).map(([key, value]) => ({
        key,
        ...value,
      }));


      list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      setItems(list);
    });

    return unsubscribe;
  }, []);

  const saveItem = async () => {
    const p = product.trim();
    const a = amount.trim();
    if (!p || !a) return;

    try {
      const itemsRef = ref(db, "shopping");
      const newRef = push(itemsRef);
      await set(newRef, {
        id: Date.now(),
        product: p,
        amount: a,
      });

      setProduct("");
      setAmount("");
    } catch (e) {
      console.error("Could not add item", e);
    }
  };

  const deleteItem = async (key) => {
    try {
      await remove(ref(db, `shopping/${key}`));
    } catch (e) {
      console.error("Could not delete item", e);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Product"
        value={product}
        onChangeText={setProduct}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.saveBtn}>
        <Button title="SAVE" onPress={saveItem} />
      </View>

      <Text style={styles.title}>Shopping list</Text>

      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>
              {item.product}, {item.amount}
            </Text>

            <Pressable onPress={() => deleteItem(item.key)}>
              <Text style={styles.delete}>delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 16 },
  input: { borderWidth: 1, borderColor: "#999", paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8 },
  saveBtn: { alignSelf: "center", width: 120, marginTop: 4, marginBottom: 14 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 8, alignSelf: "center" },
  list: { marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowText: { fontSize: 14 },
  delete: { color: "blue" },
  empty: { marginTop: 10, color: "#666", alignSelf: "center" },
});