import { Text, View, Pressable } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { formatDA } from "../../utils";

const OrderItem = ({ order }) => {
  const navigation = useNavigation();
  const onTheWay = order.status === "PICKEDUP";

  return (
    <Pressable
      style={{
        flexDirection: "row",
        margin: 10,
        borderColor: onTheWay ? "#6366F1" : "#3FC060",
        borderWidth: 2,
        borderRadius: 12,
      }}
      onPress={() => navigation.navigate("OrdersDeliveryScreen", { order })}
    >
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: onTheWay ? "#6366F1" : "#3FC060" }}>
          {onTheWay ? "🛵 EN COURS DE LIVRAISON" : "📦 PRÊTE À RÉCUPÉRER"}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 4 }}>
          {order.userFirstName} {order.userLastName}
        </Text>
        <Text style={{ color: "grey", fontWeight: "500" }}>📍 {order.userAddress}</Text>
        <Text style={{ marginTop: 6, fontWeight: "700" }}>À encaisser : {formatDA(order.total)}</Text>
      </View>
      <View
        style={{
          padding: 8,
          backgroundColor: onTheWay ? "#6366F1" : "#3FC060",
          borderBottomRightRadius: 10,
          borderTopRightRadius: 10,
          justifyContent: "center",
        }}
      >
        <Entypo name="chevron-right" size={30} color="white" />
      </View>
    </Pressable>
  );
};

export default OrderItem;
