import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, StyleSheet, useWindowDimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { callPhone, formatDA, hasCoords, openDirections, openWhatsApp } from "../../utils";

const OrderDelivery = ({ route, navigation }) => {
  const [order, setOrder] = useState(route.params.order);
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const { height } = useWindowDimensions();

  // Live order: reflects changes made from the dashboard too
  useEffect(() => {
    return onSnapshot(doc(db, "orders", order.id), (snap) => {
      if (snap.exists()) setOrder({ ...snap.data(), id: snap.id });
    });
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({});
      setLocation(pos.coords);
    })().catch((e) => console.log("Location error:", e));
  }, []);

  const setStatus = async (status) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "orders", order.id), { status });
      if (status === "COMPLETE") {
        Alert.alert("Livraison terminée 🎉", `N'oublie pas d'encaisser ${formatDA(order.total)}.`);
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert("Erreur", "Le statut n'a pas pu être changé. Vérifie ta connexion.");
    }
    setSaving(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {location && (
        <MapView
          style={{ height: height * 0.3 }}
          showsUserLocation
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          {hasCoords(order.userLatitude, order.userLongitude) && (
            <Marker
              coordinate={{ latitude: order.userLatitude, longitude: order.userLongitude }}
              title={order.userFirstName}
            />
          )}
        </MapView>
      )}

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </Pressable>

        <Text style={styles.title}>{order.userFirstName} {order.userLastName}</Text>
        <Text style={styles.text}>📍 {order.userAddress}</Text>
        {!!order.note && <Text style={styles.text}>📝 {order.note}</Text>}

        <View style={styles.row}>
          <Pressable style={[styles.smallButton, { backgroundColor: "#111" }]} onPress={() => callPhone(order.userPhoneNumber)}>
            <Text style={styles.smallButtonText}>📞 Appeler</Text>
          </Pressable>
          <Pressable style={[styles.smallButton, { backgroundColor: "#25D366" }]} onPress={() => openWhatsApp(order.userPhoneNumber)}>
            <Text style={styles.smallButtonText}>WhatsApp</Text>
          </Pressable>
          <Pressable style={[styles.smallButton, { backgroundColor: "#4285F4" }]} onPress={() => openDirections(order)}>
            <Text style={styles.smallButtonText}>🗺️ Itinéraire</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Commande · {order.restaurantName}</Text>
          {(order.items || []).map((item) => (
            <View key={item.dishId} style={styles.itemRow}>
              <Text style={styles.text}>{item.quantity} × {item.name}</Text>
              <Text style={styles.text}>{formatDA(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={[styles.itemRow, { borderTopWidth: 1, borderColor: "#eee", paddingTop: 8, marginTop: 4 }]}>
            <Text style={styles.total}>À encaisser (espèces)</Text>
            <Text style={styles.total}>{formatDA(order.total)}</Text>
          </View>
        </View>

        {order.status === "READY" && (
          <Pressable disabled={saving} style={styles.bigButton} onPress={() => setStatus("PICKEDUP")}>
            <Text style={styles.bigButtonText}>📦 J'ai récupéré la commande</Text>
          </Pressable>
        )}
        {order.status === "PICKEDUP" && (
          <Pressable disabled={saving} style={styles.bigButton} onPress={() => setStatus("COMPLETE")}>
            <Text style={styles.bigButtonText}>✅ Livrée et payée</Text>
          </Pressable>
        )}
        {order.status === "COMPLETE" && <Text style={[styles.subtitle, { textAlign: "center" }]}>Commande livrée ✅</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  back: { color: "#3FC060", fontWeight: "700", fontSize: 16, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 16, color: "#444", marginBottom: 4 },
  total: { fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", gap: 8, marginVertical: 12 },
  smallButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  smallButtonText: { color: "white", fontWeight: "700" },
  card: { backgroundColor: "#f6f6f6", borderRadius: 12, padding: 14, marginBottom: 16 },
  itemRow: { flexDirection: "row", justifyContent: "space-between" },
  bigButton: { backgroundColor: "#3FC060", padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 30 },
  bigButtonText: { color: "white", fontSize: 18, fontWeight: "700" },
});

export default OrderDelivery;
