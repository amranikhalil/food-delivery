import { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, FlatList, useWindowDimensions } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Marker } from "react-native-maps";
import { Entypo } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import OrderItem from "../../components/OrderItem";
import { db, RESTAURANT_ID } from "../../../firebase/firebase.js";
import { DRIVER_STATUSES, hasCoords } from "../../utils";

const KITCHEN_STATUSES = ["PENDING", "ACCEPTED", "PREPARING"];

const EmptyState = ({ inKitchen }) => (
  <View
    style={{
      margin: 16,
      padding: 24,
      borderRadius: 16,
      backgroundColor: "#F3F4F6",
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 48 }}>🛵</Text>
    <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8, textAlign: "center" }}>
      Aucune commande prête pour l'instant
    </Text>
    <Text style={{ color: "grey", marginTop: 6, textAlign: "center" }}>
      Les commandes apparaissent ici dès que le restaurant clique sur « Commande prête ».
    </Text>
    {inKitchen > 0 && (
      <Text style={{ color: "#EA580C", fontWeight: "700", marginTop: 12 }}>
        🍳 {inKitchen} commande{inKitchen > 1 ? "s" : ""} en préparation
      </Text>
    )}
  </View>
);

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [inKitchen, setInKitchen] = useState(0);
  const bottomSheetRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["15%", "45%", "90%"], []);

  useEffect(() => {
    // Filter by restaurant only and do the rest here: no Firestore index needed
    const q = query(collection(db, "orders"), where("restaurantId", "==", RESTAURANT_ID));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setOrders(
        all
          .filter((o) => DRIVER_STATUSES.includes(o.status))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
      setInKitchen(all.filter((o) => KITCHEN_STATUSES.includes(o.status)).length);
    });
  }, []);

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <MapView style={{ height, width }} showsUserLocation followsUserLocation>
        {orders
          .filter((o) => hasCoords(o.restaurantLatitude, o.restaurantLongitude))
          .map((order) => (
            <Marker
              key={order.id}
              title={order.restaurantName}
              coordinate={{ latitude: order.restaurantLatitude, longitude: order.restaurantLongitude }}
            >
              <View style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}>
                <Entypo name="shop" size={24} color="white" />
              </View>
            </Marker>
          ))}
      </MapView>
      <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints}>
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: "600", paddingBottom: 5 }}>Tu es en ligne 🟢</Text>
          <Text style={{ color: "grey" }}>
            Commandes à livrer : {orders.length}
            {orders.length > 0 && inKitchen > 0 ? `  ·  🍳 ${inKitchen} en préparation` : ""}
          </Text>
        </View>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderItem order={item} />}
          ListEmptyComponent={<EmptyState inKitchen={inKitchen} />}
        />
      </BottomSheet>
    </View>
  );
};

export default OrdersScreen;
