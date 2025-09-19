import { View, Text, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Link } from "expo-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type PermitCardProps = Partial<PermitData> & {
  onEdit?: () => void;
};

const PermitCard = ({
  id,
  name,
  status,
  location,
  document,
  permitType,
  createdTime,
  workStartTime,
  workEndTime, // ✅ new field
  onEdit,
}: PermitCardProps) => {
  return (
    <View className="bg-white rounded-lg w-full p-4 mb-4">
      {/* Status + actions */}
      <View className="flex-row items-center justify-between pb-3">
        <Text className="text-primary text-lg">
          Status:{" "}
          <Text
            className={
              status === "Approved"
                ? "text-green-600 font-bold"
                : status === "Pending"
                ? "text-yellow-600 font-bold"
                : status === "Rejected"
                ? "text-red-600 font-bold"
                : "text-black font-bold"
            }
          >
            {status}
          </Text>
        </Text>

        <View className="flex-row space-x-3">
          {status === "DRAFT" && onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}
            >
              <Text style={{ marginRight: 6 }}>Edit</Text>
              <IconSymbol name="pencil" size={18} color="#000" />
            </TouchableOpacity>
          )}

          <Link href={`/permits/${id}`} asChild>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}
            >
              <Text style={{ marginRight: 6 }}>Details</Text>
              <IconSymbol name="chevron.right" size={20} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="border-b border-gray-300 mb-3" />

      {/* Basic info */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2">
          <Text className="text-primary"> Name: </Text>
          <Text className="text-primary font-bold"> {name} </Text>
        </View>
        <View className="w-1/2">
          <Text className="text-primary"> Location: </Text>
          <Text className="text-primary font-bold"> {location} </Text>
        </View>
      </View>

      {/* Dates */}
      <View className="w-full flex-row mb-2">
        <View className="w-1/2">
          <Text className="text-primary"> Application Date: </Text>
          <Text className="text-primary font-bold">
            {formatDate(createdTime)}
          </Text>
        </View>
        <View className="w-1/2">
          <Text className="text-primary"> Work Start: </Text>
          <Text className="text-primary font-bold">{formatDate(workStartTime)}</Text>
        </View>
      </View>

      <View className="w-full flex-row mb-2">
        <View className="w-1/2">
          <Text className="text-primary"> Work End: </Text>
          <Text className="text-primary font-bold">{formatDate(workEndTime)}</Text>
        </View>
        <View className="w-1/2">
          <Text className="text-primary"> Document: </Text>
          <Text className="text-primary font-bold"> {document} </Text>
        </View>
      </View>

      <View className="w-full flex-row mb-2">
        <View className="w-1/2">
          <Text className="text-primary"> Permit Type: </Text>
          <Text className="text-primary font-bold"> {permitType} </Text>
        </View>
      </View>
    </View>
  );
};

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  return dayjs.utc(dateString).tz(dayjs.tz.guess()).format("DD-MM-YYYY HH:mm");
}

export default PermitCard;
